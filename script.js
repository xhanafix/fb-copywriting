async function generatePainPoints(product, apiKey, provider) {
    const apiConfig = {
        openai: {
            url: 'https://api.openai.com/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            model: 'gpt-3.5-turbo'
        },
        groq: {
            url: 'https://api.groq.com/openai/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            model: 'mixtral-8x7b-32768'
        },
        openrouter: {
            url: 'https://openrouter.ai/api/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'FB Ads Copy Generator'
            },
            model: 'mistralai/mixtral-8x7b-instruct'
        },
        gemini: {
            getUrl: (apiKey) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    };

    try {
        if (provider === 'gemini') {
            const response = await fetch(apiConfig.gemini.getUrl(apiKey), {
                method: 'POST',
                headers: apiConfig.gemini.headers,
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `As a marketing expert, list 5 critical pain points that customers might face when considering this product/service: ${product}. Format the response as a JSON array of strings, with each pain point being specific, emotional, and compelling. Example format: ["pain point 1", "pain point 2", "pain point 3", "pain point 4", "pain point 5"]`
                        }]
                    }]
                })
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }

            // Extract the text from Gemini's response
            const painPointsText = data.candidates[0].content.parts[0].text;
            // Find the JSON array in the response using regex
            const jsonMatch = painPointsText.match(/\[.*\]/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Could not parse pain points from response');
        } else {
            // Existing code for other providers
            const response = await fetch(apiConfig[provider].url, {
                method: 'POST',
                headers: apiConfig[provider].headers,
                body: JSON.stringify({
                    model: apiConfig[provider].model,
                    messages: [{
                        role: "system",
                        content: "You are a marketing expert who helps identify critical customer pain points."
                    },
                    {
                        role: "user",
                        content: `List 5 critical pain points that customers might face when considering this product/service: ${product}. 
                                 Format the response as a JSON array of strings, with each pain point being specific, emotional, and compelling.
                                 Example format: ["pain point 1", "pain point 2", "pain point 3", "pain point 4", "pain point 5"]`
                    }],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }

            const painPointsText = data.choices[0].message.content;
            return JSON.parse(painPointsText);
        }
    } catch (error) {
        console.error('Error generating pain points:', error);
        return null;
    }
} 