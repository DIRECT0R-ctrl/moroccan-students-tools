// Global variables
let timerInterval;
let timerSeconds = 25 * 60; // 25 minutes in seconds
let isTimerRunning = false;
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let shortLinks = JSON.parse(localStorage.getItem('shortLinks')) || [];

// Currency exchange rates (approximate - you can update these)
const exchangeRates = {
    USD: 0.1,     // 1 MAD ≈ 0.1 USD
    EUR: 0.09,    // 1 MAD ≈ 0.09 EUR
    GBP: 0.08,    // 1 MAD ≈ 0.08 GBP
    CAD: 0.13     // 1 MAD ≈ 0.13 CAD
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadExpenses();
    loadShortLinks();
    updateTimerDisplay();
});

// Currency Converter
function convertCurrency() {
    const madAmount = parseFloat(document.getElementById('madAmount').value);
    const targetCurrency = document.getElementById('targetCurrency').value;
    const resultDiv = document.getElementById('currencyResult');
    
    if (!madAmount || madAmount <= 0) {
        resultDiv.innerHTML = '<span class="error">Please enter a valid amount</span>';
        return;
    }
    
    const convertedAmount = (madAmount * exchangeRates[targetCurrency]).toFixed(2);
    resultDiv.innerHTML = `
        <span class="success">
            ${madAmount} MAD = ${convertedAmount} ${targetCurrency}
            <br><small>Rate: 1 MAD = ${exchangeRates[targetCurrency]} ${targetCurrency}</small>
        </span>
    `;
}

// Timer Functions
function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (isTimerRunning) return;
    
    isTimerRunning = true;
    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            alert('⏰ Time\'s up! Take a break! 🎉');
            playNotificationSound();
            timerSeconds = 25 * 60; // Reset to 25 minutes
            updateTimerDisplay();
        }
    }, 1000);
}

function pauseTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        isTimerRunning = false;
    }
}

function resetTimer() {
    pauseTimer();
    timerSeconds = 25 * 60;
    updateTimerDisplay();
}

function setTimer(minutes) {
    pauseTimer();
    timerSeconds = minutes * 60;
    updateTimerDisplay();
}

function playNotificationSound() {
    // Create a simple beep sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    } catch (error) {
        console.log('Audio notification not supported');
    }
}

// Grade Calculator
function addGradeInput() {
    const gradeInputs = document.getElementById('gradeInputs');
    const newInput = document.createElement('div');
    newInput.className = 'grade-input fade-in';
    newInput.innerHTML = `
        <input type="number" placeholder="Grade" min="0" max="20" step="0.5">
        <input type="number" placeholder="Coefficient" min="1" value="1">
        <button onclick="removeGradeInput(this)" class="clear-btn" style="padding: 0.5rem;">×</button>
    `;
    gradeInputs.appendChild(newInput);
}

function removeGradeInput(button) {
    button.parentElement.remove();
}

function calculateAverage() {
    const gradeInputs = document.querySelectorAll('.grade-input');
    const resultDiv = document.getElementById('gradeResult');
    
    let totalPoints = 0;
    let totalCoefficients = 0;
    let validGrades = 0;
    
    gradeInputs.forEach(input => {
        const grade = parseFloat(input.children[0].value);
        const coeff = parseFloat(input.children[1].value) || 1;
        
        if (!isNaN(grade) && grade >= 0 && grade <= 20) {
            totalPoints += grade * coeff;
            totalCoefficients += coeff;
            validGrades++;
        }
    });
    
    if (validGrades === 0) {
        resultDiv.innerHTML = '<span class="error">Please enter at least one valid grade</span>';
        return;
    }
    
    const average = (totalPoints / totalCoefficients).toFixed(2);
    const status = average >= 10 ? 'Passed ✅' : 'Failed ❌';
    const statusClass = average >= 10 ? 'success' : 'error';
    
    resultDiv.innerHTML = `
        <span class="${statusClass}">
            Average: ${average}/20 - ${status}
            <br><small>Based on ${validGrades} grade(s)</small>
        </span>
    `;
}

// Expense Tracker
function addExpense() {
    const desc = document.getElementById('expenseDesc').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    
    if (!desc || !amount || amount <= 0) {
        alert('Please enter a valid description and amount');
        return;
    }
    
    const expense = {
        id: Date.now(),
        description: desc,
        amount: amount,
        date: new Date().toLocaleDateString('en-GB')
    };
    
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    // Clear inputs
    document.getElementById('expenseDesc').value = '';
    document.getElementById('expenseAmount').value = '';
    
    loadExpenses();
}

function loadExpenses() {
    const expensesList = document.getElementById('expensesList');
    const totalDiv = document.getElementById('totalExpenses');
    
    if (expenses.length === 0) {
        expensesList.innerHTML = '<p style="color: #7f8c8d; text-align: center;">No expenses recorded yet</p>';
        totalDiv.innerHTML = '<span>Total: 0 MAD</span>';
        return;
    }
    
    expensesList.innerHTML = expenses.map(expense => `
        <div class="expense-item fade-in">
            <div>
                <strong>${expense.description}</strong>
                <br><small>${expense.date}</small>
            </div>
            <div>
                <span style="font-weight: bold; color: #e74c3c;">${expense.amount} MAD</span>
                <button onclick="removeExpense(${expense.id})">Delete</button>
            </div>
        </div>
    `).join('');
    
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalDiv.innerHTML = `<span class="success">Total: ${total.toFixed(2)} MAD</span>`;
}

function removeExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    loadExpenses();
}

function clearExpenses() {
    if (confirm('Are you sure you want to clear all expenses?')) {
        expenses = [];
        localStorage.setItem('expenses', JSON.stringify(expenses));
        loadExpenses();
    }
}

// Link Shortener
function shortenUrl() {
    const longUrl = document.getElementById('longUrl').value.trim();
    const resultDiv = document.getElementById('shortUrlResult');
    
    if (!longUrl) {
        resultDiv.innerHTML = '<span class="error">Please enter a URL</span>';
        return;
    }
    
    // Simple URL validation
    try {
        new URL(longUrl);
    } catch {
        resultDiv.innerHTML = '<span class="error">Please enter a valid URL</span>';
        return;
    }
    
    // Generate a short code (simple version)
    const shortCode = Math.random().toString(36).substring(2, 8);
    const shortUrl = `https://mst.ly/${shortCode}`;
    
    const link = {
        id: Date.now(),
        longUrl: longUrl,
        shortUrl: shortUrl,
        shortCode: shortCode,
        clicks: 0,
        created: new Date().toLocaleDateString('en-GB')
    };
    
    shortLinks.push(link);
    localStorage.setItem('shortLinks', JSON.stringify(shortLinks));
    
    resultDiv.innerHTML = `
        <div class="success">
            <strong>Short URL created:</strong><br>
            <a href="${longUrl}" target="_blank">${shortUrl}</a>
            <button onclick="copyToClipboard('${shortUrl}')" class="copy-btn">Copy</button>
        </div>
    `;
    
    document.getElementById('longUrl').value = '';
    loadShortLinks();
}

function loadShortLinks() {
    const savedLinks = document.getElementById('savedLinks');
    
    if (shortLinks.length === 0) {
        savedLinks.innerHTML = '';
        return;
    }
    
    const recentLinks = shortLinks.slice(-3).reverse(); // Show last 3 links
    savedLinks.innerHTML = `
        <h4 style="margin-top: 1rem; color: #2c3e50;">Recent Links:</h4>
        ${recentLinks.map(link => `
            <div class="link-item fade-in">
                <div>
                    <a href="${link.longUrl}" target="_blank">${link.shortUrl}</a>
                    <br><small>${link.created}</small>
                </div>
                <button onclick="copyToClipboard('${link.shortUrl}')" class="copy-btn">Copy</button>
            </div>
        `).join('')}
    `;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard! 📋');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Copied to clipboard! 📋');
    });
}

// QR Code Generator
function generateQR() {
    const text = document.getElementById('qrText').value.trim();
    const resultDiv = document.getElementById('qrResult');
    
    if (!text) {
        resultDiv.innerHTML = '<span class="error">Please enter text or URL</span>';
        return;
    }
    
    // Using QR Server API (free service)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
    
    resultDiv.innerHTML = `
        <div class="success qr-container">
            <p><strong>QR Code generated:</strong></p>
            <img src="${qrUrl}" alt="QR Code" onload="this.style.opacity=1" style="opacity:0; transition: opacity 0.3s;">
            <br><small>Scan with your phone camera</small>
            <br><button onclick="downloadQR('${qrUrl}', '${text.substring(0, 20)}')" style="margin-top: 10px;">Download QR</button>
        </div>
    `;
}

function downloadQR(qrUrl, filename) {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr-${filename.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Donation Modal
function showDonation() {
    document.getElementById('donationModal').style.display = 'block';
}

function closeDonation() {
    document.getElementById('donationModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('donationModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Additional utility functions
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Add CSS animations for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Analytics (simple pageview tracking)
function trackUsage(tool) {
    try {
        const usage = JSON.parse(localStorage.getItem('toolUsage')) || {};
        usage[tool] = (usage[tool] || 0) + 1;
        usage.totalUses = (usage.totalUses || 0) + 1;
        localStorage.setItem('toolUsage', JSON.stringify(usage));
    } catch (error) {
        console.log('Usage tracking failed:', error);
    }
}

// Add event listeners for tracking
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON') {
        const toolCard = e.target.closest('.tool-card');
        if (toolCard) {
            const toolName = toolCard.querySelector('h2').textContent;
            trackUsage(toolName);
        }
    }
});

console.log('🇲🇦 Moroccan Student Tools loaded successfully!');
console.log('Made with ❤️ for 1337 students');

