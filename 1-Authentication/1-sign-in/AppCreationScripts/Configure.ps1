 
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
   Primary entry method to create and configure app registrations
#> 
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
        Connect-MgGraph -Scopes "User.Read.All Organization.Read.All Application.ReadWrite.All" -Environment $azureEnvironmentName
    }
    else {
        Connect-MgGraph -TenantId $tenantId -Scopes "User.Read.All Organization.Read.All Application.ReadWrite.All" -Environment $azureEnvironmentName
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
   Write-Host "Creating the AAD application (msal-react-spa)"
   # create the application 
   $clientAadApplication = New-MgApplication -DisplayName "msal-react-spa" `
                                                      -Spa `
                                                      @{ `
                                                          RedirectUris = "http://localhost:3000/", "http://localhost:3000/redirect"; `
                                                        } `
                                                       -SignInAudience AzureADMyOrg `
                                                      #end of command

    $currentAppId = $clientAadApplication.AppId
    $currentAppObjectId = $clientAadApplication.Id

    $tenantName = (Get-MgApplication -ApplicationId $currentAppObjectId).PublisherDomain
    #Update-MgApplication -ApplicationId $currentAppObjectId -IdentifierUris @("https://$tenantName/msal-react-spa")
    
    # create the service principal of the newly created application     
    $clientServicePrincipal = New-MgServicePrincipal -AppId $currentAppId -Tags {WindowsAzureActiveDirectoryIntegratedApp}

    # add the user running the script as an app owner if needed
    $owner = Get-MgApplicationOwner -ApplicationId $currentAppObjectId
    if ($owner -eq $null)
    { 
        New-MgApplicationOwnerByRef -ApplicationId $currentAppObjectId  -BodyParameter = @{"@odata.id" = "htps://graph.microsoft.com/v1.0/directoryObjects/$user.ObjectId"}
        Write-Host "'$($user.UserPrincipalName)' added as an application owner to app '$($clientServicePrincipal.DisplayName)'"
    }
    Write-Host "Done creating the client application (msal-react-spa)"

    # URL of the AAD application in the Azure portal
    # Future? $clientPortalUrl = "https://portal.azure.com/#@"+$tenantName+"/blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/appId/"+$currentAppId+"/objectId/"+$currentAppObjectId+"/isMSAApp/"
    $clientPortalUrl = "https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/"+$currentAppId+"/isMSAApp~/false"

    Add-Content -Value "<tr><td>client</td><td>$currentAppId</td><td><a href='$clientPortalUrl'>msal-react-spa</a></td></tr>" -Path createdApps.html

    # print the registered app portal URL for any further navigation
    Write-Host "Successfully registered and configured that app registration for 'msal-react-spa' at `n $clientPortalUrl" -ForegroundColor Green 
    
    # Update config file for 'client'
    # $configFile = $pwd.Path + "\..\SPA\src\authConfig.js"
    $configFile = $(Resolve-Path ($pwd.Path + "\..\SPA\src\authConfig.js"))
    
    $dictionary = @{ "Enter_the_Application_Id_Here" = $clientAadApplication.AppId;"Enter_the_Tenant_Id_Here" = $tenantId };

    Write-Host "Updating the sample config '$configFile' with the following config values:" -ForegroundColor Yellow 
    $dictionary
    Write-Host "-----------------"

    ReplaceInTextFile -configFilePath $configFile -dictionary $dictionary
    Write-Host "- App client  - created at $clientPortalUrl"


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