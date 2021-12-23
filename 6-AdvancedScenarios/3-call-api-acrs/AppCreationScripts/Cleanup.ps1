[CmdletBinding()]
param(    
    [Parameter(Mandatory=$False, HelpMessage='Tenant ID (This is a GUID which represents the "Directory ID" of the AzureAD tenant into which you want to create the apps')]
    [string] $tenantId,
    [Parameter(Mandatory=$False, HelpMessage='Azure environment to use while running the script (it defaults to AzureCloud)')]
    [string] $azureEnvironmentName
)

#Requires -Modules Microsoft.Graph.Applications

if ($null -eq (Get-Module -ListAvailable -Name "Microsoft.Graph.Applications")) { 
    Install-Module "Microsoft.Graph.Applications" -Scope CurrentUser                                            
} 
Import-Module Microsoft.Graph.Applications
$ErrorActionPreference = "Stop"

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
    Write-Host "Connecting Microsoft Graph"
    Connect-MgGraph -TenantId $TenantId -Scopes "Application.ReadWrite.All" -Environment $azureEnvironmentName
    
    # Removes the applications
    Write-Host "Cleaning-up applications from tenant '$tenantId'"

    Write-Host "Removing 'service' (msal-node-api-acrs) if needed"
    try
    {
        Get-MgApplication -Filter "DisplayName eq 'msal-node-api-acrs'"  | ForEach-Object {Remove-MgApplication -ApplicationId $_.Id }
    }
    catch
    {
	    Write-Host "Unable to remove the 'msal-node-api-acrs' . Try deleting manually." -ForegroundColor White -BackgroundColor Red
    }

    Write-Host "Making sure there are no more (msal-node-api-acrs) applications found, will remove if needed..."
    $apps = Get-MgApplication -Filter "DisplayName eq 'msal-node-api-acrs'"
    
    if ($apps)
    {
        Remove-MgApplication -ApplicationId $apps.Id
    }

    foreach ($app in $apps) 
    {
        Remove-MgApplication -ApplicationId $app.Id
        Write-Host "Removed msal-node-api-acrs.."
    }

    # also remove service principals of this app
    try
    {
        Get-MgServicePrincipal -filter "DisplayName eq 'msal-node-api-acrs'" | ForEach-Object {Remove-MgServicePrincipal -ApplicationId $_.Id -Confirm:$false}
    }
    catch
    {
	    Write-Host "Unable to remove ServicePrincipal 'msal-node-api-acrs' . Try deleting manually from Enterprise applications." -ForegroundColor White -BackgroundColor Red
    }
    Write-Host "Removing 'client' (msal-react-spa-acrs) if needed"
    try
    {
        Get-MgApplication -Filter "DisplayName eq 'msal-react-spa-acrs'"  | ForEach-Object {Remove-MgApplication -ApplicationId $_.Id }
    }
    catch
    {
	    Write-Host "Unable to remove the 'msal-react-spa-acrs' . Try deleting manually." -ForegroundColor White -BackgroundColor Red
    }

    Write-Host "Making sure there are no more (msal-react-spa-acrs) applications found, will remove if needed..."
    $apps = Get-MgApplication -Filter "DisplayName eq 'msal-react-spa-acrs'"
    
    if ($apps)
    {
        Remove-MgApplication -ApplicationId $apps.Id
    }

    foreach ($app in $apps) 
    {
        Remove-MgApplication -ApplicationId $app.Id
        Write-Host "Removed msal-react-spa-acrs.."
    }

    # also remove service principals of this app
    try
    {
        Get-MgServicePrincipal -filter "DisplayName eq 'msal-react-spa-acrs'" | ForEach-Object {Remove-MgServicePrincipal -ApplicationId $_.Id -Confirm:$false}
    }
    catch
    {
	    Write-Host "Unable to remove ServicePrincipal 'msal-react-spa-acrs' . Try deleting manually from Enterprise applications." -ForegroundColor White -BackgroundColor Red
    }
}

Cleanup -tenantId $TenantId

