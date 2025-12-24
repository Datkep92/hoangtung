// js/contact-buttons-luxury.js
class LuxuryContactButtons {
    constructor() {
        this.phoneNumber = '0567033888';
        this.zaloLink = 'https://zalo.me/0567033888';
        this.whatsappLink = `https://wa.me/840567033888?text=${encodeURIComponent('Xin chào HTUTransport! Tôi muốn tư vấn về dịch vụ xe.')}`;
        
        // Stats tracking
        this.stats = {
            phone: this.getStat('phone'),
            zalo: this.getStat('zalo'),
            whatsapp: this.getStat('whatsapp'),
            lastInteraction: Date.now()
        };
        
        // Sound effects
        this.sounds = {
            click: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='), // Silent fallback
            hover: null
        };
    }

    init() {
        this.createLuxuryButtons();
        this.setupEventListeners();
        this.createSparkles();
        this.startAmbientAnimation();
        
        console.log('💎 Luxury Contact Buttons initialized');
    }

    createLuxuryButtons() {
        const buttonsHTML = `
            <div class="contact-buttons-luxury" id="luxuryContactButtons">
                <!-- Nút Gọi Điện Vàng -->
                <button class="luxury-contact-btn phone-btn-gold" id="luxuryPhoneBtn" 
                        aria-label="Gọi điện cho HTUTransport">
                    <div class="melt-effect"></div>
                    <i class="fas fa-phone-alt"></i>
                    <span class="luxury-tooltip">Gọi ngay: ${this.formatPhoneNumber(this.phoneNumber)}</span>
                    <span class="luxury-badge" id="phoneLuxuryBadge">${this.stats.phone > 0 ? this.stats.phone : ''}</span>
                </button>
                
                <!-- Nút Zalo Xanh Dương -->
                <button class="luxury-contact-btn zalo-btn-blue" id="luxuryZaloBtn"
                        aria-label="Nhắn tin Zalo cho HTUTransport">
                    <div class="wave-effect"></div>
                    <i class="fab fa-facebook-messenger"></i>
                    <span class="luxury-tooltip">Zalo: ${this.formatPhoneNumber(this.phoneNumber)}</span>
                    <span class="luxury-badge" id="zaloLuxuryBadge">${this.stats.zalo > 0 ? this.stats.zalo : ''}</span>
                </button>
                
                <!-- Nút WhatsApp Xanh Lá -->
                <button class="luxury-contact-btn whatsapp-btn-green" id="luxuryWhatsappBtn"
                        aria-label="Chat WhatsApp với HTUTransport">
                    <div class="leaf-effect"></div>
                    <i class="fab fa-whatsapp"></i>
                    <span class="luxury-tooltip">WhatsApp: ${this.formatPhoneNumber(this.phoneNumber)}</span>
                    <span class="luxury-badge" id="whatsappLuxuryBadge">${this.stats.whatsapp > 0 ? this.stats.whatsapp : ''}</span>
                </button>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', buttonsHTML);
        
        // Tạo sparkles động
        this.createDynamicSparkles();
    }

    createSparkles() {
        const buttons = document.querySelectorAll('.luxury-contact-btn');
        buttons.forEach(btn => {
            for (let i = 1; i <= 6; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = `sparkle-diamond sparkle-${i}`;
                btn.appendChild(sparkle);
            }
        });
    }

    createDynamicSparkles() {
        // Tạo sparkles ngẫu nhiên bay xung quanh
        setInterval(() => {
            if (Math.random() > 0.7) {
                this.createFloatingSparkle();
            }
        }, 2000);
    }

    createFloatingSparkle() {
        const container = document.getElementById('luxuryContactButtons');
        const sparkle = document.createElement('div');
        sparkle.className = 'floating-sparkle';
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        sparkle.style.cssText = `
            position: absolute;
            width: 3px;
            height: 3px;
            background: var(--diamond-sparkle);
            border-radius: 50%;
            top: ${y}%;
            left: ${x}%;
            box-shadow: 0 0 6px var(--diamond-sparkle);
            animation: floatingSparkle 3s ease-in-out forwards;
        `;
        
        container.appendChild(sparkle);
        
        // Xóa sau animation
        setTimeout(() => sparkle.remove(), 3000);
    }

    setupEventListeners() {
        const phoneBtn = document.getElementById('luxuryPhoneBtn');
        const zaloBtn = document.getElementById('luxuryZaloBtn');
        const whatsappBtn = document.getElementById('luxuryWhatsappBtn');

        // Phone với hiệu ứng loading
        phoneBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.playClickEffect();
            this.animateButton('phone');
            
            setTimeout(() => {
                this.trackInteraction('phone');
                window.location.href = `tel:${this.phoneNumber}`;
            }, 300);
        });

        // Zalo mở tab mới
        zaloBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.playClickEffect();
            this.animateButton('zalo');
            
            setTimeout(() => {
                this.trackInteraction('zalo');
                window.open(this.zaloLink, '_blank');
            }, 300);
        });

        // WhatsApp
        whatsappBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.playClickEffect();
            this.animateButton('whatsapp');
            
            setTimeout(() => {
                this.trackInteraction('whatsapp');
                window.open(this.whatsappLink, '_blank');
            }, 300);
        });

        // Hover effects
        [phoneBtn, zaloBtn, whatsappBtn].forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.playHoverEffect();
                this.createRippleEffect(btn);
            });
            
            // Touch feedback
            btn.addEventListener('touchstart', () => {
                btn.classList.add('active');
            });
            
            btn.addEventListener('touchend', () => {
                setTimeout(() => btn.classList.remove('active'), 150);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === '1' && e.altKey) {
                phoneBtn.click();
            } else if (e.key === '2' && e.altKey) {
                zaloBtn.click();
            } else if (e.key === '3' && e.altKey) {
                whatsappBtn.click();
            }
        });
    }

    animateButton(type) {
        const btn = document.getElementById(`luxury${this.capitalize(type)}Btn`);
        if (!btn) return;
        
        // Thêm class loading
        btn.classList.add('loading');
        
        // Hiệu ứng ripple
        this.createClickRipple(btn);
        
        // Xóa loading sau 1s
        setTimeout(() => {
            btn.classList.remove('loading');
        }, 1000);
    }

    createRippleEffect(button) {
        const ripple = document.createElement('div');
        ripple.className = 'luxury-ripple';
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
            width: ${size}px;
            height: ${size}px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: rippleExpand 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        button.appendChild(ripple);
        
        // Xóa sau animation
        setTimeout(() => ripple.remove(), 600);
    }

    createClickRipple(button) {
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%);
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            transform: scale(0);
            animation: clickRipple 0.5s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 500);
    }

    playClickEffect() {
        try {
            if (typeof Howl !== 'undefined') {
                // Nếu có Howl.js
                const sound = new Howl({
                    src: ['sounds/click.mp3'],
                    volume: 0.3
                });
                sound.play();
            } else {
                // Fallback đơn giản
                this.sounds.click.play();
            }
        } catch (e) {
            console.log('Sound not available');
        }
    }

    playHoverEffect() {
        // Tạo âm thanh hover nhẹ
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 523.25; // C5
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            // Fallback silent
        }
    }

    trackInteraction(type) {
        this.stats[type]++;
        this.stats.lastInteraction = Date.now();
        
        // Lưu vào localStorage
        localStorage.setItem(`luxury_${type}_clicks`, this.stats[type]);
        localStorage.setItem('last_contact_interaction', this.stats.lastInteraction);
        
        // Update badge
        this.updateBadge(type);
        
        // Gửi analytics
        this.sendEnhancedAnalytics(type);
        
        // Hiệu ứng thông báo
        this.showNotification(type);
    }

    updateBadge(type) {
        const badge = document.getElementById(`${type}LuxuryBadge`);
        if (badge && this.stats[type] > 0) {
            badge.textContent = this.stats[type];
            badge.style.display = 'flex';
            
            // Hiệu ứng badge mới
            badge.classList.add('new-badge');
            setTimeout(() => badge.classList.remove('new-badge'), 500);
        }
    }

    showNotification(type) {
        const messages = {
            phone: '📞 Đang kết nối cuộc gọi...',
            zalo: '💬 Mở Zalo để nhắn tin',
            whatsapp: '💚 Mở WhatsApp để chat'
        };
        
        // Tạo toast notification
        const toast = document.createElement('div');
        toast.className = 'luxury-toast';
        toast.textContent = messages[type];
        
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: linear-gradient(135deg, rgba(30,30,30,0.95), rgba(40,40,40,0.98));
            color: var(--text-primary);
            padding: 12px 20px;
            border-radius: 10px;
            border: 1px solid rgba(212,175,55,0.3);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            z-index: 9999;
            animation: slideInRight 0.3s ease-out, fadeOut 0.3s ease-out 2.7s forwards;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }

    sendEnhancedAnalytics(type) {
        const analyticsData = {
            event: 'luxury_contact_click',
            type: type,
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            userAgent: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height}`,
            totalClicks: this.stats[type],
            sessionClicks: this.getSessionClicks()
        };
        
        console.log('📊 Luxury Analytics:', analyticsData);
        
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'luxury_contact', {
                'event_category': 'conversion',
                'event_label': type,
                'value': this.stats[type]
            });
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('trackCustom', 'LuxuryContactClick', { type: type });
        }
    }

    startAmbientAnimation() {
        // Animation ngẫu nhiên cho các nút
        setInterval(() => {
            const buttons = document.querySelectorAll('.luxury-contact-btn');
            const randomBtn = buttons[Math.floor(Math.random() * buttons.length)];
            
            if (randomBtn && Math.random() > 0.8) {
                this.ambientPulse(randomBtn);
            }
        }, 8000);
    }

    ambientPulse(button) {
        const originalAnimation = button.style.animation;
        button.style.animation = 'ambientPulse 1s ease-in-out';
        
        setTimeout(() => {
            button.style.animation = originalAnimation;
        }, 1000);
    }

    // Helper functions
    getStat(type) {
        return parseInt(localStorage.getItem(`luxury_${type}_clicks`) || 0);
    }

    getSessionClicks() {
        return this.stats.phone + this.stats.zalo + this.stats.whatsapp;
    }

    formatPhoneNumber(phone) {
        return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3');
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Thêm CSS animations
const luxuryAnimations = `
@keyframes rippleExpand {
    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

@keyframes clickRipple {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(1.5); opacity: 0; }
}

@keyframes slideInRight {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}

@keyframes ambientPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

@keyframes floatingSparkle {
    0% { 
        opacity: 0; 
        transform: translate(0, 0) scale(0); 
    }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { 
        opacity: 0; 
        transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) scale(1); 
    }
}

.new-badge {
    animation: newBadgePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes newBadgePop {
    0% { transform: scale(0); }
    70% { transform: scale(1.2); }
    100% { transform: scale(1); }
}
`;

// Thêm CSS vào document
if (!document.getElementById('luxuryAnimations')) {
    const style = document.createElement('style');
    style.id = 'luxuryAnimations';
    style.textContent = luxuryAnimations;
    document.head.appendChild(style);
}

// Khởi tạo
const luxuryContactButtons = new LuxuryContactButtons();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => luxuryContactButtons.init());
} else {
    luxuryContactButtons.init();
}

// Tự động highlight sau delay
setTimeout(() => {
    if (luxuryContactButtons.stats.phone === 0) {
        luxuryContactButtons.animateButton('phone');
    }
}, 8000);

// Export
window.luxuryContactButtons = luxuryContactButtons;