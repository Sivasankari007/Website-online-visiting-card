// ===== DOM Elements =====
const qrToggle = document.getElementById('qrToggle');
const qrDisplay = document.getElementById('qrDisplay');
const qrCode = document.getElementById('qrCode');
const saveContactBtn = document.getElementById('saveContactBtn');
const shareCardBtn = document.getElementById('shareCardBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// ===== Contact Information (Customize this) =====
const contactInfo = {
    name: 'Aadhira',
    title: 'Professional Title',
    company: 'Company Name',
    phone: '+1234567890',
    email: 'aadhira2@gmail.com',
    website: 'https://yourwebsite.com',
    address: 'Your City, Country',
    linkedin: 'https://linkedin.com/in/yourprofile',
    twitter: 'https://twitter.com/yourprofile',
    github: 'https://github.com/yourprofile',
    instagram: 'https://instagram.com/yourprofile',
    whatsapp: '+1234567890'
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    generateQRCode();
    initializeEventListeners();
    addContactItemInteractions();
});

// ===== Event Listeners =====
function initializeEventListeners() {
    // QR Code Toggle
    qrToggle.addEventListener('click', toggleQRCode);

    // Save Contact Button
    saveContactBtn.addEventListener('click', saveContact);

    // Share Card Button
    shareCardBtn.addEventListener('click', shareCard);

    // Add hover effects to card
    const card = document.querySelector('.visiting-card');
    card.addEventListener('mousemove', handleCardTilt);
    card.addEventListener('mouseleave', resetCardTilt);
}

// ===== QR Code Generation =====
function generateQRCode() {
    // Generate a simple QR code using SVG
    const url = window.location.href;
    const size = 130;

    // Create a placeholder QR pattern (in production, use a library like qrcode.js)
    const svg = createQRCodeSVG(url, size);
    qrCode.innerHTML = svg;
}

function createQRCodeSVG(data, size) {
    // Simple QR code placeholder with a pattern
    // For production, use qrcode-generator or similar library
    const cellSize = 5;
    const modules = 21; // QR version 1
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${modules * cellSize} ${modules * cellSize}">`;

    // Generate a pseudo-random pattern based on URL
    const pattern = generatePattern(data, modules);

    for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
            if (pattern[row][col]) {
                svg += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="#1a1a2e"/>`;
            }
        }
    }

    svg += '</svg>';
    return svg;
}

function generatePattern(data, size) {
    const pattern = [];

    // Create position detection patterns (corners)
    for (let i = 0; i < size; i++) {
        pattern[i] = [];
        for (let j = 0; j < size; j++) {
            // Position detection patterns in corners
            if (isPositionPattern(i, j, size)) {
                pattern[i][j] = isPositionPatternModule(i, j, size);
            } else {
                // Data area - create pattern based on hash
                const hash = simpleHash(data + i + j);
                pattern[i][j] = (hash % 3 !== 0);
            }
        }
    }

    return pattern;
}

function isPositionPattern(row, col, size) {
    // Check if in position pattern areas
    const inTopLeft = row < 7 && col < 7;
    const inTopRight = row < 7 && col >= size - 7;
    const inBottomLeft = row >= size - 7 && col < 7;
    return inTopLeft || inTopRight || inBottomLeft;
}

function isPositionPatternModule(row, col, size) {
    let r = row;
    let c = col;

    // Normalize coordinates for each position pattern
    if (row >= size - 7) r = row - (size - 7);
    if (col >= size - 7) c = col - (size - 7);

    // Position pattern: 7x7 with specific pattern
    if (r === 0 || r === 6 || c === 0 || c === 6) return true;
    if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
    return false;
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// ===== QR Code Toggle =====
function toggleQRCode() {
    qrDisplay.classList.toggle('active');
    const icon = qrToggle.querySelector('i');
    const text = qrToggle.querySelector('span');

    if (qrDisplay.classList.contains('active')) {
        icon.className = 'fas fa-times';
        text.textContent = 'Hide QR Code';
    } else {
        icon.className = 'fas fa-qrcode';
        text.textContent = 'Scan QR Code';
    }
}

// ===== Save Contact (vCard) =====
function saveContact() {
    const vCard = generateVCard();
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${contactInfo.name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Contact saved successfully!');
}

function generateVCard() {
    return `BEGIN:VCARD
VERSION:3.0
FN:${contactInfo.name}
ORG:${contactInfo.company}
TITLE:${contactInfo.title}
TEL;TYPE=CELL:${contactInfo.phone}
EMAIL:${contactInfo.email}
URL:${contactInfo.website}
ADR;TYPE=HOME:;;${contactInfo.address};;;;
END:VCARD`;
}

// ===== Share Card =====
async function shareCard() {
    const shareData = {
        title: `${contactInfo.name} - Digital Visiting Card`,
        text: `Check out my digital visiting card!`,
        url: window.location.href
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
            showToast('Shared successfully!');
        } else {
            // Fallback: Copy to clipboard
            await navigator.clipboard.writeText(window.location.href);
            showToast('Link copied to clipboard!');
        }
    } catch (err) {
        // User cancelled or error occurred
        if (err.name !== 'AbortError') {
            // Try clipboard as fallback
            try {
                await navigator.clipboard.writeText(window.location.href);
                showToast('Link copied to clipboard!');
            } catch (clipErr) {
                showToast('Unable to share. Please copy the URL manually.');
            }
        }
    }
}

// ===== Toast Notification =====
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== Card 3D Tilt Effect =====
function handleCardTilt(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function resetCardTilt(e) {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
}

// ===== Contact Item Interactions =====
function addContactItemInteractions() {
    const contactItems = document.querySelectorAll('.contact-item');

    contactItems.forEach(item => {
        item.addEventListener('click', async () => {
            const link = item.querySelector('a');
            if (link) {
                const text = link.textContent || link.href;
                try {
                    await navigator.clipboard.writeText(text);
                    showToast('Copied to clipboard!');
                } catch (err) {
                    // If clipboard fails, just follow the link
                    window.location.href = link.href;
                }
            }
        });
    });
}

// ===== Social Links Analytics (Optional) =====
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const platform = link.classList[1]; // Get platform name from class
        console.log(`Social link clicked: ${platform}`);
        // Add analytics tracking here if needed
    });
});

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.querySelectorAll('.contact-item, .social-link').forEach(el => {
    observer.observe(el);
});

// ===== Keyboard Navigation =====
document.addEventListener('keydown', (e) => {
    // Press 'Q' to toggle QR code
    if (e.key.toLowerCase() === 'q' && !e.ctrlKey && !e.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
            toggleQRCode();
        }
    }

    // Press 'S' to save contact
    if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
            saveContact();
        }
    }
});

// ===== Console Welcome Message =====
console.log('%c👋 Welcome to Digital Visiting Card!', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%cCustomize the contactInfo object in script.js to personalize your card.', 'font-size: 14px; color: #764ba2;');
