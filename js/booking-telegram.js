// js/booking-telegram.js - Version 3.1 (Fixed security setup error)
class TelegramBooking {
    constructor() {
        this.config = null;
        this.isLoading = false;
        this.vehicleTypes = ['4 chỗ', '7 chỗ', '16 chỗ', '45 chỗ'];
        this.selectedVehicleType = '4 chỗ'; // Mặc định
        this.lastSubmission = 0;
        this.submitCount = 0;
        this.maxSubmissionsPerMinute = 5;
        this.init();
    }
    
    async init() {
        await this.loadTelegramConfig();
        this.createVehicleSelector();
        this.attachFormListener();
        this.setupSecurityChecks();
    }
    
    async loadTelegramConfig() {
        try {
            // Chỉ lấy config từ Firebase, không lưu token trong localStorage
            console.log('📡 Loading Telegram config from Firebase...');
            this.config = await this.fetchFromFirebase();
            
            if (this.config && this.validateConfig(this.config)) {
                console.log('✅ Telegram config loaded successfully');
                return true;
            } else {
                console.warn('⚠️ No valid Telegram config found');
                return false;
            }
        } catch (error) {
            console.error('❌ Error loading Telegram config:', error);
            return false;
        }
    }
    
    async fetchFromFirebase() {
        try {
            if (typeof firebase !== 'undefined' && firebase.database) {
                const database = firebase.database();
                const snapshot = await database.ref('telegram_configs').once('value');
                const data = snapshot.val();
                
                if (data && data.configs) {
                    // Tìm config mặc định hoặc config đầu tiên
                    const defaultId = data.default;
                    let config = null;
                    
                    if (defaultId && data.configs[defaultId]) {
                        config = data.configs[defaultId];
                        config.id = defaultId;
                    } else {
                        // Lấy config đầu tiên
                        const firstKey = Object.keys(data.configs)[0];
                        if (firstKey) {
                            config = data.configs[firstKey];
                            config.id = firstKey;
                        }
                    }
                    
                    return config;
                }
            }
        } catch (error) {
            console.error('Firebase fetch error:', error);
        }
        
        return null;
    }
    
    validateConfig(config) {
        return config && 
               config.botToken && 
               config.chatIds && 
               Array.isArray(config.chatIds) && 
               config.chatIds.length > 0;
    }
    
    // Tạo dropdown lựa chọn loại xe
    createVehicleSelector() {
        const form = document.getElementById('bookingForm');
        if (!form) return;
        
        // Kiểm tra nếu đã có selector chưa
        if (document.getElementById('vehicleTypeSelector')) return;
        
        // Tìm vị trí để chèn (sau điểm đến)
        const dropoffLocation = document.getElementById('dropoffLocation');
        if (!dropoffLocation || !dropoffLocation.parentNode) return;
        
        // Tạo container cho selector
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'form-group';
        
        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = 'Loại xe *';
        label.setAttribute('for', 'vehicleTypeSelector');
        
        const select = document.createElement('select');
        select.id = 'vehicleTypeSelector';
        select.className = 'form-input';
        select.name = 'vehicleType';
        select.required = true;
        select.setAttribute('aria-required', 'true');
        
        // Thêm options
        this.vehicleTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = `Xe ${type}`;
            select.appendChild(option);
        });
        
        // Thêm sự kiện thay đổi
        select.addEventListener('change', (e) => {
            this.selectedVehicleType = e.target.value;
        });
        
        // Thêm vào form
        selectorContainer.appendChild(label);
        selectorContainer.appendChild(select);
        dropoffLocation.parentNode.insertAdjacentElement('afterend', selectorContainer);
        
        // Thêm CSS cho selector
        this.addSelectorStyles();
    }
    
    addSelectorStyles() {
        const styleId = 'vehicle-selector-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #vehicleTypeSelector {
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23d4af37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 15px center;
                background-size: 16px;
                padding-right: 40px;
                cursor: pointer;
            }
            
            #vehicleTypeSelector:focus {
                border-color: #d4af37;
                box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
            }
            
            .form-group select option {
                background: #1a1a1a;
                color: #f2e6c4;
                padding: 10px;
            }
        `;
        document.head.appendChild(style);
    }
    
    attachFormListener() {
        const form = document.getElementById('bookingForm');
        if (form) {
            // Xóa event listener cũ nếu có
            form.removeEventListener('submit', this.handleSubmitBound);
            
            // Tạo bound function để có thể remove sau này
            this.handleSubmitBound = this.handleSubmit.bind(this);
            form.addEventListener('submit', this.handleSubmitBound);
            console.log('✅ Form listener attached');
        } else {
            console.warn('📝 Booking form not found, will retry in 1s');
            setTimeout(() => this.attachFormListener(), 1000);
        }
    }
    
    // Kiểm tra bảo mật - ĐƠN GIẢN HÓA
    setupSecurityChecks() {
        console.log('🔒 Security checks initialized');
        
        // Rate limiting protection
        this.setupRateLimiting();
        
        // Input sanitization
        this.setupInputSanitization();
    }
    
    setupRateLimiting() {
        // Reset counter mỗi phút
        setInterval(() => {
            this.submitCount = 0;
        }, 60000);
    }
    
    setupInputSanitization() {
        // Thêm sự kiện blur để sanitize input
        const form = document.getElementById('bookingForm');
        if (!form) return;
        
        const inputs = form.querySelectorAll('input[type="text"], input[type="tel"], textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                this.sanitizeInput(e.target);
            });
            
            input.addEventListener('input', (e) => {
                this.validateInput(e.target);
            });
        });
    }
    
    sanitizeInput(element) {
        if (!element || !element.value) return;
        
        let value = element.value;
        
        // Loại bỏ các thẻ HTML
        value = value.replace(/<[^>]*>/g, '');
        
        // Loại bỏ các ký tự nguy hiểm
        value = value.replace(/[<>{}[\]]/g, '');
        
        // Giới hạn độ dài
        if (value.length > 500) {
            value = value.substring(0, 500);
        }
        
        element.value = value.trim();
    }
    
    validateInput(element) {
        if (!element || !element.value) return true;
        
        const value = element.value;
        const name = element.name || element.id;
        
        // Kiểm tra XSS patterns
        const xssPatterns = [
            /<script\b/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /eval\s*\(/i,
            /alert\s*\(/i
        ];
        
        for (const pattern of xssPatterns) {
            if (pattern.test(value.toLowerCase())) {
                console.warn(`⚠️ Potential XSS detected in ${name}:`, value.substring(0, 50));
                element.classList.add('input-error');
                return false;
            }
        }
        
        element.classList.remove('input-error');
        return true;
    }
    
    checkRateLimit() {
        const now = Date.now();
        const minTimeBetweenSubmissions = 5000; // 5 giây
        
        // Kiểm tra thời gian giữa các lần submit
        if (now - this.lastSubmission < minTimeBetweenSubmissions) {
            throw new Error('Vui lòng đợi 5 giây trước khi gửi yêu cầu tiếp theo');
        }
        
        // Kiểm tra số lần submit trong phút
        if (this.submitCount >= this.maxSubmissionsPerMinute) {
            throw new Error('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút');
        }
        
        this.lastSubmission = now;
        this.submitCount++;
        return true;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Kiểm tra rate limiting
        try {
            this.checkRateLimit();
        } catch (error) {
            this.showAlert(error.message, 'warning');
            return;
        }
        
        // Kiểm tra config
        if (!this.config) {
            await this.loadTelegramConfig();
            if (!this.config) {
                this.showAlert('Hệ thống thông báo đang bảo trì. Vui lòng gọi 0567.033.888', 'error');
                return;
            }
        }
        
        const formData = this.getFormData();
        
        // Kiểm tra dữ liệu đầu vào
        if (!this.validateForm(formData)) {
            return;
        }
        
        // Kiểm tra XSS
        if (this.detectXSS(formData)) {
            this.showAlert('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin!', 'error');
            console.warn('⚠️ Potential XSS attempt detected');
            return;
        }
        
        const btn = e.target.querySelector('.btn-submit');
        this.disableButton(btn, 'Đang gửi...');
        
        try {
            // Gửi đến Telegram (KHÔNG lưu vào Firebase)
            await this.sendTelegramNotification(formData);
            this.showSuccess();
            e.target.reset();
            
            // Reset loại xe về mặc định
            this.selectedVehicleType = '4 chỗ';
            const selector = document.getElementById('vehicleTypeSelector');
            if (selector) selector.value = '4 chỗ';
            
        } catch (error) {
            console.error('Telegram error:', error);
            this.showAlert('Có lỗi xảy ra. Vui lòng gọi 0567.033.888', 'error');
        } finally {
            this.enableButton(btn, 'Gửi Yêu Cầu Đặt Xe');
        }
    }
    
    getFormData() {
        const vehicleSelector = document.getElementById('vehicleTypeSelector');
        const vehicleType = vehicleSelector ? vehicleSelector.value : this.selectedVehicleType;
        
        // Sanitize tất cả input
        const sanitize = (str) => {
            if (!str) return '';
            return str.toString()
                .replace(/[<>{}[\]]/g, '') // Loại bỏ các ký tự nguy hiểm
                .trim()
                .substring(0, 500); // Giới hạn độ dài
        };
        
        return {
            vehicleType: sanitize(vehicleType),
            serviceType: 'Xe hợp đồng', // Cố định cho dịch vụ
            pickupLocation: sanitize(document.getElementById('pickupLocation')?.value || ''),
            dropoffLocation: sanitize(document.getElementById('dropoffLocation')?.value || ''),
            customerName: sanitize(document.getElementById('customerName')?.value || ''),
            customerPhone: sanitize(document.getElementById('customerPhone')?.value || ''),
            customerNote: sanitize(document.getElementById('customerNote')?.value || ''),
            timestamp: new Date().toLocaleString('vi-VN'),
            pageUrl: window.location.href,
            userAgent: navigator.userAgent.substring(0, 100)
        };
    }
    
    detectXSS(data) {
        const xssPatterns = [
            /<script\b/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /eval\s*\(/i,
            /alert\s*\(/i,
            /document\./i,
            /window\./i
        ];
        
        // Kiểm tra tất cả giá trị trong form data
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const value = data[key].toString().toLowerCase();
                
                for (const pattern of xssPatterns) {
                    if (pattern.test(value)) {
                        console.warn(`XSS detected in ${key}:`, value.substring(0, 100));
                        return true;
                    }
                }
                
                // Kiểm tra độ dài quá lớn
                if (value.length > 1000 && key !== 'customerNote') {
                    console.warn(`Suspicious long input in ${key}:`, value.length);
                    return true;
                }
            }
        }
        
        return false;
    }
    
    validateForm(data) {
        // Kiểm tra cơ bản
        if (!data.pickupLocation || data.pickupLocation.trim().length < 3) {
            this.showAlert('Vui lòng nhập điểm đón hợp lệ (ít nhất 3 ký tự)', 'warning');
            return false;
        }
        
        if (!data.dropoffLocation || data.dropoffLocation.trim().length < 3) {
            this.showAlert('Vui lòng nhập điểm đến hợp lệ (ít nhất 3 ký tự)', 'warning');
            return false;
        }
        
        if (!data.customerName || data.customerName.trim().length < 2) {
            this.showAlert('Vui lòng nhập tên hợp lệ (ít nhất 2 ký tự)', 'warning');
            return false;
        }
        
        if (!data.customerPhone) {
            this.showAlert('Vui lòng nhập số điện thoại', 'warning');
            return false;
        }
        
        // Kiểm tra số điện thoại (chỉ số, 10-11 ký tự)
        const cleanPhone = data.customerPhone.replace(/\D/g, '');
        const phoneRegex = /^[0-9]{10,11}$/;
        
        if (!phoneRegex.test(cleanPhone)) {
            this.showAlert('Số điện thoại không hợp lệ! Vui lòng nhập 10-11 chữ số.', 'warning');
            return false;
        }
        
        // Kiểm tra tên (chỉ chữ cái và khoảng trắng)
        const nameRegex = /^[a-zA-ZÀ-ỹ\s]{2,50}$/;
        if (!nameRegex.test(data.customerName)) {
            this.showAlert('Tên không hợp lệ! Chỉ cho phép chữ cái và khoảng trắng (2-50 ký tự).', 'warning');
            return false;
        }
        
        return true;
    }
    
    async sendTelegramNotification(data) {
        const message = this.formatMessage(data);
        
        // Tạo promises với timeout để tránh blocking
        const sendPromises = this.config.chatIds.map(chatId => 
            this.sendToChatWithTimeout(chatId, message)
        );
        
        const results = await Promise.allSettled(sendPromises);
        
        // Kiểm tra kết quả
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
        
        if (successful === 0) {
            console.error('All Telegram notifications failed:', results);
            throw new Error('Không thể gửi thông báo qua Telegram');
        }
        
        console.log(`✅ ${successful}/${this.config.chatIds.length} Telegram notifications sent successfully`);
        return results;
    }
    
    async sendToChatWithTimeout(chatId, message) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.config.botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                    disable_notification: false
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Telegram API error:', error);
            throw error;
        }
    }
    
    formatMessage(data) {
        // Escape special Telegram characters
        const escapeHTML = (str) => {
            if (!str) return '';
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };
        
        return `<b>🚖 YÊU CẦU ĐẶT XE MỚI - HTUTransport</b>

<b>📋 Loại xe:</b> ${escapeHTML(data.vehicleType)}
<b>👤 Khách hàng:</b> ${escapeHTML(data.customerName)}
<b>📞 Điện thoại:</b> <code>${escapeHTML(data.customerPhone)}</code>
<b>📍 Đón tại:</b> ${escapeHTML(data.pickupLocation)}
<b>🎯 Đến:</b> ${escapeHTML(data.dropoffLocation)}
${data.customerNote ? `<b>📝 Ghi chú:</b> ${escapeHTML(data.customerNote)}` : ''}

<b>🕐 Thời gian:</b> ${escapeHTML(data.timestamp)}
<b>🌐 Trang:</b> ${escapeHTML(data.pageUrl.split('?')[0])}

<u>🔥 VUI LÒNG LIÊN HỆ NGAY!</u>
<code>Hotline: 0567.033.888</code>`;
    }
    
    disableButton(btn, text) {
        if (!btn) return;
        
        const originalHTML = btn.innerHTML;
        btn.setAttribute('data-original-html', originalHTML);
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
        btn.disabled = true;
        btn.style.opacity = '0.7';
        btn.style.cursor = 'not-allowed';
    }
    
    enableButton(btn, text) {
        if (!btn) return;
        
        const originalHTML = btn.getAttribute('data-original-html');
        btn.innerHTML = originalHTML || `<i class="fas fa-paper-plane"></i> ${text}`;
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    }
    
    showSuccess() {
        // Tạo và hiển thị popup thành công
        const popupId = 'booking-success-popup';
        if (document.getElementById(popupId)) return;
        
        const popup = document.createElement('div');
        popup.id = popupId;
        popup.className = 'booking-success-popup';
        
        popup.innerHTML = `
            <div class="success-modal">
                <div class="success-header">
                    <i class="fas fa-check-circle"></i>
                    <h3>Đặt xe thành công!</h3>
                </div>
                <div class="success-body">
                    <p>✅ Yêu cầu đã được gửi đến đội ngũ HTUTransport</p>
                    <p>📞 Chúng tôi sẽ gọi lại cho bạn trong <strong>3 phút</strong></p>
                    <div class="success-hotline">
                        <i class="fas fa-phone-alt"></i>
                        <span>0567.033.888</span>
                    </div>
                    <div class="success-note">
                        <i class="fas fa-shield-alt"></i>
                        <small>Thông tin của bạn được bảo mật</small>
                    </div>
                </div>
                <button class="btn-success-close">
                    <i class="fas fa-times"></i> Đóng
                </button>
            </div>
        `;
        
        document.body.appendChild(popup);
        this.addSuccessStyles();
        
        // Close handlers
        const closeBtn = popup.querySelector('.btn-success-close');
        closeBtn.addEventListener('click', () => {
            popup.remove();
        });
        
        popup.addEventListener('click', (e) => {
            if (e.target === popup) popup.remove();
        });
        
        // Thêm sự kiện ESC để đóng
        const closeOnEsc = (e) => {
            if (e.key === 'Escape' && document.getElementById(popupId)) {
                popup.remove();
                document.removeEventListener('keydown', closeOnEsc);
            }
        };
        document.addEventListener('keydown', closeOnEsc);
        
        // Auto close after 8 seconds
        setTimeout(() => {
            if (document.getElementById(popupId)) {
                popup.remove();
                document.removeEventListener('keydown', closeOnEsc);
            }
        }, 8000);
    }
    
    addSuccessStyles() {
        const styleId = 'booking-success-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .booking-success-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.85);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
                backdrop-filter: blur(5px);
            }
            
            .success-modal {
                background: #1a1a1a;
                border: 2px solid #d4af37;
                border-radius: 20px;
                padding: 30px;
                max-width: 400px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                animation: slideUp 0.4s ease;
            }
            
            .success-header {
                margin-bottom: 20px;
                color: #4CAF50;
            }
            
            .success-header i {
                font-size: 48px;
                margin-bottom: 15px;
            }
            
            .success-header h3 {
                margin: 0;
                font-size: 22px;
                font-weight: 600;
                color: #ffffff;
            }
            
            .success-body {
                color: #cccccc;
                line-height: 1.6;
                margin-bottom: 25px;
            }
            
            .success-body p {
                margin: 10px 0;
            }
            
            .success-hotline {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                background: rgba(76, 175, 80, 0.1);
                color: #4CAF50;
                padding: 12px 20px;
                border-radius: 12px;
                margin: 15px 0;
                font-weight: 600;
                font-size: 18px;
            }
            
            .success-hotline i {
                font-size: 20px;
            }
            
            .success-note {
                margin-top: 15px;
                color: #999999;
                font-size: 13px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .btn-success-close {
                background: linear-gradient(135deg, #d4af37, #f1c40f);
                color: #000000;
                border: none;
                padding: 12px 30px;
                border-radius: 12px;
                font-weight: 700;
                font-size: 15px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-success-close:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @media (max-width: 480px) {
                .success-modal {
                    padding: 20px 15px;
                }
                
                .success-header h3 {
                    font-size: 20px;
                }
                
                .success-hotline {
                    font-size: 16px;
                    padding: 10px 15px;
                }
                
                .btn-success-close {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    showAlert(message, type = 'info') {
        // Tạo toast notification
        const toastId = 'custom-toast-' + Date.now();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `custom-toast toast-${type}`;
        
        const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
        toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-message">${message}</span>`;
        
        document.body.appendChild(toast);
        
        // Thêm style cho toast
        this.addToastStyles();
        
        // Auto remove sau 4 giây
        setTimeout(() => {
            const toastElement = document.getElementById(toastId);
            if (toastElement) {
                toastElement.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => {
                    if (toastElement.parentNode) {
                        toastElement.parentNode.removeChild(toastElement);
                    }
                }, 300);
            }
        }, 4000);
    }
    
    addToastStyles() {
        const styleId = 'toast-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .custom-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #1a1a1a;
                color: #ffffff;
                padding: 15px 20px;
                border-radius: 10px;
                border-left: 4px solid;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                z-index: 10001;
                animation: slideInRight 0.3s ease;
                max-width: 350px;
                font-size: 14px;
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .toast-error {
                border-left-color: #ff4444;
            }
            
            .toast-warning {
                border-left-color: #ffaa00;
            }
            
            .toast-info {
                border-left-color: #2196F3;
            }
            
            .toast-icon {
                font-size: 16px;
            }
            
            .toast-message {
                flex: 1;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes fadeOut {
                to { opacity: 0; transform: translateY(-10px); }
            }
            
            @media (max-width: 480px) {
                .custom-toast {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
            
            .input-error {
                border-color: #ff4444 !important;
                box-shadow: 0 0 0 2px rgba(255, 68, 68, 0.2) !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Khởi tạo khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Delay một chút để đảm bảo các phần tử khác đã load
    setTimeout(() => {
        try {
            const telegramBooking = new TelegramBooking();
            window.telegramBooking = telegramBooking;
            console.log('✅ TelegramBooking initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize TelegramBooking:', error);
        }
    }, 1500);
});