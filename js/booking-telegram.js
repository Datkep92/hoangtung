// js/booking-telegram.js - Version 2.0
class TelegramBooking {
    constructor() {
        this.config = null;
        this.isLoading = false;
        this.init();
    }
    
    async init() {
        await this.loadTelegramConfig();
        this.attachFormListener();
    }
    
    async loadTelegramConfig() {
        try {
            // Lấy config từ localStorage hoặc Firebase
            let config = localStorage.getItem('luxurymove_telegram_config');
            
            if (!config) {
                // Nếu chưa có trong localStorage, tải từ Firebase
                console.log('📡 Loading Telegram config from Firebase...');
                config = await this.fetchFromFirebase();
            } else {
                config = JSON.parse(config);
            }
            
            if (config && this.validateConfig(config)) {
                this.config = config;
                console.log('✅ Telegram config loaded:', config.name);
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
        // Sử dụng Firebase SDK trực tiếp
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
                    
                    if (config) {
                        // Lưu vào localStorage
                        localStorage.setItem('luxurymove_telegram_config', JSON.stringify(config));
                        // Đặt thời gian hết hạn (1 ngày)
                        localStorage.setItem('luxurymove_telegram_config_expires', Date.now() + 24 * 60 * 60 * 1000);
                        return config;
                    }
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
    
    attachFormListener() {
        const form = document.getElementById('bookingForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        } else {
            console.warn('📝 Booking form not found, will retry in 1s');
            setTimeout(() => this.attachFormListener(), 1000);
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Kiểm tra config
        if (!this.config) {
            await this.loadTelegramConfig();
            if (!this.config) {
                this.showAlert('Hệ thống thông báo đang bảo trì. Vui lòng gọi 0567.033.888', 'error');
                return;
            }
        }
        
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            this.showAlert('Vui lòng điền đầy đủ thông tin bắt buộc!', 'warning');
            return;
        }
        
        const btn = e.target.querySelector('.btn-submit');
        this.disableButton(btn, 'Đang gửi...');
        
        try {
            await this.sendTelegramNotification(formData);
            this.showSuccess();
            e.target.reset();
        } catch (error) {
            console.error('Telegram error:', error);
            this.showAlert('Có lỗi xảy ra. Vui lòng gọi 0567.033.888', 'error');
        } finally {
            this.enableButton(btn, 'Gửi Yêu Cầu Đặt Xe');
        }
    }
    
    getFormData() {
        // Lấy thêm thông tin từ form
        const serviceElement = document.querySelector('.booking-service.active');
        const serviceName = serviceElement ? serviceElement.dataset.name : 'Không xác định';
        
        return {
            serviceType: serviceName,
            pickupLocation: document.getElementById('pickupLocation')?.value || '',
            dropoffLocation: document.getElementById('dropoffLocation')?.value || '',
            customerName: document.getElementById('customerName')?.value || '',
            customerPhone: document.getElementById('customerPhone')?.value || '',
            customerNote: document.getElementById('customerNote')?.value || '',
            timestamp: new Date().toLocaleString('vi-VN'),
            pageUrl: window.location.href,
            userAgent: navigator.userAgent.substring(0, 100),
            ip:  this.getClientIP()
        };
    }
    
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'Không xác định';
        }
    }
    
    validateForm(data) {
        return data.pickupLocation && 
               data.dropoffLocation && 
               data.customerName && 
               data.customerPhone;
    }
    
    async sendTelegramNotification(data) {
        const message = this.formatMessage(data);
        
        // Gửi đến tất cả chat IDs
        const sendPromises = this.config.chatIds.map(chatId => 
            this.sendToChat(chatId, message)
        );
        
        const results = await Promise.all(sendPromises);
        
        // Kiểm tra nếu tất cả đều thất bại
        const successful = results.filter(r => r.ok).length;
        if (successful === 0) {
            throw new Error('Không thể gửi thông báo đến bất kỳ chat nào');
        }
        
        // Log kết quả
        await this.logBooking(data, successful > 0);
        
        return results;
    }
    
    async sendToChat(chatId, message) {
        const response = await fetch(`https://api.telegram.org/bot${this.config.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });
        
        return await response.json();
    }
    
    async logBooking(data, success) {
        try {
            if (typeof firebase !== 'undefined' && firebase.database) {
                const database = firebase.database();
                await database.ref('booking_logs').push({
                    ...data,
                    success: success,
                    telegramConfig: this.config.id,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error('Error logging booking:', error);
        }
    }
    
    formatMessage(data) {
        return `<b>🚖 YÊU CẦU ĐẶT XE MỚI - LuxuryMove</b>


<b>👤 Khách hàng:</b> ${data.customerName}
<b>📞 Điện thoại:</b> <code>${data.customerPhone}</code>
<b> Đón tại:</b> ${data.pickupLocation}
<b> Đến:</b> ${data.dropoffLocation}
${data.customerNote ? `<b>📝 Ghi chú:</b> ${data.customerNote}` : ''}

<b>🕐 Thời gian:</b> ${data.timestamp}
<b> Trang:</b> ${data.pageUrl}
<b> User Agent:</b> ${data.userAgent}
${data.ip ? `<b>🌍 IP:</b> ${data.ip}` : ''}

<u>🔥 VUI LÒNG LIÊN HỆ NGAY!</u>`;
    }
    
    disableButton(btn, text) {
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
        btn.disabled = true;
    }
    
    enableButton(btn, text) {
        btn.innerHTML = `<i class="fas fa-paper-plane"></i> ${text}`;
        btn.disabled = false;
    }
    
    showSuccess() {
        const popup = document.createElement('div');
        popup.className = 'lux-success';
        popup.innerHTML = `
            <div class="lux-modal">
                <div class="lux-header">
                    <i class="fas fa-check-circle"></i>
                    <h3>Yêu cầu đã gửi thành công!</h3>
                </div>
                <div class="lux-body">
                    <p>Đội ngũ LuxuryMove sẽ liên hệ bạn trong vài phút.</p>
                    <div class="lux-hotline">
                        <i class="fas fa-phone"></i>
                        <strong>0567.033.888</strong>
                    </div>
                    <p class="lux-note">Thông báo đã được gửi đến ${this.config.chatIds.length} quản trị viên</p>
                </div>
                <button class="btn-lux-close">Đóng</button>
            </div>
        `;
        
        document.body.appendChild(popup);
        this.addSuccessStyles();
        
        popup.querySelector('.btn-lux-close').addEventListener('click', () => {
            popup.remove();
        });
        
        setTimeout(() => popup.remove(), 8000);
    }
    
    addSuccessStyles() {
        if (document.getElementById('lux-success-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'lux-success-styles';
        style.textContent = `
            .lux-success {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: luxFadeIn 0.3s;
            }
            
            .lux-modal {
                background: linear-gradient(145deg, #1a1a1a, #333);
                border-radius: 20px;
                padding: 30px 25px;
                max-width: 380px;
                width: 90%;
                text-align: center;
                box-shadow: 0 15px 35px rgba(0,0,0,0.3);
                animation: luxSlideUp 0.4s;
                color: #f2e6c4;
                font-family: 'Poppins', sans-serif;
            }
            
            .lux-header {
                margin-bottom: 20px;
                color: #f1c40f;
            }
            
            .lux-header i {
                font-size: 50px;
                margin-bottom: 10px;
            }
            
            .lux-header h3 {
                margin: 0;
                font-size: 20px;
                font-weight: 600;
            }
            
            .lux-body {
                font-size: 14px;
                color: #e0d4b0;
                margin-bottom: 25px;
            }
            
            .lux-hotline {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
                background: rgba(241, 196, 15, 0.1);
                color: #f1c40f;
                font-weight: 600;
                padding: 10px 15px;
                border-radius: 12px;
                margin: 15px 0;
            }
            
            .lux-note {
                font-size: 12px;
                color: #aaa;
                margin-top: 10px;
            }
            
            .btn-lux-close {
                background: #f1c40f;
                color: #1a1a1a;
                border: none;
                padding: 12px 25px;
                border-radius: 12px;
                cursor: pointer;
                font-weight: 700;
                font-size: 15px;
                transition: all 0.3s ease;
                width: 100%;
            }
            
            .btn-lux-close:hover {
                background: #d4ac0d;
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(241,196,15,0.4);
            }
            
            @keyframes luxFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes luxSlideUp {
                from { opacity: 0; transform: translateY(25px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @media (max-width: 480px) {
                .lux-modal {
                    padding: 20px 15px;
                }
                
                .lux-header h3 {
                    font-size: 18px;
                }
                
                .lux-body {
                    font-size: 13px;
                }
                
                .lux-hotline {
                    font-size: 13px;
                    padding: 8px 12px;
                }
                
                .btn-lux-close {
                    font-size: 14px;
                    padding: 10px 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    showAlert(message, type = 'info') {
        // Có thể thay bằng toast notification đẹp hơn
        alert(message);
    }
}

// Hàm helper cho Promise.all với timeout
Promise.allSendPromises = function(promises, timeout = 10000) {
    const timeoutPromises = promises.map(promise => 
        Promise.race([
            promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), timeout)
            )
        ])
    );
    return Promise.all(timeoutPromises);
};

// Khởi tạo khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const telegramBooking = new TelegramBooking();
    window.telegramBooking = telegramBooking; // Cho phép debug

});
