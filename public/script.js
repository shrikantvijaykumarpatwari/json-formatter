// API endpoint
const API_URL = `${window.location.origin}/api/format`;

// DOM elements
const jsonInput = document.getElementById('jsonInput');
const jsonOutput = document.getElementById('jsonOutput');
const templateSelect = document.getElementById('templateSelect');
const specSelect = document.getElementById('specSelect');
const fixJsonCheck = document.getElementById('fixJsonCheck');
const formatBtn = document.getElementById('formatBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const loadFileBtn = document.getElementById('loadFileBtn');
const loadExampleBtn = document.getElementById('loadExampleBtn');
const fileInput = document.getElementById('fileInput');
const outputSection = document.getElementById('outputSection');
const validationStatus = document.getElementById('validationStatus');
const messagesContainer = document.getElementById('messagesContainer');
const notification = document.getElementById('notification');

// Example JSON data
const exampleJSON = {
    "store": {
        "book": [
            {
                "category": "reference",
                "author": "Nigel Rees",
                "title": "Sayings of the Century",
                "price": 8.95
            },
            {
                "category": "fiction",
                "author": "Evelyn Waugh",
                "title": "Sword of Honour",
                "price": 12.99
            },
            {
                "category": "fiction",
                "author": "J. R. R. Tolkien",
                "title": "The Lord of the Rings",
                "isbn": "0-395-19395-8",
                "price": 22.99
            }
        ],
        "bicycle": {
            "color": "red",
            "price": 19.95
        }
    }
};

// Event listeners
formatBtn.addEventListener('click', formatJSON);
copyBtn.addEventListener('click', copyToClipboard);
downloadBtn.addEventListener('click', downloadJSON);
clearBtn.addEventListener('click', clearInput);
loadFileBtn.addEventListener('click', () => fileInput.click());
loadExampleBtn.addEventListener('click', loadExample);
fileInput.addEventListener('change', handleFileUpload);

// Format JSON
async function formatJSON() {
    const data = jsonInput.value.trim();
    
    if (!data) {
        showNotification('Please enter some JSON data', 'error');
        return;
    }

    formatBtn.disabled = true;
    formatBtn.textContent = '⏳ Processing...';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: data,
                template: templateSelect.value,
                spec: specSelect.value,
                fixJson: fixJsonCheck.checked
            })
        });

        const result = await response.json();

        if (result.success) {
            jsonOutput.value = result.formatted;
            outputSection.style.display = 'block';
            
            // Update validation status
            if (result.valid) {
                validationStatus.className = 'status valid';
                validationStatus.textContent = `✓ Valid JSON${result.spec ? ' (' + result.spec + ')' : ''}`;
            } else {
                validationStatus.className = 'status invalid';
                validationStatus.textContent = '✗ Invalid JSON';
            }

            // Display messages
            displayMessages(result);
            
            // Scroll to output
            outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            showNotification('JSON formatted successfully!', 'success');
        } else {
            showNotification(result.error, 'error');
            displayError(result);
        }

    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
        console.error('Error:', error);
    } finally {
        formatBtn.disabled = false;
        formatBtn.textContent = '✨ Format JSON';
    }
}

// Display messages (fixes, errors, warnings)
function displayMessages(result) {
    messagesContainer.innerHTML = '';

    // Display fixes
    if (result.fixes && result.fixes.length > 0) {
        const fixMessage = createMessageElement('success', 'Fixes Applied:', result.fixes);
        messagesContainer.appendChild(fixMessage);
    }

    // Display errors
    if (result.errors && result.errors.length > 0) {
        const errorMessage = createMessageElement('error', 'Errors:', result.errors);
        messagesContainer.appendChild(errorMessage);
    }

    // Display warnings
    if (result.warnings && result.warnings.length > 0) {
        const warningMessage = createMessageElement('warning', 'Warnings:', result.warnings);
        messagesContainer.appendChild(warningMessage);
    }
}

// Display error when formatting fails
function displayError(result) {
    messagesContainer.innerHTML = '';
    outputSection.style.display = 'block';
    jsonOutput.value = '';
    validationStatus.className = 'status invalid';
    validationStatus.textContent = '✗ JSON Parse Error';

    const errorMessage = createMessageElement('error', 'Error:', [result.error]);
    messagesContainer.appendChild(errorMessage);

    if (result.fixes && result.fixes.length > 0) {
        const fixMessage = createMessageElement('info', 'Attempted Fixes:', result.fixes);
        messagesContainer.appendChild(fixMessage);
    }

    if (result.warnings && result.warnings.length > 0) {
        const warningMessage = createMessageElement('warning', 'Warnings:', result.warnings);
        messagesContainer.appendChild(warningMessage);
    }

    outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Create message element
function createMessageElement(type, title, items) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const titleStrong = document.createElement('strong');
    titleStrong.textContent = title;

    const list = document.createElement('ul');
    list.className = 'message-list';

    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `• ${item}`;
        list.appendChild(li);
    });

    messageDiv.appendChild(titleStrong);
    messageDiv.appendChild(list);

    return messageDiv;
}

// Copy to clipboard
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(jsonOutput.value);
        showNotification('Copied to clipboard!', 'success');
    } catch (error) {
        // Fallback for older browsers
        jsonOutput.select();
        document.execCommand('copy');
        showNotification('Copied to clipboard!', 'success');
    }
}

// Download JSON
function downloadJSON() {
    const blob = new Blob([jsonOutput.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('JSON downloaded!', 'success');
}

// Clear input
function clearInput() {
    jsonInput.value = '';
    jsonOutput.value = '';
    outputSection.style.display = 'none';
    messagesContainer.innerHTML = '';
    jsonInput.focus();
}

// Load example
function loadExample() {
    jsonInput.value = JSON.stringify(exampleJSON, null, 2);
    showNotification('Example loaded!', 'info');
}

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;

    if (!file.name.endsWith('.json')) {
        showNotification('Please select a JSON file', 'error');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
        jsonInput.value = e.target.result;
        showNotification('File loaded successfully!', 'success');
    };
    
    reader.onerror = () => {
        showNotification('Error reading file', 'error');
    };
    
    reader.readAsText(file);
    
    // Reset file input
    fileInput.value = '';
}

// Show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = 'notification show';
    
    // Set color based on type
    switch(type) {
        case 'error':
            notification.style.background = '#dc3545';
            break;
        case 'warning':
            notification.style.background = '#ffc107';
            notification.style.color = '#000';
            break;
        case 'info':
            notification.style.background = '#17a2b8';
            break;
        default:
            notification.style.background = '#28a745';
            notification.style.color = '#fff';
    }
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Handle drag and drop
jsonInput.addEventListener('dragover', (e) => {
    e.preventDefault();
    jsonInput.style.borderColor = '#4a90e2';
    jsonInput.style.background = '#f0f8ff';
});

jsonInput.addEventListener('dragleave', (e) => {
    e.preventDefault();
    jsonInput.style.borderColor = '#dee2e6';
    jsonInput.style.background = '#fafafa';
});

jsonInput.addEventListener('drop', (e) => {
    e.preventDefault();
    jsonInput.style.borderColor = '#dee2e6';
    jsonInput.style.background = '#fafafa';
    
    const file = e.dataTransfer.files[0];
    
    if (file && file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            jsonInput.value = event.target.result;
            showNotification('File loaded successfully!', 'success');
        };
        reader.readAsText(file);
    } else {
        showNotification('Please drop a JSON file', 'error');
    }
});