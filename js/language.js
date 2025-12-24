

// Google Translate Implementation
class GoogleTranslateManager {
    constructor() {
        this.isLoaded = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.dropdownVisible = false;
        this.isProcessing = false;
        
        // Chỉ khởi tạo khi DOM sẵn sàng
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        // Chỉ setup dropdown nếu các phần tử tồn tại
        if (document.getElementById('googleTranslateTrigger') && document.getElementById('languageDropdown')) {
            this.setupDropdown();
        }
        
        // Load Google Translate script
        this.loadScript();
        
        // Check if already loaded
        this.checkLoaded();
    }
    
    setupDropdown() {
        const translateBtn = document.getElementById('googleTranslateTrigger');
        const dropdown = document.getElementById('languageDropdown');
        
        if (!translateBtn || !dropdown) return;
        
        // Chỉ thêm sự kiện một lần
        if (translateBtn.dataset.dropdownInitialized) return;
        translateBtn.dataset.dropdownInitialized = 'true';
        
        // Event delegation cho dropdown
        document.addEventListener('click', (e) => {
            this.handleDocumentClick(e, translateBtn, dropdown);
        });
        
        // Ngăn chặn sự kiện click trên dropdown lan ra ngoài
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Event delegation cho các option trong dropdown
        dropdown.addEventListener('click', (e) => {
            this.handleDropdownClick(e);
        });
        
        // Thêm sự kiện cho nút trigger
        translateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleDropdown(translateBtn, dropdown);
        });
    }
    
    handleDocumentClick(e, translateBtn, dropdown) {
        // Kiểm tra click có phải trên dropdown hoặc button không
        const isClickInside = dropdown.contains(e.target) || translateBtn.contains(e.target);
        
        if (!isClickInside && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            this.dropdownVisible = false;
        }
    }
    
    handleDropdownClick(e) {
        const option = e.target.closest('.language-option');
        if (!option || this.isProcessing) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        this.isProcessing = true;
        
        const lang = option.getAttribute('data-lang') || 
                    this.extractLangFromOnClick(option.onclick);
        
        if (lang) {
            this.processLanguageSelection(lang, option.closest('#languageDropdown'));
        }
        
        // Reset trạng thái sau 100ms
        setTimeout(() => {
            this.isProcessing = false;
        }, 100);
    }
    
    extractLangFromOnClick(onclick) {
        if (typeof onclick === 'function') {
            const match = onclick.toString().match(/changeLanguage\('(.+?)'\)/);
            return match ? match[1] : null;
        }
        return null;
    }
    
    toggleDropdown(translateBtn, dropdown) {
        // Đóng tất cả dropdown khác trước
        document.querySelectorAll('.language-dropdown.show').forEach(d => {
            if (d !== dropdown) {
                d.classList.remove('show');
            }
        });
        
        dropdown.classList.toggle('show');
        this.dropdownVisible = dropdown.classList.contains('show');
    }
    
    async processLanguageSelection(lang, dropdown) {
        try {
            // Đóng dropdown ngay lập tức
            if (dropdown) {
                dropdown.classList.remove('show');
                this.dropdownVisible = false;
            }
            
            // Xử lý ngôn ngữ VI (về bản gốc)
            if (lang === 'vi') {
                await this.resetToOriginal();
                return;
            }
            
            // Xử lý các ngôn ngữ khác
            await this.translateTo(lang);
            this.updateLanguageDisplay(lang);
            
        } catch (error) {
            console.error('Error processing language selection:', error);
        }
    }
    
    async resetToOriginal() {
        // Xóa ngôn ngữ đã lưu
        localStorage.removeItem('HTUTransport_lang');
        
        // Reset Google Translate
        if (window.google?.translate?.TranslateElement) {
            try {
                // Thử khôi phục về bản gốc
                const translateInstance = google.translate.TranslateElement.getInstance();
                if (translateInstance?.restore) {
                    translateInstance.restore();
                }
                
                // Ẩn các phần tử của Google Translate
                document.querySelectorAll('.goog-te-menu-value, .goog-te-gadget, .goog-te-banner')
                    .forEach(el => {
                        el.style.display = 'none';
                    });
                
                // Đợi một chút trước khi reload
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                console.log('Error restoring, will reload page...');
            }
        }
        
        // Reload trang
        location.reload();
    }
    
    updateLanguageDisplay(lang) {
        const display = document.getElementById('currentLanguageDisplay');
        if (!display) return;
        
        const codes = {
            'vi': 'VI',
            'en': 'EN',
            'ko': 'KO',
            'zh-CN': '中文',
            'ja': '日本語'
        };
        
        display.textContent = codes[lang] || 'VI';
        
        // Cập nhật active state trong dropdown
        this.updateActiveLanguage(lang);
    }
    
    updateActiveLanguage(lang) {
        const options = document.querySelectorAll('.language-option');
        const langMap = {
            'vi': 'VI',
            'en': 'EN',
            'ko': 'KO',
            'zh-CN': '中文',
            'ja': '日本語'
        };
        
        options.forEach(option => {
            option.classList.remove('active');
            const codeSpan = option.querySelector('.language-code');
            if (codeSpan && codeSpan.textContent === langMap[lang]) {
                option.classList.add('active');
            }
        });
    }
    
    translateTo(language) {
        return new Promise((resolve, reject) => {
            if (!this.isLoaded) {
                console.log('⚠️ Google Translate not ready, retrying...');
                setTimeout(() => {
                    this.translateTo(language).then(resolve).catch(reject);
                }, 500);
                return;
            }
            
            try {
                const select = document.querySelector('.goog-te-combo');
                
                if (!select) {
                    console.error('Google Translate select element not found');
                    reject(new Error('Select element not found'));
                    return;
                }
                
                // Change value
                select.value = language;
                
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                select.dispatchEvent(event);
                
                // Save preference
                localStorage.setItem('HTUTransport_lang', language);
                
                console.log(`✅ Translation to ${language} triggered`);
                resolve();
                
            } catch (error) {
                console.error('Translation error:', error);
                reject(error);
            }
        });
    }
    
    loadScript() {
        // Kiểm tra nếu script đã tồn tại
        const existingScript = document.querySelector('script[src*="translate.google.com"]');
        if (existingScript) {
            // Nếu đã có callback, không cần load lại
            if (window.googleTranslateCallback) {
                this.isLoaded = true;
                return;
            }
            existingScript.remove();
        }
        
        // Tạo script mới
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateCallback';
        script.async = true;
        
        // Global callback
        window.googleTranslateCallback = () => {
            console.log('✅ Google Translate script loaded');
            this.isLoaded = true;
            this.initializeWidget();
        };
        
        script.onerror = () => {
            console.error('❌ Failed to load Google Translate');
            this.retryLoad();
        };
        
        document.head.appendChild(script);
    }
    
    retryLoad() {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`Retrying Google Translate load (${this.retryCount}/${this.maxRetries})...`);
            setTimeout(() => this.loadScript(), 1000 * this.retryCount);
        }
    }
    
    checkLoaded() {
        if (window.google && window.google.translate) {
            this.isLoaded = true;
            this.initializeWidget();
        } else {
            setTimeout(() => this.checkLoaded(), 500);
        }
    }
    
    initializeWidget() {
        if (!window.google?.translate) {
            console.error('Google Translate API not available');
            return;
        }
        
        try {
            // Chỉ khởi tạo nếu phần tử tồn tại
            if (!document.getElementById('google_translate_element')) {
                console.warn('Google translate element not found');
                return;
            }
            
            new google.translate.TranslateElement({
                pageLanguage: 'vi',
                includedLanguages: 'vi,en,ko,zh-CN,ja',
                layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL,
                autoDisplay: false,
                disableAutoTranslation: true,
                multilanguagePage: true
            }, 'google_translate_element');
            
            console.log('✅ Google Translate widget initialized');
            
            // Áp dụng styles tối thiểu
            this.applyMinimalStyles();
            
            // Load ngôn ngữ đã lưu
            this.loadSavedLanguage();
            
        } catch (error) {
            console.error('Error initializing widget:', error);
        }
    }
    
    applyMinimalStyles() {
        // Kiểm tra nếu style đã tồn tại
        if (document.getElementById('google-translate-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'google-translate-styles';
        style.textContent = `
            /* Hiển thị widget Google Translate */
            #google_translate_element {
                display: block !important;
                position: absolute;
                top: 70px;
                right: 15px;
                z-index: 1000;
            }
            
            /* Tùy chỉnh giao diện dropdown */
            .goog-te-gadget {
                font-family: 'Inter', sans-serif !important;
            }
            
            .goog-te-gadget-simple {
                background-color: transparent !important;
                border: 1px solid rgba(212, 175, 55, 0.3) !important;
                border-radius: 8px !important;
                padding: 5px 10px !important;
                font-size: 14px !important;
                color: var(--text-primary) !important;
            }
            
            .goog-te-menu-value span {
                color: var(--text-primary) !important;
            }
            
            .goog-te-menu-value:hover {
                text-decoration: none !important;
            }
            
            /* Ẩn banner và iframe không cần thiết */
            .goog-te-banner-frame {
                display: none !important;
            }
            
            .skiptranslate {
                display: none !important;
            }
            
            /* Fix body positioning - chỉ áp dụng khi có Google Translate */
            body.goog-te-banner-frame {
                top: 0 !important;
            }
            
            /* Ngăn chặn ảnh hưởng đến các phần tử khác */
            .goog-te-gadget * {
                pointer-events: auto !important;
            }
            
            #google_translate_element * {
                box-sizing: content-box !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    loadSavedLanguage() {
        const savedLang = localStorage.getItem('HTUTransport_lang') || 'vi';
        if (savedLang !== 'vi') {
            setTimeout(() => {
                this.translateTo(savedLang).catch(error => {
                    console.warn('Failed to load saved language:', error);
                });
            }, 1500);
        }
    }
}

// Khởi tạo và quản lý singleton instance
let translateManager = null;

// Function để khởi tạo khi cần
function initGoogleTranslate() {
    if (!translateManager) {
        translateManager = new GoogleTranslateManager();
        
        // Expose translate function globally
        window.translateTo = (language) => {
            if (translateManager) {
                translateManager.translateTo(language);
            }
        };
    }
    return translateManager;
}

// Simple language change function for buttons
function changeLanguage(lang) {
    if (window.translateTo) {
        window.translateTo(lang);
    }
    
    // Update active state ngay lập tức
    if (translateManager) {
        translateManager.updateActiveLanguage(lang);
    }
}

// Tự động khởi tạo khi DOM sẵn sàng
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGoogleTranslate);
} else {
    initGoogleTranslate();
}

// Export để sử dụng trong module (nếu cần)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GoogleTranslateManager, changeLanguage };
}
