document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...

    // Get all hint elements
    const openaiHint = document.getElementById('openaiHint');
    const groqHint = document.getElementById('groqHint');
    const openrouterHint = document.getElementById('openrouterHint');
    const geminiHint = document.getElementById('geminiHint');

    // Add event listener for API provider change
    document.getElementById('apiProvider').addEventListener('change', (e) => {
        // Hide all hints first
        openaiHint.style.display = 'none';
        groqHint.style.display = 'none';
        openrouterHint.style.display = 'none';
        geminiHint.style.display = 'none';

        // Show the selected provider's hint
        switch(e.target.value) {
            case 'openai':
                openaiHint.style.display = 'block';
                break;
            case 'groq':
                groqHint.style.display = 'block';
                break;
            case 'openrouter':
                openrouterHint.style.display = 'block';
                break;
            case 'gemini':
                geminiHint.style.display = 'block';
                break;
        }
    });

    // ... rest of your existing code ...
}); 