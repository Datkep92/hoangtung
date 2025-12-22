// js/booking-telegram.js
class TelegramBooking {
    constructor() {
        this.activeConfig = null;
        this.init();
    }
    
    async init() {
        await this.loadTelegramConfig();
        
        const form = document.getElementById('bookingForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }
    
    async loadTelegramConfig() {
        try {
            // Thử từ Firebase trước
            const response = await fetch('https://hoangtung-af982-default-rtdb.firebaseio.com/telegram/configs.json');
            const configs = await response.json();
            
            if (configs) {
                // Tìm config active cho booking
                const activeConfigs = Object.values(configs).filter(config => 
                    config.status === 'active' && 
                    config.messageTypes?.includes('booking')
                );
                
                if (activeConfigs.length > 0) {
                    this.activeConfig = activeConfigs[0];
                    console.log('📱 Telegram config loaded:', this.activeConfig.name);
                    return;
                }
            }
        } catch (error) {
            console.warn('Cannot load from Firebase:', error);
        }
        
        // Fallback: dùng config mặc định
        this.activeConfig = {
            botToken: '8531709938:AAGXyxYydyqdnnqn6nr5fP74EZsZGDOwSko',
            chatId: '6372876364',
            name: 'Default Config'
        };
        
        console.log('📱 Using default Telegram config');
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.activeConfig) {
            this.showAlert('Hệ thống đang bảo trì. Vui lòng gọi 0567.033.888', 'error');
            return;
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
        return {
            pickupLocation: document.getElementById('pickupLocation').value,
            dropoffLocation: document.getElementById('dropoffLocation').value,
            customerName: document.getElementById('customerName').value,
            customerPhone: document.getElementById('customerPhone').value,
            timestamp: new Date().toLocaleString('vi-VN'),
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };
    }
    
    validateForm(data) {
        return data.pickupLocation && data.dropoffLocation && 
               data.customerName && data.customerPhone;
    }
    
    async sendTelegramNotification(data) {
        const message = this.formatMessage(data);
        
        const response = await fetch(`https://api.telegram.org/bot${this.activeConfig.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: this.activeConfig.chatId,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });
        
        if (!response.ok) {
            throw new Error('Telegram API failed');
        }
        
        return await response.json();
    }
    
    formatMessage(data) {
        return `<b>🚖 YÊU CẦU ĐẶT XE MỚI</b>

<b>Khách hàng:</b> ${data.customerName}
<b>Điện thoại:</b> <code>${data.customerPhone}</code>
<b>Đón tại:</b> ${data.pickupLocation}
<b>Đến:</b> ${data.dropoffLocation}
<b>Thời gian:</b> ${data.timestamp}
<b>Từ trang:</b> ${window.location.href}

<u>VUI LÒNG LIÊN HỆ NGAY!</u>`;
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
    // Tạo popup thành công
    const popup = document.createElement('div');
    popup.className = 'lux-success';
    popup.innerHTML = `
        <div class="lux-modal">
            <div class="lux-header">
                <i class="fas fa-check-circle"></i>
                <h3>Yêu cầu đã gửi thành công!</h3>
            </div>
            <div class="lux-body">
                <p>Đội ngũ của chúng tôi sẽ liên hệ bạn trong vài phút.</p>
                <div class="lux-hotline">
                    <i class="fas fa-phone"></i>
                    <strong>0567.033.888</strong>
                </div>
            </div>
            <button class="btn-lux-close">Đóng</button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Thêm CSS luxury
    this.addSuccessStyles();
    
    // Xử lý đóng popup
    popup.querySelector('.btn-lux-close').addEventListener('click', () => {
        popup.remove();
    });
    
    // Tự động đóng sau 8s
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
            margin-top: 15px;
        }

        .lux-hotline i {
            font-size: 16px;
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

        /* Mobile */
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
        alert(message); // Có thể thay bằng toast đẹp hơn
    }

}

// Khởi tạo khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new TelegramBooking();
});

