# auth_flow_test.ps1

# Configuration
$config = @{
    supabaseUrl = "https://nkknwkentrbbyzgqgpfd.supabase.co"
    apiUrl = "https://golf-course-recommendation-engin-production.up.railway.app"
}

# Get anon key from .env
$envPath = "server/.env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match "SUPABASE_ANON_KEY=(.*)") {
            $config.anonKey = $matches[1]
        }
    }
}

Write-Host "Starting auth flow test..."

# Step 1: Create a test user or use existing one
Write-Host "`n1. Testing user authentication..."
$email = Read-Host "Enter test user email"
$password = Read-Host "Enter test user password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$passwordText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

try {
    # Sign in with email/password
    $loginHeaders = @{
        "apikey" = $config.anonKey
        "Content-Type" = "application/json"
    }

    $loginBody = @{
        email = $email
        password = $passwordText
    } | ConvertTo-Json

    Write-Host "`nAttempting login..."
    $authResponse = Invoke-RestMethod `
        -Uri "$($config.supabaseUrl)/auth/v1/token?grant_type=password" `
        -Method Post `
        -Headers $loginHeaders `
        -Body $loginBody

    $token = $authResponse.access_token
    Write-Host "Login successful! Token: $($token.Substring(0, 10))..."

    # Test profile endpoint
    Write-Host "`n2. Testing golfer profile endpoint..."
    $profileHeaders = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    try {
        Write-Host "Making request to: $($config.apiUrl)/api/get-golfer-profile"
        Write-Host "With token prefix: $($token.Substring(0, 10))..."
        
        $profileResponse = Invoke-RestMethod `
            -Uri "$($config.apiUrl)/api/get-golfer-profile" `
            -Method Get `
            -Headers $profileHeaders `
            -Verbose

        Write-Host "Profile response:"
        $profileResponse | ConvertTo-Json -Depth 10
    } catch {
        Write-Host "`nError occurred:"
        Write-Host "StatusCode:" $_.Exception.Response.StatusCode.value__
        Write-Host "StatusDescription:" $_.Exception.Response.StatusDescription
        
        $rawResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($rawResponse)
        $rawResponse.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body:" $responseBody
        
        # Add more debug info
        Write-Host "`nRequest Details:"
        Write-Host "URL: $($config.apiUrl)/api/get-golfer-profile"
        Write-Host "Headers:" 
        $profileHeaders | ConvertTo-Json
    }

} catch {
    Write-Host "`nError occurred:"
    Write-Host "StatusCode:" $_.Exception.Response.StatusCode.value__
    Write-Host "StatusDescription:" $_.Exception.Response.StatusDescription
    
    $rawResponse = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($rawResponse)
    $rawResponse.Position = 0
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response body:" $responseBody
}

# Clean up
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)