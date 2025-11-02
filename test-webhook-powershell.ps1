# PowerShell script to test webhook endpoints
# Usage: .\test-webhook-powershell.ps1

$BACKEND_URL = "https://miracole-backend.onrender.com"
$API_KEY = "miracole_secret_key_123"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "WordPress Webhook Test (PowerShell)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health endpoint
Write-Host "🔍 Testing Health Endpoint..." -ForegroundColor Yellow
Write-Host "URL: $BACKEND_URL/health" -ForegroundColor Gray
Write-Host ""

try {
    $healthResponse = Invoke-WebRequest -Uri "$BACKEND_URL/health" -Method GET -UseBasicParsing
    Write-Host "✅ Health endpoint is working!" -ForegroundColor Green
    Write-Host "Status: $($healthResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($healthResponse.Content)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Health endpoint failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Test 2: Webhook endpoint with X-API-KEY
Write-Host "🔍 Testing Webhook Endpoint (/api/members/sync)" -ForegroundColor Yellow
Write-Host "URL: $BACKEND_URL/api/members/sync" -ForegroundColor Gray
Write-Host ""

$body = @{
    user_id = 123
    level_id = 3
    email = "test@example.com"
    action = "membership_change"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "X-API-KEY" = $API_KEY
}

try {
    $webhookResponse = Invoke-WebRequest -Uri "$BACKEND_URL/api/members/sync" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "✅ Webhook endpoint is working!" -ForegroundColor Green
    Write-Host "Status: $($webhookResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($webhookResponse.Content)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Webhook endpoint failed!" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "Status: $statusCode" -ForegroundColor Red
        
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Test 3: Webhook with Authorization Bearer
Write-Host "🔍 Testing Webhook with Authorization Bearer..." -ForegroundColor Yellow
Write-Host ""

$headersBearer = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $API_KEY"
}

try {
    $webhookResponse2 = Invoke-WebRequest -Uri "$BACKEND_URL/api/members/sync" `
        -Method POST `
        -Headers $headersBearer `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "✅ Webhook with Bearer token is working!" -ForegroundColor Green
    Write-Host "Status: $($webhookResponse2.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($webhookResponse2.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Webhook with Bearer token failed!" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "Status: $statusCode" -ForegroundColor Red
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

