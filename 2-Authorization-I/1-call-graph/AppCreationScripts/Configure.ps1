
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
    

   # Create the spa AAD application
   Write-Host "Creating the AAD application (ms-identity-react-c2s1)"
   
   # create the application 
   $spaAadApplication = New-MgApplication -DisplayName "ms-identity-react-c2s1" `
                                                   -Spa `
                                                   @{ `
                                                       RedirectUris = "http://localhost:3000/", "http://localhost:3000/redirect"; `
                                                     } `
                                                    -SignInAudience AzureADMyOrg `
                                                   #end of command
    $tenantName = (Get-MgApplication -ApplicationId $spaAadApplication.Id).PublisherDomain
    Update-MgApplication -ApplicationId $spaAadApplication.Id -IdentifierUris @("https://$tenantName/ms-identity-react-c2s1")
    
    # create the service principal of the newly created application 
    $currentAppId = $spaAadApplication.AppId
    $spaServicePrincipal = New-MgServicePrincipal -AppId $currentAppId -Tags {WindowsAzureActiveDirectoryIntegratedApp}

    # add the user running the script as an app owner if needed
    $owner = Get-MgApplicationOwner -ApplicationId $spaAadApplication.Id
    if ($owner -eq $null)
    { 
        New-MgApplicationOwnerByRef -ApplicationId $spaAadApplication.Id  -BodyParameter = @{"@odata.id" = "htps://graph.microsoft.com/v1.0/directoryObjects/$user.ObjectId"}
        Write-Host "'$($user.UserPrincipalName)' added as an application owner to app '$($spaServicePrincipal.DisplayName)'"
    }

    # Add Claims

    $optionalClaims = New-Object Microsoft.Graph.PowerShell.Models.MicrosoftGraphOptionalClaims
    $optionalClaims.AccessToken = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphOptionalClaim]
    $optionalClaims.IdToken = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphOptionalClaim]
    $optionalClaims.Saml2Token = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphOptionalClaim]


    # Add Optional Claims

    $newClaim =  CreateOptionalClaim  -name "sid" 
    $optionalClaims.IdToken += ($newClaim)
    $newClaim =  CreateOptionalClaim  -name "login_hint" 
    $optionalClaims.IdToken += ($newClaim)
    $newClaim =  CreateOptionalClaim  -name "email" 
    $optionalClaims.IdToken += ($newClaim)
    $newClaim =  CreateOptionalClaim  -name "upn" 
    $optionalClaims.IdToken += ($newClaim)
    $newClaim =  CreateOptionalClaim  -name "acct" 
    $optionalClaims.IdToken += ($newClaim)
    Update-MgApplication -ApplicationId $spaAadApplication.Id -OptionalClaims $optionalClaims
    Write-Host "Done creating the spa application (ms-identity-react-c2s1)"

    # URL of the AAD application in the Azure portal
    # Future? $spaPortalUrl = "https://portal.azure.com/#@"+$tenantName+"/blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/appId/"+$spaAadApplication.AppId+"/objectId/"+$spaAadApplication.Id+"/isMSAApp/"
    $spaPortalUrl = "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/CallAnAPI/appId/"+$spaAadApplication.AppId+"/objectId/"+$spaAadApplication.Id+"/isMSAApp/"
    Add-Content -Value "<tr><td>spa</td><td>$currentAppId</td><td><a href='$spaPortalUrl'>ms-identity-react-c2s1</a></td></tr>" -Path createdApps.html
    $requiredResourcesAccess = New-Object System.Collections.Generic.List[Microsoft.Graph.PowerShell.Models.MicrosoftGraphRequiredResourceAccess]

    
    # Add Required Resources Access (from 'spa' to 'Microsoft Graph')
    Write-Host "Getting access from 'spa' to 'Microsoft Graph'"
    $requiredPermissions = GetRequiredPermissions -applicationDisplayName "Microsoft Graph" `
        -requiredDelegatedPermissions "User.Read|Contacts.Read" `
    

    $requiredResourcesAccess.Add($requiredPermissions)
    Update-MgApplication -ApplicationId $spaAadApplication.Id -RequiredResourceAccess $requiredResourcesAccess
    Write-Host "Granted permissions."
    
    # Update config file for 'spa'
    $configFile = $pwd.Path + "\..\SPA\src\authConfig.js"
    $dictionary = @{ "Enter_the_Application_Id_Here" = $spaAadApplication.AppId;"Enter_the_Tenant_Info_Here" = $tenantId };

    Write-Host "Updating the sample code ($configFile)"

    ReplaceInTextFile -configFilePath $configFile -dictionary $dictionary
    if($isOpenSSL -eq 'Y')
    {
        Write-Host -ForegroundColor Green "------------------------------------------------------------------------------------------------" 
        Write-Host "You have generated certificate using OpenSSL so follow below steps: "
        Write-Host "Install the certificate on your system from current folder."
        Write-Host -ForegroundColor Green "------------------------------------------------------------------------------------------------" 
    }
    Add-Content -Value "</tbody></table></body></html>" -Path createdApps.html  
}

# Pre-requisites
if ($null -eq (Get-Module -ListAvailable -Name "Microsoft.Graph.Applications")) {
    Install-Module "Microsoft.Graph.Applications" -Scope CurrentUser 
}

Import-Module Microsoft.Graph.Applications

Set-Content -Value "<html><body><table>" -Path createdApps.html
Add-Content -Value "<thead><tr><th>Application</th><th>AppId</th><th>Url in the Azure portal</th></tr></thead><tbody>" -Path createdApps.html

$ErrorActionPreference = "Stop"

# Run interactively (will ask you for the tenant ID)
ConfigureApplications -tenantId $tenantId -environment $azureEnvironmentName

Write-Host "Disconnecting from tenant"
Disconnect-MgGraph