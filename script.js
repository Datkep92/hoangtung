// DOM Elements
const bookingForm = document.getElementById('bookingForm');
const tabItems = document.querySelectorAll('.tab-item');
const serviceCards = document.querySelectorAll('.service-card');
const benefitCards = document.querySelectorAll('.benefit-card');
const serviceDetailsModal = document.getElementById('serviceDetails');
const closeDetailsBtn = document.getElementById('closeDetails');
const detailTitle = document.getElementById('detailTitle');
const detailSubtitle = document.getElementById('detailSubtitle');
const detailContent = document.getElementById('detailContent');

// Dữ liệu chi tiết dịch vụ
const serviceDetails = {
    'airport': {
        title: 'Đưa Đón Sân Bay',
        subtitle: 'Dịch vụ cao cấp - Đúng giờ - Chuyên nghiệp',
        icon: 'fas fa-plane',
        description: 'Dịch vụ đưa đón sân bay cao cấp với đội xe đời mới và tài xế chuyên nghiệp. Chúng tôi cam kết đón khách đúng giờ, hỗ trợ hành lý và đảm bảo hành trình thoải mái nhất.',
        features: [
            'Đón tận cửa, hỗ trợ hành lý',
            'Xe đời mới, nội thất cao cấp',
            'Tài xế mặc vest, chuyên nghiệp',
            'Theo dõi chuyến đi trực tuyến',
            'Hỗ trợ đa ngôn ngữ (có yêu cầu)',
            'Bảo hiểm hành khách đầy đủ'
        ],
        pricing: [
            { label: 'Sân bay Cam Ranh → Nha Trang', price: '450,000 VND' },
            { label: 'Sân bay Liên Khương → Đà Lạt', price: '400,000 VND' },
            { label: 'Theo giờ (tối thiểu 4h)', price: '350,000 VND/giờ' }
        ]
    },
    'tour': {
        title: 'Du Lịch Biển Đảo',
        subtitle: 'Khám phá vẻ đẹp miền Trung',
        icon: 'fas fa-umbrella-beach',
        description: 'Dịch vụ xe du lịch chuyên nghiệp cho các tour biển đảo tại Khánh Hòa, Ninh Thuận, Phan Thiết. Tài xế am hiểu địa phương, sẵn sàng tư vấn điểm đến hấp dẫn.',
        features: [
            'Thiết kế lịch trình theo yêu cầu',
            'Xe 4-16 chỗ tùy chọn',
            'Tài xế thông thạo địa phương',
            'Hỗ trợ đặt phòng, vé tham quan',
            'Nước uống miễn phí trên xe',
            'Wi-Fi di động (có yêu cầu)'
        ],
        pricing: [
            { label: 'Tour Nha Trang 1 ngày (8h)', price: '1,200,000 VND' },
            { label: 'Tour Phan Rang - Vĩnh Hy', price: '1,500,000 VND' },
            { label: 'Tour Phan Thiết - Mũi Né', price: '2,000,000 VND/ngày' }
        ]
    },
    'business': {
        title: 'Dịch Vụ Doanh Nghiệp',
        subtitle: 'Giải pháp di chuyển chuyên nghiệp',
        icon: 'fas fa-building',
        description: 'Cung cấp giải pháp vận chuyển toàn diện cho doanh nghiệp: đón tiếp khách, đưa đón nhân viên, hội nghị, team building. Hợp đồng linh hoạt, báo cáo chi tiết.',
        features: [
            'Xe hạng sang cho đối tác',
            'Hợp đồng dài hạn linh hoạt',
            'Báo cáo chi tiết hàng tháng',
            'Tài xế chuyên nghiệp, ngoại ngữ',
            'Hỗ trợ 24/7 cho doanh nghiệp',
            'Hóa đơn VAT đầy đủ'
        ],
        pricing: [
            { label: 'Đón tiếp khách/đối tác', price: '500,000 VND/chuyến' },
            { label: 'Đưa đón nhân viên (tháng)', price: 'Liên hệ báo giá' },
            { label: 'Thuê xe hội nghị', price: '800,000 VND/ngày' }
        ]
    },
    'rental': {
        title: 'Thuê Xe Có Tài Xế',
        subtitle: 'Linh hoạt - Tiện lợi - Chuyên nghiệp',
        icon: 'fas fa-car-side',
        description: 'Dịch vụ thuê xe có tài xế chuyên nghiệp cho mọi nhu cầu: công tác, tham quan, sự kiện. Đa dạng dòng xe từ 4 đến 16 chỗ, phù hợp với mọi yêu cầu.',
        features: [
            'Đa dạng dòng xe (4-16 chỗ)',
            'Tài xế kinh nghiệm >5 năm',
            'Đặt xe nhanh trong 30 phút',
            'Hỗ trợ đa điểm đón/trả',
            'Bảo hiểm đầy đủ',
            'Giá cố định, không phát sinh'
        ],
        pricing: [
            { label: 'Xe 4 chỗ (8h/80km)', price: '800,000 VND' },
            { label: 'Xe 7 chỗ (8h/80km)', price: '1,200,000 VND' },
            { label: 'Xe 16 chỗ (8h/80km)', price: '1,800,000 VND' }
        ]
    },
    'mountain': {
        title: 'Tour Cao Nguyên',
        subtitle: 'Khám phá Đà Lạt - Lâm Đồng',
        icon: 'fas fa-mountain',
        description: 'Tour du lịch cao nguyên với các điểm đến hấp dẫn: Đà Lạt, Bảo Lộc, Đơn Dương. Tài xế am hiểu địa hình, an toàn trên mọi cung đường đèo.',
        features: [
            'Chuyên tour cao nguyên',
            'Xe đời mới, an toàn đèo dốc',
            'Tài xế kinh nghiệm địa hình',
            'Thiết kế lịch trình riêng',
            'Điểm dừng chân linh hoạt',
            'Hỗ trợ chụp ảnh (nếu cần)'
        ],
        pricing: [
            { label: 'Tour Đà Lạt 1 ngày', price: '1,500,000 VND' },
            { label: 'Tour Đà Lạt 2 ngày 1 đêm', price: '3,200,000 VND' },
            { label: 'Tour Bảo Lộc - Di Linh', price: '2,000,000 VND/ngày' }
        ]
    },
    'wedding': {
        title: 'Xe Cưới & Sự Kiện',
        subtitle: 'Trọn vẹn ngày trọng đại',
        icon: 'fas fa-glass-cheers',
        description: 'Dịch vụ xe cưới cao cấp cho ngày trọng đại của bạn. Đội xe sang trọng, trang trí theo yêu cầu, tài xế lịch sự và chuyên nghiệp.',
        features: [
            'Xe đời mới, nội thất sang trọng',
            'Trang trí hoa, ruy băng theo yêu cầu',
            'Tài xế mặc vest, lịch sự',
            'Đúng giờ tuyệt đối',
            'Hỗ trợ suốt lộ trình cưới',
            'Chụp ảnh lưu niệm (nếu cần)'
        ],
        pricing: [
            { label: 'Xe cưới 4-6 chỗ (4h)', price: '1,500,000 VND' },
            { label: 'Xe cưới 7 chỗ (4h)', price: '2,000,000 VND' },
            { label: 'Xe đoàn cưới (tối thiểu 3 xe)', price: 'Liên hệ báo giá' }
        ]
    }
};

// Form Submission
if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const serviceType = document.getElementById('serviceType').value;
        const phone = document.getElementById('phoneNumber').value;
        
        if (!phone) {
            alert('Vui lòng nhập số điện thoại');
            return;
        }
        
        // Show success message
        alert(`✅ Yêu cầu đã gửi thành công!\n\nDịch vụ: ${serviceType || 'Tổng đài sẽ tư vấn'}\nSố điện thoại: ${phone}\n\nChúng tôi sẽ gọi lại cho bạn trong 5 phút.`);
        
        // Reset form
        this.reset();
    });
}

// Tab Bar Navigation
tabItems.forEach(tab => {
    tab.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all tabs
        tabItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Get target section
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Service Cards Interaction
serviceCards.forEach(card => {
    card.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Lấy loại dịch vụ từ data attribute
        const serviceType = this.getAttribute('data-service');
        
        // Hiển thị chi tiết dịch vụ
        showServiceDetails(serviceType);
        
        // Cập nhật tab active
        updateTabActive('services');
    });
});

// Benefit Cards Animation
benefitCards.forEach(card => {
    card.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);
    });
});

// Phone Button Click
document.querySelector('.phone-btn')?.addEventListener('click', function(e) {
    if (window.innerWidth > 768) {
        e.preventDefault();
        alert('📞 Vui lòng gọi: 0236.xxx.xxx\n\nĐội ngũ LuxuryMove luôn sẵn sàng phục vụ!');
    }
});

// Hiển thị chi tiết dịch vụ
function showServiceDetails(serviceType) {
    const service = serviceDetails[serviceType] || serviceDetails['airport'];
    
    if (!service) return;
    
    // Cập nhật tiêu đề
    detailTitle.textContent = service.title;
    detailSubtitle.textContent = service.subtitle;
    
    // Tạo nội dung chi tiết
    let contentHTML = `
        <div class="details-image">
            <i class="${service.icon}"></i>
        </div>
        
        <div class="details-description">
            ${service.description}
        </div>
        
        <div class="details-features">
            <h4 class="features-title">Đặc điểm nổi bật</h4>
            <ul class="features-list">
    `;
    
    // Thêm danh sách tính năng
    service.features.forEach(feature => {
        contentHTML += `
            <li>
                <i class="fas fa-check feature-icon"></i>
                <span>${feature}</span>
            </li>
        `;
    });
    
    contentHTML += `
            </ul>
        </div>
        
        <div class="pricing-info">
            <h4 class="pricing-title">Bảng giá tham khảo</h4>
    `;
    
    // Thêm bảng giá
    service.pricing.forEach(item => {
        contentHTML += `
            <div class="price-item">
                <span class="price-label">${item.label}</span>
                <span class="price-value">${item.price}</span>
            </div>
        `;
    });
    
    contentHTML += `
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
    
    // Cập nhật nội dung
    detailContent.innerHTML = contentHTML;
    
    // Hiển thị modal
    serviceDetailsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Thêm event listeners cho các nút trong modal
    setTimeout(() => {
        const closeBtn = document.getElementById('closeDetailsBtn');
        const bookBtn = document.getElementById('bookThisService');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeServiceDetails);
        }
        
        if (bookBtn) {
            bookBtn.addEventListener('click', () => {
                closeServiceDetails();
                setTimeout(() => {
                    document.querySelector('#booking').scrollIntoView({
                        behavior: 'smooth'
                    });
                    // Cập nhật loại dịch vụ trong form
                    const serviceSelect = document.getElementById('serviceType');
                    if (serviceSelect) {
                        serviceSelect.value = serviceType;
                    }
                }, 300);
            });
        }
    }, 10);
}

// Đóng modal chi tiết dịch vụ
function closeServiceDetails() {
    serviceDetailsModal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset animation
    setTimeout(() => {
        detailContent.innerHTML = '';
    }, 300);
}

// Đóng modal khi click overlay
serviceDetailsModal.addEventListener('click', function(e) {
    if (e.target === this) {
        closeServiceDetails();
    }
});

// Đóng modal khi click nút đóng
closeDetailsBtn.addEventListener('click', closeServiceDetails);

// Đóng modal bằng phím ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && serviceDetailsModal.classList.contains('active')) {
        closeServiceDetails();
    }
});

// Hàm cập nhật tab active
function updateTabActive(section) {
    if (window.innerWidth > 767) return;
    
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(item => item.classList.remove('active'));
    
    const activeTab = document.querySelector(`.tab-item[href="#${section}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// Handle Mobile View
function handleMobileView() {
    const isMobile = window.innerWidth <= 767;
    const tabBar = document.querySelector('.bottom-tab-bar');
    
    if (isMobile) {
        tabBar.style.display = 'block';
        document.body.style.paddingBottom = '70px';
    } else {
        tabBar.style.display = 'none';
        document.body.style.paddingBottom = '0';
    }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href') === '#') return;
        
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Add active class to tab based on scroll position
window.addEventListener('scroll', () => {
    if (window.innerWidth > 767) return;
    
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
    
    // Update tab
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(tab => tab.classList.remove('active'));
    
    const activeTab = document.querySelector(`.tab-item[href="#${currentSection}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
});

// Initial call and window resize
handleMobileView();
window.addEventListener('resize', handleMobileView);

// Initialize on DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add data-service attributes if not already present
    const serviceCards = document.querySelectorAll('.service-card');
    const serviceTypes = ['airport', 'tour', 'business', 'rental', 'mountain', 'wedding'];
    
    serviceCards.forEach((card, index) => {
        if (index < serviceTypes.length && !card.getAttribute('data-service')) {
            card.setAttribute('data-service', serviceTypes[index]);
        }
    });
});
