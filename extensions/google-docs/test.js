/**
 * Test functions for Tone Slyder Google Docs Add-on
 * Run these from the Apps Script editor to test functionality
 */

/**
 * Test the basic homepage card creation
 */
function testHomepageCard() {
  try {
    const card = createHomepageCard();
    console.log('✅ Homepage card created successfully');
    return card;
  } catch (error) {
    console.error('❌ Homepage card creation failed:', error);
    throw error;
  }
}

/**
 * Test preset functionality with mock data
 */
function testPresetWithMockData() {
  // Mock event object
  const mockEvent = {
    parameters: {
      preset: 'business'
    }
  };
  
  try {
    // This would normally fail because no text is selected
    // But we can test the preset settings retrieval
    const presetSettings = getPresetSettings('business');
    console.log('✅ Preset settings retrieved:', presetSettings);
    
    // Test all presets
    const presets = ['business', 'social', 'academic', 'editorial'];
    presets.forEach(preset => {
      const settings = getPresetSettings(preset);
      console.log(`✅ ${preset} preset:`, settings);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Preset test failed:', error);
    throw error;
  }
}

/**
 * Test API payload generation
 */
function testAPIPayloadGeneration() {
  try {
    const mockText = "This is a test sentence that needs tone adjustment.";
    const mockSliders = {
      formality: 80,
      conversational: 30,
      informativeness: 70,
      authoritativeness: 85
    };
    
    const payload = {
      originalText: mockText,
      sliderValues: mockSliders,
      guardrails: {
        required: [],
        banned: []
      }
    };
    
    console.log('✅ API payload generated:', payload);
    
    // Test JSON serialization
    const serialized = JSON.stringify(payload);
    console.log('✅ Payload serializes correctly');
    
    return payload;
  } catch (error) {
    console.error('❌ API payload generation failed:', error);
    throw error;
  }
}

/**
 * Test error handling
 */
function testErrorHandling() {
  try {
    const errorCard = showError('This is a test error message');
    console.log('✅ Error card created successfully');
    return errorCard;
  } catch (error) {
    console.error('❌ Error handling test failed:', error);
    throw error;
  }
}

/**
 * Test success message
 */
function testSuccessMessage() {
  try {
    const successCard = showSuccess('Test successful!', 'Mock rewritten text goes here.');
    console.log('✅ Success card created successfully');
    return successCard;
  } catch (error) {
    console.error('❌ Success message test failed:', error);
    throw error;
  }
}

/**
 * Test configuration
 */
function testConfiguration() {
  try {
    console.log('✅ CONFIG object:', CONFIG);
    console.log('✅ API Base URL:', CONFIG.API_BASE_URL);
    console.log('✅ Version:', CONFIG.VERSION);
    
    if (!CONFIG.API_BASE_URL.startsWith('http')) {
      throw new Error('API_BASE_URL must start with http or https');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Configuration test failed:', error);
    throw error;
  }
}

/**
 * Test document permissions (run this when a document is open)
 */
function testDocumentPermissions() {
  try {
    const doc = DocumentApp.getActiveDocument();
    console.log('✅ Can access document:', doc.getName());
    
    const selection = doc.getSelection();
    if (selection) {
      console.log('✅ Can access selection');
    } else {
      console.log('⚠️ No text selected (this is normal)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Document permissions test failed:', error);
    console.log('💡 Make sure to run this function when a Google Doc is open');
    throw error;
  }
}

/**
 * Run all tests
 */
function runAllTests() {
  console.log('🧪 Running Tone Slyder Add-on Tests');
  console.log('===================================');
  
  const tests = [
    { name: 'Configuration', func: testConfiguration },
    { name: 'Homepage Card', func: testHomepageCard },
    { name: 'Preset Settings', func: testPresetWithMockData },
    { name: 'API Payload', func: testAPIPayloadGeneration },
    { name: 'Error Handling', func: testErrorHandling },
    { name: 'Success Message', func: testSuccessMessage }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach((test, index) => {
    try {
      console.log(`\n${index + 1}. Testing ${test.name}...`);
      test.func();
      passed++;
    } catch (error) {
      failed++;
      console.error(`❌ ${test.name} test failed:`, error.message);
    }
  });
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / tests.length) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your add-on is ready for testing.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
  
  console.log('\n📝 Next: Test with real Google Docs integration');
  console.log('   1. Open a Google Doc');
  console.log('   2. Run testDocumentPermissions() to verify permissions');
  console.log('   3. Test the add-on UI manually');
}

/**
 * Test API connectivity (requires backend to be running)
 */
function testAPIConnectivity() {
  console.log('🌐 Testing API connectivity...');
  
  const testPayload = {
    originalText: "Hello, this is a test.",
    sliderValues: {
      formality: 70,
      conversational: 40,
      informativeness: 60,
      authoritativeness: 65
    },
    guardrails: {
      required: [],
      banned: []
    }
  };
  
  try {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(testPayload)
    };
    
    console.log('📡 Making test API call to:', CONFIG.API_BASE_URL + '/api/rewrite');
    const response = UrlFetchApp.fetch(CONFIG.API_BASE_URL + '/api/rewrite', options);
    const responseText = response.getContentText();
    const responseData = JSON.parse(responseText);
    
    if (response.getResponseCode() === 200 && responseData.success) {
      console.log('✅ API connection successful!');
      console.log('✅ Response:', responseData);
      return true;
    } else {
      console.error('❌ API returned error:', responseData);
      return false;
    }
  } catch (error) {
    console.error('❌ API connectivity test failed:', error.message);
    console.log('💡 Make sure your backend is running and accessible');
    console.log('💡 Check CORS settings if you\'re getting CORS errors');
    console.log('💡 Verify the API_BASE_URL in CONFIG is correct');
    return false;
  }
}
