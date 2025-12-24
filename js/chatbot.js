// ===== CHATBOT OPTIMIZED - JS TỐI ƯU HIỆU NĂNG =====
class OptimizedContactButtons {
    constructor() {
        this.phoneNumber = '0567033888';
        this.zaloLink = 'https://zalo.me/0567033888';
        this.whatsappLink = `https://wa.me/840567033888?text=${encodeURIComponent('Xin chào HTUTransport! Tôi muốn tư vấn về dịch vụ xe.')}`;
        
        // Performance detection
        this.isMobile = this.detectMobile();
        this.isLowPerformance = this.detectLowPerformance();
        
        // Stats (lightweight)
        this.stats = {
            phone: this.getStat('phone'),
            zalo: this.getStat('zalo'),
            whatsapp: this.getStat('whatsapp')
        };
    }
    
    // ===== DETECTION METHODS =====
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    detectLowPerformance() {
        // Detect low-end devices
        const concurrency = navigator.hardwareConcurrency || 4;
        const memory = navigator.deviceMemory || 4;
        const isSlowCPU = concurrency <= 4;
        const isLowRAM = memory < 4;
        
        return this.isMobile && (isSlowCPU || isLowRAM);
    }
    
    shouldSkipAnimations() {
        // Kiểm tra các điều kiện tắt animation
        return this.isLowPerformance || 
               window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
               !document.hasFocus(); // Tab không active
    }
    
    // ===== INITIALIZATION =====
    async init() {
        // Chờ trang load xong
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                if (document.readyState === 'complete') resolve();
                else window.addEventListener('load', resolve, { once: true });
            });
        }
        
        // Đợi thêm 500ms để tránh ảnh hưởng đến page load
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.createOptimizedButtons();
        this.setupOptimizedEvents();
        this.observePerformance();
        
        console.log('🚀 Optimized Contact Buttons initialized');
    }
    
    // ===== CREATE BUTTONS =====
    createOptimizedButtons() {
        const buttonsHTML = `
            <div class="contact-buttons-optimized" id="optimizedContactButtons">
                <!-- Nút Gọi Điện -->
                <button class="optimized-btn phone-btn-opt" id="optPhoneBtn" 
                        aria-label="Gọi điện cho HTUTransport"
                        data-performance="light">
                    <i class="fas fa-phone-alt" aria-hidden="true"></i>
                    <span class="optimized-tooltip">Gọi ngay: ${this.formatPhone(this.phoneNumber)}</span>
                    ${this.stats.phone > 0 ? `<span class="optimized-badge" id="optPhoneBadge">${this.stats.phone}</span>` : ''}
                </button>
                
                <!-- Nút Zalo -->
                <button class="optimized-btn zalo-btn-opt" id="optZaloBtn"
                        aria-label="Nhắn tin Zalo cho HTUTransport"
                        data-performance="light">
                    <i class="fab fa-facebook-messenger" aria-hidden="true"></i>
                    <span class="optimized-tooltip">Zalo: ${this.formatPhone(this.phoneNumber)}</span>
                    ${this.stats.zalo > 0 ? `<span class="optimized-badge" id="optZaloBadge">${this.stats.zalo}</span>` : ''}
                </button>
                
                <!-- Nút WhatsApp -->
                <button class="optimized-btn whatsapp-btn-opt" id="optWhatsappBtn"
                        aria-label="Chat WhatsApp với HTUTransport"
                        data-performance="light">
                    <i class="fab fa-whatsapp" aria-hidden="true"></i>
                    <span class="optimized-tooltip">WhatsApp: ${this.formatPhone(this.phoneNumber)}</span>
                    ${this.stats.whatsapp > 0 ? `<span class="optimized-badge" id="optWhatsappBadge">${this.stats.whatsapp}</span>` : ''}
                </button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', buttonsHTML);
        
        // Tối ưu: Tắt animations nếu cần
        if (this.shouldSkipAnimations()) {
            this.disableAnimations();
        }
    }
    
    disableAnimations() {
        const buttons = document.querySelectorAll('.optimized-btn');
        buttons.forEach(btn => {
            btn.style.animation = 'none';
            btn.style.willChange = 'auto';
        });
    }
    
    setupOptimizedEvents() {
    const phoneBtn = document.getElementById('optPhoneBtn');
    const zaloBtn = document.getElementById('optZaloBtn');
    const whatsappBtn = document.getElementById('optWhatsappBtn');
    
    // ⭐ CHỈ dùng passive cho scroll/touch events, KHÔNG dùng cho click
    const passiveOptions = { passive: true, capture: false };
    const activeOptions = { capture: false }; // Không có passive
    
    // Phone Button - KHÔNG dùng passive
    phoneBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handlePhoneClick();
    }, activeOptions); // ⭐ Sửa thành activeOptions
    
    // Zalo Button - KHÔNG dùng passive
    zaloBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleZaloClick();
    }, activeOptions); // ⭐ Sửa thành activeOptions
    
    // WhatsApp Button - KHÔNG dùng passive
    whatsappBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleWhatsAppClick();
    }, activeOptions); // ⭐ Sửa thành activeOptions
    
    // Các sự kiện khác có thể dùng passive
    if (this.isMobile) {
        [phoneBtn, zaloBtn, whatsappBtn].forEach(btn => {
            btn.addEventListener('touchstart', () => {
                btn.classList.add('active');
            }, { passive: true }); // ✅ OK - không có preventDefault
            
            btn.addEventListener('touchend', () => {
                setTimeout(() => btn.classList.remove('active'), 150);
            }, { passive: true }); // ✅ OK - không có preventDefault
        });
    }
}
    
    setupTooltipHover() {
        // Debounce hover để tối ưu performance
        let hoverTimeout;
        const buttons = document.querySelectorAll('.optimized-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                clearTimeout(hoverTimeout);
                hoverTimeout = setTimeout(() => {
                    // Tooltip đã được CSS xử lý
                }, 100);
            }, { passive: true });
            
            btn.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimeout);
            }, { passive: true });
        });
    }
    
    // ===== CLICK HANDLERS =====
    handlePhoneClick() {
        this.trackInteraction('phone');
        this.showClickFeedback('phone');
        
        // Slight delay để người dùng thấy feedback
        setTimeout(() => {
            window.location.href = `tel:${this.phoneNumber}`;
        }, 150);
    }
    
    handleZaloClick() {
        this.trackInteraction('zalo');
        this.showClickFeedback('zalo');
        
        setTimeout(() => {
            window.open(this.zaloLink, '_blank', 'noopener,noreferrer');
        }, 150);
    }
    
    handleWhatsAppClick() {
        this.trackInteraction('whatsapp');
        this.showClickFeedback('whatsapp');
        
        setTimeout(() => {
            window.open(this.whatsappLink, '_blank', 'noopener,noreferrer');
        }, 150);
    }
    
    // ===== FEEDBACK & TRACKING (LIGHTWEIGHT) =====
    showClickFeedback(type) {
        const btn = document.getElementById(`opt${this.capitalize(type)}Btn`);
        if (!btn) return;
        
        // Hiệu ứng click đơn giản
        btn.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);
        
        // Hiển thị badge nếu cần
        this.updateBadge(type);
    }
    
    trackInteraction(type) {
        // Update local stats
        this.stats[type] = (this.stats[type] || 0) + 1;
        
        // Lưu vào localStorage (debounced)
        this.saveStatsDebounced();
        
        // Analytics đơn giản
        if (typeof gtag !== 'undefined') {
            gtag('event', 'contact_click', {
                'event_category': 'engagement',
                'event_label': type,
                'value': this.stats[type]
            });
        }
    }
    
    updateBadge(type) {
        const badge = document.getElementById(`opt${this.capitalize(type)}Badge`);
        const count = this.stats[type];
        
        if (count > 0) {
            if (!badge) {
                // Tạo badge nếu chưa có
                const btn = document.getElementById(`opt${this.capitalize(type)}Btn`);
                const badgeHTML = `<span class="optimized-badge" id="opt${this.capitalize(type)}Badge">${count}</span>`;
                btn.insertAdjacentHTML('beforeend', badgeHTML);
            } else {
                // Update badge hiện có
                badge.textContent = count;
                badge.style.display = 'flex';
                
                // Hiệu ứng nhẹ
                badge.style.animation = 'none';
                setTimeout(() => {
                    badge.style.animation = 'subtle-pulse 0.5s ease';
                }, 10);
            }
        }
    }
    
    // ===== PERFORMANCE OPTIMIZATIONS =====
    observePerformance() {
        // Theo dõi visibility để tạm dừng animations
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        }, { passive: true });
        
        // Theo dõi battery trên supported browsers
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                if (battery.level < 0.3) {
                    this.enablePowerSavingMode();
                }
                
                battery.addEventListener('levelchange', () => {
                    if (battery.level < 0.2) {
                        this.enablePowerSavingMode();
                    }
                });
            });
        }
        
        // Throttle scroll events để tránh performance hit
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            
            // Tạm ẩn buttons khi đang scroll mạnh
            const buttons = document.getElementById('optimizedContactButtons');
            if (buttons) {
                buttons.style.opacity = '0.7';
                buttons.style.pointerEvents = 'none';
                
                scrollTimeout = setTimeout(() => {
                    buttons.style.opacity = '1';
                    buttons.style.pointerEvents = 'auto';
                }, 300);
            }
        }, { passive: true });
    }
    
    pauseAnimations() {
        const buttons = document.querySelectorAll('.optimized-btn');
        buttons.forEach(btn => {
            btn.style.animationPlayState = 'paused';
        });
    }
    
    resumeAnimations() {
        if (!this.shouldSkipAnimations()) {
            const buttons = document.querySelectorAll('.optimized-btn');
            buttons.forEach(btn => {
                btn.style.animationPlayState = 'running';
            });
        }
    }
    
    enablePowerSavingMode() {
        // Tắt animations khi pin yếu
        this.disableAnimations();
        
        // Giảm opacity
        const container = document.getElementById('optimizedContactButtons');
        if (container) {
            container.style.opacity = '0.8';
        }
    }
    
    // ===== HELPER FUNCTIONS =====
    getStat(type) {
        try {
            return parseInt(localStorage.getItem(`opt_${type}_clicks`)) || 0;
        } catch {
            return 0;
        }
    }
    
    saveStatsDebounced() {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            try {
                localStorage.setItem('opt_phone_clicks', this.stats.phone);
                localStorage.setItem('opt_zalo_clicks', this.stats.zalo);
                localStorage.setItem('opt_whatsapp_clicks', this.stats.whatsapp);
            } catch (e) {
                // Ignore localStorage errors
            }
        }, 1000);
    }
    
    formatPhone(phone) {
        return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3');
    }
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// ===== INITIALIZATION WRAPPER =====
// Khởi tạo an toàn, không chặn page load
(function() {
    // Kiểm tra nếu đang ở trang cần scroll ngang
    const hasHorizontalScroll = document.querySelector('.user-experience-row, .blog-horizontal-row, .gallery-grid');
    
    if (hasHorizontalScroll) {
        // Delay thêm để đảm bảo scroll hoạt động trước
        window.addEventListener('load', () => {
            setTimeout(() => {
                const optimizedButtons = new OptimizedContactButtons();
                optimizedButtons.init();
                window.OptimizedContactButtons = optimizedButtons;
            }, 1000);
        }, { once: true });
    } else {
        // Trang không có scroll ngang, init sớm hơn
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const optimizedButtons = new OptimizedContactButtons();
                optimizedButtons.init();
                window.OptimizedContactButtons = optimizedButtons;
            }, 500);
        }, { once: true });
    }
    
    // Cleanup khi page unload
    window.addEventListener('beforeunload', () => {
        if (window.OptimizedContactButtons && window.OptimizedContactButtons.saveStatsDebounced) {
            window.OptimizedContactButtons.saveStatsDebounced();
        }
    });
})();

// ===== EXPORT =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizedContactButtons;
}