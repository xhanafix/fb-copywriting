async function generatePainPoints() {
    const provider = elements.apiProvider.value;
    const config = apiConfig[provider];
    const currentLang = elements.language.value;
    
    // Language-specific system prompts
    const systemPrompts = {
        en: "You are a marketing expert who helps identify critical customer pain points.",
        ms: "Anda adalah pakar pemasaran yang membantu mengenal pasti masalah pelanggan.",
        zh: "您是一位营销专家，专门帮助识别客户的痛点。",
        ta: "நீங்கள் வாடிக்கையாளர் சிக்கல்களை அடையாளம் காணும் சந்தைப்படுத்தல் நிபுணர்.",
        es: "Eres un experto en marketing que ayuda a identificar puntos críticos de dolor del cliente.",
        fr: "Vous êtes un expert en marketing qui aide à identifier les points sensibles critiques des clients.",
        de: "Sie sind ein Marketing-Experte, der hilft, kritische Schmerzpunkte der Kunden zu identifizieren.",
        it: "Sei un esperto di marketing che aiuta a identificare i punti critici di dolore dei clienti."
    };

    // Language-specific prompts for pain points
    const painPointPrompts = {
        en: `List 5 critical pain points that customers might face when considering this product/service: ${elements.productInput.value}`,
        ms: `Senaraikan 5 masalah kritikal yang mungkin dihadapi pelanggan apabila mempertimbangkan produk/perkhidmatan ini: ${elements.productInput.value}`,
        zh: `列出客户在考虑这个产品/服务时可能面临的5个关键痛点：${elements.productInput.value}`,
        ta: `இந்த தயாரிப்பு/சேவையை பரிசீலிக்கும்போது வாடிக்கையாளர்கள் எதிர்கொள்ளக்கூடிய 5 முக்கிய சிக்கல்களை பட்டியலிடவும்: ${elements.productInput.value}`,
        es: `Enumera 5 puntos críticos de dolor que los clientes podrían enfrentar al considerar este producto/servicio: ${elements.productInput.value}`,
        fr: `Listez 5 points sensibles critiques que les clients pourraient rencontrer en considérant ce produit/service : ${elements.productInput.value}`,
        de: `Listen Sie 5 kritische Schmerzpunkte auf, die Kunden bei der Erwägung dieses Produkts/dieser Dienstleistung haben könnten: ${elements.productInput.value}`,
        it: `Elenca 5 punti critici di dolore che i clienti potrebbero affrontare quando considerano questo prodotto/servizio: ${elements.productInput.value}`
    };

    try {
        const response = await fetch(config.url, {
            method: 'POST',
            headers: config.headers(elements.apiKey.value),
            body: JSON.stringify({
                model: config.model,
                messages: [{
                    role: "system",
                    content: systemPrompts[currentLang] || systemPrompts.en
                }, {
                    role: "user",
                    content: `${painPointPrompts[currentLang] || painPointPrompts.en}
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

// Update the loading message in handleProductInput function
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

    const loadingMessages = {
        en: "Generating pain points...",
        ms: "Menjana masalah pelanggan...",
        zh: "正在生成痛点...",
        ta: "சிக்கல்களை உருவாக்குகிறது...",
        es: "Generando puntos de dolor...",
        fr: "Génération des points sensibles...",
        de: "Generiere Schmerzpunkte...",
        it: "Generazione dei punti critici..."
    };

    const errorMessages = {
        en: "Failed to generate pain points. Please try again.",
        ms: "Gagal menjana masalah pelanggan. Sila cuba lagi.",
        zh: "生成痛点失败。请重试。",
        ta: "சிக்கல்களை உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
        es: "No se pudieron generar puntos de dolor. Por favor, inténtelo de nuevo.",
        fr: "Échec de la génération des points sensibles. Veuillez réessayer.",
        de: "Generierung der Schmerzpunkte fehlgeschlagen. Bitte versuchen Sie es erneut.",
        it: "Impossibile generare i punti critici. Per favore riprova."
    };

    const currentLang = elements.language.value;

    painPointSuggestions.innerHTML = `<div class="suggestion loading">${loadingMessages[currentLang] || loadingMessages.en}</div>`;
    painPointSuggestions.style.display = 'block';

    const painPoints = await generatePainPoints();
    
    if (painPoints && painPoints.length > 0) {
        painPointSuggestions.innerHTML = painPoints
            .map(point => `<div class="suggestion">${point}</div>`)
            .join('');
    } else {
        painPointSuggestions.innerHTML = `<div class="suggestion error">${errorMessages[currentLang] || errorMessages.en}</div>`;
    }
}