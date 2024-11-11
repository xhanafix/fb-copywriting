// Share functions (outside DOMContentLoaded)
function shareOnTwitter() {
    const text = encodeURIComponent("Check out this awesome Facebook Ads Copy Generator! It helps create compelling ad copy using AI and proven copywriting formulas. 🚀");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

function shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent("Facebook Ads Copy Generator");
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, '_blank');
}

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareOnWhatsApp() {
    const text = encodeURIComponent("Check out this awesome Facebook Ads Copy Generator! 🚀\n\n");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://wa.me/?text=${text}${url}`, '_blank');
}

function shareOnTelegram() {
    const text = encodeURIComponent("Check out this awesome Facebook Ads Copy Generator! 🚀");
    const url = encodeURIComponent(window.location.href);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
}

// Add these language detection helper functions at the top level
const languagePatterns = {
    zh: /[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF]/, // Chinese characters
    ta: /[\u0B80-\u0BFF]/, // Tamil characters
    ms: /^[a-zA-Z\s]*(?:lah|kan|nya|untuk|dan|atau|yang|di|ke|dari|dengan|dalam|pada|kepada|oleh|seperti|sudah|telah|akan|sedang|masih|tentang|bagi|sejak|ketika|apabila|jika|kalau|saya|anda|dia|mereka|ini|itu|tersebut)\b/i, // Common Malay words and patterns
    en: /^[a-zA-Z\s\d.,!?'"()-]+$/, // English characters and common punctuation
    es: /^[a-zA-Z\s]*(?:el|la|los|las|un|una|unos|unas|y|o|de|del|al|con|por|para|en|sobre|entre|detrás|después|ante|antes|contra|hacia)\b/i, // Spanish patterns
    fr: /^[a-zA-Z\s]*(?:le|la|les|un|une|des|et|ou|de|du|au|aux|avec|par|pour|en|sur|sous|dans|derrière|après|avant|contre|vers)\b/i, // French patterns
    de: /^[a-zA-Z\s]*(?:der|die|das|ein|eine|und|oder|von|mit|bei|seit|vor|nach|aus|auf|in|über|unter|neben|zwischen|hinter)\b/i, // German patterns
    it: /^[a-zA-Z\s]*(?:il|lo|la|i|gli|le|un|uno|una|e|o|di|da|in|con|su|per|tra|fra|contro|verso)\b/i  // Italian patterns
};

function detectLanguage(text) {
    if (!text) return null;
    
    // Remove numbers and special characters for better detection
    const cleanText = text.trim();
    
    // Check for Chinese characters
    if (languagePatterns.zh.test(cleanText)) {
        return 'zh';
    }
    
    // Check for Tamil characters
    if (languagePatterns.ta.test(cleanText)) {
        return 'ta';
    }
    
    // For other languages, check the patterns and count matches
    const langScores = {};
    
    for (const [lang, pattern] of Object.entries(languagePatterns)) {
        if (lang === 'zh' || lang === 'ta') continue; // Skip already checked languages
        
        // Count how many words match the pattern
        const words = cleanText.split(/\s+/);
        const matches = words.filter(word => pattern.test(word)).length;
        langScores[lang] = matches / words.length;
    }
    
    // Find the language with the highest score
    const entries = Object.entries(langScores);
    if (entries.length === 0) return null;
    
    const [detectedLang, highestScore] = entries.reduce((max, curr) => 
        curr[1] > max[1] ? curr : max
    );
    
    // Return detected language only if the score is above a threshold
    return highestScore > 0.2 ? detectedLang : 'en'; // Default to English if no clear match
}

// Main application code
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const elements = {
        generateBtn: document.getElementById('generate'),
        copyBtn: document.getElementById('copy'),
        resultDiv: document.getElementById('result'),
        loadingDiv: document.getElementById('loading'),
        productInput: document.getElementById('product'),
        painPointInput: document.getElementById('painPoint'),
        apiProvider: document.getElementById('apiProvider'),
        apiKey: document.getElementById('apiKey'),
        formula: document.getElementById('formula'),
        tone: document.getElementById('tone'),
        language: document.getElementById('language'),
        hints: {
            openai: document.getElementById('openaiHint'),
            groq: document.getElementById('groqHint'),
            openrouter: document.getElementById('openrouterHint')
        }
    };

    // Create pain point suggestions container
    const painPointSuggestions = document.createElement('div');
    painPointSuggestions.className = 'pain-point-suggestions';
    elements.painPointInput.parentNode.appendChild(painPointSuggestions);

    // API Configuration
    const apiConfig = {
        openai: {
            url: 'https://api.openai.com/v1/chat/completions',
            headers: apiKey => ({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }),
            model: 'gpt-3.5-turbo'
        },
        groq: {
            url: 'https://api.groq.com/openai/v1/chat/completions',
            headers: apiKey => ({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }),
            model: 'mixtral-8x7b-32768'
        },
        openrouter: {
            url: 'https://openrouter.ai/api/v1/chat/completions',
            headers: apiKey => ({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'FB Ads Copy Generator'
            }),
            model: 'mistralai/mixtral-8x7b-instruct'
        }
    };

    // Copywriting formulas
    const formulaContexts = {
        'AIDA': 'Use the AIDA formula: First grab Attention, build Interest, create Desire, then call to Action',
        'PAS': 'Use the PAS formula: Identify the Problem, Agitate the pain points, present the Solution',
        'BAB': 'Use the BAB formula: Show the Before state, paint the After picture, provide the Bridge to get there',
        'FAB': 'Use the FAB formula: List the Features, explain the Advantages, emphasize the Benefits',
        '4Ps': 'Use the 4Ps formula: Make a Promise, Paint the Picture, Provide Proof, Push for action',
        'PASTOR': 'Use the PASTOR formula: Present the Problem, Amplify consequences, Share a Story, Show the Transformation, Make an Offer, Ask for Response',
        'QUEST': 'Use the QUEST formula: Qualify the audience, help them Understand the problem, Educate about solution, Stimulate interest, Transition to action',
        '4Cs': 'Use the 4Cs formula: Be Clear in message, Concise in delivery, Compelling in reasoning, Credible in proof',
        'PPPP': 'Use the PPPP formula: Paint the Picture of the problem, Make a Promise, Prove your claims, Push for action',
        'SSS': 'Use the SSS formula: Start with a Star (attention grabber), Tell a Story, Present the Solution',
        'ACCA': 'Use the ACCA formula: Build Awareness, ensure Comprehension, create Conviction, prompt Action',
        '6+1': 'Use the 6+1 formula: Answer Who, What, When, Where, Why, How + Address Money/Value aspect',
        'SLAP': 'Use the SLAP formula: Make them Stop scrolling, Look at the offer, Act on interest, Purchase the product',
        '1-2-3-4': 'Use the 1-2-3-4 formula: Present 1 Problem, Make 2 Promises, 3 Proofs, 4 Action Steps'
    };

    // Event Listeners
    elements.apiProvider.addEventListener('change', updateApiHints);
    elements.generateBtn.addEventListener('click', generateCopy);
    elements.copyBtn.addEventListener('click', copyToClipboard);
    elements.productInput.addEventListener('input', debounce(handleProductInput, 1000));
    painPointSuggestions.addEventListener('click', handleSuggestionClick);
    document.addEventListener('click', handleClickOutside);

    // Functions
    function updateApiHints() {
        // Hide all hints
        Object.values(elements.hints).forEach(hint => hint.style.display = 'none');
        // Show selected provider hint
        const selectedProvider = elements.apiProvider.value;
        elements.hints[selectedProvider].style.display = 'block';
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async function handleProductInput() {
        const productText = elements.productInput.value;
        
        if (!productText) {
            painPointSuggestions.style.display = 'none';
            return;
        }

        if (!elements.apiKey.value) {
            painPointSuggestions.innerHTML = '<div class="suggestion error">Please enter an API key first</div>';
            painPointSuggestions.style.display = 'block';
            return;
        }

        // Detect language of input
        const detectedLanguage = detectLanguage(productText);
        if (detectedLanguage) {
            // Update language selector if the detected language is in our options
            const languageSelect = elements.language;
            const options = Array.from(languageSelect.options);
            const matchingOption = options.find(option => option.value === detectedLanguage);
            
            if (matchingOption) {
                languageSelect.value = detectedLanguage;
                // Optional: Show a notification that language was auto-detected
                showLanguageDetectionNotification(detectedLanguage);
            }
        }

        painPointSuggestions.innerHTML = '<div class="suggestion loading">Generating pain points...</div>';
        painPointSuggestions.style.display = 'block';

        const painPoints = await generatePainPoints();
        
        if (painPoints && painPoints.length > 0) {
            painPointSuggestions.innerHTML = painPoints
                .map(point => `<div class="suggestion">${point}</div>`)
                .join('');
        } else {
            painPointSuggestions.innerHTML = '<div class="suggestion error">Failed to generate pain points. Please try again.</div>';
        }
    }

    function handleSuggestionClick(e) {
        if (e.target.classList.contains('suggestion') && 
            !e.target.classList.contains('loading') && 
            !e.target.classList.contains('error')) {
            elements.painPointInput.value = e.target.textContent;
            painPointSuggestions.style.display = 'none';
        }
    }

    function handleClickOutside(e) {
        if (!painPointSuggestions.contains(e.target) && e.target !== elements.painPointInput) {
            painPointSuggestions.style.display = 'none';
        }
    }

    async function generatePainPoints() {
        const provider = elements.apiProvider.value;
        const config = apiConfig[provider];
        
        try {
            const response = await fetch(config.url, {
                method: 'POST',
                headers: config.headers(elements.apiKey.value),
                body: JSON.stringify({
                    model: config.model,
                    messages: [{
                        role: "system",
                        content: "You are a marketing expert who helps identify critical customer pain points."
                    }, {
                        role: "user",
                        content: `List 5 critical pain points that customers might face when considering this product/service: ${elements.productInput.value}. 
                                 Format the response as a JSON array of strings, with each pain point being specific, emotional, and compelling.
                                 Example format: ["pain point 1", "pain point 2", "pain point 3", "pain point 4", "pain point 5"]`
                    }],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return JSON.parse(data.choices[0].message.content);
        } catch (error) {
            console.error('Error generating pain points:', error);
            return null;
        }
    }

    async function generateCopy() {
        if (!validateInputs()) return;

        elements.loadingDiv.classList.remove('hidden');
        elements.resultDiv.innerHTML = '';
        elements.copyBtn.classList.add('hidden');

        const provider = elements.apiProvider.value;
        const config = apiConfig[provider];

        try {
            const response = await fetch(config.url, {
                method: 'POST',
                headers: config.headers(elements.apiKey.value),
                body: JSON.stringify({
                    model: config.model,
                    messages: [
                        {
                            role: "system",
                            content: getSystemPrompt()
                        },
                        {
                            role: "user",
                            content: getUserPrompt()
                        }
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            elements.resultDiv.innerText = data.choices[0].message.content;
            elements.copyBtn.classList.remove('hidden');
        } catch (error) {
            elements.resultDiv.innerHTML = `<span style="color: red;">Error: ${error.message}</span>`;
        } finally {
            elements.loadingDiv.classList.add('hidden');
        }
    }

    function validateInputs() {
        if (!elements.apiKey.value || !elements.productInput.value || !elements.painPointInput.value) {
            alert('Please fill in all required fields');
            return false;
        }
        return true;
    }

    function getSystemPrompt() {
        return elements.language.value === 'ms' ? 
            `Anda adalah pakar pengiklanan dari Malaysia yang mahir dalam penulisan iklan Facebook dalam Bahasa Malaysia.
             [... rest of Malaysian system prompt ...]` : 
            `You are a professional copywriter who writes compelling Facebook ads.`;
    }

    function getUserPrompt() {
        return elements.language.value === 'ms' ?
            `Tuliskan iklan Facebook untuk produk/perkhidmatan ini: ${elements.productInput.value}. 
             [... rest of Malaysian user prompt ...]` :
            `Write a Facebook ad copy for this product/service: ${elements.productInput.value}. 
             Target audience pain point: ${elements.painPointInput.value}
             ${formulaContexts[elements.formula.value]}
             Tone of voice: ${elements.tone.value}
             [... rest of English prompt ...]`;
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(elements.resultDiv.innerText).then(() => {
            const originalText = elements.copyBtn.innerText;
            elements.copyBtn.innerText = 'Copied!';
            elements.copyBtn.classList.add('success');
            setTimeout(() => {
                elements.copyBtn.innerText = originalText;
                elements.copyBtn.classList.remove('success');
            }, 2000);
        });
    }

    // Add this helper function to show a notification when language is detected
    function showLanguageDetectionNotification(lang) {
        const languageNames = {
            en: 'English',
            ms: 'Bahasa Malaysia',
            zh: 'Chinese',
            ta: 'Tamil',
            es: 'Spanish',
            fr: 'French',
            de: 'German',
            it: 'Italian'
        };

        const notification = document.createElement('div');
        notification.className = 'language-detection-notification';
        notification.textContent = `Language detected: ${languageNames[lang]}`;
        
        // Add the notification near the language selector
        const languageSelect = elements.language;
        languageSelect.parentNode.appendChild(notification);
        
        // Remove the notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}); 