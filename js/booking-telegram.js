// js/booking-telegram.js - Version 3.8 (Deep IP Tracking & Luxury UI)
class TelegramBooking {
    constructor() {
        this.config = null;
        this.isLoading = false;
        this.vehicleTypes = ['4 chỗ', '7 chỗ', '16 chỗ', '45 chỗ'];
        this.userLocation = {
            city: 'Chưa rõ', region: 'Chưa rõ', country: 'Việt Nam',
            ip: 'Đang lấy...', isp: 'Mạng di động/Wifi'
        };
        this.init();
    }
    
    async init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeSystem());
        } else {
            this.initializeSystem();
        }
    }
    
    async initializeSystem() {
        try {
            await this.initializeFirebase();
            await this.loadTelegramConfig();
            await this.detectLocationByIP(); // Hàm định vị mạnh mẽ
            this.addStyles();
            this.createBookingForm();
            this.createPopupElement();
            this.setupFormListeners();
            console.log('✅ Hệ thống Luxury sẵn sàng - IP:', this.userLocation.ip);
        } catch (error) {
            console.error('❌ Lỗi khởi tạo:', error);
        }
    }
    
    async initializeFirebase() {
        const config = {
            apiKey: "AIzaSyCeYPoizbE-Op79186r7pmndGpJ-JfESAk",
            authDomain: "hoangtung-af982.firebaseapp.com",
            databaseURL: "https://hoangtung-af982-default-rtdb.firebaseio.com",
            projectId: "hoangtung-af982",
            storageBucket: "hoangtung-af982.firebasestorage.app",
            messagingSenderId: "232719624914",
            appId: "1:232719624914:web:cac7ce833ae105d9255b0b"
        };
        if (typeof firebase === 'undefined') return;
        if (!firebase.apps.length) firebase.initializeApp(config);
    }
    
    async loadTelegramConfig() {
        try {
            const snapshot = await firebase.database().ref('telegram_configs').once('value');
            const data = snapshot.val();
            if (data && data.configs) {
                const configId = data.default || Object.keys(data.configs)[0];
                this.config = data.configs[configId];
            }
        } catch (e) { console.error('Lỗi tải Telegram Config'); }
    }

    // HÀM GỐC CẢI TIẾN: Xác định vị trí đa lớp
    async detectLocationByIP() {
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            this.userLocation.ip = ipData.ip;
            
            try {
                const response = await fetch('https://ipinfo.io/json');
                const data = await response.json();
                
                if (data && !data.error) {
                    const loc = data.loc ? data.loc.split(',') : [null, null];
                    this.userLocation = {
                        ip: data.ip || ipData.ip,
                        city: data.city || 'Không xác định',
                        region: data.region || 'Không xác định',
                        country: data.country || 'Không xác định',
                        latitude: loc[0],
                        longitude: loc[1],
                        timezone: data.timezone,
                        isp: data.org || 'Không xác định'
                    };
                }
            } catch (error) {
                console.warn('Location detection failed');
            }
        } catch (error) {
            console.warn('IP detection failed');
        }
    }

    addStyles() {
        if (document.getElementById('telegram-booking-css')) return;
        const style = document.createElement('style');
        style.id = 'telegram-booking-css';
        style.textContent = `
            :root { --champagne: #d4af37; --text-primary: #ffffff; --text-secondary: #b0b0b0; }
            .quick-booking { padding: 60px 10px; background: linear-gradient(135deg, #1a1a1a, #0a0a0a); position: relative; overflow: hidden; font-family: 'Segoe UI', Roboto, sans-serif; }
            .quick-booking::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><path fill="%23d4af37" fill-opacity="0.03" d="M0,0h1000v1000H0V0z M150,150h700v700H150V150z"/></svg>'); background-size: 50px; opacity: 0.3; z-index: 1; }
            .booking-card { max-width: 600px; margin: 0 auto; background: rgba(20, 20, 20, 0.95); border-radius: 20px; border: 2px solid rgba(212, 175, 55, 0.3); padding: 40px; position: relative; z-index: 2; backdrop-filter: blur(10px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5); box-sizing: border-box; }
            .booking-title { color: var(--champagne); font-size: 32px; margin-bottom: 10px; font-weight: 700; background: linear-gradient(135deg, #d4af37, #ffd700); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-transform: uppercase; text-align: center; }
            .booking-subtitle { color: var(--text-secondary); font-size: 16px; text-align: center; margin-bottom: 30px; }
            .form-group { margin-bottom: 20px; }
            .form-label { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-weight: 600; color: var(--text-primary); font-size: 14px; }
            .form-label i { color: var(--champagne); width: 20px; text-align: center; }
            .form-input, select.form-input { width: 100%; padding: 14px 18px; background: rgba(30, 30, 30, 0.9); border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: #fff; font-size: 15px; transition: all 0.3s ease; box-sizing: border-box; }
            select.form-input { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23d4af37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 18px center; background-size: 16px; padding-right: 50px; cursor: pointer; }
            .form-input:focus { outline: none; border-color: #d4af37; box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2); background: rgba(40, 40, 40, 0.95); }
            .btn-submit { width: 100%; padding: 18px; font-size: 17px; font-weight: 700; margin-top: 10px; background: linear-gradient(135deg, #d4af37, #ffd700); border: none; border-radius: 12px; color: #1a1a1a; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 0.5px; }
            .btn-submit:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(212, 175, 55, 0.4); }
            .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

            /* Popup Styles Gốc */
            .booking-popup { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: none; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(5px); }
            .popup-content { background: #1a1a1a; border: 2px solid var(--champagne); border-radius: 20px; padding: 40px; max-width: 400px; width: 90%; text-align: center; transform: scale(0.7); transition: 0.3s ease; }
            .booking-popup.active { display: flex; }
            .booking-popup.active .popup-content { transform: scale(1); }
            .popup-icon { font-size: 60px; color: var(--champagne); margin-bottom: 20px; }
            .popup-title { color: #fff; font-size: 24px; margin-bottom: 10px; font-weight: 700; }
            .popup-msg { color: var(--text-secondary); margin-bottom: 25px; line-height: 1.6; }
            .btn-close-popup { padding: 12px 30px; background: var(--champagne); border: none; border-radius: 8px; color: #000; font-weight: bold; cursor: pointer; text-transform: uppercase; }

            @media (max-width: 768px) { .booking-card { padding: 25px 20px; } .booking-title { font-size: 26px; } }
        `;
        document.head.appendChild(style);
    }

    createBookingForm() {
        let container = document.getElementById('booking');
        if (!container) {
            container = document.createElement('section');
            container.id = 'booking'; container.className = 'quick-booking';
            document.body.appendChild(container);
        }
        container.innerHTML = `
        <div class="booking-card">
            <div class="booking-header">
                <h2 id="bookingTitle" class="booking-title">Đặt Xe Nhanh Chóng - Nhận Ưu Đãi Ngay</h2>
                        <p class="booking-subtitle">Chỉ cần điền thông tin, chúng tôi sẽ gọi lại tư vấn ngay</p>
            </div>
            <form id="bookingForm">
                <div class="form-group"><label class="form-label"><i class="fas fa-car"></i> Loại Xe</label>
                    <select id="carType" class="form-input">${this.vehicleTypes.map(t => `<option value="${t}">${t}</option>`).join('')}</select>
                </div>
                <div class="form-group"><label class="form-label"><i class="fas fa-phone"></i> Số Điện Thoại *</label>
                    <input type="tel" id="customerPhone" class="form-input" placeholder="Nhập SĐT..." required autocomplete="off">
                </div>
                <div class="form-group"><label class="form-label"><i class="fas fa-user"></i> Họ Tên Khách Hàng</label>
                    <input type="text" id="customerName" class="form-input" placeholder="Tên của bạn...">
                </div>
                <div class="form-group"><label class="form-label"><i class="fas fa-map-marker-alt"></i> Điểm Đón *</label>
                    <input type="text" id="pickupLocation" class="form-input" placeholder="Bạn đang ở đâu?" required>
                </div>
                <div class="form-group"><label class="form-label"><i class="fas fa-flag-checkered"></i> Điểm Đến</label>
                    <input type="text" id="dropoffLocation" class="form-input" placeholder="Bạn muốn đi đâu?">
                </div>
                <div class="form-group"><label class="form-label"><i class="fas fa-sticky-note"></i> Ghi Chú Yêu Cầu</label>
                    <textarea id="customerNote" class="form-input" rows="2" placeholder="Yêu cầu thêm (nếu có)..."></textarea>
                </div>
                <button type="submit" id="bookingSubmitBtn" class="btn-submit">Gửi Yêu Cầu Đặt Xe</button>
            </form>
        </div>`;
    }

    createPopupElement() {
        const popup = document.createElement('div');
        popup.id = 'bookingPopup';
        popup.className = 'booking-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-icon"><i class="fas fa-check-circle"></i></div>
                <div class="popup-title">Thành Công!</div>
                <div class="popup-msg" id="popupMsg">Chúng tôi đã nhận được yêu cầu của bạn.</div>
                <button class="btn-close-popup" onclick="document.getElementById('bookingPopup').classList.remove('active')">Đồng Ý</button>
            </div>`;
        document.body.appendChild(popup);
    }

    showPopup(title, msg, isError = false) {
        const popup = document.getElementById('bookingPopup');
        popup.querySelector('.popup-title').innerText = title;
        popup.querySelector('.popup-msg').innerText = msg;
        const icon = popup.querySelector('.popup-icon i');
        if (isError) {
            icon.className = 'fas fa-exclamation-triangle';
            icon.style.color = '#ff4d4d';
        } else {
            icon.className = 'fas fa-check-circle';
            icon.style.color = 'var(--champagne)';
        }
        popup.classList.add('active');
    }

    setupFormListeners() {
        const phoneInput = document.getElementById('customerPhone');
        // Sửa lỗi SDT: Lọc thô không qua format trung gian
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 11);
        });
        document.getElementById('bookingForm').addEventListener('submit', (e) => this.handleSubmit(e));
        this.loadSavedDraft();
    }

    loadSavedDraft() {
        try {
            const draft = JSON.parse(localStorage.getItem('booking_draft') || '{}');
            if (draft.phone) document.getElementById('customerPhone').value = draft.phone;
            if (draft.name) document.getElementById('customerName').value = draft.name;
        } catch (e) {}
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (this.isLoading) return;

        const data = {
            carType: document.getElementById('carType').value,
            phone: document.getElementById('customerPhone').value,
            name: document.getElementById('customerName').value,
            pickup: document.getElementById('pickupLocation').value,
            dropoff: document.getElementById('dropoffLocation').value,
            note: document.getElementById('customerNote').value,
            location: this.userLocation,
            time: new Date().toLocaleString('vi-VN')
        };

        if (data.phone.length < 10) {
            this.showPopup('Lỗi', 'Vui lòng nhập đúng số điện thoại di động.', true);
            return;
        }

        const btn = document.getElementById('bookingSubmitBtn');
        this.isLoading = true; btn.innerHTML = 'ĐANG GỬI...'; btn.disabled = true;

        try {
            await this.sendTelegram(data);
            await this.saveToFirebase(data);
            localStorage.setItem('booking_draft', JSON.stringify({ name: data.name, phone: data.phone }));
            this.showPopup('Đã Nhận Yêu Cầu', `Cảm ơn ${data.name || 'quý khách'}! Chúng tôi sẽ gọi lại ngay.`);
            e.target.reset();
            this.loadSavedDraft();
        } catch (error) {
            this.showPopup('Thất Bại', 'Không thể kết nối máy chủ. Vui lòng gọi Hotline.', true);
        } finally {
            this.isLoading = false; btn.innerHTML = 'Gửi Yêu Cầu Đặt Xe'; btn.disabled = false;
        }
    }

    async sendTelegram(d) {
        if (!this.config) throw new Error('Config missing');
        const message = `<b>🚕 ĐƠN ĐẶT XE MỚI (LUXURY)</b>\n` +
                        `--------------------------\n` +
                        `👤 <b>Khách:</b> ${d.name || 'N/A'}\n` +
                        `📞 <b>SĐT:</b> <code>${d.phone}</code>\n` +
                        `🚗 <b>Loại:</b> ${d.carType}\n` +
                        `📍 <b>Đón:</b> ${d.pickup}\n` +
                        `🏁 <b>Đến:</b> ${d.dropoff || 'N/A'}\n` +
                        `📝 <b>Note:</b> ${d.note || 'Không'}\n` +
                        `--------------------------\n` +
                        `🏠 <b>Khu vực:</b> ${d.location.city}, ${d.location.region}\n` +
                        `🌐 <b>IP:</b> ${d.location.ip}\n` +
                        `⚡ <b>Mạng:</b> ${d.location.isp}`;

        const promises = this.config.chatIds.map(id => fetch(`https://api.telegram.org/bot${this.config.botToken}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: id, text: message, parse_mode: 'HTML' })
        }));
        await Promise.all(promises);
    }

    async saveToFirebase(data) {
        try { await firebase.database().ref('bookings').push({ ...data, timestamp: firebase.database.ServerValue.TIMESTAMP }); } catch (e) {}
    }
    
}
// ===== THÊM HÀM SCROLL ĐƠN GIẢN =====
function scrollToBookingSection() {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
        bookingSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Thêm hiệu ứng highlight
        bookingSection.classList.add('highlight-booking');
        setTimeout(() => {
            bookingSection.classList.remove('highlight-booking');
        }, 3000);
    } else {
        // Nếu booking section chưa tạo, tạo trước rồi scroll
        if (window.completeBookingSystem) {
            window.completeBookingSystem.createBookingSection().then(() => {
                const newBookingSection = document.getElementById('booking');
                if (newBookingSection) {
                    newBookingSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                    newBookingSection.classList.add('highlight-booking');
                    setTimeout(() => {
                        newBookingSection.classList.remove('highlight-booking');
                    }, 3000);
                }
            });
        }
    }
}
// Cũng thêm vào window object để dễ truy cập
window.scrollToBookingSection = scrollToBookingSection;

// Thêm vào completeBookingSystem
if (window.completeBookingSystem) {
    window.completeBookingSystem.scrollToBookingSection = function() {
        scrollToBookingSection();
    };
}
new TelegramBooking();