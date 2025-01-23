# Load .env file
$envFile = ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1]
            $value = $matches[2]
            Set-Item "env:$key" $value
        }
    }
}

# Use environment variables with production URL
$body = @{
    email = $env:TEST_USER_EMAIL
    password = $env:TEST_USER_PASSWORD
} | ConvertTo-Json

Write-Host "Attempting to get token for $($env:TEST_USER_EMAIL)..."

# Make the request to production
$response = Invoke-RestMethod -Uri "https://golf-course-recommendation-engin-production.up.railway.app/api/debug/token" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

# Output the token
Write-Host "`nAccess Token (copy this to your .env file):`n"
Write-Host "TEST_TOKEN=$($response.access_token)"