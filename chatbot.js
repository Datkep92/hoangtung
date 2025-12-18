// chatbot-pro.js - LuxuryMove Professional Chatbot
class LuxuryMoveProChatbot {
    constructor() {
        this.messages = [];
        this.userPhone = localStorage.getItem('luxurymove_user_phone') || '';
        this.userName = localStorage.getItem('luxurymove_user_name') || '';
        this.conversationStage = 'welcome'; // welcome, asking, collecting, closing
        this.chatOpen = false;
        this.servicesData = null;
    }

    // Sửa hàm showNotification
showNotification(text) {
    const noti = document.getElementById('chatProNotification');
    if (noti) {
        noti.textContent = text;
        noti.style.display = text ? 'block' : 'none';
        
        if (text) {
            // Auto hide after 5 seconds
            setTimeout(() => {
                if (noti.textContent === text) {
                    noti.style.display = 'none';
                }
            }, 5000);
        }
    }
}

// Sửa hàm toggleChat
toggleChat() {
    this.chatOpen = !this.chatOpen;
    const window = document.getElementById('chatbotProWindow');
    const button = document.getElementById('chatbotProButton');
    
    if (!window || !button) {
        console.error('Chatbot elements not found');
        return;
    }
    
    if (this.chatOpen) {
        window.classList.add('active');
        button.classList.add('active');
        
        // Focus input if exists
        const input = document.getElementById('chatProInput');
        if (input) input.focus();
        
        // Clear notification
        this.showNotification('');
        
        // Load conversation history
        this.loadConversationHistory();
        
    } else {
        window.classList.remove('active');
        button.classList.remove('active');
    }
}

// Sửa hàm setupEventListeners để check element tồn tại
setupEventListeners() {
    const button = document.getElementById('chatbotProButton');
    if (!button) {
        console.error('Chatbot button not found');
        return;
    }
    
    button.addEventListener('click', () => this.toggleChat());
    
    // Click outside to close
    document.addEventListener('click', (e) => {
        const window = document.getElementById('chatbotProWindow');
        const button = document.getElementById('chatbotProButton');
        
        if (!window || !button) return;
        
        if (this.chatOpen && 
            !window.contains(e.target) && 
            !button.contains(e.target)) {
            this.toggleChat();
        }
    });
}

// Thêm hàm check DOM element trước khi thao tác
checkElements() {
    const requiredElements = [
        'chatbotProContainer',
        'chatbotProButton', 
        'chatbotProWindow',
        'chatProMessages',
        'chatProInput'
    ];
    
    const missing = requiredElements.filter(id => !document.getElementById(id));
    
    if (missing.length > 0) {
        console.warn('Missing chatbot elements:', missing);
        return false;
    }
    
    return true;
}

// Sửa hàm init để check elements
init() {
    // Load services data
    this.loadServicesData();
    
    // Create UI
    this.createProfessionalUI();
    
    // Check if elements were created successfully
    setTimeout(() => {
        if (this.checkElements()) {
            this.setupEventListeners();
            
            // Auto welcome after 3 seconds
            setTimeout(() => {
                if (!localStorage.getItem('luxurymove_chat_welcomed')) {
                    this.showProfessionalWelcome();
                }
            }, 3000);
            
            console.log('✅ Chatbot initialized successfully');
        } else {
            console.error('❌ Chatbot failed to initialize - missing elements');
        }
    }, 100); // Small delay to ensure DOM is ready
}

    async loadServicesData() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/Datkep92/hoangtung/main/data/services.json?v=' + Date.now());
            if (response.ok) {
                this.servicesData = await response.json();
                console.log('✅ Loaded services data for chatbot');
            }
        } catch (error) {
            console.log('ℹ️ No GitHub data for chatbot, using defaults');
        }
    }

    createProfessionalUI() {
        const html = `
        <div class="chatbot-pro-container" id="chatbotProContainer">
            <!-- Floating button -->
            <div class="chatbot-pro-button" id="chatbotProButton">
                <!-- Cập nhật phần icon trong chatbot-pro-button -->
<div class="chatbot-pro-icon">
    <i class="fas fa-headset"></i>
    <div class="icon-ring"></div>
    <!-- Sparkle dots -->
    <div class="sparkle"></div>
    <div class="sparkle"></div>
    <div class="sparkle"></div>
    <div class="sparkle"></div>
</div>
            </div>

            <!-- Chat window -->
            <div class="chatbot-pro-window" id="chatbotProWindow">
                <div class="chatbot-pro-header">
                    <div class="chatbot-pro-avatar">
                        <i class="fas fa-crown"></i>
                    </div>
                    <div class="chatbot-pro-info">
                        <h4>Trợ lý</h4>
                        <p class="chatbot-pro-status">
                            <span class="status-dot"></span>
                            online
                        </p>
                    </div>
                    <div class="chatbot-pro-actions">
                        <button class="chat-action-btn" title="Gọi điện" onclick="window.location.href='tel:0931243679'">
                            <i class="fas fa-phone"></i>
                        </button>
                        <button class="chat-action-btn" title="Zalo" onclick="window.open('https://zalo.me/0931243679')">
                            <i class="fab fa-facebook-messenger"></i>
                        </button>
                        <button class="chat-action-btn" title="Đóng" onclick="chatbotPro.toggleChat()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div class="chatbot-pro-messages" id="chatProMessages">
                    <!-- Messages will load here -->
                </div>

                <div class="chatbot-pro-input-section">
                    <div class="chatbot-pro-quick-actions" id="quickActions">
                        <button class="quick-action" onclick="chatbotPro.quickAction('pricing')">
                            <i class="fas fa-tags"></i> Báo giá
                        </button>
                        <button class="quick-action" onclick="chatbotPro.quickAction('booking')">
                            <i class="fas fa-calendar-alt"></i> Đặt xe
                        </button>
                        <button class="quick-action" onclick="chatbotPro.quickAction('contact')">
                            <i class="fas fa-phone"></i> Liên hệ
                        </button>
                    </div>

                    <div class="chatbot-pro-input-area">
                        <input type="text" id="chatProInput" 
                               placeholder="Nhập câu hỏi của bạn..." 
                               onkeypress="if(event.key==='Enter') chatbotPro.sendMessage()">
                        <button class="chatbot-pro-send" onclick="chatbotPro.sendMessage()">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>

                    <div class="chatbot-pro-disclaimer">
                        <i class="fas fa-info-circle"></i>
                        <span>Hỗ trợ 24/7 • Phản hồi trong 3 phút</span>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    }

    setupEventListeners() {
        document.getElementById('chatbotProButton').addEventListener('click', () => this.toggleChat());
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            const window = document.getElementById('chatbotProWindow');
            const button = document.getElementById('chatbotProButton');
            
            if (this.chatOpen && 
                !window.contains(e.target) && 
                !button.contains(e.target)) {
                this.toggleChat();
            }
        });
    }

    showProfessionalWelcome() {
        localStorage.setItem('luxurymove_chat_welcomed', 'true');
        
        this.addMessage('bot', `
            <div class="welcome-message">
                <div class="welcome-header">
                    <i class="fas fa-crown welcome-icon"></i>
                    <h3>Xin chào Quý khách!</h3>
                </div>
                <p>Tôi là <strong>Trợ lý ảo LuxuryMove</strong> - được huấn luyện để hỗ trợ bạn 24/7.</p>
                <div class="welcome-features">
                    <div class="feature-item">
                        <i class="fas fa-check-circle"></i>
                        <span>Tư vấn dịch vụ cao cấp</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-check-circle"></i>
                        <span>Báo giá tham khảo nhanh</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-check-circle"></i>
                        <span>Kết nối đội ngũ chuyên nghiệp</span>
                    </div>
                </div>
                <p class="welcome-note">Để được tư vấn <strong>chính xác và cá nhân hóa</strong>, vui lòng cung cấp số điện thoại.</p>
            </div>
        `);
        
        this.showNotification('Có tin nhắn mới');
    }



    addMessage(sender, htmlContent) {
        const messagesDiv = document.getElementById('chatProMessages');
        const messageDiv = document.createElement('div');
        
        messageDiv.className = `chat-pro-message ${sender}-message`;
        messageDiv.innerHTML = htmlContent;
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        // Save to history
        this.messages.push({
            sender,
            content: htmlContent,
            time: new Date().toISOString()
        });
        
        this.saveConversationHistory();
    }

    sendMessage() {
        const input = document.getElementById('chatProInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addMessage('user', `
            <div class="user-message-content">
                <strong>Bạn:</strong> ${this.escapeHtml(message)}
            </div>
        `);
        
        input.value = '';
        
        // Process after delay
        setTimeout(() => {
            this.processProfessionalMessage(message);
        }, 600);
    }

    quickAction(action) {
        const actions = {
            'pricing': 'Tôi muốn xem bảng giá dịch vụ',
            'booking': 'Tôi muốn đặt xe dịch vụ',
            'contact': 'Tôi cần liên hệ tư vấn ngay'
        };
        
        document.getElementById('chatProInput').value = actions[action];
        this.sendMessage();
    }

    async processProfessionalMessage(message) {
        const lowerMsg = message.toLowerCase();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Remove typing indicator
        this.hideTypingIndicator();
        
        // Route to appropriate handler
        if (this.isPricingRequest(lowerMsg)) {
            await this.handlePricingRequest();
            
        } else if (this.isBookingRequest(lowerMsg)) {
            await this.handleBookingRequest();
            
        } else if (this.isContactRequest(lowerMsg)) {
            await this.handleContactRequest();
            
        } else if (this.isThankYou(lowerMsg)) {
            this.handleThankYou();
            
        } else {
            await this.handleGeneralInquiry(message);
        }
    }

    showTypingIndicator() {
        const messagesDiv = document.getElementById('chatProMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
            <span class="typing-text">Trợ lý đang soạn tin nhắn...</span>
        `;
        messagesDiv.appendChild(typingDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    hideTypingIndicator() {
        const typing = document.getElementById('typingIndicator');
        if (typing) typing.remove();
    }

    isPricingRequest(message) {
        const keywords = ['giá', 'báo giá', 'chi phí', 'phí', 'bao nhiêu tiền', 'giá cả', 'cost', 'price'];
        return keywords.some(keyword => message.includes(keyword));
    }

    isBookingRequest(message) {
        const keywords = ['đặt xe', 'book', 'đặt lịch', 'thuê xe', 'đón', 'chuyến', 'di chuyển', 'đi lại'];
        return keywords.some(keyword => message.includes(keyword));
    }

    isContactRequest(message) {
        const keywords = ['liên hệ', 'sđt', 'số điện thoại', 'phone', 'gọi lại', 'alo', 'zalo', 'contact'];
        return keywords.some(keyword => message.includes(keyword));
    }

    isThankYou(message) {
        const keywords = ['cảm ơn', 'thanks', 'thank you', 'cám ơn'];
        return keywords.some(keyword => message.includes(keyword));
    }

    async handlePricingRequest() {
        // Start with apology for not giving exact prices
        this.addMessage('bot', `
            <div class="bot-message-content">
                <div class="message-header">
                    <i class="fas fa-exclamation-circle"></i>
                    <strong>Thông tin quan trọng về báo giá</strong>
                </div>
                <p>Xin lỗi Quý khách, <strong>tôi không thể cung cấp giá chính xác</strong> vì:</p>
                <ul class="reason-list">
                    <li>Giá dịch vụ thay đổi theo thời điểm</li>
                    <li>Phụ thuộc vào lộ trình cụ thể</li>
                    <li>Có nhiều chương trình ưu đãi đặc biệt</li>
                    <li>Chi phí nhiên liệu biến động</li>
                </ul>
                <p>Tuy nhiên, tôi có thể cung cấp <strong>bảng giá tham khảo</strong> để bạn hình dung:</p>
            </div>
        `);
        
        // Show reference pricing from GitHub or default
        await this.showReferencePricing();
        
        // Always ask for phone number for accurate pricing
        setTimeout(() => {
            this.askForContactInfo('pricing');
        }, 800);
    }

    async showReferencePricing() {
        let pricingHTML = '';
        
        if (this.servicesData?.services) {
            // Get pricing from GitHub data
            const services = Object.values(this.servicesData.services);
            const sampleServices = services.slice(0, 3); // Show first 3 services
            
            pricingHTML = `
                <div class="pricing-reference">
                    <div class="pricing-header">
                        <i class="fas fa-file-invoice-dollar"></i>
                        <h4>Bảng giá tham khảo (cập nhật từ hệ thống)</h4>
                    </div>
                    <div class="pricing-items">
            `;
            
            sampleServices.forEach(service => {
                if (service.pricing && service.pricing.length > 0) {
                    const price = service.pricing[0];
                    pricingHTML += `
                        <div class="pricing-item">
                            <span class="service-name">${service.title}</span>
                            <span class="service-price">${price.price || 'Liên hệ'}</span>
                        </div>
                    `;
                }
            });
            
            pricingHTML += `
                    </div>
                    <p class="pricing-note"><i class="fas fa-info-circle"></i> Giá trên chỉ mang tính tham khảo</p>
                </div>
            `;
            
        } else {
            // Default pricing
            pricingHTML = `
                <div class="pricing-reference">
                    <div class="pricing-header">
                        <i class="fas fa-file-invoice-dollar"></i>
                        <h4>Bảng giá tham khảo</h4>
                    </div>
                    <div class="pricing-items">
                        <div class="pricing-item">
                            <span class="service-name">Đưa đón sân bay</span>
                            <span class="service-price">Từ 450,000 VND</span>
                        </div>
                        <div class="pricing-item">
                            <span class="service-name">Tour du lịch 1 ngày</span>
                            <span class="service-price">Từ 1,200,000 VND</span>
                        </div>
                        <div class="pricing-item">
                            <span class="service-name">Thuê xe có tài xế</span>
                            <span class="service-price">Từ 350,000 VND/giờ</span>
                        </div>
                    </div>
                    <p class="pricing-note"><i class="fas fa-info-circle"></i> Giá chưa bao gồm VAT & phụ phí</p>
                </div>
            `;
        }
        
        this.addMessage('bot', pricingHTML);
    }

    askForContactInfo(context = 'general') {
        const contextMessages = {
            'pricing': 'Để nhận <strong>báo giá chính xác và ưu đãi tốt nhất</strong>, vui lòng để lại số điện thoại.',
            'booking': 'Để <strong>đặt xe nhanh chóng và xác nhận lịch trình</strong>, chúng tôi cần số điện thoại của bạn.',
            'general': 'Để được <strong>tư vấn chuyên nghiệp và hỗ trợ tốt nhất</strong>, xin vui lòng cung cấp số điện thoại.'
        };
        
        this.addMessage('bot', `
            <div class="contact-request">
                <div class="contact-header">
                    <i class="fas fa-phone-volume"></i>
                    <h4>Kết nối với chuyên viên</h4>
                </div>
                <p>${contextMessages[context] || contextMessages['general']}</p>
                <p><strong>Chúng tôi cam kết:</strong></p>
                <ul class="commitment-list">
                    <li>📞 Gọi lại trong <strong>3 phút</strong></li>
                    <li>💰 Báo giá <strong>cạnh tranh nhất</strong></li>
                    <li>👔 Tư vấn bởi <strong>chuyên viên LuxuryMove</strong></li>
                    <li>⏰ Hỗ trợ <strong>24/7</strong></li>
                </ul>
                
                <div class="contact-options">
                    <button class="contact-option-btn primary" onclick="chatbotPro.showPhoneForm()">
                        <i class="fas fa-mobile-alt"></i>
                        <span>Để lại số điện thoại</span>
                    </button>
                    <button class="contact-option-btn secondary" onclick="window.location.href='tel:0931243679'">
                        <i class="fas fa-phone"></i>
                        <span>Gọi ngay: 0931.243.679</span>
                    </button>
                    <button class="contact-option-btn secondary" onclick="window.open('https://zalo.me/0931243679')">
                        <i class="fab fa-facebook-messenger"></i>
                        <span>Nhắn tin Zalo</span>
                    </button>
                </div>
            </div>
        `);
    }

    showPhoneForm() {
        this.addMessage('bot', `
            <div class="phone-form-container">
                <div class="phone-form-header">
                    <i class="fas fa-user-check"></i>
                    <h4>Thông tin liên hệ</h4>
                </div>
                <p>Vui lòng điền thông tin để chuyên viên liên hệ:</p>
                
                <div class="form-group">
                    <label for="proPhoneInput"><i class="fas fa-mobile-alt"></i> Số điện thoại *</label>
                    <input type="tel" id="proPhoneInput" placeholder="0931.243.679" 
                           pattern="[0-9]{10,11}" maxlength="11">
                </div>
                
                <div class="form-group">
                    <label for="proNameInput"><i class="fas fa-user"></i> Tên của bạn</label>
                    <input type="text" id="proNameInput" placeholder="Nguyễn Văn A">
                </div>
                
                <div class="form-group">
                    <label for="proServiceSelect"><i class="fas fa-car"></i> Dịch vụ quan tâm</label>
                    <select id="proServiceSelect">
                        <option value="">Chọn dịch vụ</option>
                        <option value="airport">Đưa đón sân bay</option>
                        <option value="tour">Tour du lịch</option>
                        <option value="business">Dịch vụ doanh nghiệp</option>
                        <option value="rental">Thuê xe có tài xế</option>
                        <option value="wedding">Xe cưới & sự kiện</option>
                        <option value="other">Dịch vụ khác</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button class="form-submit-btn" onclick="chatbotPro.submitContactForm()">
                        <i class="fas fa-paper-plane"></i>
                        Gửi thông tin
                    </button>
                    <button class="form-cancel-btn" onclick="chatbotPro.cancelContactForm()">
                        Hủy bỏ
                    </button>
                </div>
                
                <p class="form-note">
                    <i class="fas fa-shield-alt"></i>
                    Thông tin được bảo mật tuyệt đối
                </p>
            </div>
        `);
        
        // Auto focus
        setTimeout(() => {
            document.getElementById('proPhoneInput')?.focus();
        }, 100);
    }

    async submitContactForm() {
        const phone = document.getElementById('proPhoneInput')?.value.trim();
        const name = document.getElementById('proNameInput')?.value.trim();
        const service = document.getElementById('proServiceSelect')?.value;
        
        if (!phone || !/^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/.test(phone)) {
            this.addMessage('bot', `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Vui lòng nhập số điện thoại hợp lệ (10-11 số, bắt đầu bằng 0)</strong>
                </div>
            `);
            return;
        }
        
        // Save user info
        this.userPhone = phone;
        this.userName = name;
        localStorage.setItem('luxurymove_user_phone', phone);
        if (name) localStorage.setItem('luxurymove_user_name', name);
        
        // Remove form
        const form = document.querySelector('.phone-form-container');
        if (form) form.remove();
        
        // Show confirmation
        this.addMessage('bot', `
            <div class="confirmation-message">
                <div class="confirmation-header">
                    <i class="fas fa-check-circle"></i>
                    <h4>✅ Đã ghi nhận thông tin</h4>
                </div>
                <p><strong>Cảm ơn ${name || 'Quý khách'}!</strong></p>
                <p>Chuyên viên LuxuryMove sẽ liên hệ qua số:</p>
                <div class="contact-highlight">
                    <i class="fas fa-phone"></i>
                    <span class="phone-number">${phone}</span>
                </div>
                <p class="confirmation-time">
                    <i class="fas fa-clock"></i>
                    Thời gian: <strong>Trong 3 phút</strong>
                </p>
                <div class="next-steps">
                    <p><strong>Tiếp theo sẽ:</strong></p>
                    <ol>
                        <li>Chuyên viên gọi xác nhận thông tin</li>
                        <li>Tư vấn chi tiết dịch vụ phù hợp</li>
                        <li>Báo giá ưu đãi đặc biệt</li>
                        <li>Hỗ trợ đặt xe nhanh chóng</li>
                    </ol>
                </div>
                <p class="thank-you-note">Trân trọng cảm ơn sự tin tưởng của Quý khách! ❤️</p>
            </div>
        `);
        
        // Send notification to admin (can be Zalo/Email/SMS)
        await this.notifyAdmin(phone, name, service);
        
        // Update conversation stage
        this.conversationStage = 'closing';
    }

    cancelContactForm() {
        const form = document.querySelector('.phone-form-container');
        if (form) form.remove();
        
        this.addMessage('bot', `
            <div class="cancel-message">
                <p>Không sao cả! Bạn có thể liên hệ bất cứ khi nào:</p>
                <div class="contact-options-inline">
                    <button onclick="window.location.href='tel:0931243679'" class="inline-btn">
                        <i class="fas fa-phone"></i> Gọi ngay
                    </button>
                    <button onclick="window.open('https://zalo.me/0931243679')" class="inline-btn">
                        <i class="fab fa-facebook-messenger"></i> Zalo
                    </button>
                </div>
            </div>
        `);
    }

    async notifyAdmin(phone, name, service) {
        // This is where you would integrate with Zalo API, Email, or SMS
        console.log('📤 Notify admin:', { phone, name, service });
        
        // Example: Send to webhook
        try {
            const webhookData = {
                type: 'new_lead',
                phone: phone,
                name: name || 'Khách hàng',
                service: service || 'general',
                source: 'website_chatbot',
                timestamp: new Date().toISOString(),
                url: window.location.href
            };
            
            // Uncomment to enable webhook
            // await fetch('YOUR_WEBHOOK_URL', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(webhookData)
            // });
            
        } catch (error) {
            console.error('Notification error:', error);
        }
    }

    async handleBookingRequest() {
        this.addMessage('bot', `
            <div class="booking-assistance">
                <div class="booking-header">
                    <i class="fas fa-calendar-check"></i>
                    <h4>Hỗ trợ đặt xe chuyên nghiệp</h4>
                </div>
                <p>Để đặt xe <strong>nhanh chóng và chính xác</strong>, chúng tôi cần:</p>
                <ul class="booking-requirements">
                    <li>📅 Thời gian & địa điểm đón</li>
                    <li>👥 Số lượng hành khách</li>
                    <li>🚗 Loại xe yêu cầu</li>
                    <li>📍 Lộ trình di chuyển</li>
                </ul>
                <p><strong>Quy trình đặt xe LuxuryMove:</strong></p>
                <ol class="booking-process">
                    <li>Tư vấn dịch vụ phù hợp</li>
                    <li>Xác nhận lộ trình chi tiết</li>
                    <li>Báo giá ưu đãi đặc biệt</li>
                    <li>Đặt cọc & xác nhận booking</li>
                    <li>Theo dõi hành trình 24/7</li>
                </ol>
            </div>
        `);
        
        setTimeout(() => {
            this.askForContactInfo('booking');
        }, 1000);
    }

    async handleContactRequest() {
        this.addMessage('bot', `
            <div class="direct-contact">
                <div class="contact-header">
                    <i class="fas fa-comments"></i>
                    <h4>Kênh liên hệ trực tiếp</h4>
                </div>
                <p>Để được hỗ trợ <strong>nhanh nhất và hiệu quả nhất</strong>:</p>
                
                <div class="contact-channels">
                    <div class="channel-card primary">
                        <div class="channel-icon">
                            <i class="fas fa-phone"></i>
                        </div>
                        <div class="channel-info">
                            <h5>Gọi điện trực tiếp</h5>
                            <p class="channel-detail">0931.243.679</p>
                            <p class="channel-note">Phản hồi ngay lập tức</p>
                        </div>
                        <button class="channel-action" onclick="window.location.href='tel:0931243679'">
                            Gọi ngay
                        </button>
                    </div>
                    
                    <div class="channel-card">
                        <div class="channel-icon">
                            <i class="fab fa-facebook-messenger"></i>
                        </div>
                        <div class="channel-info">
                            <h5>Zalo Official</h5>
                            <p class="channel-detail">0931.243.679</p>
                            <p class="channel-note">Nhắn tin miễn phí</p>
                        </div>
                        <button class="channel-action" onclick="window.open('https://zalo.me/0931243679')">
                            Mở Zalo
                        </button>
                    </div>
                    
                    <div class="channel-card">
                        <div class="channel-icon">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="channel-info">
                            <h5>Email chuyên nghiệp</h5>
                            <p class="channel-detail">contact@luxurymove.vn</p>
                            <p class="channel-note">Phản hồi trong 1h</p>
                        </div>
                        <button class="channel-action" onclick="window.location.href='mailto:contact@luxurymove.vn'">
                            Gửi Email
                        </button>
                    </div>
                </div>
                
                <div class="contact-note">
                    <i class="fas fa-clock"></i>
                    <span>Đội ngũ hỗ trợ làm việc <strong>24/7</strong> kể cả cuối tuần & ngày lễ</span>
                </div>
            </div>
        `);
    }

    handleThankYou() {
        this.addMessage('bot', `
            <div class="thank-you-response">
                <div class="thank-you-header">
                    <i class="fas fa-heart"></i>
                    <h4>Trân trọng cảm ơn!</h4>
                </div>
                <p>Rất vui được phục vụ Quý khách! ❤️</p>
                <p>Nếu cần hỗ trợ thêm, chúng tôi luôn sẵn sàng:</p>
                <div class="thank-you-contacts">
                    <p><strong>📞 Hotline:</strong> 0931.243.679</p>
                    <p><strong>💬 Zalo:</strong> 0931.243.679</p>
                    <p><strong>📧 Email:</strong> contact@luxurymove.vn</p>
                </div>
                <p class="closing-note">Chúc Quý khách một ngày tốt lành! 🚗💨</p>
            </div>
        `);
    }

    async handleGeneralInquiry(message) {
        this.addMessage('bot', `
            <div class="general-response">
                <div class="response-header">
                    <i class="fas fa-lightbulb"></i>
                    <h4>Cảm ơn câu hỏi của bạn!</h4>
                </div>
                <p>Tôi hiểu bạn đang hỏi về: <strong>"${this.escapeHtml(message)}"</strong></p>
                <p>Để cung cấp thông tin <strong>chính xác và hữu ích nhất</strong>, tôi cần kết nối bạn với chuyên viên tư vấn.</p>
                
                <div class="expert-benefits">
                    <p><strong>Lợi ích khi tư vấn với chuyên viên:</strong></p>
                    <ul>
                        <li>✅ Thông tin cập nhật mới nhất</li>
                        <li>✅ Tư vấn cá nhân hóa theo nhu cầu</li>
                        <li>✅ Báo giá chính xác với ưu đãi đặc biệt</li>
                        <li>✅ Hỗ trợ đặt dịch vụ nhanh chóng</li>
                    </ul>
                </div>
            </div>
        `);
        
        setTimeout(() => {
            this.askForContactInfo('general');
        }, 1000);
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveConversationHistory() {
        const history = {
            messages: this.messages.slice(-50), // Keep last 50 messages
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('luxurymove_conversation_history', JSON.stringify(history));
    }

    loadConversationHistory() {
        const saved = localStorage.getItem('luxurymove_conversation_history');
        if (saved && this.messages.length === 0) {
            try {
                const history = JSON.parse(saved);
                history.messages.forEach(msg => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `chat-pro-message ${msg.sender}-message`;
                    messageDiv.innerHTML = msg.content;
                    document.getElementById('chatProMessages').appendChild(messageDiv);
                });
                
                this.messages = history.messages;
            } catch (e) {
                console.error('Load history error:', e);
            }
        }
    }
    // Thêm vào chatbot-pro.js trong constructor hoặc init()
createSparkles() {
    const icon = document.querySelector('.chatbot-pro-icon');
    if (!icon) return;
    
    // Tạo sparkles động
    for (let i = 0; i < 6; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        
        // Random position
        const angle = (Math.PI * 2 * i) / 6;
        const radius = 20;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        
        sparkle.style.left = `${x}%`;
        sparkle.style.top = `${y}%`;
        sparkle.style.animationDelay = `${i * 0.3}s`;
        
        icon.appendChild(sparkle);
    }
}


}

// Initialize chatbot
const chatbotPro = new LuxuryMoveProChatbot();

// Start when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => chatbotPro.init());
} else {
    chatbotPro.init();
}

// Make available globally
window.chatbotPro = chatbotPro;
