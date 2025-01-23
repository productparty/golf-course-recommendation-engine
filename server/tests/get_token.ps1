# Load .env file from server directory
$envFile = "server/.env"
if (!(Test-Path $envFile)) {
    Write-Host "Error: .env file not found at $envFile"
    exit 1
}

# Clear existing env variables
$env:TEST_USER_EMAIL = $null
$env:TEST_USER_PASSWORD = $null

# Load and set environment variables
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Item "env:$key" $value
    }
}

# Verify required variables
if (!$env:TEST_USER_EMAIL -or !$env:TEST_USER_PASSWORD) {
    Write-Host "Error: TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env file"
    exit 1
}

Write-Host "Attempting to get token for $($env:TEST_USER_EMAIL)..."

# Prepare request body
$body = @{
    email = $env:TEST_USER_EMAIL
    password = $env:TEST_USER_PASSWORD
} | ConvertTo-Json

Write-Host "Making request to API..."

# Make the request
try {
    $response = Invoke-RestMethod `
        -Uri "https://golf-course-recommendation-engin-production.up.railway.app/api/debug/token" `
        -Method Post `
        -Body $body `
        -ContentType "application/json"

    Write-Host "`nAccess Token (copy this to your .env file):`n"
    Write-Host "TEST_TOKEN=$($response.access_token)"
} catch {
    Write-Host "Error: $_"
    Write-Host "Response: $($_.ErrorDetails.Message)"
}