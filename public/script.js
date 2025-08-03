// Global variables
let chatHistory = [];
let isProcessing = false;
let currentTheme = localStorage.getItem('theme') || 'light';
let uploadedImage = null;

// DOM elements
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');
const loadingOverlay = document.getElementById('loadingOverlay');
const charCount = document.getElementById('charCount');
const status = document.getElementById('status');
const themeToggle = document.getElementById('themeToggle');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const uploadPreview = document.getElementById('uploadPreview');
const previewImage = document.getElementById('previewImage');
const streamingIndicator = document.getElementById('streamingIndicator');
const toastContainer = document.getElementById('toastContainer');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateCharCount();
    checkServerHealth();
    applyTheme();
});

// Setup event listeners
function setupEventListeners() {
    // Send message on Enter (but not Shift+Enter)
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        updateCharCount();
        autoResizeTextarea();
    });

    // Send button click
    sendButton.addEventListener('click', sendMessage);

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Export conversation
    exportBtn.addEventListener('click', exportConversation);

    // Clear conversation
    clearBtn.addEventListener('click', clearChat);

    // File upload
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        messageInput.focus();
    }
    
    // Ctrl/Cmd + L to toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        toggleTheme();
    }
    
    // Ctrl/Cmd + E to export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportConversation();
    }
}

// Theme management
function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const icon = themeToggle.querySelector('i');
    icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme();
    showToast('Theme changed to ' + currentTheme + ' mode', 'info');
}

// Auto-resize textarea
function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

// Update character count
function updateCharCount() {
    const count = messageInput.value.length;
    charCount.textContent = `${count}/4000`;
    
    if (count > 3600) {
        charCount.style.color = '#ef4444';
    } else if (count > 3000) {
        charCount.style.color = '#f59e0b';
    } else {
        charCount.style.color = 'var(--text-muted)';
    }
}

// File upload handling
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showToast('Image size must be less than 10MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImage = {
            data: e.target.result,
            name: file.name,
            type: file.type
        };
        
        previewImage.src = e.target.result;
        uploadPreview.style.display = 'flex';
        showToast('Image uploaded successfully', 'success');
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    uploadedImage = null;
    uploadPreview.style.display = 'none';
    fileInput.value = '';
    showToast('Image removed', 'info');
}

// Send example message
function sendExample(message) {
    messageInput.value = message;
    sendMessage();
}

// Send message to Gemini
async function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message || isProcessing) {
        return;
    }

    // Clear input and add user message
    messageInput.value = '';
    updateCharCount();
    autoResizeTextarea();
    
    addMessage(message, 'user');
    setProcessing(true);

    try {
        const requestBody = {
            message: message,
            history: chatHistory
        };

        // Add image if uploaded
        if (uploadedImage) {
            requestBody.image = uploadedImage;
            removeImage(); // Clear the image after sending
        }

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        // Update chat history
        chatHistory = data.history;
        
        // Add assistant response
        addMessage(data.response, 'assistant');
        
        updateStatus('Ready', 'success');

    } catch (error) {
        console.error('Error:', error);
        addErrorMessage('Sorry, I encountered an error. Please try again.');
        updateStatus('Error', 'error');
    } finally {
        setProcessing(false);
    }
}

// Add message to chat
function addMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Format the content (handle code blocks, links, etc.)
    messageContent.innerHTML = formatMessage(content);
    
    // Add message actions for assistant messages
    if (role === 'assistant') {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'message-action';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.title = 'Copy message';
        copyBtn.onclick = () => copyToClipboard(content);
        
        const regenerateBtn = document.createElement('button');
        regenerateBtn.className = 'message-action';
        regenerateBtn.innerHTML = '<i class="fas fa-redo"></i>';
        regenerateBtn.title = 'Regenerate response';
        regenerateBtn.onclick = () => regenerateResponse();
        
        actionsDiv.appendChild(copyBtn);
        actionsDiv.appendChild(regenerateBtn);
        messageContent.appendChild(actionsDiv);
    }
    
    // Add timestamp
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString();
    messageDiv.appendChild(timestamp);
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Remove welcome message if it exists
    const welcomeMessage = chatMessages.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
}

// Copy message to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Message copied to clipboard', 'success');
    } catch (error) {
        showToast('Failed to copy message', 'error');
    }
}

// Regenerate response
function regenerateResponse() {
    const lastUserMessage = chatHistory.find(msg => msg.role === 'user');
    if (lastUserMessage) {
        messageInput.value = lastUserMessage.parts;
        sendMessage();
    }
}

// Add error message
function addErrorMessage(content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.style.border = '1px solid var(--error-color)';
    messageContent.style.background = 'var(--bg-secondary)';
    messageContent.style.color = 'var(--error-color)';
    messageContent.textContent = content;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Format message content (handle markdown-like formatting)
function formatMessage(content) {
    // Handle code blocks
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
        return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code)}</code></pre>`;
    });
    
    // Handle inline code
    content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Handle line breaks
    content = content.replace(/\n/g, '<br>');
    
    // Handle links (simple regex for demonstration)
    content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    
    return content;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Set processing state
function setProcessing(processing) {
    isProcessing = processing;
    sendButton.disabled = processing;
    
    if (processing) {
        loadingOverlay.classList.add('show');
        updateStatus('Processing...', 'processing');
    } else {
        loadingOverlay.classList.remove('show');
        updateStatus('Ready', 'success');
    }
}

// Update status
function updateStatus(text, type) {
    const statusText = status.querySelector('.status-text');
    const statusDot = status.querySelector('.status-dot');
    
    statusText.textContent = text;
    
    // Update status dot color
    statusDot.className = 'status-dot';
    switch (type) {
        case 'success':
            statusDot.style.background = 'var(--success-color)';
            break;
        case 'error':
            statusDot.style.background = 'var(--error-color)';
            break;
        case 'processing':
            statusDot.style.background = 'var(--warning-color)';
            break;
        default:
            statusDot.style.background = 'var(--success-color)';
    }
}

// Check server health
async function checkServerHealth() {
    try {
        const response = await fetch('/api/health');
        if (response.ok) {
            updateStatus('Connected', 'success');
        } else {
            updateStatus('Disconnected', 'error');
        }
    } catch (error) {
        updateStatus('Disconnected', 'error');
    }
}

// Export conversation
function exportConversation() {
    if (chatHistory.length === 0) {
        showToast('No conversation to export', 'info');
        return;
    }

    const exportData = {
        timestamp: new Date().toISOString(),
        messages: chatHistory,
        totalMessages: chatHistory.length
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-conversation-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Conversation exported successfully', 'success');
}

// Clear chat
function clearChat() {
    if (chatHistory.length === 0) {
        showToast('Chat is already empty', 'info');
        return;
    }

    if (confirm('Are you sure you want to clear the conversation?')) {
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-sparkles"></i>
                </div>
                <h2>Welcome to Gemini AI!</h2>
                <p>Ask me anything - I'm here to help with your questions, creative tasks, coding, and more.</p>
                <div class="example-prompts">
                    <button class="example-btn" onclick="sendExample('Write a short story about a robot learning to paint')">
                        <i class="fas fa-palette"></i>
                        Creative Writing
                    </button>
                    <button class="example-btn" onclick="sendExample('Explain quantum computing in simple terms')">
                        <i class="fas fa-atom"></i>
                        Explain Concepts
                    </button>
                    <button class="example-btn" onclick="sendExample('Write a Python function to calculate fibonacci numbers')">
                        <i class="fas fa-code"></i>
                        Code Help
                    </button>
                </div>
            </div>
        `;
        chatHistory = [];
        showToast('Conversation cleared', 'success');
    }
}

// Toast notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Export functions for global access
window.sendMessage = sendMessage;
window.sendExample = sendExample;
window.clearChat = clearChat;
window.removeImage = removeImage; 