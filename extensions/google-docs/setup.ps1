# Tone Slyder Google Docs Add-on Setup Script
# Run this from the extensions/google-docs directory

Write-Host "🎚️ Tone Slyder Google Docs Add-on Setup" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue

# Check if running from correct directory
if (-not (Test-Path "appsscript.json")) {
    Write-Host "❌ Error: Please run this script from the extensions/google-docs directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "Expected files: appsscript.json, Code.js" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Running from correct directory" -ForegroundColor Green

# Step 1: Check Node.js installation
Write-Host "`n📋 Step 1: Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 16+ first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Step 2: Install or check clasp
Write-Host "`n📋 Step 2: Installing Google clasp CLI..." -ForegroundColor Yellow
try {
    $claspVersion = clasp --version
    Write-Host "✅ clasp already installed: $claspVersion" -ForegroundColor Green
} catch {
    Write-Host "⏳ Installing clasp globally..." -ForegroundColor Yellow
    npm install -g @google/clasp
    
    # Verify installation
    try {
        $claspVersion = clasp --version
        Write-Host "✅ clasp installed successfully: $claspVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install clasp. Please try manually: npm install -g @google/clasp" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Check if user is logged in
Write-Host "`n📋 Step 3: Checking Google Apps Script authentication..." -ForegroundColor Yellow
try {
    clasp list >$null 2>&1
    Write-Host "✅ Already logged in to Google Apps Script" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please log in to Google Apps Script..." -ForegroundColor Yellow
    Write-Host "1. This will open a browser window" -ForegroundColor Cyan
    Write-Host "2. Log in to your Google account" -ForegroundColor Cyan
    Write-Host "3. Grant permissions to clasp" -ForegroundColor Cyan
    Write-Host "`nPress Enter to continue..." -ForegroundColor Yellow
    Read-Host
    
    clasp login
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully logged in!" -ForegroundColor Green
    } else {
        Write-Host "❌ Login failed. Please try again later." -ForegroundColor Red
        exit 1
    }
}

# Step 4: Check if project already exists
Write-Host "`n📋 Step 4: Setting up Apps Script project..." -ForegroundColor Yellow
if (Test-Path ".clasp.json") {
    $claspConfig = Get-Content ".clasp.json" | ConvertFrom-Json
    Write-Host "✅ Project already exists: $($claspConfig.scriptId)" -ForegroundColor Green
} else {
    Write-Host "⏳ Creating new Apps Script project..." -ForegroundColor Yellow
    clasp create --type standalone --title "Tone Slyder"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Project created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create project. Check your Google Apps Script API is enabled:" -ForegroundColor Red
        Write-Host "   https://script.google.com/home/usersettings" -ForegroundColor Yellow
        exit 1
    }
}

# Step 5: Configure API endpoint
Write-Host "`n📋 Step 5: Configuring API endpoint..." -ForegroundColor Yellow
Write-Host "Choose your backend configuration:" -ForegroundColor Cyan
Write-Host "1. Local backend (localhost:8080)" -ForegroundColor Cyan  
Write-Host "2. Local backend with ngrok tunnel" -ForegroundColor Cyan
Write-Host "3. Deployed backend (custom URL)" -ForegroundColor Cyan

do {
    $choice = Read-Host "Enter your choice (1-3)"
} while ($choice -notmatch '^[1-3]$')

switch ($choice) {
    "1" {
        $apiUrl = "http://localhost:8080"
        Write-Host "⚠️ Note: This will only work if your backend runs on localhost:8080" -ForegroundColor Yellow
        Write-Host "   Make sure to start your backend: npm run dev:backend" -ForegroundColor Yellow
    }
    "2" {
        Write-Host "`nTo use ngrok:" -ForegroundColor Yellow
        Write-Host "1. Download ngrok from: https://ngrok.com/download" -ForegroundColor Cyan
        Write-Host "2. Start your backend: npm run dev:backend" -ForegroundColor Cyan  
        Write-Host "3. In another terminal: ngrok http 8080" -ForegroundColor Cyan
        Write-Host "4. Copy the https URL (e.g., https://abc123.ngrok.io)" -ForegroundColor Cyan
        
        do {
            $apiUrl = Read-Host "`nEnter your ngrok HTTPS URL"
        } while ($apiUrl -notlike "https://*")
    }
    "3" {
        do {
            $apiUrl = Read-Host "Enter your deployed backend URL (must start with https://)"
        } while ($apiUrl -notlike "https://*")
    }
}

# Update Code.js with the API URL
$codeContent = Get-Content "Code.js" -Raw
$updatedContent = $codeContent -replace "https://api\.toneslyder\.com", $apiUrl
Set-Content "Code.js" -Value $updatedContent
Write-Host "✅ Updated API endpoint to: $apiUrl" -ForegroundColor Green

# Step 6: Push code to Apps Script
Write-Host "`n📋 Step 6: Deploying code to Google Apps Script..." -ForegroundColor Yellow
clasp push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Code deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy code. Check the error above." -ForegroundColor Red
    exit 1
}

# Step 7: Success message and next steps
Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to https://docs.google.com" -ForegroundColor Cyan
Write-Host "2. Create a new document or open existing one" -ForegroundColor Cyan
Write-Host "3. Click 'Extensions' → 'Apps Script'" -ForegroundColor Cyan
Write-Host "4. Find your 'Tone Slyder' project" -ForegroundColor Cyan
Write-Host "5. Run the 'onDocsHomepage' function to grant permissions" -ForegroundColor Cyan
Write-Host "6. Go back to your document - sidebar should appear!" -ForegroundColor Cyan

Write-Host "`n🔧 Development Commands:" -ForegroundColor Yellow
Write-Host "clasp push    - Push code changes" -ForegroundColor Cyan
Write-Host "clasp open    - Open in web editor" -ForegroundColor Cyan
Write-Host "clasp logs    - View execution logs" -ForegroundColor Cyan

Write-Host "`n📚 Full documentation: extensions/google-docs/DEPLOYMENT.md" -ForegroundColor Yellow
Write-Host "`n🐛 If you encounter issues, check the troubleshooting section in DEPLOYMENT.md" -ForegroundColor Yellow

Write-Host "`nPress Enter to exit..." -ForegroundColor Gray
Read-Host
