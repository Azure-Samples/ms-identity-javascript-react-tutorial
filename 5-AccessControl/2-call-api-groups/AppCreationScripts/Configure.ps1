 
[CmdletBinding()]
param(
    [Parameter(Mandatory=$False, HelpMessage='Tenant ID (This is a GUID which represents the "Directory ID" of the AzureAD tenant into which you want to create the apps')]
    [string] $tenantId,
    [Parameter(Mandatory=$False, HelpMessage='Azure environment to use while running the script. Default = Global')]
    [string] $azureEnvironmentName
)

<#
 This script creates the Azure AD applications needed for this sample and updates the configuration files
 for the visual Studio projects from the data in the Azure AD applications.

 In case you don't have Microsoft.Graph.Applications already installed, the script will automatically install it for the current user
 
 There are four ways to run this script. For more information, read the AppCreationScripts.md file in the same folder as this script.
#>

# Create an application key
# See https://www.sabin.io/blog/adding-an-azure-active-directory-application-and-key-using-powershell/
Function CreateAppKey([DateTime] $fromDate, [double] $durationInMonths)
{
    $key = New-Object Microsoft.Graph.PowerShell.Models.MicrosoftGraphPasswordCredential

    $key.StartDateTime = $fromDate
    $key.EndDateTime = $fromDate.AddMonths($durationInMonths)
    $key.KeyId = (New-Guid).ToString()
    $key.DisplayName = "app secret"

    return $key
}

# Adds the requiredAccesses (expressed as a pipe separated string) to the requiredAccess structure
# The exposed permissions are in the $exposedPermissions collection, and the type of permission (Scope | Role) is 
# described in $permissionType
Function AddResourcePermission($requiredAccess, `
                               $exposedPermissions, [string]$requiredAccesses, [string]$permissionType)
{
    foreach($permission in $requiredAccesses.Trim().Split("|"))
    {
        foreach($exposedPermission in $exposedPermissions)
        {
            if ($exposedPermission.Value -eq $permission)
                {
                $resourceAccess = New-Object Microsoft.Graph.PowerShell.Models.MicrosoftGraphResourceAccess
                $resourceAccess.Type = $permissionType # Scope = Delegated permissions | Role = Application permissions
                $resourceAccess.Id = $exposedPermission.Id # Read directory data
                $requiredAccess.ResourceAccess += $resourceAccess
                }
        }
    }
}

#
# Example: GetRequiredPermissions "Microsoft Graph"  "Graph.Read|User.Read"
# See also: http://stackoverflow.com/questions/42164581/how-to-configure-a-new-azure-ad-application-through-powershell
Function GetRequiredPermissions([string] $applicationDisplayName, [string] $requiredDelegatedPermissions, [string]$requiredApplicationPermissions, $servicePrincipal)
{
    # If we are passed the service principal we use it directly, otherwise we find it from the display name (which might not be unique)
    if ($servicePrincipal)
    {
        $sp = $servicePrincipal
    }
    else
    {
        $sp = Get-MgServicePrincipal -Filter "DisplayName eq '$applicationDisplayName'"
    }
    $appid = $sp.AppId
    $requiredAccess = New-Object Microsoft.Graph.PowerShell.Models.MicrosoftGraphRequiredResourceAccess
    $requiredAccess.ResourceAppId = $appid 
    $requiredAccess.ResourceAccess = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphResourceAccess]

    # $sp.Oauth2Permissions | Select Id,AdminConsentDisplayName,Value: To see the list of all the Delegated permissions for the application:
    if ($requiredDelegatedPermissions)
    {
        AddResourcePermission $requiredAccess -exposedPermissions $sp.Oauth2PermissionScopes -requiredAccesses $requiredDelegatedPermissions -permissionType "Scope"
    }
    
    # $sp.AppRoles | Select Id,AdminConsentDisplayName,Value: To see the list of all the Application permissions for the application
    if ($requiredApplicationPermissions)
    {
        AddResourcePermission $requiredAccess -exposedPermissions $sp.AppRoles -requiredAccesses $requiredApplicationPermissions -permissionType "Role"
    }
    return $requiredAccess
}


Function ReplaceInLine([string] $line, [string] $key, [string] $value)
{
    $index = $line.IndexOf($key)
    if ($index -ige 0)
    {
        $index2 = $index+$key.Length
        $line = $line.Substring(0, $index) + $value + $line.Substring($index2)
    }
    return $line
}

Function ReplaceInTextFile([string] $configFilePath, [System.Collections.HashTable] $dictionary)
{
    $lines = Get-Content $configFilePath
    $index = 0
    while($index -lt $lines.Length)
    {
        $line = $lines[$index]
        foreach($key in $dictionary.Keys)
        {
            if ($line.Contains($key))
            {
                $lines[$index] = ReplaceInLine $line $key $dictionary[$key]
            }
        }
        $index++
    }

    Set-Content -Path $configFilePath -Value $lines -Force
}
<#.Description
   This function creates a new Azure AD scope (OAuth2Permission) with default and provided values
#>  
Function CreateScope( [string] $value, [string] $userConsentDisplayName, [string] $userConsentDescription, [string] $adminConsentDisplayName, [string] $adminConsentDescription)
{
    $scope = New-Object Microsoft.Graph.PowerShell.Models.MicrosoftGraphPermissionScope
    $scope.Id = New-Guid
    $scope.Value = $value
    $scope.UserConsentDisplayName = $userConsentDisplayName
    $scope.UserConsentDescription = $userConsentDescription
    $scope.AdminConsentDisplayName = $adminConsentDisplayName
    $scope.AdminConsentDescription = $adminConsentDescription
    $scope.IsEnabled = $true
    $scope.Type = "User"
    return $scope
}

<#.Description
   This function creates a new Azure AD AppRole with default and provided values
#>  
Function CreateAppRole([string] $types, [string] $name, [string] $description)
{
    $appRole = New-Object Microsoft.Graph.PowerShell.Models.MicrosoftGraphAppRole
    $appRole.AllowedMemberTypes = New-Object System.Collections.Generic.List[string]
    $typesArr = $types.Split(',')
    foreach($type in $typesArr)
    {
        $appRole.AllowedMemberTypes += $type;
    }
    $appRole.DisplayName = $name
    $appRole.Id = New-Guid
    $appRole.IsEnabled = $true
    $appRole.Description = $description
    $appRole.Value = $name;
    return $appRole
}
Function CreateOptionalClaim([string] $name)
{
    <#.Description
    This function creates a new Azure AD optional claims  with default and provided values
    #>  

    $appClaim = New-Object Microsoft.Graph.PowerShell.Models.MicrosoftGraphOptionalClaim
    $appClaim.AdditionalProperties =  New-Object System.Collections.Generic.List[string]
    $appClaim.Source =  $null
    $appClaim.Essential = $false
    $appClaim.Name = $name
    return $appClaim
}

Function ConfigureApplications
{
    $isOpenSSl = 'N' #temporary disable open certificate creation 

    <#.Description
       This function creates the Azure AD applications for the sample in the provided Azure AD tenant and updates the
       configuration files in the client and service project  of the visual studio solution (App.Config and Web.Config)
       so that they are consistent with the Applications parameters
    #> 
    
    if (!$azureEnvironmentName)
    {
        $azureEnvironmentName = "Global"
    }

    # Connect to the Microsoft Graph API, non-interactive is not supported for the moment (Oct 2021)
    Write-Host "Connecting to Microsoft Graph"
    if ($tenantId -eq "") {
        Connect-MgGraph -Scopes "Application.ReadWrite.All" -Environment $azureEnvironmentName
        $tenantId = (Get-MgContext).TenantId
    }
    else {
        Connect-MgGraph -TenantId $tenantId -Scopes "Application.ReadWrite.All" -Environment $azureEnvironmentName
    }
    

   # Create the service AAD application
   Write-Host "Creating the AAD application (msal-node-api)"
   # Get a 6 months application key for the service Application
   $fromDate = [DateTime]::Now;
   $key = CreateAppKey -fromDate $fromDate -durationInMonths 6
   
   
   # create the application 
   $serviceAadApplication = New-MgApplication -DisplayName "msal-node-api" `
                                                       -Web `
                                                       @{ `
                                                           HomePageUrl = "http://localhost:5000/api"; `
                                                         } `
                                                         -Api `
                                                         @{ `
                                                            RequestedAccessTokenVersion = 2 `
                                                         } `
                                                        -SignInAudience AzureADMyOrg `
                                                       -GroupMembershipClaims "SecurityGroup" `
                                                       #end of command
    #add a secret to the application
    $pwdCredential = Add-MgApplicationPassword -ApplicationId $serviceAadApplication.Id -PasswordCredential $key
    $serviceAppKey = $pwdCredential.SecretText

    $serviceIdentifierUri = 'api://'+$serviceAadApplication.AppId
    Update-MgApplication -ApplicationId $serviceAadApplication.Id -IdentifierUris @($serviceIdentifierUri)
    
    # create the service principal of the newly created application 
    $currentAppId = $serviceAadApplication.AppId
    $serviceServicePrincipal = New-MgServicePrincipal -AppId $currentAppId -Tags {WindowsAzureActiveDirectoryIntegratedApp}

    # add the user running the script as an app owner if needed
    $owner = Get-MgApplicationOwner -ApplicationId $serviceAadApplication.Id
    if ($owner -eq $null)
    { 
        New-MgApplicationOwnerByRef -ApplicationId $serviceAadApplication.Id  -BodyParameter = @{"@odata.id" = "htps://graph.microsoft.com/v1.0/directoryObjects/$user.ObjectId"}
        Write-Host "'$($user.UserPrincipalName)' added as an application owner to app '$($serviceServicePrincipal.DisplayName)'"
    }

    # Add Claims

    $optionalClaims = New-Object Microsoft.Graph.PowerShell.Models.MicrosoftGraphOptionalClaims
    $optionalClaims.AccessToken = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphOptionalClaim]
    $optionalClaims.IdToken = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphOptionalClaim]
    $optionalClaims.Saml2Token = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphOptionalClaim]

    # Add Groups Claims

    $newClaim =  CreateOptionalClaim  -name "groups" 
    $optionalClaims.IdToken += ($newClaim)
    $newClaim =  CreateOptionalClaim  -name "groups" 
    $optionalClaims.AccessToken += ($newClaim)
    $newClaim =  CreateOptionalClaim  -name "groups" 
    $optionalClaims.Saml2Token += ($newClaim)


    # Add Optional Claims

    $newClaim =  CreateOptionalClaim  -name "idtyp" 
    $optionalClaims.AccessToken += ($newClaim)
    Update-MgApplication -ApplicationId $serviceAadApplication.Id -OptionalClaims $optionalClaims
    
    # rename the user_impersonation scope if it exists to match the readme steps or add a new scope
       
    # delete default scope i.e. User_impersonation
    # Alex: the scope deletion doesn't work - see open issue - https://github.com/microsoftgraph/msgraph-sdk-powershell/issues/1054
    $scopes = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphPermissionScope]
    $scope = $serviceAadApplication.Api.Oauth2PermissionScopes | Where-Object { $_.Value -eq "User_impersonation" }
    
    if($scope -ne $null)
    {    
        # disable the scope
        $scope.IsEnabled = $false
        $scopes.Add($scope)
        Update-MgApplication -ApplicationId $serviceAadApplication.Id -Api @{Oauth2PermissionScopes = @($scopes)}

        # clear the scope
        Update-MgApplication -ApplicationId $serviceAadApplication.Id -Api @{Oauth2PermissionScopes = @()}
    }

    $scopes = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphPermissionScope]
    $scope = CreateScope -value access_using_groups_assignments  `
    -userConsentDisplayName "Access msal-node-api"  `
    -userConsentDescription "Allow the application to access msal-node-api on your behalf."  `
    -adminConsentDisplayName "Access msal-node-api"  `
    -adminConsentDescription "Allows the app to have the same access to information in the directory on behalf of an admin."
            
    $scopes.Add($scope)
    
    # add/update scopes
    Update-MgApplication -ApplicationId $serviceAadApplication.Id -Api @{Oauth2PermissionScopes = @($scopes)}
    Write-Host "Done creating the service application (msal-node-api)"

    # URL of the AAD application in the Azure portal
    # Future? $servicePortalUrl = "https://portal.azure.com/#@"+$tenantName+"/blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/appId/"+$serviceAadApplication.AppId+"/objectId/"+$serviceAadApplication.Id+"/isMSAApp/"
    $servicePortalUrl = "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/CallAnAPI/appId/"+$serviceAadApplication.AppId+"/objectId/"+$serviceAadApplication.Id+"/isMSAApp/"
    Add-Content -Value "<tr><td>service</td><td>$currentAppId</td><td><a href='$servicePortalUrl'>msal-node-api</a></td></tr>" -Path createdApps.html
    $requiredResourcesAccess = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphRequiredResourceAccess]
    
    # Add Required Resources Access (from 'service' to 'Microsoft Graph')
    Write-Host "Getting access from 'service' to 'Microsoft Graph'"
    $requiredPermission = GetRequiredPermissions -applicationDisplayName "Microsoft Graph" `
        -requiredDelegatedPermissions "User.Read|GroupMember.Read.All" `

    $requiredResourcesAccess.Add($requiredPermission)
    Update-MgApplication -ApplicationId $serviceAadApplication.Id -RequiredResourceAccess $requiredResourcesAccess
    Write-Host "Granted permissions."

    Write-Host "Successfully registered and configured that app registration for 'msal-node-api' at" -ForegroundColor Green

    # print the registered app portal URL for any further navigation
    $servicePortalUrl

   # Create the client AAD application
   Write-Host "Creating the AAD application (msal-react-spa)"
   
   # create the application 
   $clientAadApplication = New-MgApplication -DisplayName "msal-react-spa" `
                                                      -Spa `
                                                      @{ `
                                                          RedirectUris = "http://localhost:3000/", "http://localhost:3000/redirect.html"; `
                                                        } `
                                                       -SignInAudience AzureADMyOrg `
                                                      -GroupMembershipClaims "SecurityGroup" `
                                                      #end of command
    $tenantName = (Get-MgApplication -ApplicationId $clientAadApplication.Id).PublisherDomain
    Update-MgApplication -ApplicationId $clientAadApplication.Id -IdentifierUris @("https://$tenantName/msal-react-spa")
    
    # create the service principal of the newly created application 
    $currentAppId = $clientAadApplication.AppId
    $clientServicePrincipal = New-MgServicePrincipal -AppId $currentAppId -Tags {WindowsAzureActiveDirectoryIntegratedApp}

    # add the user running the script as an app owner if needed
    $owner = Get-MgApplicationOwner -ApplicationId $clientAadApplication.Id
    if ($owner -eq $null)
    { 
        New-MgApplicationOwnerByRef -ApplicationId $clientAadApplication.Id  -BodyParameter = @{"@odata.id" = "htps://graph.microsoft.com/v1.0/directoryObjects/$user.ObjectId"}
        Write-Host "'$($user.UserPrincipalName)' added as an application owner to app '$($clientServicePrincipal.DisplayName)'"
    }

    # Add Claims

    $optionalClaims = New-Object Microsoft.Graph.PowerShell.Models.MicrosoftGraphOptionalClaims
    $optionalClaims.AccessToken = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphOptionalClaim]
    $optionalClaims.IdToken = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphOptionalClaim]
    $optionalClaims.Saml2Token = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphOptionalClaim]

    # Add Groups Claims

    $newClaim =  CreateOptionalClaim  -name "groups" 
    $optionalClaims.IdToken += ($newClaim)
    $newClaim =  CreateOptionalClaim  -name "groups" 
    $optionalClaims.AccessToken += ($newClaim)
    $newClaim =  CreateOptionalClaim  -name "groups" 
    $optionalClaims.Saml2Token += ($newClaim)

    Update-MgApplication -ApplicationId $clientAadApplication.Id -OptionalClaims $optionalClaims
    Write-Host "Done creating the client application (msal-react-spa)"

    # URL of the AAD application in the Azure portal
    # Future? $clientPortalUrl = "https://portal.azure.com/#@"+$tenantName+"/blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/appId/"+$clientAadApplication.AppId+"/objectId/"+$clientAadApplication.Id+"/isMSAApp/"
    $clientPortalUrl = "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/CallAnAPI/appId/"+$clientAadApplication.AppId+"/objectId/"+$clientAadApplication.Id+"/isMSAApp/"
    Add-Content -Value "<tr><td>client</td><td>$currentAppId</td><td><a href='$clientPortalUrl'>msal-react-spa</a></td></tr>" -Path createdApps.html
    $requiredResourcesAccess = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphRequiredResourceAccess]
    
    # Add Required Resources Access (from 'client' to 'service')
    Write-Host "Getting access from 'client' to 'service'"
    $requiredPermission = GetRequiredPermissions -applicationDisplayName "msal-node-api" `
        -requiredDelegatedPermissions "access_using_groups_assignments" `

    $requiredResourcesAccess.Add($requiredPermission)
    
    # Add Required Resources Access (from 'client' to 'Microsoft Graph')
    Write-Host "Getting access from 'client' to 'Microsoft Graph'"
    $requiredPermission = GetRequiredPermissions -applicationDisplayName "Microsoft Graph" `
        -requiredDelegatedPermissions "User.Read|GroupMember.Read.All" `

    $requiredResourcesAccess.Add($requiredPermission)
    Update-MgApplication -ApplicationId $clientAadApplication.Id -RequiredResourceAccess $requiredResourcesAccess
    Write-Host "Granted permissions."

    Write-Host "Successfully registered and configured that app registration for 'msal-react-spa' at" -ForegroundColor Green

    # print the registered app portal URL for any further navigation
    $clientPortalUrl

    # Configure known client applications for service 
    Write-Host "Configure known client applications for the 'service'"
    $knowApplications = New-Object System.Collections.Generic.List[System.String]
    $knowApplications.Add($clientAadApplication.AppId)
    Update-MgApplication -ApplicationId $serviceAadApplication.Id -Api @{KnownClientApplications = $knowApplications}
    Write-Host "knownclientapplication setting configured."

Function UpdateLine([string] $line, [string] $value)
{
    $index = $line.IndexOf(':')
    $lineEnd = ''

    if($line[$line.Length - 1] -eq ','){   $lineEnd = ',' }
    
    if ($index -ige 0)
    {
        $line = $line.Substring(0, $index+1) + " " + '"' + $value+ '"' + $lineEnd
    }
    return $line
}

Function UpdateTextFile([string] $configFilePath, [System.Collections.HashTable] $dictionary)
{
    $lines = Get-Content $configFilePath
    $index = 0
    while($index -lt $lines.Length)
    {
        $line = $lines[$index]
        foreach($key in $dictionary.Keys)
        {
            if ($line.Contains($key))
            {
                $lines[$index] = UpdateLine $line $dictionary[$key]
            }
        }
        $index++
    }

    Set-Content -Path $configFilePath -Value $lines -Force
}
    
    # Update config file for 'service'
    # $configFile = $pwd.Path + "\..\API\authConfig.json"
    $configFile = $(Resolve-Path ($pwd.Path + "\..\API\authConfig.json"))
    
    $dictionary = @{ "Enter_the_Tenant_Info_Here" = $tenantId;"Enter_the_Application_Id_Here" = $serviceAadApplication.AppId;"Enter_the_Client_Secret_Here" = $serviceAppKey };

    Write-Host "Updating the sample config '$configFile' with the following config values:"
    $dictionary

    ReplaceInTextFile -configFilePath $configFile -dictionary $dictionary
    
    # Update config file for 'client'
    # $configFile = $pwd.Path + "\..\SPA\src\authConfig.js"
    $configFile = $(Resolve-Path ($pwd.Path + "\..\SPA\src\authConfig.js"))
    
    $dictionary = @{ "Enter_the_Application_Id_Here" = $clientAadApplication.AppId; "Enter_the_Tenant_Info_Here" = $tenantId; "Enter_the_Web_Api_Scope_here" = ("api://" + $serviceAadApplication.AppId + "/access_using_groups_assignments") };

    Write-Host "Updating the sample config '$configFile' with the following config values:"
    $dictionary

    ReplaceInTextFile -configFilePath $configFile -dictionary $dictionary
    Write-Host -ForegroundColor Green "------------------------------------------------------------------------------------------------" 
    Write-Host "IMPORTANT: Please follow the instructions below to complete a few manual step(s) in the Azure portal":
    Write-Host "- For service"
    Write-Host "  - Navigate to $servicePortalUrl"
    Write-Host "  - Create your security groups and add the group's IDs to the authConfig files" -ForegroundColor Red 
    Write-Host "  - Navigate to the API Permissions page and select 'Grant admin consent for (your tenant)" -ForegroundColor Red 
    Write-Host "- For client"
    Write-Host "  - Navigate to $clientPortalUrl"
    Write-Host "  - Create your security groups and add the group's IDs to the authConfig files" -ForegroundColor Red 
    Write-Host "  - Navigate to the SPA Permissions page and select 'Grant admin consent for (your tenant)" -ForegroundColor Red 
    Write-Host -ForegroundColor Green "------------------------------------------------------------------------------------------------" 
       if($isOpenSSL -eq 'Y')
    {
        Write-Host -ForegroundColor Green "------------------------------------------------------------------------------------------------" 
        Write-Host "You have generated certificate using OpenSSL so follow below steps: "
        Write-Host "Install the certificate on your system from current folder."
        Write-Host -ForegroundColor Green "------------------------------------------------------------------------------------------------" 
    }
    Add-Content -Value "</tbody></table></body></html>" -Path createdApps.html  
} # end of ConfigureApplications function

# Pre-requisites
if ($null -eq (Get-Module -ListAvailable -Name "Microsoft.Graph.Applications")) {
    Install-Module "Microsoft.Graph.Applications" -Scope CurrentUser 
}

Import-Module Microsoft.Graph.Applications

Set-Content -Value "<html><body><table>" -Path createdApps.html
Add-Content -Value "<thead><tr><th>Application</th><th>AppId</th><th>Url in the Azure portal</th></tr></thead><tbody>" -Path createdApps.html

$ErrorActionPreference = "Stop"

# Run interactively (will ask you for the tenant ID)

try
{
    ConfigureApplications -tenantId $tenantId -environment $azureEnvironmentName
}
catch
{
    $message = $_
    Write-Warning $Error[0]
    Write-Host "Unable to register apps. Error is $message." -ForegroundColor White -BackgroundColor Red
}
Write-Host "Disconnecting from tenant"
Disconnect-MgGraph