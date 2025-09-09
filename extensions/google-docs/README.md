# 🎚️ Tone Slyder - Google Docs Add-on

AI-powered tone adjustment directly in Google Docs. Select text, choose a tone, and instantly improve your writing.

## 🚀 Quick Start (5 minutes)

### For Developers:

```powershell
# 1. Navigate to this directory
cd extensions/google-docs

# 2. Run the automated setup script
./setup.ps1

# 3. Follow the prompts to configure your backend
# 4. Test in Google Docs!
```

### For Manual Setup:

1. **Install clasp**: `npm install -g @google/clasp`
2. **Login**: `clasp login`
3. **Create project**: `clasp create --type standalone --title "Tone Slyder"`
4. **Configure API**: Update `CONFIG.API_BASE_URL` in `Code.js`
5. **Deploy**: `clasp push`
6. **Test**: Open Google Docs → Extensions → Apps Script → Run functions

## 📱 How It Works

1. **Select Text** in your Google Doc
2. **Choose Tone** from sidebar (Professional, Casual, Academic, Editorial)
3. **Apply Changes** - text is instantly replaced with tone-adjusted version
4. **Custom Control** - Use sliders for precise tone adjustment

## 🎯 Features

- ✅ **4 Quick Presets**: Professional, Casual, Academic, Editorial
- ✅ **Custom Sliders**: Fine-tune formality and authoritativeness  
- ✅ **Instant Replacement**: Selected text updated in-place
- ✅ **Error Handling**: Clear messages for common issues
- ✅ **Secure**: Only accesses current document, no data stored

## 📋 Files

```
extensions/google-docs/
├── Code.js           # Main add-on logic
├── appsscript.json   # Manifest and permissions
├── test.js           # Test functions
├── setup.ps1         # Automated setup script
├── DEPLOYMENT.md     # Detailed deployment guide
└── README.md         # This file
```

## 🧪 Testing

Run tests in Apps Script editor:

```javascript
// Run comprehensive tests
runAllTests()

// Test API connectivity (backend must be running)
testAPIConnectivity()

// Test document permissions (run with Google Doc open)
testDocumentPermissions()
```

## 🔧 Development

```powershell
clasp push      # Push code changes
clasp open      # Open in web editor  
clasp logs      # View execution logs
clasp pull      # Pull latest from web
```

## 🐛 Troubleshooting

**Add-on doesn't appear:**
- Check Extensions → Apps Script in Google Docs
- Run `onDocsHomepage` function to grant permissions
- Refresh the document

**API calls fail:**
- Verify backend is running on configured URL
- Check CORS settings
- Ensure HTTPS for production deployments
- Run `testAPIConnectivity()` to diagnose

**Permission errors:**
- Enable Google Apps Script API: https://script.google.com/home/usersettings
- Re-run `clasp login` if needed

## 📊 Success Metrics

Track these during testing:
- Add-on load time < 2s
- API response time < 5s  
- Text replacement success rate > 95%
- User retention after first use

## 🔒 Security & Privacy

- **Minimal Permissions**: Only current document access
- **No Data Storage**: Text processed in real-time, not stored
- **HTTPS Required**: Secure API communication
- **Google Compliance**: Follows Workspace add-on policies

## 📈 Next Steps

After successful testing:
1. **Gather User Feedback** from beta testers
2. **Optimize Performance** based on usage patterns
3. **Add Features** like bulk processing, more presets
4. **Submit to Marketplace** for public distribution

## 📞 Support

- **Full Documentation**: `DEPLOYMENT.md`
- **Test Functions**: Run `runAllTests()` in Apps Script
- **Issues**: Check GitHub Issues or contact dev team

---

**Ready to test?** Run `./setup.ps1` and start improving your Google Docs writing with AI! 🚀
