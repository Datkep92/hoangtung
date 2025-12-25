

// Google Translate Implementation - FIXED VERSION
class GoogleTranslateManager {
    constructor() {
        this.isLoaded = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.preventGoogleTranslateStyles = true;
        this.setupEventDelegation();
        this.init();
    }

    // ===== PHƯƠNG PHÁP MỚI: Event Delegation để chống lại Google Translate =====
    setupEventDelegation() {
        // 1. Sử dụng event delegation cho toàn bộ trang
        document.addEventListener('click', this.handleGlobalClick.bind(this), true); // capture phase
        
        // 2. Bảo vệ event listeners khỏi bị Google Translate ghi đè
        this.protectExistingEventListeners();
        
        // 3. Setup dropdown với delegation
        this.setupDropdownDelegation();
    }

    handleGlobalClick(e) {
        // QUAN TRỌNG: Cho phép tất cả click events trừ Google Translate
        if (this.isGoogleTranslateElement(e.target)) {
            return; // Cho phép Google Translate hoạt động
        }
        
        // Phục hồi click cho các element bị Google Translate vô hiệu hóa
        this.restoreClickEvents(e);
    }

    isGoogleTranslateElement(element) {
        let el = element;
        while (el && el !== document) {
            if (el.classList?.contains('goog-te-') || 
                el.id?.includes('google') ||
                el.className?.includes('VIpgJd')) {
                return true;
            }
            el = el.parentElement;
        }
        return false;
    }

    restoreClickEvents(event) {
        const target = event.target;
        
        // Kiểm tra nếu element hoặc cha của nó có onclick
        let currentElement = target;
        while (currentElement && currentElement !== document) {
            // Nếu có onclick attribute, thực thi nó
            if (currentElement.hasAttribute('onclick')) {
                const onclickValue = currentElement.getAttribute('onclick');
                if (onclickValue && !onclickValue.includes('goog-te')) {
                    // Ngăn hành vi mặc định và thực thi onclick
                    event.stopPropagation();
                    event.preventDefault();
                    
                    try {
                        // Thực thi hàm onclick an toàn
                        if (onclickValue.includes('(') && onclickValue.includes(')')) {
                            const fn = new Function(onclickValue);
                            fn.call(currentElement);
                        } else {
                            eval(onclickValue);
                        }
                    } catch (err) {
                        console.warn('Could not execute onclick:', err);
                    }
                    return;
                }
            }
            
            // Kiểm tra nếu là button có sự kiện click đã đăng ký
            if (currentElement.tagName === 'BUTTON' || 
                currentElement.tagName === 'A' ||
                currentElement.hasAttribute('onclick')) {
                // Đảm bảo sự kiện tiếp tục lan truyền
                currentElement.style.pointerEvents = 'auto';
                currentElement.style.zIndex = '9999';
            }
            
            currentElement = currentElement.parentElement;
        }
    }

    protectExistingEventListeners() {
        // Bảo vệ tất cả các element có onclick
        const elementsWithOnclick = document.querySelectorAll('[onclick]');
        elementsWithOnclick.forEach(el => {
            const originalOnclick = el.getAttribute('onclick');
            if (originalOnclick && !originalOnclick.includes('goog-te')) {
                // Lưu onclick gốc vào data attribute
                el.setAttribute('data-original-onclick', originalOnclick);
                
                // Thêm event listener bằng JavaScript thay vì onclick attribute
                el.addEventListener('click', function(e) {
                    if (e.isTrusted && !e.defaultPrevented) {
                        try {
                            eval(originalOnclick);
                        } catch (err) {
                            console.warn('Failed to execute onclick:', err);
                        }
                    }
                });
            }
        });
    }

    // ===== SETUP DROPDOWN MỚI - AN TOÀN =====
    setupDropdownDelegation() {
        // Sử dụng event delegation cho dropdown
        document.addEventListener('click', (e) => {
            const translateBtn = document.getElementById('googleTranslateTrigger');
            const dropdown = document.getElementById('languageDropdown');
            
            if (!translateBtn || !dropdown) return;
            
            // Toggle dropdown
            if (translateBtn.contains(e.target)) {
                e.preventDefault();
                e.stopImmediatePropagation();
                
                // Đóng dropdown khác
                document.querySelectorAll('.language-dropdown.show').forEach(d => {
                    if (d !== dropdown) d.classList.remove('show');
                });
                
                dropdown.classList.toggle('show');
                return;
            }
            
            // Xử lý chọn ngôn ngữ
            if (dropdown.contains(e.target)) {
                const option = e.target.closest('.language-option');
                if (option) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    this.handleLanguageSelect(option);
                }
            }
            
            // Đóng dropdown khi click ra ngoài
            if (dropdown.classList.contains('show') && 
                !dropdown.contains(e.target) && 
                !translateBtn.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    handleLanguageSelect(option) {
        const lang = option.getAttribute('data-lang');
        if (!lang) return;
        
        // Đóng dropdown ngay lập tức
        const dropdown = document.getElementById('languageDropdown');
        if (dropdown) dropdown.classList.remove('show');
        
        // Xử lý chọn VI (về bản gốc)
        if (lang === 'vi') {
            localStorage.removeItem('HTUTransport_lang');
            this.resetToVietnamese();
            return;
        }
        
        // Dịch sang ngôn ngữ khác
        this.translateTo(lang);
        this.updateLanguageDisplay(lang);
    }

    // ===== CÁC PHƯƠNG THỨC KHÁC GIỮ NGUYÊN HOẶC SỬA NHẸ =====
    translateTo(language) {
        if (!this.isLoaded) {
            console.log('⚠️ Google Translate not ready, queuing translation...');
            setTimeout(() => this.translateTo(language), 500);
            return;
        }
        
        try {
            // Sử dụng Google Translate API trực tiếp
            if (window.google && window.google.translate && window.google.translate.TranslateElement) {
                // Lấy instance hiện tại
                const translateInstance = window.google.translate.TranslateElement.getInstance();
                
                if (translateInstance && translateInstance.selectValue) {
                    // Sử dụng API chính thức của Google
                    translateInstance.selectValue(language);
                } else {
                    // Fallback: thay đổi select element
                    const select = document.querySelector('.goog-te-combo');
                    if (select) {
                        select.value = language;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
                
                // Lưu ngôn ngữ đã chọn
                localStorage.setItem('HTUTransport_lang', language);
                console.log(`✅ Translation to ${language} triggered`);
            }
        } catch (error) {
            console.error('Translation error:', error);
        }
    }

    resetToVietnamese() {
        try {
            if (window.google && window.google.translate && window.google.translate.TranslateElement) {
                const translateInstance = window.google.translate.TranslateElement.getInstance();
                
                if (translateInstance && translateInstance.restore) {
                    translateInstance.restore();
                }
                
                // Ẩn các element của Google Translate
                document.querySelectorAll('.goog-te-menu-value, .goog-te-gadget, .goog-te-banner')
                    .forEach(el => {
                        el.style.display = 'none';
                    });
                
                // Reload trang sau 300ms để về bản gốc
                setTimeout(() => {
                    window.location.reload();
                }, 300);
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.log('Reloading page to reset language...');
            window.location.reload();
        }
    }

    // ===== PHƯƠNG THỨC KHỞI TẠO CẢI TIẾN =====
    init() {
        // Load Google Translate với cấu hình bảo vệ
        this.loadProtectedScript();
        this.checkLoaded();
    }

    loadProtectedScript() {
        // Xóa script cũ nếu có
        const existingScript = document.querySelector('script[src*="translate.google.com"]');
        if (existingScript) existingScript.remove();
        
        // Tạo script mới với callback bảo vệ
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateCallbackProtected';
        script.async = true;
        
        // Callback bảo vệ
        window.googleTranslateCallbackProtected = () => {
            console.log('✅ Google Translate script loaded with protection');
            this.isLoaded = true;
            this.initializeProtectedWidget();
            
            // Áp dụng CSS bảo vệ ngay lập tức
            this.applyProtectionStyles();
        };
        
        script.onerror = () => {
            console.error('❌ Failed to load Google Translate');
            this.retryLoad();
        };
        
        document.head.appendChild(script);
    }

    initializeProtectedWidget() {
        if (!window.google || !window.google.translate) {
            console.error('Google Translate API not available');
            return;
        }
        
        try {
            // Khởi tạo widget với cấu hình hạn chế can thiệp
            new google.translate.TranslateElement({
                pageLanguage: 'vi',
                includedLanguages: 'vi,en,ko,zh-CN,ja',
                layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL,
                autoDisplay: false,
                disableAutoTranslation: true,
                multilanguagePage: true,
                // QUAN TRỌNG: Cấu hình để giảm thiểu can thiệp
                disableAutoDisplay: true,
                preventReload: true
            }, 'google_translate_element');
            
            console.log('✅ Google Translate widget initialized with protection');
            
            // Tải ngôn ngữ đã lưu
            this.loadSavedLanguage();
            
        } catch (error) {
            console.error('Error initializing widget:', error);
        }
    }

    // ===== CSS BẢO VỆ QUAN TRỌNG =====
    applyProtectionStyles() {
        // Xóa style cũ nếu có
        const oldStyle = document.getElementById('google-translate-protection');
        if (oldStyle) oldStyle.remove();
        
        const style = document.createElement('style');
        style.id = 'google-translate-protection';
        style.textContent = `
            /* QUAN TRỌNG: Bảo vệ tất cả các element khỏi Google Translate */
            body *:not(.goog-te-*):not(.VIpgJd-*):not(.skiptranslate) {
                pointer-events: auto !important;
                z-index: auto !important;
                position: relative !important;
                transform: none !important;
            }
            
            /* Bảo vệ đặc biệt cho các element quan trọng */
            button:not(.goog-te-*),
            a:not(.goog-te-*),
            [onclick]:not(.goog-te-*),
            .pricing-preview-card *,
            .gallery-card *,
            .benefit-card *,
            .service-card *,
            .btn-view-all-pricing,
            .btn-quick-call,
            .btn-quick-book,
            .mini-call-btn,
            .mini-book-btn {
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 9999 !important;
                position: relative !important;
                transform-style: preserve-3d !important;
                isolation: isolate !important;
            }
            
            /* Ẩn Google Translate UI không cần thiết */
            .goog-te-banner-frame,
            .skiptranslate,
            .goog-te-menu-value,
            .goog-te-gadget {
                display: none !important;
            }
            
            /* Giữ dropdown ngôn ngữ của chúng ta luôn trên cùng */
            .language-dropdown {
                z-index: 999999 !important;
            }
            
            /* Fix body khi Google Translate can thiệp */
            body {
                top: 0 !important;
                position: static !important;
            }
            
            /* Bảo vệ iframe của Google Translate không chồng lấn */
            .goog-te-menu-frame,
            .goog-te-menu-value {
                max-height: 0;
                overflow: hidden;
            }
        `;
        
        document.head.appendChild(style);
        
        // Thêm style inline bảo vệ ngay lập tức
        this.applyImmediateProtection();
    }

    applyImmediateProtection() {
        // Áp dụng ngay lập tức cho các element quan trọng
        const protectSelectors = [
            '.pricing-preview-card',
            '.gallery-card',
            '.benefit-card',
            '.service-card',
            '[onclick]',
            'button',
            'a[href^="#"]',
            '.btn-view-all-pricing',
            '.tab-item'
        ];
        
        protectSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (!el.classList.toString().includes('goog-te')) {
                    el.style.pointerEvents = 'auto';
                    el.style.cursor = 'pointer';
                    el.style.zIndex = '9999';
                    el.style.position = 'relative';
                }
            });
        });
    }

    // ===== CÁC PHƯƠNG THỨC CÒN LẠI GIỮ NGUYÊN =====
    updateLanguageDisplay(lang) {
        const display = document.getElementById('currentLanguageDisplay');
        if (!display) return;
        
        const codes = { 'vi': 'VI', 'en': 'EN', 'ko': 'KO', 'zh-CN': '中文', 'ja': '日本語' };
        display.textContent = codes[lang] || 'VI';
        this.updateActiveLanguage(lang);
    }

    updateActiveLanguage(lang) {
        const options = document.querySelectorAll('.language-option');
        const langMap = { 'vi': 'VI', 'en': 'EN', 'ko': 'KO', 'zh-CN': '中文', 'ja': '日本語' };
        
        options.forEach(option => {
            option.classList.remove('active');
            const codeSpan = option.querySelector('.language-code');
            if (codeSpan && codeSpan.textContent === langMap[lang]) {
                option.classList.add('active');
            }
        });
    }

    retryLoad() {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`Retrying Google Translate load (${this.retryCount}/${this.maxRetries})...`);
            setTimeout(() => this.loadProtectedScript(), 1000 * this.retryCount);
        }
    }

    checkLoaded() {
        if (window.google && window.google.translate) {
            this.isLoaded = true;
            this.initializeProtectedWidget();
            this.applyProtectionStyles();
        } else {
            setTimeout(() => this.checkLoaded(), 500);
        }
    }

    loadSavedLanguage() {
        const savedLang = localStorage.getItem('HTUTransport_lang') || 'vi';
        if (savedLang !== 'vi') {
            setTimeout(() => {
                this.translateTo(savedLang);
            }, 1500);
        }
    }
}

// ===== KHỞI TẠO AN TOÀN =====
let translateManager = null;

document.addEventListener('DOMContentLoaded', () => {
    // Đảm bảo tất cả scripts khác đã load trước
    setTimeout(() => {
        translateManager = new GoogleTranslateManager();
        
        // Expose function an toàn
        window.translateTo = (language) => {
            if (translateManager) {
                translateManager.translateTo(language);
            }
        };
        
        console.log('✅ Google Translate Manager initialized with full protection');
    }, 100);
});

// Simple language change function (giữ nguyên cho compatibility)
function changeLanguage(lang) {
    if (window.translateTo) {
        window.translateTo(lang);
    }
    if (translateManager) {
        translateManager.updateActiveLanguage(lang);
    }
}
