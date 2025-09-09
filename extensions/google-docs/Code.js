/**
 * Tone Slyder - Google Docs Add-on
 * AI-powered tone adjustment for Google Docs
 */

// Configuration
const CONFIG = {
  API_BASE_URL: 'https://api.toneslyder.com', // Will be your deployed backend
  VERSION: '1.0.0'
};

/**
 * Homepage trigger for Google Docs
 */
function onDocsHomepage(e) {
  return createHomepageCard();
}

/**
 * Generic homepage trigger
 */
function onHomepage(e) {
  return createHomepageCard();
}

/**
 * File scope granted trigger
 */
function onDocsFileScopeGranted(e) {
  return createHomepageCard();
}

/**
 * Create the main homepage card
 */
function createHomepageCard() {
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Tone Slyder')
      .setSubtitle('AI-powered tone adjustment')
      .setImageUrl('https://your-domain.com/icon-32.png'))
    
    // Instructions
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText('<b>How to use:</b><br/>1. Select text in your document<br/>2. Choose a tone adjustment<br/>3. Replace with improved text')))
    
    // Quick presets
    .addSection(CardService.newCardSection()
      .setHeader('Quick Presets')
      .addWidget(createPresetButton('Professional', 'business'))
      .addWidget(createPresetButton('Casual', 'social'))
      .addWidget(createPresetButton('Academic', 'academic'))
      .addWidget(createPresetButton('Editorial', 'editorial')))
    
    // Custom adjustment
    .addSection(CardService.newCardSection()
      .setHeader('Custom Adjustment')
      .addWidget(CardService.newTextButton()
        .setText('Open Tone Sliders')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('showToneSliders'))))
    
    // Selected text info
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText('<i>Select text in your document to begin</i>')));

  return card.build();
}

/**
 * Create a preset button
 */
function createPresetButton(label, presetId) {
  return CardService.newTextButton()
    .setText(label)
    .setOnClickAction(CardService.newAction()
      .setFunctionName('applyPreset')
      .setParameters({preset: presetId}));
}

/**
 * Apply a preset to selected text
 */
function applyPreset(e) {
  const preset = e.parameters.preset;
  const selectedText = getSelectedText();
  
  if (!selectedText) {
    return showError('Please select some text first');
  }
  
  // Show loading state
  const loadingCard = createLoadingCard('Applying ' + preset + ' tone...');
  
  try {
    // Call Tone Slyder API
    const result = callToneSliderAPI(selectedText, getPresetSettings(preset));
    
    if (result && result.rewrittenText) {
      // Replace selected text
      replaceSelectedText(result.rewrittenText);
      return showSuccess('Tone adjusted successfully!', result.rewrittenText);
    } else {
      return showError('Failed to adjust tone. Please try again.');
    }
  } catch (error) {
    console.error('Error applying preset:', error);
    return showError('Error: ' + error.message);
  }
}

/**
 * Show custom tone sliders
 */
function showToneSliders(e) {
  const selectedText = getSelectedText();
  
  if (!selectedText) {
    return showError('Please select some text first');
  }
  
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Tone Adjustment')
      .setSubtitle(selectedText.length + ' characters selected'))
    
    // Formality slider
    .addSection(CardService.newCardSection()
      .setHeader('Adjust Tone')
      .addWidget(CardService.newTextParagraph()
        .setText('<b>Formality:</b>'))
      .addWidget(CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setTitle('Level')
        .setFieldName('formality')
        .addItem('Very Casual', '10', false)
        .addItem('Casual', '30', false)
        .addItem('Moderate', '50', true)
        .addItem('Formal', '70', false)
        .addItem('Very Formal', '90', false))
      
      // Authoritativeness
      .addWidget(CardService.newTextParagraph()
        .setText('<b>Authoritativeness:</b>'))
      .addWidget(CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setTitle('Level')
        .setFieldName('authoritativeness')
        .addItem('Very Tentative', '10', false)
        .addItem('Tentative', '30', false)
        .addItem('Moderate', '50', true)
        .addItem('Confident', '70', false)
        .addItem('Very Confident', '90', false))
      
      // Apply button
      .addWidget(CardService.newTextButton()
        .setText('Apply Custom Tone')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('applyCustomTone'))))
    
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextButton()
        .setText('← Back to Presets')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('onDocsHomepage'))));

  return card.build();
}

/**
 * Apply custom tone settings
 */
function applyCustomTone(e) {
  const formData = e.formInput || {};
  const selectedText = getSelectedText();
  
  if (!selectedText) {
    return showError('Please select some text first');
  }
  
  const sliderValues = {
    formality: parseInt(formData.formality) || 50,
    conversational: 50, // Default for now
    informativeness: 50, // Default for now  
    authoritativeness: parseInt(formData.authoritativeness) || 50
  };
  
  try {
    const result = callToneSliderAPI(selectedText, sliderValues);
    
    if (result && result.rewrittenText) {
      replaceSelectedText(result.rewrittenText);
      return showSuccess('Custom tone applied!', result.rewrittenText);
    } else {
      return showError('Failed to apply custom tone. Please try again.');
    }
  } catch (error) {
    console.error('Error applying custom tone:', error);
    return showError('Error: ' + error.message);
  }
}

/**
 * Get selected text from Google Docs
 */
function getSelectedText() {
  try {
    const selection = DocumentApp.getActiveDocument().getSelection();
    if (!selection) {
      return null;
    }
    
    let selectedText = '';
    const elements = selection.getSelectedElements();
    
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i].getElement();
      if (element.getType() === DocumentApp.ElementType.TEXT) {
        const textElement = element.asText();
        const startIndex = elements[i].getStartIndex();
        const endIndex = elements[i].getEndIndexInclusive();
        
        if (startIndex === -1) {
          selectedText += textElement.getText();
        } else {
          selectedText += textElement.getText().substring(startIndex, endIndex + 1);
        }
      }
    }
    
    return selectedText.trim();
  } catch (error) {
    console.error('Error getting selected text:', error);
    return null;
  }
}

/**
 * Replace selected text with new text
 */
function replaceSelectedText(newText) {
  try {
    const selection = DocumentApp.getActiveDocument().getSelection();
    if (!selection) return false;
    
    const elements = selection.getSelectedElements();
    if (elements.length === 0) return false;
    
    // Simple replacement for single text element
    const element = elements[0].getElement();
    if (element.getType() === DocumentApp.ElementType.TEXT) {
      const textElement = element.asText();
      const startIndex = elements[0].getStartIndex();
      const endIndex = elements[0].getEndIndexInclusive();
      
      if (startIndex === -1) {
        textElement.setText(newText);
      } else {
        textElement.deleteText(startIndex, endIndex);
        textElement.insertText(startIndex, newText);
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error replacing text:', error);
    return false;
  }
}

/**
 * Call Tone Slyder API
 */
function callToneSliderAPI(originalText, sliderValues) {
  try {
    const payload = {
      originalText: originalText,
      sliderValues: sliderValues,
      guardrails: {
        required: [],
        banned: []
      }
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(CONFIG.API_BASE_URL + '/api/rewrite', options);
    const responseData = JSON.parse(response.getContentText());
    
    if (responseData.success) {
      return responseData.data;
    } else {
      throw new Error(responseData.message || 'API request failed');
    }
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * Get preset settings
 */
function getPresetSettings(presetId) {
  const presets = {
    business: {
      formality: 80,
      conversational: 30,
      informativeness: 70,
      authoritativeness: 85
    },
    social: {
      formality: 20,
      conversational: 85,
      informativeness: 40,
      authoritativeness: 30
    },
    academic: {
      formality: 85,
      conversational: 10,
      informativeness: 90,
      authoritativeness: 80
    },
    editorial: {
      formality: 60,
      conversational: 50,
      informativeness: 75,
      authoritativeness: 70
    }
  };
  
  return presets[presetId] || presets.business;
}

/**
 * Create loading card
 */
function createLoadingCard(message) {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Processing...'))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText(message)))
    .build();
}

/**
 * Show success message
 */
function showSuccess(message, result) {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('✅ Success'))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText('<b>' + message + '</b>'))
      .addWidget(CardService.newTextParagraph()
        .setText('<i>Text has been updated in your document.</i>')))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextButton()
        .setText('← Back to Tone Slyder')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('onDocsHomepage'))))
    .build();
}

/**
 * Show error message
 */
function showError(message) {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('❌ Error'))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText('<b>' + message + '</b>')))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextButton()
        .setText('← Try Again')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('onDocsHomepage'))))
    .build();
}
