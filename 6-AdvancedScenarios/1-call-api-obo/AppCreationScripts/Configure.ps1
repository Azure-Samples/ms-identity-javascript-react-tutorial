[CmdletBinding()]
param(
    [PSCredential] $Credential,
    [Parameter(Mandatory=$False, HelpMessage='Tenant ID (This is a GUID which represents the "Directory ID" of the AzureAD tenant into which you want to create the apps')]
    [string] $tenantId,
    [Parameter(Mandatory=$False, HelpMessage='Azure environment to use while running the script (it defaults to AzureCloud)')]
    [string] $azureEnvironmentName
)

#Requires -Modules AzureAD -RunAsAdministrator

<#
 This script creates the Azure AD applications needed for this sample and updates the configuration files
 for the visual Studio projects from the data in the Azure AD applications.

 Before running this script you need to install the AzureAD cmdlets as an administrator. 
 For this:
 1) Run Powershell as an administrator
 2) in the PowerShell window, type: Install-Module AzureAD

 There are four ways to run this script. For more information, read the AppCreationScripts.md file in the same folder as this script.
#>

# Create a password that can be used as an application key
Function ComputePassword
{
    $aesManaged = New-Object "System.Security.Cryptography.AesManaged"
    $aesManaged.Mode = [System.Security.Cryptography.CipherMode]::CBC
    $aesManaged.Padding = [System.Security.Cryptography.PaddingMode]::Zeros
    $aesManaged.BlockSize = 128
    $aesManaged.KeySize = 256
    $aesManaged.GenerateKey()
    return [System.Convert]::ToBase64String($aesManaged.Key)
}

# Create an application key
# See https://www.sabin.io/blog/adding-an-azure-active-directory-application-and-key-using-powershell/
Function CreateAppKey([DateTime] $fromDate, [double] $durationInYears, [string]$pw)
{
    $endDate = $fromDate.AddYears($durationInYears) 
    $keyId = (New-Guid).ToString();
    $key = New-Object Microsoft.Open.AzureAD.Model.PasswordCredential
    $key.StartDate = $fromDate
    $key.EndDate = $endDate
    $key.Value = $pw
    $key.KeyId = $keyId
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
                    $resourceAccess = New-Object Microsoft.Open.AzureAD.Model.ResourceAccess
                    $resourceAccess.Type = $permissionType # Scope = Delegated permissions | Role = Application permissions
                    $resourceAccess.Id = $exposedPermission.Id # Read directory data
                    $requiredAccess.ResourceAccess.Add($resourceAccess)
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
        $sp = Get-AzureADServicePrincipal -Filter "DisplayName eq '$applicationDisplayName'"
    }
    $appid = $sp.AppId
    $requiredAccess = New-Object Microsoft.Open.AzureAD.Model.RequiredResourceAccess
    $requiredAccess.ResourceAppId = $appid 
    $requiredAccess.ResourceAccess = New-Object System.Collections.Generic.List[Microsoft.Open.AzureAD.Model.ResourceAccess]

    # $sp.Oauth2Permissions | Select Id,AdminConsentDisplayName,Value: To see the list of all the Delegated permissions for the application:
    if ($requiredDelegatedPermissions)
    {
        AddResourcePermission $requiredAccess -exposedPermissions $sp.Oauth2Permissions -requiredAccesses $requiredDelegatedPermissions -permissionType "Scope"
    }
    
    # $sp.AppRoles | Select Id,AdminConsentDisplayName,Value: To see the list of all the Application permissions for the application
    if ($requiredApplicationPermissions)
    {
        AddResourcePermission $requiredAccess -exposedPermissions $sp.AppRoles -requiredAccesses $requiredApplicationPermissions -permissionType "Role"
    }
    return $requiredAccess
}


Function UpdateLine([string] $line, [string] $value)
{
    $index = $line.IndexOf('=')
    $delimiter = ';'
    if ($index -eq -1)
    {
        $index = $line.IndexOf(':')
        $delimiter = ','
    }
    if ($index -ige 0)
    {
        $line = $line.Substring(0, $index+1) + " "+'"'+$value+'"'+$delimiter
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
    $scope = New-Object Microsoft.Open.AzureAD.Model.OAuth2Permission
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
    $appRole = New-Object Microsoft.Open.AzureAD.Model.AppRole
    $appRole.AllowedMemberTypes = New-Object System.Collections.Generic.List[string]
    $typesArr = $types.Split(',')
    foreach($type in $typesArr)
    {
        $appRole.AllowedMemberTypes.Add($type);
    }
    $appRole.DisplayName = $name
    $appRole.Id = New-Guid
    $appRole.IsEnabled = $true
    $appRole.Description = $description
    $appRole.Value = $name;
    return $appRole
}

Set-Content -Value "<html><body><table>" -Path createdApps.html
Add-Content -Value "<thead><tr><th>Application</th><th>AppId</th><th>Url in the Azure portal</th></tr></thead><tbody>" -Path createdApps.html

$ErrorActionPreference = "Stop"

Function ConfigureApplications
{
<#.Description
   This function creates the Azure AD applications for the sample in the provided Azure AD tenant and updates the
   configuration files in the client and service project  of the visual studio solution (App.Config and Web.Config)
   so that they are consistent with the Applications parameters
#> 
    $commonendpoint = "common"
    
    if (!$azureEnvironmentName)
    {
        $azureEnvironmentName = "AzureCloud"
    }

    # $tenantId is the Active Directory Tenant. This is a GUID which represents the "Directory ID" of the AzureAD tenant
    # into which you want to create the apps. Look it up in the Azure portal in the "Properties" of the Azure AD.

    # Login to Azure PowerShell (interactive if credentials are not already provided:
    # you'll need to sign-in with creds enabling your to create apps in the tenant)
    if (!$Credential -and $TenantId)
    {
        $creds = Connect-AzureAD -TenantId $tenantId -AzureEnvironmentName $azureEnvironmentName
    }
    else
    {
        if (!$TenantId)
        {
            $creds = Connect-AzureAD -Credential $Credential -AzureEnvironmentName $azureEnvironmentName
        }
        else
        {
            $creds = Connect-AzureAD -TenantId $tenantId -Credential $Credential -AzureEnvironmentName $azureEnvironmentName
        }
    }

    if (!$tenantId)
    {
        $tenantId = $creds.Tenant.Id
    }

    

    $tenant = Get-AzureADTenantDetail
    $tenantName =  ($tenant.VerifiedDomains | Where { $_._Default -eq $True }).Name

    # Get the user running the script to add the user as the app owner
    $user = Get-AzureADUser -ObjectId $creds.Account.Id

   # Create the DownstreamAPI AAD application
   Write-Host "Creating the AAD application (msal-react-downstream)"
   # create the application 
   $DownstreamAPIAadApplication = New-AzureADApplication -DisplayName "msal-react-downstream" `
                                                         -HomePage "http://localhost:7000/api" `
                                                         -PublicClient $False

   $DownstreamAPIIdentifierUri = 'api://'+$DownstreamAPIAadApplication.AppId
   Set-AzureADApplication -ObjectId $DownstreamAPIAadApplication.ObjectId -IdentifierUris $DownstreamAPIIdentifierUri

   # create the service principal of the newly created application 
   $currentAppId = $DownstreamAPIAadApplication.AppId
   $DownstreamAPIServicePrincipal = New-AzureADServicePrincipal -AppId $currentAppId -Tags {WindowsAzureActiveDirectoryIntegratedApp}

   # add the user running the script as an app owner if needed
   $owner = Get-AzureADApplicationOwner -ObjectId $DownstreamAPIAadApplication.ObjectId
   if ($owner -eq $null)
   { 
        Add-AzureADApplicationOwner -ObjectId $DownstreamAPIAadApplication.ObjectId -RefObjectId $user.ObjectId
        Write-Host "'$($user.UserPrincipalName)' added as an application owner to app '$($DownstreamAPIServicePrincipal.DisplayName)'"
   }

    # rename the user_impersonation scope if it exists to match the readme steps or add a new scope
    $scopes = New-Object System.Collections.Generic.List[Microsoft.Open.AzureAD.Model.OAuth2Permission]
   
    # delete default scope i.e. User_impersonation
    $scope = $serviceAadApplication.Oauth2Permissions | Where-Object { $_.Value -eq "User_impersonation" }
    if($scope -ne $null)
    {
       # disable the scope
       $scope.IsEnabled = $false
       $scopes.Add($scope)
       Set-AzureADApplication -ObjectId $serviceAadApplication.ObjectId -Oauth2Permissions $scopes

       # clear the scope
       $scopes.Clear()
       Set-AzureADApplication -ObjectId $serviceAadApplication.ObjectId -Oauth2Permissions $scopes
    }

    if ($scopes.Count -ge 0) 
    {
             $scope = CreateScope -value access_as_user  `
                -userConsentDisplayName "Access msal-react-downstream"  `
                -userConsentDescription "Allow the application to access msal-react-downstream on your behalf."  `
                -adminConsentDisplayName "Access msal-react-downstream"  `
                -adminConsentDescription "Allows the app to have the same access to information in the directory on behalf of the signed-in user."
            
                $scopes.Add($scope)
    
    }
     
    # add/update scopes
    Set-AzureADApplication -ObjectId $serviceAadApplication.ObjectId -OAuth2Permission $scopes

   Write-Host "Done creating the DownstreamAPI application (msal-react-downstream)"

   # URL of the AAD application in the Azure portal
   # Future? $DownstreamAPIPortalUrl = "https://portal.azure.com/#@"+$tenantName+"/blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/appId/"+$DownstreamAPIAadApplication.AppId+"/objectId/"+$DownstreamAPIAadApplication.ObjectId+"/isMSAApp/"
   $DownstreamAPIPortalUrl = "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/CallAnAPI/appId/"+$DownstreamAPIAadApplication.AppId+"/objectId/"+$DownstreamAPIAadApplication.ObjectId+"/isMSAApp/"
   Add-Content -Value "<tr><td>DownstreamAPI</td><td>$currentAppId</td><td><a href='$DownstreamAPIPortalUrl'>msal-react-downstream</a></td></tr>" -Path createdApps.html


   # Create the MiddletierAPI AAD application
   Write-Host "Creating the AAD application (msal-react-middletier)"
   # Get a 2 years application key for the MiddletierAPI Application
   $pw = ComputePassword
   $fromDate = [DateTime]::Now;
   $key = CreateAppKey -fromDate $fromDate -durationInYears 2 -pw $pw
   $MiddletierAPIAppKey = $pw
   # create the application 
   $MiddletierAPIAadApplication = New-AzureADApplication -DisplayName "msal-react-middletier" `
                                                         -HomePage "http://localhost:5000/api" `
                                                         -PasswordCredentials $key `
                                                         -PublicClient $False

   $MiddletierAPIIdentifierUri = 'api://'+$MiddletierAPIAadApplication.AppId
   Set-AzureADApplication -ObjectId $MiddletierAPIAadApplication.ObjectId -IdentifierUris $MiddletierAPIIdentifierUri

   # create the service principal of the newly created application 
   $currentAppId = $MiddletierAPIAadApplication.AppId
   $MiddletierAPIServicePrincipal = New-AzureADServicePrincipal -AppId $currentAppId -Tags {WindowsAzureActiveDirectoryIntegratedApp}

   # add the user running the script as an app owner if needed
   $owner = Get-AzureADApplicationOwner -ObjectId $MiddletierAPIAadApplication.ObjectId
   if ($owner -eq $null)
   { 
        Add-AzureADApplicationOwner -ObjectId $MiddletierAPIAadApplication.ObjectId -RefObjectId $user.ObjectId
        Write-Host "'$($user.UserPrincipalName)' added as an application owner to app '$($MiddletierAPIServicePrincipal.DisplayName)'"
   }

    # rename the user_impersonation scope if it exists to match the readme steps or add a new scope
    $scopes = New-Object System.Collections.Generic.List[Microsoft.Open.AzureAD.Model.OAuth2Permission]
   
    # delete default scope i.e. User_impersonation
    $scope = $serviceAadApplication.Oauth2Permissions | Where-Object { $_.Value -eq "User_impersonation" }
    if($scope -ne $null)
    {
       # disable the scope
       $scope.IsEnabled = $false
       $scopes.Add($scope)
       Set-AzureADApplication -ObjectId $serviceAadApplication.ObjectId -Oauth2Permissions $scopes

       # clear the scope
       $scopes.Clear()
       Set-AzureADApplication -ObjectId $serviceAadApplication.ObjectId -Oauth2Permissions $scopes
    }

    if ($scopes.Count -ge 0) 
    {
             $scope = CreateScope -value access_as_user  `
                -userConsentDisplayName "Access msal-react-middletier"  `
                -userConsentDescription "Allow the application to access msal-react-middletier on your behalf."  `
                -adminConsentDisplayName "Access msal-react-middletier"  `
                -adminConsentDescription "Allows the app to have the same access to information in the directory on behalf of the signed-in user."
            
                $scopes.Add($scope)
    
    }
     
    # add/update scopes
    Set-AzureADApplication -ObjectId $serviceAadApplication.ObjectId -OAuth2Permission $scopes

   Write-Host "Done creating the MiddletierAPI application (msal-react-middletier)"

   # URL of the AAD application in the Azure portal
   # Future? $MiddletierAPIPortalUrl = "https://portal.azure.com/#@"+$tenantName+"/blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/appId/"+$MiddletierAPIAadApplication.AppId+"/objectId/"+$MiddletierAPIAadApplication.ObjectId+"/isMSAApp/"
   $MiddletierAPIPortalUrl = "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/CallAnAPI/appId/"+$MiddletierAPIAadApplication.AppId+"/objectId/"+$MiddletierAPIAadApplication.ObjectId+"/isMSAApp/"
   Add-Content -Value "<tr><td>MiddletierAPI</td><td>$currentAppId</td><td><a href='$MiddletierAPIPortalUrl'>msal-react-middletier</a></td></tr>" -Path createdApps.html

   $requiredResourcesAccess = New-Object System.Collections.Generic.List[Microsoft.Open.AzureAD.Model.RequiredResourceAccess]

   # Add Required Resources Access (from 'MiddletierAPI' to 'DownstreamAPI')
   Write-Host "Getting access from 'MiddletierAPI' to 'DownstreamAPI'"
   $requiredPermissions = GetRequiredPermissions -applicationDisplayName "msal-react-downstream" `
                                                -requiredDelegatedPermissions "access_downstream_as_user" `

   $requiredResourcesAccess.Add($requiredPermissions)


   Set-AzureADApplication -ObjectId $MiddletierAPIAadApplication.ObjectId -RequiredResourceAccess $requiredResourcesAccess
   Write-Host "Granted permissions."

   # Create the spa AAD application
   Write-Host "Creating the AAD application (msal-react-spa)"
   # create the application 
   $spaAadApplication = New-AzureADApplication -DisplayName "msal-react-spa" `
                                               -HomePage "http://localhost:3000/" `
                                               -ReplyUrls "http://localhost:3000/" `
                                               -IdentifierUris "https://$tenantName/msal-react-spa" `
                                               -PublicClient $False

   # create the service principal of the newly created application 
   $currentAppId = $spaAadApplication.AppId
   $spaServicePrincipal = New-AzureADServicePrincipal -AppId $currentAppId -Tags {WindowsAzureActiveDirectoryIntegratedApp}

   # add the user running the script as an app owner if needed
   $owner = Get-AzureADApplicationOwner -ObjectId $spaAadApplication.ObjectId
   if ($owner -eq $null)
   { 
        Add-AzureADApplicationOwner -ObjectId $spaAadApplication.ObjectId -RefObjectId $user.ObjectId
        Write-Host "'$($user.UserPrincipalName)' added as an application owner to app '$($spaServicePrincipal.DisplayName)'"
   }


   Write-Host "Done creating the spa application (msal-react-spa)"

   # URL of the AAD application in the Azure portal
   # Future? $spaPortalUrl = "https://portal.azure.com/#@"+$tenantName+"/blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/appId/"+$spaAadApplication.AppId+"/objectId/"+$spaAadApplication.ObjectId+"/isMSAApp/"
   $spaPortalUrl = "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/CallAnAPI/appId/"+$spaAadApplication.AppId+"/objectId/"+$spaAadApplication.ObjectId+"/isMSAApp/"
   Add-Content -Value "<tr><td>spa</td><td>$currentAppId</td><td><a href='$spaPortalUrl'>msal-react-spa</a></td></tr>" -Path createdApps.html

   $requiredResourcesAccess = New-Object System.Collections.Generic.List[Microsoft.Open.AzureAD.Model.RequiredResourceAccess]

   # Add Required Resources Access (from 'spa' to 'MiddletierAPI')
   Write-Host "Getting access from 'spa' to 'MiddletierAPI'"
   $requiredPermissions = GetRequiredPermissions -applicationDisplayName "msal-react-middletier" `
                                                -requiredDelegatedPermissions "access_middletier_as_user" `

   $requiredResourcesAccess.Add($requiredPermissions)


   Set-AzureADApplication -ObjectId $spaAadApplication.ObjectId -RequiredResourceAccess $requiredResourcesAccess
   Write-Host "Granted permissions."

   # Configure known client applications for MiddletierAPI 
   Write-Host "Configure known client applications for the 'MiddletierAPI'"
   $knowApplications = New-Object System.Collections.Generic.List[System.String]
    $knowApplications.Add($spaAadApplication.AppId)
   Set-AzureADApplication -ObjectId $MiddletierAPIAadApplication.ObjectId -KnownClientApplications $knowApplications
   Write-Host "Configured."


   # Update config file for 'DownstreamAPI'
   $configFile = $pwd.Path + "\..\DownstreamAPI\config.json"
   Write-Host "Updating the sample code ($configFile)"
   $dictionary = @{ "clientID" = $DownstreamAPIAadApplication.AppId;"tenantID" = $tenantId };
   UpdateTextFile -configFilePath $configFile -dictionary $dictionary

   # Update config file for 'middletierAPI'
   $configFile = $pwd.Path + "\..\MiddletierAPI\config.json"
   Write-Host "Updating the sample code ($configFile)"
   $dictionary = @{ "clientID" = $middletierAPIAadApplication.AppId;"tenantID" = $tenantId;"clientSecret" = $middletierAPIAppKey };
   UpdateTextFile -configFilePath $configFile -dictionary $dictionary

   # Update config file for 'middletierAPI'
   $configFile = $pwd.Path + "\..\MiddletierAPI\config.json"
   Write-Host "Updating the sample code ($configFile)"
   $dictionary = @{ "Enter_the_Web_Api_Scope_Here" = ("api://"+$DownstreamAPIAadApplication.AppId+"/access_as_user") };
   ReplaceInTextFile -configFilePath $configFile -dictionary $dictionary

   # Update config file for 'spa'
   $configFile = $pwd.Path + "\..\SPA\src\authConfig.js"
   Write-Host "Updating the sample code ($configFile)"
   $dictionary = @{ "Enter_the_Application_Id_Here" = $spaAadApplication.AppId;"https://login.microsoftonline.com/Enter_the_Tenant_Info_Here" = "https://login.microsoftonline.com/"+$tenantId;"Enter_the_Web_Api_Scope_Here" = ("api://"+$MiddletierAPIAadApplication.AppId+"/access_as_user") };
   ReplaceInTextFile -configFilePath $configFile -dictionary $dictionary
   Write-Host ""
   Write-Host -ForegroundColor Green "------------------------------------------------------------------------------------------------" 
   Write-Host "IMPORTANT: Please follow the instructions below to complete a few manual step(s) in the Azure portal":
   Write-Host "- For 'DownstreamAPI'"
   Write-Host "  - Navigate to '$DownstreamAPIPortalUrl'"
   Write-Host "  - Navigate to the Manifest and set 'accessTokenAcceptedVersion' to '2' instead of 'null'" -ForegroundColor Red 
   Write-Host "  - Create a new conditional access policy as described in the sample's README" -ForegroundColor Red 
   Write-Host "- For 'MiddletierAPI'"
   Write-Host "  - Navigate to '$MiddletierAPIPortalUrl'"
   Write-Host "  - Navigate to the Manifest and set 'accessTokenAcceptedVersion' to '2' instead of 'null'" -ForegroundColor Red 
   Write-Host "- For 'spa'"
   Write-Host "  - Navigate to '$spaPortalUrl'"
   Write-Host "  - Navigate to the Manifest page, find the 'replyUrlsWithType' section and change the type of redirect URI to 'Spa'" -ForegroundColor Red 

   Write-Host -ForegroundColor Green "------------------------------------------------------------------------------------------------" 
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
if ((Get-Module -ListAvailable -Name "AzureAD") -eq $null) { 
    Install-Module "AzureAD" -Scope CurrentUser 
}

Import-Module AzureAD

# Run interactively (will ask you for the tenant ID)
ConfigureApplications -Credential $Credential -tenantId $TenantId