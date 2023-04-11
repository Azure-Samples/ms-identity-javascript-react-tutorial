 
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
 
 There are two ways to run this script. For more information, read the AppCreationScripts.md file in the same folder as this script.
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


<#.Description
   This function takes a string input as a single line, matches a key value and replaces with the replacement value
#> 
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

<#.Description
   This function takes a dictionary of keys to search and their replacements and replaces the placeholders in a text file
#> 
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

<#.Description
   This function takes a string input as a single line, matches a key value and replaces with the replacement value
#>     
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

<#.Description
   This function takes a dictionary of keys to search and their replacements and replaces the placeholders in a text file
#>     
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
if ($null -eq (Get-Module -ListAvailable -Name "Microsoft.Graph.Groups")) {
    Install-Module "Microsoft.Graph.Groups" -Scope CurrentUser 
}

Import-Module Microsoft.Graph.Groups

<#.Description
   This function creates a new Azure AD Security Group with provided values
#>  
Function CreateSecurityGroup([string] $name, [string] $description)
{
    Write-Host "Creating a security group by the name '$name'."
    $newGroup = New-MgGroup -Description $description -DisplayName $name -MailEnabled:$false -SecurityEnabled:$true -MailNickName $name
    return Get-MgGroup -Filter "DisplayName eq '$name'" 
}

<#.Description
   This function first checks and then creates a new Azure AD Security Group with provided values, if required
#>  
Function CreateIfNotExistsSecurityGroup([string] $name, [string] $description,  [switch] $promptBeforeCreate)
{

    # check if Group exists
    $group = Get-MgGroup -Filter "DisplayName eq '$name'"    
    
    if( $group -eq $null)
    {
        if ($promptBeforeCreate) 
        {
            $confirmation = Read-Host "Proceed to create a new security group named '$name' in the tenant ? (Y/N)"

            if($confirmation -eq 'y')
            {
                $group = CreateSecurityGroup -name $name -description $description
            }
        }
        else
        {
            Write-Host "No Security Group created!"
        }     
    }
    
    return $group    
}

<#.Description
   This function first checks and then deletes an existing Azure AD Security Group, if required
#>  
Function RemoveSecurityGroup([string] $name, [switch] $promptBeforeDelete)
{

    # check if Group exists
    $group = Get-MgGroup -Filter "DisplayName eq '$name'"
    
    if( $group -ne $null)
    {
        if ($promptBeforeDelete) 
        {
            $confirmation = Read-Host "Proceed to delete an existing group named '$name' in the tenant ?(Y/N)"

            if($confirmation -eq 'y')
            {
               Remove-MgGroup -GroupId $group.Id
               Write-Host "Security group '$name' successfully deleted"
            }
        }
        else
        {
            Write-Host "No Security group by name '$name' exists in the tenant, no deletion needed."
        }     
    }
    
    return $group.Id    
}

<#.Description
   This function assigns a provided user to a security group
#>  
Function AssignUserToGroup([Microsoft.Graph.PowerShell.Models.MicrosoftGraphUser]$userToAssign, [Microsoft.Graph.PowerShell.Models.MicrosoftGraphGroup]$groupToAssign)
{
    $owneruserId = $userToAssign.Id
    $params = @{
        "@odata.id" = "https://graph.microsoft.com/v1.0/directoryObjects/{$owneruserId}"
    }

    New-MgGroupMemberByRef -GroupId $groupToAssign.Id -BodyParameter $params
    Write-Host "Successfully assigned user '$($userToAssign.UserPrincipalName)' to group '$($groupToAssign.DisplayName)'"
}

<#.Description
   This function takes a string as input and creates an instance of an Optional claim object
#> 
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

<#.Description
   Primary entry method to create and configure app registrations
#> 
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
        Connect-MgGraph -Scopes "User.Read.All Organization.Read.All Application.ReadWrite.All Group.ReadWrite.All" -Environment $azureEnvironmentName
    }
    else {
        Connect-MgGraph -TenantId $tenantId -Scopes "User.Read.All Organization.Read.All Application.ReadWrite.All Group.ReadWrite.All" -Environment $azureEnvironmentName
    }
    
    $context = Get-MgContext
    $tenantId = $context.TenantId

    # Get the user running the script
    $currentUserPrincipalName = $context.Account
    $user = Get-MgUser -Filter "UserPrincipalName eq '$($context.Account)'"

    # get the tenant we signed in to
    $Tenant = Get-MgOrganization
    $tenantName = $Tenant.DisplayName
    
    $verifiedDomain = $Tenant.VerifiedDomains | where {$_.Isdefault -eq $true}
    $verifiedDomainName = $verifiedDomain.Name
    $tenantId = $Tenant.Id

    Write-Host ("Connected to Tenant {0} ({1}) as account '{2}'. Domain is '{3}'" -f  $Tenant.DisplayName, $Tenant.Id, $currentUserPrincipalName, $verifiedDomainName)

   # Create the client AAD application
   Write-Host "Creating the AAD application (msal-react-app)"
   # Get a 6 months application key for the client Application
   $fromDate = [DateTime]::Now;
   $key = CreateAppKey -fromDate $fromDate -durationInMonths 6
   
   # create the application 
   $clientAadApplication = New-MgApplication -DisplayName "msal-react-app" `
                                                      -Spa `
                                                      @{ `
                                                          RedirectUris = "http://localhost:3000/", "http://localhost:3000/redirect"; `
                                                        } `
                                                        -Api `
                                                        @{ `
                                                           RequestedAccessTokenVersion = 2 `
                                                        } `
                                                       -SignInAudience AzureADMyOrg `
                                                      -GroupMembershipClaims "SecurityGroup" `
                                                      #end of command

    #add a secret to the application
    $pwdCredential = Add-MgApplicationPassword -ApplicationId $clientAadApplication.Id -PasswordCredential $key
    $clientAppKey = $pwdCredential.SecretText

    $currentAppId = $clientAadApplication.AppId
    $currentAppObjectId = $clientAadApplication.Id

    $clientIdentifierUri = 'api://'+$currentAppId
    Update-MgApplication -ApplicationId $currentAppObjectId -IdentifierUris @($clientIdentifierUri)
    
    # create the service principal of the newly created application     
    $clientServicePrincipal = New-MgServicePrincipal -AppId $currentAppId -Tags {WindowsAzureActiveDirectoryIntegratedApp}

    # add the user running the script as an app owner if needed
    $owner = Get-MgApplicationOwner -ApplicationId $currentAppObjectId
    if ($owner -eq $null)
    { 
        New-MgApplicationOwnerByRef -ApplicationId $currentAppObjectId  -BodyParameter = @{"@odata.id" = "htps://graph.microsoft.com/v1.0/directoryObjects/$user.ObjectId"}
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

    # Add Optional Claims

    $newClaim =  CreateOptionalClaim  -name "acct" 
    $optionalClaims.IdToken += ($newClaim)
    Update-MgApplication -ApplicationId $currentAppObjectId -OptionalClaims $optionalClaims
    
    # rename the user_impersonation scope if it exists to match the readme steps or add a new scope
    $scopes = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphPermissionScope]
    $scope = $clientAadApplication.Api.Oauth2PermissionScopes | Where-Object { $_.Value -eq "user_impersonation" }
    
    if($scope -ne $null)
    {    
        # disable the scope
        $scope.IsEnabled = $false
        $scopes.Add($scope)
        Update-MgApplication -ApplicationId $currentAppObjectId -Api @{Oauth2PermissionScopes = @($scopes)}

        # clear the scope
        Update-MgApplication -ApplicationId $currentAppObjectId -Api @{Oauth2PermissionScopes = @()}
    }

    $scopes = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphPermissionScope]
    $scope = CreateScope -value access_via_group_assignments  `
        -userConsentDisplayName "Access 'msal-react-app' as the signed-in user assigned to group memberships"  `
        -userConsentDescription "Allow the app to access the 'msal-react-app' on your behalf after assignment to one or more security groups"  `
        -adminConsentDisplayName "Access 'msal-react-app' as the signed-in user assigned to group memberships"  `
        -adminConsentDescription "Allow the app to access the 'msal-react-app' as a signed-in user assigned to one or more security groups"
            
    $scopes.Add($scope)
    
    # add/update scopes
    Update-MgApplication -ApplicationId $currentAppObjectId -Api @{Oauth2PermissionScopes = @($scopes)}
    Write-Host "Done creating the client application (msal-react-app)"

    # URL of the AAD application in the Azure portal
    # Future? $clientPortalUrl = "https://portal.azure.com/#@"+$tenantName+"/blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/appId/"+$currentAppId+"/objectId/"+$currentAppObjectId+"/isMSAApp/"
    $clientPortalUrl = "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/CallAnAPI/appId/"+$currentAppId+"/objectId/"+$currentAppObjectId+"/isMSAApp/"

    Add-Content -Value "<tr><td>client</td><td>$currentAppId</td><td><a href='$clientPortalUrl'>msal-react-app</a></td></tr>" -Path createdApps.html
    # Declare a list to hold RRA items    
    $requiredResourcesAccess = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphRequiredResourceAccess]

    # Add Required Resources Access (from 'client' to 'client')
    Write-Host "Getting access from 'client' to 'client'"
    $requiredPermission = GetRequiredPermissions -applicationDisplayName "msal-react-app"`
        -requiredDelegatedPermissions "access_via_group_assignments"

    $requiredResourcesAccess.Add($requiredPermission)
    Write-Host "Added 'client' to the RRA list."
    # Useful for RRA additions troubleshooting
    # $requiredResourcesAccess.Count
    # $requiredResourcesAccess
    

    # Add Required Resources Access (from 'client' to 'Microsoft Graph')
    Write-Host "Getting access from 'client' to 'Microsoft Graph'"
    $requiredPermission = GetRequiredPermissions -applicationDisplayName "Microsoft Graph"`
        -requiredDelegatedPermissions "User.Read|GroupMember.Read.All"

    $requiredResourcesAccess.Add($requiredPermission)
    Write-Host "Added 'Microsoft Graph' to the RRA list."
    # Useful for RRA additions troubleshooting
    # $requiredResourcesAccess.Count
    # $requiredResourcesAccess
    
    Update-MgApplication -ApplicationId $currentAppObjectId -RequiredResourceAccess $requiredResourcesAccess
    Write-Host "Granted permissions."
    
    # we assign the currently signed-in user to the first security group. The following flag tracks that
    [bool] $ownerAssigned = $false

    # Create any security groups that this app requires.

    $GroupAdmin = CreateIfNotExistsSecurityGroup -name 'GroupAdmin' -description 'Admin Security Group' -promptBeforeCreate 'Y'
    Write-Host "group id of 'GroupAdmin'" -> $GroupAdmin.Id -ForegroundColor Green 

    if ($ownerAssigned -eq $false)
    {
        AssignUserToGroup -userToAssign $user -groupToAssign $GroupAdmin
        $ownerAssigned = $true
    }

    $GroupMember = CreateIfNotExistsSecurityGroup -name 'GroupMember' -description 'User Security Group' -promptBeforeCreate 'Y'
    Write-Host "group id of 'GroupMember'" -> $GroupMember.Id -ForegroundColor Green 

    if ($ownerAssigned -eq $false)
    {
        AssignUserToGroup -userToAssign $user -groupToAssign $GroupMember
        $ownerAssigned = $true
    }
    Write-Host "Don't forget to assign the users you wish to work with to the newly created security groups !" -ForegroundColor Red 

    # print the registered app portal URL for any further navigation
    Write-Host "Successfully registered and configured that app registration for 'msal-react-app' at `n $clientPortalUrl" -ForegroundColor Green 
    
    # Update config file for 'client'
    # $configFile = $pwd.Path + "\..\API\authConfig.json"
    $configFile = $(Resolve-Path ($pwd.Path + "\..\API\authConfig.json"))
    
    $dictionary = @{ "Enter_the_Tenant_Info_Here" = $tenantId;"Enter_the_Application_Id_Here" = $clientAadApplication.AppId;"Enter_the_Client_Secret_Here" = $clientAppKey;"Enter_the_Object_Id_of_GroupAdmin_Group_Here" = $GroupAdmin.Id;"Enter_the_Object_Id_of_GroupMember_Group_Here" = $GroupMember.Id };

    Write-Host "Updating the sample config '$configFile' with the following config values:" -ForegroundColor Yellow 
    $dictionary
    Write-Host "-----------------"

    ReplaceInTextFile -configFilePath $configFile -dictionary $dictionary
    
    # Update config file for 'client'
    # $configFile = $pwd.Path + "\..\SPA\src\authConfig.js"
    $configFile = $(Resolve-Path ($pwd.Path + "\..\SPA\src\authConfig.js"))
    
    $dictionary = @{ "Enter_the_Application_Id_Here" = $clientAadApplication.AppId;"Enter_the_Tenant_Info_Here" = $tenantId;"Enter_the_Web_Api_Application_Id_Here" = $clientAadApplication.AppId;"Enter_the_Object_Id_of_GroupAdmin_Group_Here" = $GroupAdmin.Id;"Enter_the_Object_Id_of_GroupMember_Group_Here" = $GroupMember.Id };

    Write-Host "Updating the sample config '$configFile' with the following config values:" -ForegroundColor Yellow 
    $dictionary
    Write-Host "-----------------"

    ReplaceInTextFile -configFilePath $configFile -dictionary $dictionary
    Write-Host -ForegroundColor Green "------------------------------------------------------------------------------------------------" 
    Write-Host "IMPORTANT: Please follow the instructions below to complete a few manual step(s) in the Azure portal":
    Write-Host "- For client"
    Write-Host "  - Navigate to $clientPortalUrl"
    Write-Host "  - To support overage scenario, remember to provide admin consent for GroupMember.Read.All permission in the portal." -ForegroundColor Red 
    Write-Host "  - This script has created a group named 'GroupAdmin' for you. On Azure portal, navigate to Azure AD > Groups blade and assign some users to it." -ForegroundColor Red 
    Write-Host "  - This script has created a group named 'GroupMember' for you. On Azure portal, navigate to Azure AD > Groups blade and assign some users to it." -ForegroundColor Red 
    Write-Host "  - Security groups matching the names you provided have been created in this tenant (if not present already). On Azure portal, assign some users to it, and configure ID & Access tokens to emit Group IDs" -ForegroundColor Red 
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

if ($null -eq (Get-Module -ListAvailable -Name "Microsoft.Graph")) {
    Install-Module "Microsoft.Graph" -Scope CurrentUser 
}

#Import-Module Microsoft.Graph

if ($null -eq (Get-Module -ListAvailable -Name "Microsoft.Graph.Authentication")) {
    Install-Module "Microsoft.Graph.Authentication" -Scope CurrentUser 
}

Import-Module Microsoft.Graph.Authentication

if ($null -eq (Get-Module -ListAvailable -Name "Microsoft.Graph.Identity.DirectoryManagement")) {
    Install-Module "Microsoft.Graph.Identity.DirectoryManagement" -Scope CurrentUser 
}

Import-Module Microsoft.Graph.Identity.DirectoryManagement

if ($null -eq (Get-Module -ListAvailable -Name "Microsoft.Graph.Applications")) {
    Install-Module "Microsoft.Graph.Applications" -Scope CurrentUser 
}

Import-Module Microsoft.Graph.Applications

if ($null -eq (Get-Module -ListAvailable -Name "Microsoft.Graph.Groups")) {
    Install-Module "Microsoft.Graph.Groups" -Scope CurrentUser 
}

Import-Module Microsoft.Graph.Groups

if ($null -eq (Get-Module -ListAvailable -Name "Microsoft.Graph.Users")) {
    Install-Module "Microsoft.Graph.Users" -Scope CurrentUser 
}

Import-Module Microsoft.Graph.Users

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
    $_.Exception.ToString() | out-host
    $message = $_
    Write-Warning $Error[0]    
    Write-Host "Unable to register apps. Error is $message." -ForegroundColor White -BackgroundColor Red
}
Write-Host "Disconnecting from tenant"
Disconnect-MgGraph