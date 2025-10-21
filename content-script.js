// content-script.js - Isolated auto-fill functionality
function fillPasswordFieldsIsolated(password, username) {
    // Store original styles to restore later
    const originalStyles = new Map();
    
    try {
        // Find password fields
        const passwordFields = findPasswordFields();
        
        if (passwordFields.length === 0) {
            return { success: false, reason: 'No password fields found' };
        }

        let filledFields = 0;

        // Fill password fields
        passwordFields.forEach(field => {
            if (field && field.type === 'password') {
                // Store original value and style
                originalStyles.set(field, {
                    value: field.value,
                    boxShadow: field.style.boxShadow,
                    border: field.style.border
                });
                
                // Fill the field
                field.value = password;
                
                // Add temporary visual feedback without affecting layout
                field.style.boxShadow = '0 0 0 2px #34a853';
                field.style.border = '1px solid #34a853';
                
                // Trigger events
                triggerEvents(field);
                filledFields++;
            }
        });

        // Fill username/email fields if provided
        if (username) {
            const usernameFields = findUsernameFields();
            usernameFields.forEach(field => {
                if (field && !field.value) { // Only fill if empty
                    originalStyles.set(field, {
                        value: field.value,
                        boxShadow: field.style.boxShadow,
                        border: field.style.border
                    });
                    
                    field.value = username;
                    field.style.boxShadow = '0 0 0 2px #4285f4';
                    field.style.border = '1px solid #4285f4';
                    triggerEvents(field);
                    filledFields++;
                }
            });
        }

        // Remove visual feedback after 2 seconds
        setTimeout(() => {
            originalStyles.forEach((originalStyle, field) => {
                if (field && field.style) {
                    field.style.boxShadow = originalStyle.boxShadow;
                    field.style.border = originalStyle.border;
                }
            });
        }, 2000);

        return { 
            success: true, 
            filledFields: filledFields,
            message: `Filled ${filledFields} field(s) successfully` 
        };

    } catch (error) {
        // Restore original styles on error
        originalStyles.forEach((originalStyle, field) => {
            if (field && field.style) {
                field.style.boxShadow = originalStyle.boxShadow;
                field.style.border = originalStyle.border;
            }
        });
        
        return { success: false, reason: error.message };
    }
}

// Smart field detection that doesn't modify DOM
function findPasswordFields() {
    const selectors = [
        'input[type="password"]',
        'input[name*="password"]',
        'input[name*="pwd"]',
        'input[type="text"][name*="password"]',
        'input[type="text"][name*="pwd"]'
    ];
    
    const fields = [];
    selectors.forEach(selector => {
        const found = document.querySelectorAll(selector);
        found.forEach(field => {
            if (field.offsetParent !== null) { // Only visible fields
                fields.push(field);
            }
        });
    });
    
    return [...new Set(fields)]; // Remove duplicates
}

function findUsernameFields() {
    const selectors = [
        'input[type="email"]',
        'input[type="text"][name*="user"]',
        'input[type="text"][name*="email"]',
        'input[type="text"][name*="login"]',
        'input[type="text"][name*="username"]',
        'input[autocomplete="username"]',
        'input[autocomplete="email"]'
    ];
    
    const fields = [];
    selectors.forEach(selector => {
        const found = document.querySelectorAll(selector);
        found.forEach(field => {
            if (field.offsetParent !== null) { // Only visible fields
                fields.push(field);
            }
        });
    });
    
    return [...new Set(fields)];
}

// Trigger events without causing layout changes
function triggerEvents(element) {
    const events = ['input', 'change', 'keydown', 'keyup', 'focus'];
    
    events.forEach(eventType => {
        try {
            const event = new Event(eventType, { 
                bubbles: true, 
                cancelable: true 
            });
            element.dispatchEvent(event);
        } catch (e) {
            // Silent fail for unsupported events
        }
    });
}

// Expose function to chrome scripting
if (typeof fillPasswordFieldsIsolated === 'undefined') {
    window.fillPasswordFieldsIsolated = fillPasswordFieldsIsolated;
}