# health_test.ps1
$config = @{
    apiUrl = "https://golf-course-recommendation-engin-production.up.railway.app"
}

Write-Host "Testing API health..."
try {
    $response = Invoke-RestMethod -Uri "$($config.apiUrl)/api/health"
    Write-Host "Health check response:"
    $response | ConvertTo-Json
} catch {
    Write-Host "Error:"
    Write-Host $_.Exception.Message
}