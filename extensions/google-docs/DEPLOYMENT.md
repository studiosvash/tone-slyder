# Google Docs Add-on Deployment Guide

## 🚀 Quick Start Checklist

### Prerequisites (5 minutes)
- [ ] Google account with Google Drive access
- [ ] Node.js 16+ installed
- [ ] Tone Slyder backend running (locally or deployed)

### Setup (10 minutes)
- [ ] Install Google clasp CLI
- [ ] Enable Google Apps Script API
- [ ] Login to Google Apps Script
- [ ] Create and link Apps Script project

### Deploy (5 minutes)
- [ ] Configure API endpoint
- [ ] Push code to Google Apps Script
- [ ] Test in Google Docs
- [ ] Share with team for testing

---

## 📋 Detailed Setup Steps

### Step 1: Install Google clasp CLI

```powershell
# Install clasp globally
npm install -g @google/clasp

# Verify installation
clasp --version
```

### Step 2: Enable Google Apps Script API

1. Go to https://script.google.com/home/usersettings
2. Turn ON "Google Apps Script API"
3. Click "Done"

### Step 3: Login to Google Apps Script

```powershell
# Login to your Google account
clasp login

# This will open a browser window for OAuth
# Grant permissions to clasp
```

### Step 4: Create Apps Script Project

```powershell
# Navigate to the google-docs extension folder
cd extensions/google-docs

# Create a new Apps Script project
clasp create --type standalone --title "Tone Slyder"

# This creates a .clasp.json file with your script ID
```

### Step 5: Configure API Endpoint

Edit `Code.js` and update the API endpoint:

```javascript
// For local testing (using ngrok or similar)
const CONFIG = {
  API_BASE_URL: 'https://your-ngrok-url.ngrok.io', // or your deployed backend URL
  VERSION: '1.0.0'
};
```

#### Option A: Local Backend with ngrok
```powershell
# Install ngrok (if not already installed)
# Download from https://ngrok.com/download

# Start your local backend
cd ../../
npm run dev:backend

# In another terminal, expose local backend
ngrok http 8080

# Copy the https URL (e.g., https://abc123.ngrok.io)
# Update CONFIG.API_BASE_URL in Code.js
```

#### Option B: Deploy Backend to Cloud
```powershell
# Deploy to your cloud provider first
# Then update CONFIG.API_BASE_URL with your deployed URL
```

### Step 6: Push Code to Apps Script

```powershell
# Push your local code to Google Apps Script
clasp push

# If prompted about manifest, choose 'yes'
```

### Step 7: Test the Add-on

1. Go to https://docs.google.com
2. Create a new document or open existing
3. Click "Extensions" → "Apps Script"
4. You should see your "Tone Slyder" project
5. Click "Run" on the `onDocsHomepage` function (for first-time permissions)
6. Grant permissions when prompted
7. Go back to your document
8. The Tone Slyder sidebar should appear on the right

### Step 8: Manual Testing Checklist

- [ ] **Basic Integration**
  - [ ] Add-on appears in sidebar
  - [ ] UI loads without errors
  - [ ] Preset buttons are clickable

- [ ] **Text Selection**
  - [ ] Select text in document
  - [ ] Add-on detects selection
  - [ ] Character count displays correctly

- [ ] **Preset Functionality**
  - [ ] Click "Professional" preset
  - [ ] API call completes
  - [ ] Text replacement works
  - [ ] Success message appears

- [ ] **Custom Sliders**
  - [ ] "Open Tone Sliders" works
  - [ ] Dropdowns function properly
  - [ ] Custom tone application works

- [ ] **Error Handling**
  - [ ] Try without selecting text (should show error)
  - [ ] Test with backend offline (should show error)
  - [ ] Error messages are user-friendly

---

## 🔧 Development Commands

```powershell
# Navigate to extension directory
cd extensions/google-docs

# View current Apps Script project info
clasp list

# Push code changes
clasp push

# Pull latest code from Apps Script editor
clasp pull

# Open the project in Apps Script web editor
clasp open

# View logs (for debugging)
clasp logs

# Create a new version for deployment
clasp version "v1.0.0"

# Deploy as add-on (for wider testing)
clasp deploy --description "Initial beta release"
```

---

## 🐛 Troubleshooting

### Common Issues:

**1. "clasp: command not found"**
```powershell
# Reinstall clasp globally
npm uninstall -g @google/clasp
npm install -g @google/clasp
```

**2. "Script API not enabled"**
- Go to https://script.google.com/home/usersettings
- Enable "Google Apps Script API"

**3. "Unauthorized" errors**
```powershell
# Re-login to clasp
clasp logout
clasp login
```

**4. Add-on doesn't appear in sidebar**
- Check Apps Script project permissions
- Try refreshing the Google Doc
- Check browser console for errors

**5. API calls fail**
- Verify backend is running
- Check CORS settings on backend
- Ensure API endpoint URL is correct
- Check Apps Script logs: `clasp logs`

**6. Text replacement doesn't work**
- Ensure text is properly selected
- Check Google Docs permissions
- Try with simple text (no formatting)

---

## 📊 Testing Strategy

### Phase 1: Internal Testing (Week 1)
- [ ] Test with 3-5 team members
- [ ] Focus on core functionality
- [ ] Document bugs and issues
- [ ] Test different document types (business letters, reports, etc.)

### Phase 2: Closed Beta (Week 2)
- [ ] Deploy as private add-on
- [ ] Invite 10-20 trusted users
- [ ] Collect usage analytics
- [ ] Gather user feedback

### Phase 3: Public Beta (Week 3+)
- [ ] Submit to Google Workspace Marketplace (pending)
- [ ] Public testing with limited features
- [ ] Monitor performance and costs
- [ ] Iterate based on feedback

---

## 📈 Success Metrics to Track

### Technical Metrics:
- [ ] Add-on load time < 2 seconds
- [ ] API response time < 5 seconds
- [ ] Error rate < 5%
- [ ] Text replacement success rate > 95%

### User Metrics:
- [ ] Daily active users
- [ ] Rewrites per user session
- [ ] Most popular presets
- [ ] User retention (7-day, 30-day)

### Business Metrics:
- [ ] User sign-ups from add-on
- [ ] Conversion to paid tiers
- [ ] Customer feedback scores
- [ ] Support ticket volume

---

## 🔒 Security Considerations

### Permissions:
The add-on requests these permissions:
- `documents.currentonly` - Only the current document
- `script.external_request` - To call Tone Slyder API
- `userinfo.email` - For user identification

### Data Privacy:
- Selected text is sent to Tone Slyder API
- No document content is stored permanently
- User email is used for authentication only
- Complies with Google Workspace add-on policies

---

## 📝 Next Steps After Successful Testing

1. **Gather User Feedback**
   - Create feedback form
   - Monitor user behavior
   - Identify pain points

2. **Optimize Performance**
   - Cache common requests
   - Optimize API calls
   - Improve UI responsiveness

3. **Add Advanced Features**
   - Bulk text processing
   - More preset options
   - Custom guardrails UI

4. **Prepare for Marketplace**
   - Create marketing materials
   - Write detailed description
   - Prepare screenshot and demo video
   - Set up support documentation

5. **Scale Infrastructure**
   - Monitor backend performance
   - Set up proper error tracking
   - Implement usage analytics
   - Plan for increased load

---

## 🆘 Support & Resources

- **Google Apps Script Documentation**: https://developers.google.com/apps-script
- **Clasp Documentation**: https://github.com/google/clasp
- **Google Workspace Add-ons Guide**: https://developers.google.com/workspace/add-ons
- **Tone Slyder API Documentation**: `/api` endpoint on your backend

For issues or questions, check the GitHub Issues or contact the development team.
