// ===== CONFIGURATION =====
const APP_CONFIG = {
    phoneNumber: '0236.xxx.xxx',
    companyName: 'LuxuryMove',
    supportEmail: 'info@luxurymove.vn',
    supportHours: '24/7'
};

// ===== SERVICE DETAILS DATA =====
const SERVICE_DETAILS = {
    'airport': {
        title: 'Đưa Đón Sân Bay - Trải Nghiệm Toàn Diện',
        subtitle: 'Không chỉ là đón/trả, mà là sự chăm sóc chu đáo',
        icon: 'fas fa-plane',
        description: 'Chúng tôi không chỉ đưa bạn đến sân bay. Chúng tôi đồng hành cùng bạn từ khi rời nhà đến khi lên máy bay, với sự quan tâm đến từng chi tiết nhỏ.',
        features: [
            'Theo dõi giờ bay thực tế để điều chỉnh giờ đón hợp lý',
            'Tài xế có thể giao tiếp tiếng Anh/Hàn/Trung cơ bản',
            'Nhận diện chuyến bay, hỗ trợ tìm cổng check-in',
            'Mang vác hành lý miễn phí (tối đa 20kg/hành khách)',
            'Thông báo tình hình giao thông để bạn yên tâm',
            'Đón muộn miễn phí nếu chuyến bay delay dưới 1 giờ'
        ],
        pricing: [
            { label: 'Cam Ranh → Nha Trang (tiêu chuẩn)', price: '450,000 VND' },
            { label: 'Liên Khương → Đà Lạt (tiêu chuẩn)', price: '400,000 VND' },
            { label: 'Theo giờ có hỗ trợ đặc biệt', price: '400,000 VND/giờ' }
        ]
    },
    'tour': {
        title: 'Tour Du Lịch - Hành Trình Đáng Nhớ',
        subtitle: 'Không chỉ là xe, mà là người bạn đồng hành',
        icon: 'fas fa-map-marked-alt',
        description: 'Tài xế không chỉ lái xe an toàn, mà còn là người am hiểu địa phương, sẵn sàng chia sẻ và hỗ trợ để chuyến đi của bạn trọn vẹn.',
        features: [
            'Gợi ý điểm ăn uống ngon, giá hợp lý của địa phương',
            'Hỗ trợ chụp ảnh tại các điểm đến đẹp',
            'Biết đường tắt, tránh kẹt xe giờ cao điểm',
            'Hiểu phong tục, văn hóa từng địa phương',
            'Linh hoạt thay đổi lịch trình theo yêu cầu',
            'Chỉ đường đến các điểm vệ sinh công cộng sạch sẽ'
        ],
        pricing: [
            { label: 'Tour Nha Trang 1 ngày (8h)', price: '1,200,000 VND' },
            { label: 'Tour Đà Lạt 1 ngày (8h)', price: '1,500,000 VND' },
            { label: 'Tour Phan Thiết 2 ngày 1 đêm', price: '2,800,000 VND' }
        ]
    },
    'business': {
        title: 'Dịch Vụ Doanh Nghiệp - Chuyên Nghiệp Từ Chi Tiết',
        subtitle: 'Từ xe cộ đến giấy tờ, tất cả đều chuẩn chỉnh',
        icon: 'fas fa-briefcase',
        description: 'Hiểu rõ nhu cầu của doanh nghiệp: tính chuyên nghiệp, minh bạch và tiện lợi trong mọi thủ tục.',
        features: [
            'Xe biển trắng, biển số đẹp (68, 78, 88, 99...)',
            'Xuất hóa đơn VAT đầy đủ trong vòng 24h',
            'Báo cáo chi tiết định kỳ: ngày, tháng, quý',
            'Tài xế mặc vest, giao tiếp chuyên nghiệp',
            'Có thể đổi xe giữa chừng nếu cần thiết',
            'Hợp đồng linh hoạt, thanh toán đa dạng'
        ],
        pricing: [
            { label: 'Đón tiếp khách/đối tác', price: '500,000 VND/chuyến' },
            { label: 'Thuê xe hội nghị theo ngày', price: '1,500,000 VND/ngày' },
            { label: 'Hợp đồng tháng cho doanh nghiệp', price: 'Liên hệ tư vấn' }
        ]
    },
    'rental': {
        title: 'Thuê Xe Có Tài Xế - Linh Hoạt & Tiện Lợi',
        subtitle: 'Đa dạng dòng xe cho mọi nhu cầu',
        icon: 'fas fa-key',
        description: 'Dịch vụ thuê xe có tài xế chuyên nghiệp, đảm bảo an toàn và thoải mái cho mọi hành trình.',
        features: [
            'Kiểm tra xe kỹ lưỡng trước mỗi chuyến đi',
            'Hỗ trợ kỹ thuật 24/7 qua điện thoại',
            'Điểm đón/trả linh hoạt trong thành phố',
            'Tài xế kinh nghiệm, thông thạo đường xá',
            'Xe đời mới, vệ sinh sạch sẽ trước mỗi chuyến',
            'Báo giá minh bạch, không phát sinh'
        ],
        pricing: [
            { label: 'Xe 4 chỗ (8h/80km)', price: '800,000 VND' },
            { label: 'Xe 7 chỗ (8h/80km)', price: '1,200,000 VND' },
            { label: 'Xe 16 chỗ (8h/80km)', price: '1,800,000 VND' }
        ]
    },
    'mountain': {
        title: 'Vận Chuyển Liên Tỉnh - An Toàn Trên Mọi Cung Đường',
        subtitle: 'Đặc biệt an toàn cho đường đèo dốc',
        icon: 'fas fa-mountain',
        description: 'Chuyên vận chuyển liên tỉnh với đội ngũ tài xế giàu kinh nghiệm, am hiểu địa hình và thời tiết.',
        features: [
            'Điểm nghỉ an toàn theo yêu cầu của hành khách',
            'Túi y tế cơ bản luôn có sẵn trên xe',
            'Wi-fi di động (có yêu cầu trước)',
            'Tài xế được đào tạo lái xe đường đèo an toàn',
            'Theo dõi thời tiết để chọn thời điểm di chuyển phù hợp',
            'Hỗ trợ tìm chỗ nghỉ qua đêm nếu cần'
        ],
        pricing: [
            { label: 'Nha Trang → Đà Lạt', price: '1,500,000 VND' },
            { label: 'Nha Trang → Phan Thiết', price: '1,800,000 VND' },
            { label: 'Đà Lạt → Phan Rang', price: '1,200,000 VND' }
        ]
    },
    'wedding': {
        title: 'Xe Hoa & Sự Kiện - Trọn Vẹn Ngày Trọng Đại',
        subtitle: 'Đẹp, đúng giờ và tràn đầy cảm xúc',
        icon: 'fas fa-heart',
        description: 'Đội xe sang trọng, trang trí tinh tế và tài xế lịch sự cho ngày trọng đại của bạn.',
        features: [
            'Trang trí hoa tươi theo phong cách đám cưới',
            'Tài xế mặc vest, am hiểu phong tục cưới hỏi',
            'Dù che mưa/nắng đột xuất luôn sẵn sàng',
            'Đúng giờ tuyệt đối theo lịch trình cưới',
            'Lái xe êm ái, đảm bảo váy cô dâu không nhăn',
            'Hỗ trợ sắp xếp lộ trình hợp lý cho đoàn xe'
        ],
        pricing: [
            { label: 'Xe cưới 4-6 chỗ (4h)', price: '1,500,000 VND' },
            { label: 'Xe cưới 7 chỗ (4h)', price: '2,000,000 VND' },
            { label: 'Xe đoàn cưới (tối thiểu 3 xe)', price: 'Liên hệ tư vấn' }
        ]
    },
    'student': {
        title: 'Đưa Đón Học Sinh - An Toàn Là Trên Hết',
        subtitle: 'Như người thân đưa đón con em bạn',
        icon: 'fas fa-school',
        description: 'Dịch vụ dành riêng cho học sinh với tiêu chí an toàn tuyệt đối và sự quan tâm như người thân.',
        features: [
            'Điểm đón/trả chi tiết đến từng nhà',
            'Thông báo SMS khi đến trường và về nhà',
            'Ghế an toàn trẻ em đạt chuẩn',
            'Tài xế được training về ứng xử với trẻ em',
            'Kiểm tra đồ đạc học sinh trước khi xuống xe',
            'Liên lạc trực tiếp với phụ huynh khi cần'
        ],
        pricing: [
            { label: 'Đưa đón cố định theo tháng (1 chiều)', price: 'Liên hệ tư vấn' },
            { label: 'Đưa đón cố định theo tháng (2 chiều)', price: 'Liên hệ tư vấn' },
            { label: 'Thuê xe dã ngoại học sinh', price: '1,000,000 VND/ngày' }
        ]
    },
    'medical': {
        title: 'Vận Chuyển Y Tế - Chu Đáo Và An Toàn',
        subtitle: 'Hiểu và chia sẻ nỗi lo của bệnh nhân',
        icon: 'fas fa-ambulance',
        description: 'Dịch vụ đặc biệt dành cho bệnh nhân và người nhà, với sự quan tâm đặc biệt đến sức khỏe và tâm lý.',
        features: [
            'Vệ sinh xe khử khuẩn trước mỗi chuyến',
            'Hỗ trợ bệnh nhân lên/xuống xe an toàn',
            'Tài xế thông thạo đường đến các bệnh viện',
            'Lái xe êm ái, tránh ổ gà, giảm xóc',
            'Có sẵn túi nôn và các dụng cụ y tế cơ bản',
            'Hiểu và tôn trọng không gian riêng tư bệnh nhân'
        ],
        pricing: [
            { label: 'Vận chuyển trong thành phố', price: '300,000 VND/chuyến' },
            { label: 'Vận chuyển liên tỉnh (y tế)', price: 'Liên hệ tư vấn' },
            { label: 'Thuê xe theo ngày cho gia đình bệnh nhân', price: '800,000 VND/ngày' }
        ]
    }
};

// ===== DOM ELEMENTS =====
const DOM = {
    // Forms
    bookingForm: document.getElementById('bookingForm'),
    serviceTypeSelect: document.getElementById('serviceType'),
    phoneNumberInput: document.getElementById('phoneNumber'),
    
    // Navigation
    tabItems: document.querySelectorAll('.tab-item'),
    bottomTabBar: document.querySelector('.bottom-tab-bar'),
    hamburger: document.querySelector('.hamburger'),
    mainNav: document.getElementById('mainNav'),
    
    // Service Elements
    serviceCards: document.querySelectorAll('.service-card'),
    serviceDetailsModal: document.getElementById('serviceDetails'),
    closeDetailsBtn: document.getElementById('closeDetails'),
    detailTitle: document.getElementById('detailTitle'),
    detailSubtitle: document.getElementById('detailSubtitle'),
    detailContent: document.getElementById('detailContent'),
    
    // Toggle Elements
    toggleServicesBtn: document.getElementById('toggleServicesBtn'),
    mainServicesGrid: document.getElementById('mainServicesGrid'),
    additionalServicesGrid: document.getElementById('additionalServicesGrid'),
    
    // Other Elements
    phoneBtn: document.querySelector('.phone-btn'),
    benefitCards: document.querySelectorAll('.benefit-card')
};

// ===== STATE MANAGEMENT =====
let state = {
    isServicesExpanded: false,
    currentActiveSection: 'hero',
    isMobileView: window.innerWidth <= 767
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
    // Throttle function for performance
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Debounce function for resize events
    debounce: function(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },

    // Format phone number
    formatPhoneNumber: function(phone) {
        return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1.$2.$3');
    },

    // Validate phone number
    isValidPhone: function(phone) {
        const phoneRegex = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;
        return phoneRegex.test(phone);
    },

    // Show notification
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('notification-hide');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('notification-hide');
            setTimeout(() => notification.remove(), 300);
        });

        // Add styles if not exists
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: var(--card-black);
                    border: 1px solid var(--divider);
                    border-radius: 10px;
                    padding: 15px 20px;
                    min-width: 300px;
                    max-width: 400px;
                    z-index: 9999;
                    animation: slideIn 0.3s ease;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
                }
                .notification-success {
                    border-left: 4px solid var(--success);
                }
                .notification-info {
                    border-left: 4px solid var(--champagne);
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--text-primary);
                }
                .notification-content i {
                    font-size: 20px;
                }
                .notification-success .notification-content i {
                    color: var(--success);
                }
                .notification-info .notification-content i {
                    color: var(--champagne);
                }
                .notification-close {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    color: var(--text-tertiary);
                    cursor: pointer;
                    font-size: 14px;
                }
                .notification-hide {
                    animation: slideOut 0.3s ease forwards;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
};

// ===== SERVICE DETAILS MODAL =====
const ServiceModal = {
    init: function() {
        if (!DOM.serviceDetailsModal) return;

        // Close modal events
        DOM.serviceDetailsModal.addEventListener('click', (e) => {
            if (e.target === DOM.serviceDetailsModal) {
                this.close();
            }
        });

        DOM.closeDetailsBtn?.addEventListener('click', () => this.close());

        // Close with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && DOM.serviceDetailsModal.classList.contains('active')) {
                this.close();
            }
        });
    },

    open: function(serviceType) {
        const service = SERVICE_DETAILS[serviceType] || SERVICE_DETAILS['airport'];
        if (!service) return;

        // Update modal content
        DOM.detailTitle.textContent = service.title;
        DOM.detailSubtitle.textContent = service.subtitle;

        // Create modal content HTML
        const contentHTML = this.createModalContent(service);
        DOM.detailContent.innerHTML = contentHTML;

        // Show modal
        DOM.serviceDetailsModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Add event listeners to modal buttons
        setTimeout(() => {
            const closeBtn = document.getElementById('closeDetailsBtn');
            const bookBtn = document.getElementById('bookThisService');

            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }

            if (bookBtn) {
                bookBtn.addEventListener('click', () => {
                    this.close();
                    setTimeout(() => {
                        this.scrollToBooking(serviceType);
                    }, 300);
                });
            }
        }, 10);
    },

    createModalContent: function(service) {
        return `
            <div class="details-image">
                <i class="${service.icon}"></i>
            </div>
            
            <div class="details-description">
                ${service.description}
            </div>
            
            <div class="details-features">
                <h4 class="features-title">Trải nghiệm thực tế</h4>
                <ul class="features-list">
                    ${service.features.map(feature => `
                        <li>
                            <i class="fas fa-check feature-icon"></i>
                            <span>${feature}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="pricing-info">
                <h4 class="pricing-title">Bảng giá tham khảo</h4>
                ${service.pricing.map(item => `
                    <div class="price-item">
                        <span class="price-label">${item.label}</span>
                        <span class="price-value">${item.price}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="details-actions">
                <button class="btn btn-outline" id="closeDetailsBtn">
                    <i class="fas fa-times"></i> Đóng
                </button>
                <button class="btn btn-primary" id="bookThisService">
                    <i class="fas fa-calendar-alt"></i> Đặt ngay
                </button>
            </div>
        `;
    },

    close: function() {
        DOM.serviceDetailsModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear content after animation
        setTimeout(() => {
            DOM.detailContent.innerHTML = '';
        }, 300);
    },

    scrollToBooking: function(serviceType) {
        const bookingSection = document.querySelector('#booking');
        if (bookingSection) {
            bookingSection.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            // Auto-select service in form
            if (DOM.serviceTypeSelect) {
                const options = Array.from(DOM.serviceTypeSelect.options);
                const matchingOption = options.find(option => 
                    option.text.toLowerCase().includes(serviceType.toLowerCase()) ||
                    serviceType.toLowerCase().includes(option.value.toLowerCase())
                );
                
                if (matchingOption) {
                    DOM.serviceTypeSelect.value = matchingOption.value;
                }
            }
        }
    }
};

// ===== SERVICES TOGGLE FUNCTIONALITY =====
const ServicesToggle = {
    init: function() {
        if (!DOM.toggleServicesBtn || !DOM.additionalServicesGrid) return;

        DOM.toggleServicesBtn.addEventListener('click', () => this.toggle());

        // Initialize service cards data attributes
        this.initServiceCards();
    },

    initServiceCards: function() {
        const serviceCards = document.querySelectorAll('.service-card');
        const serviceTypes = ['airport', 'tour', 'business', 'rental', 'mountain', 'wedding', 'student', 'medical'];
        
        serviceCards.forEach((card, index) => {
            if (index < serviceTypes.length && !card.getAttribute('data-service')) {
                card.setAttribute('data-service', serviceTypes[index]);
                
                // Add click handler for service cards
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    const serviceType = card.getAttribute('data-service');
                    
                    // Show service details
                    ServiceModal.open(serviceType);
                    
                    // Update active tab
                    Navigation.updateTabActive('services');
                    
                    // Add ripple effect
                    this.addRippleEffect(e, card);
                });
            }
        });
    },

    toggle: function() {
        state.isServicesExpanded = !state.isServicesExpanded;
        
        if (state.isServicesExpanded) {
            this.expandServices();
        } else {
            this.collapseServices();
        }
    },

    expandServices: function() {
        DOM.additionalServicesGrid.style.display = 'grid';
        setTimeout(() => {
            DOM.additionalServicesGrid.classList.add('showing');
        }, 10);
        
        DOM.toggleServicesBtn.classList.add('active');
        DOM.toggleServicesBtn.querySelector('.toggle-text').textContent = 'Thu gọn';
        
        // Smooth scroll to keep button in view
        setTimeout(() => {
            DOM.toggleServicesBtn.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
    },

    collapseServices: function() {
        DOM.additionalServicesGrid.classList.remove('showing');
        setTimeout(() => {
            DOM.additionalServicesGrid.style.display = 'none';
        }, 300);
        
        DOM.toggleServicesBtn.classList.remove('active');
        DOM.toggleServicesBtn.querySelector('.toggle-text').textContent = 'Khám phá thêm trải nghiệm';
    },

    addRippleEffect: function(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(212, 175, 55, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            top: ${y}px;
            left: ${x}px;
            pointer-events: none;
        `;
        
        element.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
};

// ===== FORM HANDLING =====
const FormHandler = {
    init: function() {
        if (!DOM.bookingForm) return;

        DOM.bookingForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Add input validation
        if (DOM.phoneNumberInput) {
            DOM.phoneNumberInput.addEventListener('input', (e) => this.formatPhoneInput(e));
        }
    },

    handleSubmit: function(e) {
        e.preventDefault();
        
        const serviceType = DOM.serviceTypeSelect ? DOM.serviceTypeSelect.value : '';
        const phone = DOM.phoneNumberInput ? DOM.phoneNumberInput.value.trim() : '';
        
        // Validate form
        if (!this.validateForm(phone)) return;
        
        // Submit form (in real app, this would be an API call)
        this.submitForm(serviceType, phone);
        
        // Reset form
        DOM.bookingForm.reset();
    },

    validateForm: function(phone) {
        if (!phone) {
            Utils.showNotification('Vui lòng nhập số điện thoại', 'info');
            DOM.phoneNumberInput?.focus();
            return false;
        }
        
        if (!Utils.isValidPhone(phone)) {
            Utils.showNotification('Số điện thoại không hợp lệ', 'info');
            DOM.phoneNumberInput?.focus();
            return false;
        }
        
        return true;
    },

    submitForm: function(serviceType, phone) {
        // In a real application, you would send this data to your server
        const serviceName = DOM.serviceTypeSelect?.options[DOM.serviceTypeSelect.selectedIndex]?.text || 'Dịch vụ';
        
        Utils.showNotification(
            `✅ Yêu cầu đã gửi thành công!<br>Dịch vụ: ${serviceName}<br>Số điện thoại: ${Utils.formatPhoneNumber(phone)}<br><br>Chúng tôi sẽ gọi lại cho bạn trong 5 phút.`,
            'success'
        );
        
        // Log to console (for demo purposes)
        console.log('Form submitted:', {
            serviceType,
            phone: Utils.formatPhoneNumber(phone),
            timestamp: new Date().toISOString()
        });
    },

    formatPhoneInput: function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // Limit to 10 digits for Vietnamese phone numbers
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        
        // Format as user types
        if (value.length > 0) {
            if (value.length <= 4) {
                value = value.replace(/(\d{0,4})/, '$1');
            } else if (value.length <= 7) {
                value = value.replace(/(\d{0,4})(\d{0,3})/, '$1.$2');
            } else {
                value = value.replace(/(\d{0,4})(\d{0,3})(\d{0,3})/, '$1.$2.$3');
            }
        }
        
        e.target.value = value;
    }
};

// ===== NAVIGATION =====
const Navigation = {
    init: function() {
        // Tab navigation
        DOM.tabItems?.forEach(tab => {
            tab.addEventListener('click', (e) => this.handleTabClick(e, tab));
        });
        
        // Smooth scroll for anchor links
        this.initSmoothScroll();
        
        // Handle mobile navigation
        this.handleMobileNavigation();
        
        // Handle scroll for tab highlighting
        window.addEventListener('scroll', Utils.throttle(() => this.handleScroll(), 100));
    },

    handleTabClick: function(e, tab) {
        e.preventDefault();
        
        // Update active tab
        DOM.tabItems?.forEach(item => item.classList.remove('active'));
        tab.classList.add('active');
        
        // Get target section
        const targetId = tab.getAttribute('href');
        if (targetId && targetId !== '#') {
            this.scrollToSection(targetId);
        }
    },

    scrollToSection: function(sectionId) {
        const targetSection = document.querySelector(sectionId);
        if (targetSection) {
            const headerHeight = document.querySelector('.app-header')?.offsetHeight || 80;
            const targetPosition = targetSection.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    },

    initSmoothScroll: function() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#!') return;
                
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    const headerHeight = document.querySelector('.app-header')?.offsetHeight || 80;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    },

    handleMobileNavigation: function() {
        // Handle hamburger menu if exists
        if (DOM.hamburger && DOM.mainNav) {
            DOM.hamburger.addEventListener('click', () => {
                DOM.mainNav.classList.toggle('active');
                DOM.hamburger.innerHTML = DOM.mainNav.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
            });
            
            // Close menu when clicking on a link
            document.querySelectorAll('nav a').forEach(link => {
                link.addEventListener('click', () => {
                    DOM.mainNav.classList.remove('active');
                    DOM.hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                });
            });
        }
    },

    handleScroll: function() {
        if (!state.isMobileView) return;
        
        // Find current section based on scroll position
        const sections = document.querySelectorAll('section');
        const scrollPos = window.scrollY + 100;
        
        let currentSection = 'hero';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSection = sectionId || 'hero';
            }
        });
        
        // Update active tab
        DOM.tabItems?.forEach(tab => tab.classList.remove('active'));
        const activeTab = document.querySelector(`.tab-item[href="#${currentSection}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    },

    updateTabActive: function(section) {
        if (!state.isMobileView) return;
        
        DOM.tabItems?.forEach(tab => tab.classList.remove('active'));
        const activeTab = document.querySelector(`.tab-item[href="#${section}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }
};

// ===== MOBILE VIEW HANDLER =====
const MobileHandler = {
    init: function() {
        this.updateMobileView();
        window.addEventListener('resize', Utils.debounce(() => this.handleResize(), 250));
        
        // Handle phone button click
        DOM.phoneBtn?.addEventListener('click', (e) => this.handlePhoneClick(e));
        
        // Handle benefit cards animation
        this.initBenefitCards();
    },

    updateMobileView: function() {
        state.isMobileView = window.innerWidth <= 767;
        
        if (state.isMobileView) {
            DOM.bottomTabBar.style.display = 'block';
            document.body.style.paddingBottom = '70px';
        } else {
            DOM.bottomTabBar.style.display = 'none';
            document.body.style.paddingBottom = '0';
        }
    },

    handleResize: function() {
        this.updateMobileView();
        Navigation.updateTabActive(state.currentActiveSection);
    },

    handlePhoneClick: function(e) {
        // On desktop, show alert instead of calling immediately
        if (!state.isMobileView) {
            e.preventDefault();
            Utils.showNotification(
                `📞 Vui lòng gọi: ${APP_CONFIG.phoneNumber}<br><br>Đội ngũ ${APP_CONFIG.companyName} luôn sẵn sàng phục vụ!`,
                'info'
            );
        }
    },

    initBenefitCards: function() {
        DOM.benefitCards?.forEach(card => {
            card.addEventListener('click', function() {
                // Add click animation
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
            });
        });
    }
};

// ===== ANIMATION HANDLER =====
const AnimationHandler = {
    init: function() {
        this.initParticles();
        this.initScrollIndicator();
        this.initStaggeredAnimations();
    },

    initParticles: function() {
        const container = document.getElementById('heroParticles');
        if (!container) return;

        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            
            const size = Math.random() * 2 + 1;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const duration = Math.random() * 15 + 10;
            const delay = Math.random() * 3;
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: var(--champagne);
                border-radius: 50%;
                left: ${posX}%;
                top: ${posY}%;
                opacity: ${Math.random() * 0.2 + 0.05};
                animation: particleFloat ${duration}s ease-in-out infinite;
                animation-delay: ${delay}s;
                pointer-events: none;
            `;
            
            container.appendChild(particle);
        }

        // Add particle animation to CSS
        if (!document.getElementById('particle-animation')) {
            const style = document.createElement('style');
            style.id = 'particle-animation';
            style.textContent = `
                @keyframes particleFloat {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 0.1; }
                    50% { transform: translateY(-20px) scale(1.1); opacity: 0.2; }
                }
            `;
            document.head.appendChild(style);
        }
    },

    initScrollIndicator: function() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (!scrollIndicator) return;
        
        scrollIndicator.addEventListener('click', () => {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        });
        
        // Hide on scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                scrollIndicator.style.opacity = '0';
            } else {
                scrollIndicator.style.opacity = '1';
            }
        });
    },

    initStaggeredAnimations: function() {
        const animatedElements = [
            { selector: '.hero-title-container', delay: 300 },
            { selector: '.hero-value-props', delay: 600 },
            { selector: '.hero-elevated', delay: 900 },
            { selector: '.hero-cta', delay: 1200 },
            { selector: '.community-note', delay: 1500 }
        ];
        
        animatedElements.forEach(item => {
            const element = document.querySelector(item.selector);
            if (element) {
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, item.delay);
            }
        });
    }
};

// ===== INITIALIZATION =====
const App = {
    init: function() {
        // Initialize all modules
        ServiceModal.init();
        ServicesToggle.init();
        FormHandler.init();
        Navigation.init();
        MobileHandler.init();
        AnimationHandler.init();
        
        // Set current year in footer
        this.setCurrentYear();
        
        // Add ripple animation to CSS
        this.addRippleAnimation();
        
        console.log(`${APP_CONFIG.companyName} initialized successfully!`);
    },

    setCurrentYear: function() {
        const yearElement = document.querySelector('.copyright-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    },

    addRippleAnimation: function() {
        if (!document.getElementById('ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
};

// ===== START APPLICATION =====
// ===== START APPLICATION =====
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Make functions available globally for debugging (optional)
// Xóa phần kiểm tra process.env.NODE_ENV, chỉ giữ lại cho development
try {
    // Chỉ expose trong development mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.App = App;
        window.Utils = Utils;
        window.SERVICE_DETAILS = SERVICE_DETAILS;
    }
} catch (error) {
    // Ignore errors in production
}

