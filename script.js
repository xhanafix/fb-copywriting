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

// Add this function after the existing functions
async function detectLanguage(text) {
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
                    content: "You are a language detection expert. Respond only with the ISO 639-1 language code from the supported languages: en, ms, zh, ta, es, fr, de, it. If the language is not in this list, return 'en'."
                }, {
                    role: "user",
                    content: `Detect the language of this text and respond only with the ISO 639-1 language code: "${text}"`
                }],
                temperature: 0.1
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        const languageCode = data.choices[0].message.content.trim().toLowerCase();
        
        // Verify if the detected language is supported
        const supportedLanguages = ['en', 'ms', 'zh', 'ta', 'es', 'fr', 'de', 'it'];
        return supportedLanguages.includes(languageCode) ? languageCode : 'en';
    } catch (error) {
        console.error('Error detecting language:', error);
        return 'en'; // Default to English if detection fails
    }
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
        },
        themeToggle: document.getElementById('themeToggle'),
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
    elements.themeToggle.addEventListener('click', handleThemeChange);

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

        painPointSuggestions.innerHTML = '<div class="suggestion loading">Generating pain points...</div>';
        painPointSuggestions.style.display = 'block';

        try {
            // Detect language of the product input
            const detectedLanguage = await detectLanguage(productText);
            
            // Update the language selector to match detected language
            if (elements.language.value !== detectedLanguage) {
                elements.language.value = detectedLanguage;
            }

            // Generate pain points in detected language
            const painPoints = await generatePainPoints(detectedLanguage);
            
            if (painPoints && painPoints.length > 0) {
                painPointSuggestions.innerHTML = painPoints
                    .map(point => `<div class="suggestion">${point}</div>`)
                    .join('');
            } else {
                painPointSuggestions.innerHTML = '<div class="suggestion error">Failed to generate pain points. Please try again.</div>';
            }
        } catch (error) {
            console.error('Error in handleProductInput:', error);
            painPointSuggestions.innerHTML = '<div class="suggestion error">An error occurred. Please try again.</div>';
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

    async function generatePainPoints(detectedLanguage) {
        const provider = elements.apiProvider.value;
        const config = apiConfig[provider];
        const productText = elements.productInput.value;
        
        try {
            const response = await fetch(config.url, {
                method: 'POST',
                headers: config.headers(elements.apiKey.value),
                body: JSON.stringify({
                    model: config.model,
                    messages: [{
                        role: "system",
                        content: `You are a marketing expert who helps identify critical customer pain points. Respond in ${detectedLanguage} language.`
                    }, {
                        role: "user",
                        content: `List 5 critical pain points that customers might face when considering this product/service: ${productText}. 
                                 Format the response as a JSON array of strings, with each pain point being specific, emotional, and compelling.
                                 Example format: ["pain point 1", "pain point 2", "pain point 3", "pain point 4", "pain point 5"]
                                 Respond in ${detectedLanguage} language.`
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

    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    function handleThemeChange() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    initializeTheme();
}); 