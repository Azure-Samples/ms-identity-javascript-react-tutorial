
[CmdletBinding()]
param(    
    [Parameter(Mandatory=$False, HelpMessage='Tenant ID (This is a GUID which represents the "Directory ID" of the AzureAD tenant into which you want to create the apps')]
    [string] $tenantId,
    [Parameter(Mandatory=$False, HelpMessage='Azure environment to use while running the script. Default = Global')]
    [string] $azureEnvironmentName
)

Function Cleanup
{
    if (!$azureEnvironmentName)
    {
        $azureEnvironmentName = "Global"
    }

    <#
    .Description
    This function removes the Azure AD applications for the sample. These applications were created by the Configure.ps1 script
    #>

    # $tenantId is the Active Directory Tenant. This is a GUID which represents the "Directory ID" of the AzureAD tenant 
    # into which you want to create the apps. Look it up in the Azure portal in the "Properties" of the Azure AD. 

    # Connect to the Microsoft Graph API
    Write-Host "Connecting to Microsoft Graph"
    if ($tenantId -eq "") {
        Connect-MgGraph -Scopes "Application.ReadWrite.All" -Environment $azureEnvironmentName
        $tenantId = (Get-MgContext).TenantId
    }
    else {
        Connect-MgGraph -TenantId $tenantId -Scopes "Application.ReadWrite.All" -Environment $azureEnvironmentName
    }
    
    # Removes the applications
    Write-Host "Cleaning-up applications from tenant '$tenantId'"

    Write-Host "Removing 'client' (msal-react-app) if needed"
    try
    {
        Get-MgApplication -Filter "DisplayName eq 'msal-react-app'" | ForEach-Object {Remove-MgApplication -ApplicationId $_.Id }
    }
    catch
    {
        $message = $_
        Write-Warning $Error[0]
        Write-Host "Unable to remove the application 'msal-react-app'. Error is $message. Try deleting manually." -ForegroundColor White -BackgroundColor Red
    }

    Write-Host "Making sure there are no more (msal-react-app) applications found, will remove if needed..."
    $apps = Get-MgApplication -Filter "DisplayName eq 'msal-react-app'" | Format-List Id, DisplayName, AppId, SignInAudience, PublisherDomain
    
    if ($apps)
    {
        Remove-MgApplication -ApplicationId $apps.Id
    }

    foreach ($app in $apps) 
    {
        Remove-MgApplication -ApplicationId $app.Id
        Write-Host "Removed msal-react-app.."
    }

    # also remove service principals of this app
    try
    {
        Get-MgServicePrincipal -filter "DisplayName eq 'msal-react-app'" | ForEach-Object {Remove-MgServicePrincipal -ServicePrincipalId $_.Id -Confirm:$false}
    }
    catch
    {
        $message = $_
        Write-Warning $Error[0]
        Write-Host "Unable to remove ServicePrincipal 'msal-react-app'. Error is $message. Try deleting manually from Enterprise applications." -ForegroundColor White -BackgroundColor Red
    }
     Write-Host "You may want to remove the security group 'GroupAdmin' if it was created to test this sample only."
     #if($null -ne (Get-MgGroup -Filter  "DisplayName eq 'GroupAdmin'")) 
     #{
     #   Remove-MgGroup -GroupId (Get-MgGroup -Filter  "DisplayName eq 'GroupAdmin'").Id
     #}
     Write-Host "You may want to remove the security group 'GroupMember' if it was created to test this sample only."
     #if($null -ne (Get-MgGroup -Filter  "DisplayName eq 'GroupMember'")) 
     #{
     #   Remove-MgGroup -GroupId (Get-MgGroup -Filter  "DisplayName eq 'GroupMember'").Id
     #}
}

if ($null -eq (Get-Module -ListAvailable -Name "Microsoft.Graph.Applications")) { 
    Install-Module "Microsoft.Graph.Applications" -Scope CurrentUser                                            
} 
Import-Module Microsoft.Graph.Applications
$ErrorActionPreference = "Stop"


Cleanup -tenantId $tenantId -environment $azureEnvironmentName

Write-Host "Disconnecting from tenant"
Disconnect-MgGraph
