# auth_test.ps1

# Configuration
$config = @{
    supabaseUrl = "https://nkknwkentrbbyzgqgpfd.supabase.co"
    apiUrl = "https://golf-course-recommendation-engin-production.up.railway.app"
}

Write-Host "Starting API test..."

# First, verify environment
Write-Host "`n1. Checking environment..."
Write-Host "Supabase URL: $($config.supabaseUrl)"
Write-Host "API URL: $($config.apiUrl)"

# Get the anon key from .env file if it exists
$envPath = "server/.env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match "SUPABASE_ANON_KEY=(.*)") {
            $config.anonKey = $matches[1]
            Write-Host "Found anon key in .env file"
        }
    }
}

if (-not $config.anonKey) {
    $config.anonKey = Read-Host "Enter your Supabase anon key"
}

# Test API connection with error handling
Write-Host "`n2. Testing API connection..."
try {
    $apiTest = Invoke-WebRequest `
        -Uri "$($config.apiUrl)/api/debug/cors" `
        -Method Get `
        -UseBasicParsing

    Write-Host "API Status: $($apiTest.StatusCode)"
    Write-Host "API Response:"
    Write-Host $apiTest.Content
} catch {
    Write-Host "API connection failed:"
    Write-Host "Error: $($_.Exception.Message)"
    
    # Try ping test
    Write-Host "`nTrying to ping API..."
    $pingTest = Test-NetConnection -ComputerName "golf-course-recommendation-engin-production.up.railway.app" -Port 443
    Write-Host "Ping test result: $($pingTest.TcpTestSucceeded)"
}

# Test Supabase connection
Write-Host "`n3. Testing Supabase connection..."
try {
    $headers = @{
        "apikey" = $config.anonKey
        "Content-Type" = "application/json"
    }

    Write-Host "Testing with headers:"
    $headers | ConvertTo-Json

    $supabaseTest = Invoke-WebRequest `
        -Uri "$($config.supabaseUrl)/auth/v1/health" `
        -Method Get `
        -Headers $headers `
        -UseBasicParsing

    Write-Host "Supabase Status: $($supabaseTest.StatusCode)"
    Write-Host "Supabase Response:"
    Write-Host $supabaseTest.Content

    # If we got here, try the magic link
    Write-Host "`n4. Would you like to send a magic link? (y/n)"
    $sendLink = Read-Host

    if ($sendLink -eq 'y') {
        $email = Read-Host "Enter your email address"
        
        Write-Host "Sending magic link to $email..."
        $loginBody = @{
            email = $email
            options = @{
                emailRedirectTo = "https://golf-club-ui-lac.vercel.app/login"
            }
        } | ConvertTo-Json

        $authResponse = Invoke-WebRequest `
            -Uri "$($config.supabaseUrl)/auth/v1/otp" `
            -Method Post `
            -Headers $headers `
            -Body $loginBody `
            -UseBasicParsing

        Write-Host "Magic link sent! Check your email."
    }

} catch {
    Write-Host "Supabase connection failed:"
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
        
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody"
        $reader.Dispose()
    }
}

Write-Host "`nTest complete!"