
[CmdletBinding()]
param(    
    [Parameter(Mandatory=$False, HelpMessage='Tenant ID (This is a GUID which represents the "Directory ID" of the AzureAD tenant into which you want to create the apps')]
    [string] $tenantId,
    [Parameter(Mandatory=$False, HelpMessage='Azure environment to use while running the script. Default = Global')]
    [string] $azureEnvironmentName
)

Function Get-RandomPassword {
    param (
        [Parameter(Mandatory)]
        [ValidateRange(4,[int]::MaxValue)]
        [int] $length,
        [int] $upper = 1,
        [int] $lower = 1,
        [int] $numeric = 1,
        [int] $special = 1
    )
    if($upper + $lower + $numeric + $special -gt $length) {
        throw "number of upper/lower/numeric/special char must be lower or equal to length"
    }
    $uCharSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    $lCharSet = "abcdefghijklmnopqrstuvwxyz"
    $nCharSet = "0123456789"
    $sCharSet = "/*-+,!?=()@;:._"
    $charSet = ""
    if($upper -gt 0) { $charSet += $uCharSet }
    if($lower -gt 0) { $charSet += $lCharSet }
    if($numeric -gt 0) { $charSet += $nCharSet }
    if($special -gt 0) { $charSet += $sCharSet }
    
    $charSet = $charSet.ToCharArray()
    $rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
    $bytes = New-Object byte[]($length)
    $rng.GetBytes($bytes)
 
    $result = New-Object char[]($length)
    for ($i = 0 ; $i -lt $length ; $i++) {
        $result[$i] = $charSet[$bytes[$i] % $charSet.Length]
    }
    $password = (-join $result)
    $valid = $true
    if($upper   -gt ($password.ToCharArray() | Where-Object {$_ -cin $uCharSet.ToCharArray() }).Count) { $valid = $false }
    if($lower   -gt ($password.ToCharArray() | Where-Object {$_ -cin $lCharSet.ToCharArray() }).Count) { $valid = $false }
    if($numeric -gt ($password.ToCharArray() | Where-Object {$_ -cin $nCharSet.ToCharArray() }).Count) { $valid = $false }
    if($special -gt ($password.ToCharArray() | Where-Object {$_ -cin $sCharSet.ToCharArray() }).Count) { $valid = $false }
 
    if(!$valid) {
         $password = Get-RandomPassword $length $upper $lower $numeric $special
    }
    return $password
}

Function CreateUser([string] $appName, $role, [string] $tenantName) 
{
    $displayName =  $appName +"-" + $role.Value
    $userEmail = $displayName + "@" + $tenantName 
    $nickName = $role.Value
    $password =  Get-RandomPassword 8

     $PasswordProfile = @{
        Password =  $password
    }

   $user =  Get-MgUser -Filter "UserPrincipalName eq '$($userEmail)'" 

    if(!$user)
    {
        $user = New-MgUser -DisplayName $displayName -PasswordProfile $PasswordProfile -AccountEnabled -MailNickName $nickName -UserPrincipalName $userEmail
        Write-Host "Email: is "($user.UserPrincipalName)" and password is $password"
    }
    else
    {
        Write-Host "Email: "($user.UserPrincipalName)" already exists"
    }

    return $user
}


Function CreateRolesUsersAndRoleAssignments
{
    if (!$azureEnvironmentName)
    {
        $azureEnvironmentName = "Global"
    }

    Write-Host "Connecting to Microsoft Graph"

    if ($tenantId -eq "") 
    {
        Connect-MgGraph -Scopes "Application.Read.All AppRoleAssignment.ReadWrite.All User.ReadWrite.All" -Environment $azureEnvironmentName
        $tenantId = (Get-MgContext).TenantId
    }
    else 
    {
        Connect-MgGraph -TenantId $tenantId -Scopes "Application.Read.All AppRoleAssignment.ReadWrite.All User.ReadWrite.All" -Environment $azureEnvironmentName
    }

    $userAccount = (Get-MgContext).Account
    $split = $userAccount.Split("@")
    $tenantName = $split[1]

     Write-Host "get the AAD application (msal-react-spa)"
    $app = Get-MgApplication -Filter "DisplayName eq 'msal-react-spa'" 

        if ($app)
        {
           $servicePrincipal = Get-MgServicePrincipal -Filter "AppId eq '$($app.AppId)'"
           $appName = $app.DisplayName

       $TaskAdmin = $servicePrincipal.AppRoles | Where-Object { $_.DisplayName -eq "TaskAdmin" }
       # Creating a user 
       $newUser = CreateUser -appName $appName -role $TaskAdmin -tenantName $tenantName
       $assignRole = New-MgUserAppRoleAssignment -Userid $newUser.Id -PrincipalId $newUser.Id -ResourceId $servicePrincipal.Id -AppRoleID $TaskAdmin.Id

       $TaskUser = $servicePrincipal.AppRoles | Where-Object { $_.DisplayName -eq "TaskUser" }
       # Creating a user 
       $newUser = CreateUser -appName $appName -role $TaskUser -tenantName $tenantName
       $assignRole = New-MgUserAppRoleAssignment -Userid $newUser.Id -PrincipalId $newUser.Id -ResourceId $servicePrincipal.Id -AppRoleID $TaskUser.Id

        }
        else
        {
            Write-Host "Couldn't find application (msal-react-spa)"  -BackgroundColor Red
        }
}

if ($null -eq (Get-Module -ListAvailable -Name "Microsoft.Graph.Authentication")) {
    Install-Module "Microsoft.Graph.Authentication" -Scope CurrentUser 
}

Import-Module Microsoft.Graph.Authentication

if ($null -eq (Get-Module -ListAvailable -Name "Microsoft.Graph.Applications")) {
    Install-Module "Microsoft.Graph.Applications" -Scope CurrentUser 
}

Import-Module Microsoft.Graph.Applications

if ($null -eq (Get-Module -ListAvailable -Name "Microsoft.Graph.Users")) {
    Install-Module "Microsoft.Graph.Users" -Scope CurrentUser 
}

Import-Module Microsoft.Graph.Users

try
{
    # Run interactively (will ask you for the tenant ID)
    CreateRolesUsersAndRoleAssignments -tenantId $tenantId -environment $azureEnvironmentName
}
catch
{
    $_.Exception.ToString() | out-host
    $message = $_
    Write-Warning $Error[0]    
    Write-Host "Unable to configure app roles and assignments. Error is $message." -ForegroundColor White -BackgroundColor Red
}

Write-Host "Disconnecting from tenant"
Disconnect-MgGraph