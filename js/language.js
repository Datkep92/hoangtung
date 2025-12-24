// Google Translate Implementation
class GoogleTranslateManager {
    // Thêm vào constructor của GoogleTranslateManager
constructor() {
    this.isLoaded = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.init();
    
    // THÊM DÒNG NÀY: Setup dropdown interactions
    this.setupDropdown();
}

setupDropdown() {
    const translateBtn = document.getElementById('googleTranslateTrigger');
    const dropdown = document.getElementById('languageDropdown');
    
    if (translateBtn && dropdown) {
        // Toggle dropdown
        translateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Đóng tất cả dropdown khác trước
            document.querySelectorAll('.language-dropdown.show').forEach(d => {
                if (d !== dropdown) d.classList.remove('show');
            });
            
            dropdown.classList.toggle('show');
            
            // Đóng dropdown khi click ra ngoài
            if (dropdown.classList.contains('show')) {
                setTimeout(() => {
                    const closeHandler = (e) => {
                        // Kiểm tra nếu click không phải là dropdown hoặc button
                        if (!dropdown.contains(e.target) && !translateBtn.contains(e.target)) {
                            dropdown.classList.remove('show');
                            document.removeEventListener('click', closeHandler);
                        }
                    };
                    // Thêm sự kiện sau 1 tick để tránh xung đột
                    document.addEventListener('click', closeHandler);
                }, 0);
            }
        });
        
        // Đóng dropdown khi chọn option - SỬA QUAN TRỌNG
        const options = dropdown.querySelectorAll('.language-option');
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // QUAN TRỌNG: Ngăn chặn lan truyền sự kiện
                
                // Lấy ngôn ngữ từ data attribute hoặc onclick
                const lang = option.getAttribute('data-lang') || 
                            option.onclick.toString().match(/changeLanguage\('(.+?)'\)/)?.[1];
                
                if (lang) {
                    // Đặc biệt xử lý khi chọn VI (về bản gốc)
                    if (lang === 'vi') {
                        // 1. Đóng dropdown ngay
                        dropdown.classList.remove('show');
                        
                        // 2. Xóa ngôn ngữ đã lưu
                        localStorage.removeItem('HTUTransport_lang');
                        
                        // 3. Reset Google Translate về bản gốc
                        if (window.google && window.google.translate && window.google.translate.TranslateElement) {
                            try {
                                // Cách 1: Gọi API restore của Google Translate
                                const translateInstance = google.translate.TranslateElement.getInstance();
                                if (translateInstance && translateInstance.restore) {
                                    translateInstance.restore();
                                }
                                
                                // Cách 2: Reset manual - ẩn các phần tử dịch
                                document.querySelectorAll('.goog-te-menu-value, .goog-te-gadget, .goog-te-banner')
                                    .forEach(el => {
                                        el.style.display = 'none';
                                    });
                                
                                // Cách 3: Reload trang để về bản gốc hoàn toàn
                                setTimeout(() => {
                                    location.reload();
                                }, 300);
                                
                            } catch (error) {
                                console.log('Reloading page to reset language...');
                                location.reload();
                            }
                        } else {
                            // Nếu không có Google Translate, reload trang
                            location.reload();
                        }
                        
                        return; // Dừng xử lý tiếp
                    }
                    
                    // Với các ngôn ngữ khác (EN, KO, ZH-CN, JA)
                    // Gọi translate
                    this.translateTo(lang);
                    
                    // Cập nhật display
                    this.updateLanguageDisplay(lang);
                    
                    // Đóng dropdown sau 100ms để người dùng thấy hiệu ứng
                    setTimeout(() => {
                        dropdown.classList.remove('show');
                    }, 100);
                }
            });
        });
    }
}

// Sửa phương thức updateLanguageDisplay để thêm active state
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

// THÊM PHƯƠNG THỨC NÀY
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

// Sửa phương thức translateTo để gọi updateActiveLanguage
translateTo(language) {
    if (!this.isLoaded) {
        console.log('⚠️ Google Translate not ready, queuing translation...');
        setTimeout(() => this.translateTo(language), 500);
        return;
    }
    
    try {
        // Get the select element
        const select = document.querySelector('.goog-te-combo');
        
        if (!select) {
            console.error('Google Translate select element not found');
            return;
        }
        
        // Change value
        select.value = language;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);
        
        // Save preference
        localStorage.setItem('HTUTransport_lang', language);
        
        // Update display và active state
        this.updateLanguageDisplay(language);
        
        console.log(`✅ Translation to ${language} triggered`);
        
    } catch (error) {
        console.error('Translation error:', error);
    }
}
    
    init() {
        // Load Google Translate script
        this.loadScript();
        
        // Check if already loaded
        this.checkLoaded();
    }
    
    loadScript() {
        // Remove existing script if any
        const existingScript = document.querySelector('script[src*="translate.google.com"]');
        if (existingScript) {
            existingScript.remove();
        }
        
        // Create new script
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
        if (!window.google || !window.google.translate) {
            console.error('Google Translate API not available');
            return;
        }
        
        try {
            // Initialize widget - HIỂN THỊ TRỰC TIẾP
            new google.translate.TranslateElement({
                pageLanguage: 'vi',
                includedLanguages: 'vi,en,ko,zh-CN,ja',
                layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL,
                autoDisplay: false,
                disableAutoTranslation: true,
                // Thêm cấu hình để widget dễ tùy chỉnh
                multilanguagePage: true
            }, 'google_translate_element');
            
            console.log('✅ Google Translate widget initialized');
            
            // Apply minimal styles only
            this.applyMinimalStyles();
            
            // Load saved language
            this.loadSavedLanguage();
            
        } catch (error) {
            console.error('Error initializing widget:', error);
        }
    }
    
    applyMinimalStyles() {
        const style = document.createElement('style');
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
            
            /* Fix body positioning */
            body {
                top: 0 !important;
            }
        `;
        document.head.appendChild(style);
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

// Initialize when DOM is ready
let translateManager = null;

document.addEventListener('DOMContentLoaded', () => {
    translateManager = new GoogleTranslateManager();
    
    // Expose translate function globally
    window.translateTo = (language) => {
        if (translateManager) {
            translateManager.translateTo(language);
        }
    };
});

// Simple language change function for buttons
function changeLanguage(lang) {
    if (window.translateTo) {
        window.translateTo(lang);
    }
    
    // Update active state ngay lập tức
    if (translateManager) {
        translateManager.updateActiveLanguage(lang);
    }
    
    // Không đóng dropdown ở đây nữa - để dropdown tự xử lý
}