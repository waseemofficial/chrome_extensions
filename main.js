document.addEventListener("DOMContentLoaded", function () {
    console.log("Password Generator Extension Loaded");
    
    // DOM Elements
    const resultEl = document.getElementById("result");
    const lengthEl = document.getElementById("length");
    const uppercaseEl = document.getElementById("uppercase");
    const lowercaseEl = document.getElementById("lowercase");
    const numberEl = document.getElementById("number");
    const symbolsEl = document.getElementById("symbols");
    const excludeSimilarEl = document.getElementById("excludeSimilar");
    const generateEl = document.getElementById("generate");
    const clipboardEl = document.getElementById("clipboard");
    const saveEl = document.getElementById("save");
    const strengthBar = document.getElementById("strength-bar");
    const toast = document.getElementById("toast");

    // Character sets
    const characterSets = {
        lower: 'abcdefghjkmnpqrstuvwxyz',
        upper: 'ABCDEFGHJKMNPQRSTUVWXYZ',
        number: '23456789',
        symbol: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        lowerFull: 'abcdefghijklmnopqrstuvwxyz',
        upperFull: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        numberFull: '0123456789'
    };

    // Random functions using crypto.getRandomValues for better security
    const randomFunc = {
        lower: () => getRandomChar(characterSets.lower),
        upper: () => getRandomChar(characterSets.upper),
        number: () => getRandomChar(characterSets.number),
        symbol: () => getRandomChar(characterSets.symbol),
        lowerFull: () => getRandomChar(characterSets.lowerFull),
        upperFull: () => getRandomChar(characterSets.upperFull),
        numberFull: () => getRandomChar(characterSets.numberFull)
    };

    // Generate password on button click
    generateEl.onclick = function () {
        try {
            const password = generatePassword();
            resultEl.innerText = password;
            updatePasswordStrength(password);
            showToast('Password generated successfully!', 'success');
        } catch (error) {
            showToast('Error generating password', 'error');
            console.error('Password generation error:', error);
        }
    };

    // Copy to clipboard functionality
    clipboardEl.onclick = async function () {
        try {
            const password = resultEl.innerText;
            
            if (!password || password === 'Click Generate') {
                showToast('No password to copy', 'warning');
                return;
            }

            // Use modern Clipboard API
            await navigator.clipboard.writeText(password);
            
            // Visual feedback
            clipboardEl.innerHTML = '<i class="fa fa-check"></i>';
            showToast('Password copied to clipboard!', 'success');
            
            // Reset icon after 2 seconds
            setTimeout(() => {
                clipboardEl.innerHTML = '<i class="fa fa-clipboard"></i>';
            }, 2000);
            
        } catch (err) {
            // Fallback for older browsers
            console.log('Clipboard API not available, using fallback');
            copyToClipboardFallback(resultEl.innerText);
        }
    };

    // Save password functionality
    saveEl.onclick = function () {
        const password = resultEl.innerText;
        
        if (!password || password === 'Click Generate') {
            showToast('Generate a password first', 'warning');
            return;
        }

        savePassword(password);
    };

    // Auto-fill functionality
    function setupAutoFill() {
        // Add auto-fill button if not exists
        if (!document.getElementById('autofill')) {
            const autoFillBtn = document.createElement('button');
            autoFillBtn.className = 'btn btn-large';
            autoFillBtn.id = 'autofill';
            autoFillBtn.innerHTML = '<i class="fa fa-magic"></i> Auto-fill on Website';
            autoFillBtn.style.backgroundColor = '#34a853';
            autoFillBtn.style.marginTop = '8px';
            
            autoFillBtn.onclick = autoFillPassword;
            saveEl.parentNode.insertBefore(autoFillBtn, saveEl.nextSibling);
        }
    }

    // Generate password function
    function generatePassword() {
        const length = +lengthEl.value;
        const hasLower = lowercaseEl.checked;
        const hasUpper = uppercaseEl.checked;
        const hasNumber = numberEl.checked;
        const hasSymbol = symbolsEl.checked;
        const excludeSimilar = excludeSimilarEl.checked;

        // Validate inputs
        if (length < 8 || length > 32) {
            throw new Error('Password length must be between 8 and 32');
        }

        if (!hasLower && !hasUpper && !hasNumber && !hasSymbol) {
            throw new Error('Select at least one character type');
        }

        let generatedPassword = '';
        const types = [];

        if (hasLower) types.push(excludeSimilar ? 'lower' : 'lowerFull');
        if (hasUpper) types.push(excludeSimilar ? 'upper' : 'upperFull');
        if (hasNumber) types.push(excludeSimilar ? 'number' : 'numberFull');
        if (hasSymbol) types.push('symbol');

        // Ensure at least one character from each selected type
        for (let i = 0; i < types.length; i++) {
            generatedPassword += randomFunc[types[i]]();
        }

        // Fill the rest randomly
        while (generatedPassword.length < length) {
            const randomType = types[Math.floor(getSecureRandom() * types.length)];
            generatedPassword += randomFunc[randomType]();
        }

        // Shuffle the password for better randomness
        return shuffleString(generatedPassword);
    }

    // Secure random character generator
    function getRandomChar(charSet) {
        const randomIndex = Math.floor(getSecureRandom() * charSet.length);
        return charSet[randomIndex];
    }

    // Cryptographically secure random number
    function getSecureRandom() {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] / (0xFFFFFFFF + 1);
    }

    // Shuffle string using Fisher-Yates algorithm
    function shuffleString(string) {
        const array = string.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(getSecureRandom() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }

    // Password strength calculator
    function updatePasswordStrength(password) {
        let strength = 0;
        
        // Length contribution
        strength += Math.min(password.length / 4, 5);
        
        // Character variety contribution
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[^a-zA-Z0-9]/.test(password);
        
        strength += (hasLower + hasUpper + hasNumber + hasSymbol) * 2;
        
        // Entropy calculation
        let charsetSize = 0;
        if (hasLower) charsetSize += 26;
        if (hasUpper) charsetSize += 26;
        if (hasNumber) charsetSize += 10;
        if (hasSymbol) charsetSize += 20;
        
        const entropy = password.length * Math.log2(charsetSize);
        strength += Math.min(entropy / 10, 5);
        
        // Update strength bar
        strengthBar.className = 'strength-bar';
        if (strength < 10) {
            strengthBar.classList.add('strength-weak');
        } else if (strength < 20) {
            strengthBar.classList.add('strength-medium');
        } else {
            strengthBar.classList.add('strength-strong');
        }
    }

    // Copy to clipboard fallback
    function copyToClipboardFallback(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showToast('Password copied to clipboard!', 'success');
        } catch (err) {
            showToast('Failed to copy password', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    // Toast notification system
    function showToast(message, type = 'info') {
        toast.textContent = message;
        toast.className = 'toast show';
        toast.style.backgroundColor = type === 'success' ? '#34a853' : 
                                    type === 'error' ? '#ea4335' : 
                                    type === 'warning' ? '#fbbc04' : '#4285f4';
        
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }

    // Save password to storage
    function savePassword(password) {
        // Get current saved passwords
        chrome.storage.local.get(['savedPasswords'], (result) => {
            const savedPasswords = result.savedPasswords || [];
            
            // Add new password with timestamp
            const passwordEntry = {
                id: Date.now(),
                password: password,
                timestamp: new Date().toLocaleString(),
                strength: strengthBar.classList.contains('strength-strong') ? 'strong' : 
                         strengthBar.classList.contains('strength-medium') ? 'medium' : 'weak'
            };
            
            savedPasswords.unshift(passwordEntry); // Add to beginning
            savedPasswords.splice(10, 1); // Keep only last 10
            
            // Save to storage
            chrome.storage.local.set({ savedPasswords: savedPasswords }, () => {
                showToast('Password saved to history!', 'success');
            });
        });
    }

    // Auto-fill password on current website
    async function autoFillPassword() {
        try {
            const password = resultEl.innerText;
            
            if (!password || password === 'Click Generate') {
                showToast('Generate a password first', 'warning');
                return;
            }

            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Inject content script to auto-fill password
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: fillPasswordFields,
                args: [password]
            }, (results) => {
                if (chrome.runtime.lastError) {
                    showToast('Auto-fill not available on this page', 'warning');
                    return;
                }
                
                if (results && results[0].result) {
                    showToast('Password auto-filled!', 'success');
                } else {
                    showToast('No password field found', 'warning');
                }
            });
            
        } catch (error) {
            console.error('Auto-fill error:', error);
            showToast('Auto-fill failed', 'error');
        }
    }
    

    // Initialize extension
    function init() {
        setupAutoFill();
        loadSavedSettings();
        
        // Generate initial password
        generateEl.click();
    }

    // Load saved settings
    function loadSavedSettings() {
        chrome.storage.local.get(['passwordSettings'], (result) => {
            if (result.passwordSettings) {
                const settings = result.passwordSettings;
                lengthEl.value = settings.length || 16;
                uppercaseEl.checked = settings.uppercase !== false;
                lowercaseEl.checked = settings.lowercase !== false;
                numberEl.checked = settings.number !== false;
                symbolsEl.checked = settings.symbols !== false;
                excludeSimilarEl.checked = settings.excludeSimilar || false;
            }
        });
    }

    // Save settings when changed
    [lengthEl, uppercaseEl, lowercaseEl, numberEl, symbolsEl, excludeSimilarEl].forEach(el => {
        el.addEventListener('change', saveSettings);
    });

    function saveSettings() {
        const settings = {
            length: +lengthEl.value,
            uppercase: uppercaseEl.checked,
            lowercase: lowercaseEl.checked,
            number: numberEl.checked,
            symbols: symbolsEl.checked,
            excludeSimilar: excludeSimilarEl.checked
        };
        
        chrome.storage.local.set({ passwordSettings: settings });
    }

    // Initialize the extension
    init();
});

// Content script function to fill password fields
function fillPasswordFields(password) {
    const passwordFields = document.querySelectorAll('input[type="password"]');
    
    if (passwordFields.length === 0) {
        return false;
    }

    // Fill all password fields
    passwordFields.forEach(field => {
        field.value = password;
        
        // Trigger change events
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Try to find associated username/email field
    const usernameFields = document.querySelectorAll('input[type="email"], input[type="text"][name*="user"], input[type="text"][name*="email"]');
    if (usernameFields.length > 0) {
        usernameFields[0].focus();
    } else {
        passwordFields[0].focus();
    }

    return true;
}