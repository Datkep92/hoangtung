
// Cấu hình GitHub (Mặc định - Sẽ được cập nhật từ LocalStorage)
let githubConfig = {
    username: 'Datkep92',
    repo: 'hoangtung',
    branch: 'main',
    token: '' 
};

// Biến toàn cục
let currentEditingId = null;
let adminToken = 'luxurymove2024'; // Token mặc định
let servicesData = { services: {} };
// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LuxuryMove System Initializing...');
    
    // 1. Tải cấu hình GitHub từ bộ nhớ trình duyệt
    const savedConfig = localStorage.getItem('luxurymove_github_config');
    if (savedConfig) {
        githubConfig = JSON.parse(savedConfig);
    }

    // 2. KIỂM TRA AN TOÀN (Fix lỗi log index.html)
    // Chỉ thực hiện gán textContent nếu phần tử này tồn tại trên trang (Trang Admin)
    const statusLabel = document.getElementById('savedTokenStatus');
    const savedToken = localStorage.getItem('luxurymove_admin_token');
    
    if (statusLabel) { // Chỉ chạy nếu tìm thấy ID trên giao diện
        if (savedToken) {
            statusLabel.textContent = 'Đã ghi nhớ';
            statusLabel.style.color = '#00C851';
        }
    }

    // 3. Khởi chạy ứng dụng
    initApp();
});

// ===== CORE LOGIC =====
async function initApp() {
    try {
        // Thử tải dữ liệu từ GitHub
        const data = await fetchServicesFromGitHub();
        
        if (data) {
            servicesData = data;
            // Lưu dự phòng vào LocalStorage
            localStorage.setItem('luxurymove_services', JSON.stringify(data));
        } else {
            // Nếu GitHub lỗi/không có token, dùng dữ liệu đã lưu lần trước
            const localData = localStorage.getItem('luxurymove_services');
            if (localData) servicesData = JSON.parse(localData);
        }
        
        // Cập nhật giao diện
        renderUI();
    } catch (error) {
        console.error("Lỗi khởi tạo:", error);
    }
}

// Thay thế toàn bộ hàm renderUI() hiện tại bằng:
function renderUI() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;

    // KIỂM TRA: Nếu không có dữ liệu từ GitHub, KHÔNG làm gì cả
    if (!servicesData || !servicesData.services || Object.keys(servicesData.services).length === 0) {
        console.log("ℹ️ Không có dữ liệu từ GitHub, giữ nguyên giao diện mặc định.");
        servicesGrid.innerHTML = ''; // Xóa placeholder
        return; 
    }

    console.log("✅ Đang thay thế giao diện bằng dữ liệu từ GitHub...");
    
    // Xóa placeholder "Đang tải dữ liệu..."
    servicesGrid.innerHTML = '';
    
    // Render từng dịch vụ
    Object.keys(servicesData.services).forEach(id => {
        const item = servicesData.services[id];
        
        // Tạo card với cấu trúc GIỐNG HỆT HTML mặc định
        const card = document.createElement('div');
        card.className = 'service-card';
        card.setAttribute('data-service', id);
        
        // Ảnh đầu tiên trong mảng hoặc ảnh mặc định
        const imageUrl = item.images && item.images.length > 0 
            ? item.images[0] 
            : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=500';
        
        // Lấy 3 features đầu tiên để hiển thị (giống HTML mặc định)
        const features = item.features || [];
        const displayFeatures = features.slice(0, 3);
        
        // HTML GIỐNG HỆT card mặc định
        card.innerHTML = `
            <div class="service-image">
                <img src="${imageUrl}" alt="${item.title}" loading="lazy">
            </div>
            <h3 class="service-name">${item.title || 'Dịch vụ'}</h3>
            <div class="service-experience">
                ${displayFeatures.map(feature => `
                    <div class="experience-item">
                        <i class="fas fa-check"></i> <span>${feature}</span>
                    </div>
                `).join('')}
                ${displayFeatures.length === 0 ? `
                    <div class="experience-item"><i class="fas fa-check"></i> <span>Chất lượng cao cấp</span></div>
                    <div class="experience-item"><i class="fas fa-check"></i> <span>Đúng giờ 100%</span></div>
                    <div class="experience-item"><i class="fas fa-check"></i> <span>Tài xế chuyên nghiệp</span></div>
                ` : ''}
            </div>
            <button class="btn-view-details" onclick="showServiceDetail('${id}')">Chi tiết</button>
        `;
        
        servicesGrid.appendChild(card);
    });
}

// Thêm hàm loadServices() mới để tải dữ liệu
async function loadServices() {
    console.log("🔄 Đang tải dữ liệu dịch vụ từ GitHub...");
    
    try {
        // Tải dữ liệu từ GitHub
        const data = await fetchServicesFromGitHub();
        
        if (data && data.services) {
            servicesData = data;
            console.log("✅ Đã tải được dữ liệu từ GitHub:", Object.keys(data.services).length, "dịch vụ");
            
            // Lưu vào localStorage làm cache
            localStorage.setItem('luxurymove_services', JSON.stringify(data));
            
            // Render giao diện
            renderUI();
        } else {
            // Thử từ localStorage nếu GitHub không có
            const localData = localStorage.getItem('luxurymove_services');
            if (localData) {
                servicesData = JSON.parse(localData);
                console.log("📂 Dùng dữ liệu từ localStorage cache");
                renderUI();
            } else {
                console.log("⚠️ Không có dữ liệu, giữ nguyên giao diện mặc định");
            }
        }
    } catch (error) {
        console.error("❌ Lỗi tải dữ liệu:", error);
    }
}

// Sửa hàm fetchServicesFromGitHub để xử lý lỗi tốt hơn
async function fetchServicesFromGitHub() {
    // Load cấu hình GitHub từ localStorage
    const savedConfig = localStorage.getItem('luxurymove_github_config');
    if (!savedConfig) {
        console.log("ℹ️ Chưa cấu hình GitHub");
        return null;
    }
    
    const githubConfig = JSON.parse(savedConfig);
    if (!githubConfig.token || githubConfig.token === '••••••••••') {
        console.log("ℹ️ Chưa có GitHub token");
        return null;
    }
    
    const path = 'data/services.json';
    const url = `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/${path}?ref=${githubConfig.branch}&t=${Date.now()}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${githubConfig.token}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Đã tải dữ liệu từ GitHub thành công");
            return data;
        } else if (response.status === 404) {
            console.log("📄 File chưa tồn tại trên GitHub");
            return null;
        } else {
            console.error("❌ GitHub API error:", response.status);
            return null;
        }
    } catch (error) {
        console.error("❌ Lỗi kết nối GitHub:", error);
        return null;
    }
}

// Thêm vào script.js - Hàm hiển thị modal chi tiết dịch vụ
function showServiceDetail(serviceId) {
    console.log("📋 Mở chi tiết dịch vụ:", serviceId);
    
    // Lấy dữ liệu dịch vụ
    const service = servicesData.services[serviceId];
    if (!service) {
        console.error("Không tìm thấy dịch vụ:", serviceId);
        return;
    }
    
    // Lấy modal
    const modal = document.getElementById('serviceDetails');
    if (!modal) {
        console.error("Không tìm thấy modal chi tiết");
        return;
    }
    
    // Điền thông tin vào modal
    document.getElementById('detailTitle').textContent = service.title;
    document.getElementById('detailSubtitle').textContent = service.subtitle || service.title;
    
    // Tạo nội dung chi tiết
    const detailContent = document.getElementById('detailContent');
    
    let contentHTML = `
        <div class="details-images">
    `;
    
    // Hiển thị hình ảnh (tối đa 3 ảnh)
    if (service.images && service.images.length > 0) {
        contentHTML += `
            <div class="detail-image-main">
                <img src="${service.images[0]}" alt="${service.title}" loading="lazy">
            </div>
        `;
        
        if (service.images.length > 1) {
            contentHTML += `<div class="detail-image-thumbs">`;
            service.images.slice(1, 4).forEach((img, index) => {
                contentHTML += `
                    <div class="detail-thumb" onclick="changeDetailImage(this, '${img}')">
                        <img src="${img}" alt="${service.title} ${index + 2}" loading="lazy">
                    </div>
                `;
            });
            contentHTML += `</div>`;
        }
    }
    
    contentHTML += `
        </div>
        
        <div class="details-info">
            <h4>Mô tả dịch vụ</h4>
            <p class="detail-description">${service.description || 'Đang cập nhật...'}</p>
            
            <h4>Tính năng nổi bật</h4>
            <div class="detail-features">
    `;
    
    // Hiển thị features
    if (service.features && service.features.length > 0) {
        service.features.forEach(feature => {
            contentHTML += `
                <div class="detail-feature-item">
                    <i class="fas fa-check-circle"></i>
                    <span>${feature}</span>
                </div>
            `;
        });
    }
    
    contentHTML += `
            </div>
            
            <h4>Bảng giá tham khảo</h4>
            <div class="detail-pricing">
    `;
    
    // Hiển thị bảng giá
    if (service.pricing && service.pricing.length > 0) {
        service.pricing.forEach(price => {
            contentHTML += `
                <div class="detail-price-item">
                    <span class="price-label">${price.label}</span>
                    <span class="price-value">${price.price}</span>
                </div>
            `;
        });
    } else {
        contentHTML += `
            <div class="detail-price-item">
                <span class="price-label">Liên hệ để có giá tốt nhất</span>
                <span class="price-value">0931.243.679</span>
            </div>
        `;
    }
    
    contentHTML += `
            </div>
            
            <div class="detail-actions">
                <button class="btn-book-now" onclick="bookThisService('${serviceId}')">
                    <i class="fas fa-calendar-alt"></i> Đặt dịch vụ ngay
                </button>
                <button class="btn-call-now" onclick="window.location.href='tel:0931243679'">
                    <i class="fas fa-phone-alt"></i> Gọi ngay: 0931.243.679
                </button>
            </div>
        </div>
    `;
    
    detailContent.innerHTML = contentHTML;
    
    // Hiển thị modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Thêm hàm phụ trợ cho modal
function changeDetailImage(thumbElement, imageUrl) {
    const mainImage = document.querySelector('.detail-image-main img');
    if (mainImage) {
        mainImage.src = imageUrl;
    }
    
    // Cập nhật active state cho thumbnails
    document.querySelectorAll('.detail-thumb').forEach(thumb => {
        thumb.classList.remove('active');
    });
    thumbElement.classList.add('active');
}

// Hàm đặt dịch vụ từ modal
function bookThisService(serviceId) {
    const service = servicesData.services[serviceId];
    if (!service) return;
    
    // Điền thông tin vào form đặt xe
    const serviceSelect = document.getElementById('serviceType');
    if (serviceSelect) {
        // Tìm option tương ứng hoặc tạo mới
        let found = false;
        for (let option of serviceSelect.options) {
            if (option.text.toLowerCase().includes(service.title.toLowerCase()) ||
                service.title.toLowerCase().includes(option.text.toLowerCase())) {
                serviceSelect.value = option.value;
                found = true;
                break;
            }
        }
        
        if (!found) {
            // Thêm option mới
            const newOption = new Option(service.title, serviceId);
            serviceSelect.add(newOption);
            serviceSelect.value = serviceId;
        }
    }
    
    // Đóng modal
    document.getElementById('serviceDetails').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Cuộn đến form đặt xe
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
        
        // Focus vào trường tên
        setTimeout(() => {
            const nameInput = document.getElementById('customerName');
            if (nameInput) nameInput.focus();
        }, 500);
    }
}

// Thêm CSS cho modal chi tiết (thêm vào style.css hoặc thêm inline)
function addModalStyles() {
    if (!document.getElementById('modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .service-details-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                padding: 20px;
            }
            
            .service-details-container {
                background: var(--card-black);
                border-radius: 16px;
                border: 2px solid var(--champagne);
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
            }
            
            .details-header {
                padding: 20px;
                border-bottom: 1px solid rgba(212, 175, 55, 0.3);
                position: sticky;
                top: 0;
                background: var(--card-black);
                z-index: 10;
            }
            
            .details-header h3 {
                color: var(--champagne);
                font-size: 24px;
                margin-bottom: 5px;
            }
            
            .details-subtitle {
                color: var(--text-tertiary);
                font-size: 14px;
            }
            
            .close-details {
                position: absolute;
                top: 15px;
                right: 15px;
                width: 40px;
                height: 40px;
                background: rgba(0,0,0,0.5);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
                border: 1px solid var(--champagne);
            }
            
            .close-details:hover {
                background: var(--champagne);
                color: #000;
            }
            
            .details-content {
                padding: 20px;
            }
            
            .details-images {
                margin-bottom: 20px;
            }
            
            .detail-image-main {
                width: 100%;
                height: 300px;
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .detail-image-main img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .detail-image-thumbs {
                display: flex;
                gap: 10px;
                overflow-x: auto;
                padding: 10px 0;
            }
            
            .detail-thumb {
                min-width: 80px;
                height: 60px;
                border-radius: 8px;
                overflow: hidden;
                cursor: pointer;
                border: 2px solid transparent;
                transition: all 0.3s;
            }
            
            .detail-thumb:hover,
            .detail-thumb.active {
                border-color: var(--champagne);
            }
            
            .detail-thumb img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .details-info h4 {
                color: var(--champagne);
                margin: 20px 0 10px 0;
                font-size: 18px;
            }
            
            .detail-description {
                color: var(--text-secondary);
                line-height: 1.6;
                margin-bottom: 15px;
            }
            
            .detail-features {
                display: grid;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .detail-feature-item {
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--text-secondary);
            }
            
            .detail-feature-item i {
                color: var(--success);
            }
            
            .detail-pricing {
                background: rgba(212, 175, 55, 0.1);
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 20px;
            }
            
            .detail-price-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            .detail-price-item:last-child {
                border-bottom: none;
            }
            
            .price-label {
                color: var(--text-secondary);
                font-size: 14px;
            }
            
            .price-value {
                color: var(--champagne);
                font-weight: 600;
                font-size: 16px;
            }
            
            .detail-actions {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 25px;
            }
            
            .btn-book-now, .btn-call-now {
                padding: 15px;
                border-radius: 10px;
                border: none;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                font-size: 16px;
                transition: all 0.3s;
            }
            
            .btn-book-now {
                background: var(--champagne);
                color: #000;
            }
            
            .btn-book-now:hover {
                background: var(--light-champagne);
                transform: translateY(-2px);
            }
            
            .btn-call-now {
                background: transparent;
                color: var(--champagne);
                border: 2px solid var(--champagne);
            }
            
            .btn-call-now:hover {
                background: rgba(212, 175, 55, 0.1);
            }
            
            @media (max-width: 768px) {
                .service-details-container {
                    max-height: 95vh;
                }
                
                .detail-image-main {
                    height: 200px;
                }
                
                .detail-actions {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Cập nhật hàm init() để gọi addModalStyles
function init() {
    console.log("🚀 LuxuryMove Website Initializing...");
    
    // Thêm CSS cho modal
    addModalStyles();
    
    // Tải dữ liệu dịch vụ
    loadServices();
    
    // Khởi tạo các event listeners khác
    setupEventListeners();
}
// Thay thế toàn bộ hàm setupEventListeners() bằng:
function setupEventListeners() {
    console.log("🔧 Thiết lập event listeners...");
    
    // Modal chi tiết dịch vụ
    const modal = document.getElementById('serviceDetails');
    const closeBtn = document.getElementById('closeDetails');
    
    if (modal && closeBtn) {
        console.log("✅ Tìm thấy modal và nút đóng");
        
        // Đóng modal khi click nút X - FIX: preventDefault
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("❌ Đóng modal (nút X)");
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        
        // Đóng modal khi click bên ngoài - FIX: chỉ close khi click overlay
        modal.addEventListener('click', function(e) {
            console.log("🎯 Click trong modal:", e.target, e.currentTarget);
            if (e.target === modal) {
                e.preventDefault();
                e.stopPropagation();
                console.log("🎯 Click bên ngoài, đóng modal");
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
        
        // Đóng modal bằng phím ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                console.log("⎋ Nhấn ESC, đóng modal");
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
        
        // Ngăn click trong content đóng modal
        const detailsContainer = document.querySelector('.service-details-container');
        if (detailsContainer) {
            detailsContainer.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log("🛑 Click trong container, không đóng modal");
            });
        }
    } else {
        console.warn("⚠️ Không tìm thấy modal hoặc nút đóng");
    }
    
    // Form đặt xe
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Lấy thông tin từ form
            const serviceType = document.getElementById('serviceType');
            const customerName = document.getElementById('customerName').value;
            const customerPhone = document.getElementById('customerPhone').value;
            
            // Hiển thị thông báo
            const serviceName = serviceType.options[serviceType.selectedIndex].text;
            alert(`✅ Đã gửi yêu cầu thành công!\n\n📞 Chúng tôi sẽ gọi lại số:\n${customerPhone}\n\n📋 Dịch vụ: ${serviceName}\n👤 Tên: ${customerName}\n\n⏳ Thời gian: Trong 3 phút`);
            
            // Reset form
            bookingForm.reset();
        });
    }
    
    // Xử lý nút "Chi tiết" cho tất cả card
    document.addEventListener('click', function(e) {
        // FIX: Kiểm tra đúng nút được click
        if (e.target.classList.contains('btn-view-details') || 
            e.target.closest('.btn-view-details')) {
            
            e.preventDefault();
            e.stopPropagation();
            
            const button = e.target.classList.contains('btn-view-details') 
                ? e.target 
                : e.target.closest('.btn-view-details');
            
            const card = button.closest('.service-card');
            if (card) {
                const serviceType = card.getAttribute('data-service');
                console.log("🟢 Click nút Chi tiết:", serviceType);
                
                if (serviceType) {
                    // Delay nhỏ để tránh event conflict
                    setTimeout(() => {
                        // Kiểm tra xem có dữ liệu từ GitHub không
                        if (servicesData.services && servicesData.services[serviceType]) {
                            // Có dữ liệu từ GitHub
                            showServiceDetail(serviceType);
                        } else {
                            // Dùng dữ liệu mặc định
                            openDefaultServiceDetail(serviceType);
                        }
                    }, 100);
                }
            }
        }
    });
}

// Hàm mở modal cho dịch vụ mặc định (nếu không có dữ liệu từ GitHub)
function openDefaultServiceDetail(serviceType) {
    const modal = document.getElementById('serviceDetails');
    if (!modal) return;
    
    // Lấy thông tin dịch vụ mặc định dựa trên serviceType
    const defaultServices = {
        'airport': {
            title: 'Đưa Đón Sân Bay',
            subtitle: 'Dịch vụ cao cấp - Đúng giờ - Chuyên nghiệp',
            description: 'Dịch vụ đưa đón sân bay cao cấp với đội xe đời mới. Chúng tôi cam kết đón khách đúng giờ, hỗ trợ hành lý và đảm bảo hành trình thoải mái nhất.',
            features: [
                'Đón tận cửa, hỗ trợ hành lý',
                'Xe đời mới, nội thất cao cấp',
                'Tài xế mặc vest, chuyên nghiệp',
                'WiFi miễn phí trên xe',
                'Nước uống miễn phí'
            ]
        },
        'tour': {
            title: 'Du Lịch Biển Đảo',
            subtitle: 'Khám phá vẻ đẹp miền Trung',
            description: 'Dịch vụ xe du lịch chuyên nghiệp cho các tour biển đảo. Tài xế am hiểu địa phương, sẵn sàng tư vấn điểm đến hấp dẫn.',
            features: [
                'Thiết kế lịch trình riêng',
                'Xe 4-16 chỗ tùy chọn',
                'Nước uống miễn phí',
                'Tài xế am hiểu địa phương'
            ]
        }
        // Thêm các dịch vụ mặc định khác...
    };
    
    const service = defaultServices[serviceType] || {
        title: 'Dịch vụ',
        subtitle: 'Dịch vụ cao cấp',
        description: 'Đang cập nhật thông tin chi tiết...',
        features: ['Chất lượng cao cấp', 'Đúng giờ 100%', 'Tài xế chuyên nghiệp']
    };
    
    // Điền thông tin vào modal
    document.getElementById('detailTitle').textContent = service.title;
    document.getElementById('detailSubtitle').textContent = service.subtitle;
    
    const detailContent = document.getElementById('detailContent');
    detailContent.innerHTML = `
        <div class="details-info">
            <h4>Mô tả dịch vụ</h4>
            <p class="detail-description">${service.description}</p>
            
            <h4>Tính năng nổi bật</h4>
            <div class="detail-features">
                ${service.features.map(feature => `
                    <div class="detail-feature-item">
                        <i class="fas fa-check-circle"></i>
                        <span>${feature}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="detail-actions">
                <button class="btn-book-now" onclick="bookDefaultService('${serviceType}')">
                    <i class="fas fa-calendar-alt"></i> Đặt dịch vụ ngay
                </button>
                <button class="btn-call-now" onclick="window.location.href='tel:0931243679'">
                    <i class="fas fa-phone-alt"></i> Gọi ngay: 0931.243.679
                </button>
            </div>
        </div>
    `;
    
    // Hiển thị modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Hàm đặt dịch vụ mặc định
function bookDefaultService(serviceType) {
    const serviceSelect = document.getElementById('serviceType');
    if (serviceSelect) {
        serviceSelect.value = serviceType;
    }
    
    // Đóng modal
    document.getElementById('serviceDetails').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Cuộn đến form đặt xe
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
        
        // Focus vào trường tên
        setTimeout(() => {
            const nameInput = document.getElementById('customerName');
            if (nameInput) nameInput.focus();
        }, 500);
    }
}

// Gọi init() khi trang tải xong
document.addEventListener('DOMContentLoaded', init);


// Hàm phụ để xử lý hiển thị các dòng check (experience) từ subtitle/description
function renderExperience(subtitle) {
    if (!subtitle) return '';
    // Tách các ý bằng dấu phẩy hoặc gạch đầu dòng nếu có
    const items = subtitle.split(','); 
    return items.map(text => `
        <div class="experience-item">
            <i class="fas fa-check"></i> <span>${text.trim()}</span>
        </div>
    `).join('');
}



// Lắng nghe sự kiện đóng Modal
document.addEventListener('click', function(e) {
    const modal = document.getElementById('serviceDetails');
    if (!modal) return;

    if (e.target.id === 'closeDetails' || e.target.closest('#closeDetails') || e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Lắng nghe sự kiện đóng Modal
const closeBtn = document.getElementById('closeDetails');
if (closeBtn) {
    closeBtn.onclick = function() {
        document.getElementById('serviceDetails').style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}
// ===== TOKEN MANAGEMENT =====
function showTokenManager() {
    document.getElementById('tokenModal').style.display = 'flex';
    document.getElementById('currentTokenDisplay').value = 
        localStorage.getItem('luxurymove_admin_token') || 'Chưa có token';
}

function closeTokenModal() {
    document.getElementById('tokenModal').style.display = 'none';
}

function updateToken() {
    const newToken = document.getElementById('newToken').value;
    const confirmToken = document.getElementById('confirmToken').value;
    
    if (!newToken || !confirmToken) {
        showStatus('Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }
    
    if (newToken !== confirmToken) {
        showStatus('Token không khớp', 'error');
        return;
    }
    
    if (newToken.length < 6) {
        showStatus('Token phải có ít nhất 6 ký tự', 'error');
        return;
    }
    
    // Lưu token mới
    localStorage.setItem('luxurymove_admin_token', newToken);
    adminToken = newToken;
    
    showStatus('Đã cập nhật token thành công', 'success');
    closeTokenModal();
    
    // Cập nhật hiển thị
    document.getElementById('savedTokenStatus').textContent = 'Đã lưu';
    document.getElementById('savedTokenStatus').style.color = '#00C851';
}

// ===== LOGIN =====
function handleLogin() {
    const inputToken = document.getElementById('adminToken').value;
    const githubTokenInput = document.getElementById('githubTokenInput').value;
    
    // Kiểm tra token admin
    if (!inputToken) {
        showStatus('Vui lòng nhập token admin', 'error');
        return;
    }
    
    // Kiểm tra token
    if (inputToken !== adminToken) {
        const savedToken = localStorage.getItem('luxurymove_admin_token');
        if (inputToken !== savedToken) {
            showStatus('Token không đúng', 'error');
            return;
        }
        adminToken = inputToken;
    }
    
    // Lưu token admin nếu chưa có
    if (!localStorage.getItem('luxurymove_admin_token')) {
        localStorage.setItem('luxurymove_admin_token', adminToken);
    }
    
    // Lưu GitHub token nếu có
    if (githubTokenInput && githubTokenInput !== '••••••••••') {
        githubConfig.token = githubTokenInput;
        localStorage.setItem('luxurymove_github_config', JSON.stringify(githubConfig));
        document.getElementById('githubTokenInput').value = '••••••••••';
    }
    
    // Hiển thị editor
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('editorSection').style.display = 'block';
    
    // Load dữ liệu
    loadServicesData();
    
    showStatus('Đăng nhập thành công', 'success');
}

// ===== GITHUB CONFIGURATION =====
function loadGitHubConfig() {
    const saved = localStorage.getItem('luxurymove_github_config');
    if (saved) {
        try {
            const config = JSON.parse(saved);
            githubConfig = { ...githubConfig, ...config };
            
            // Update UI nếu các element tồn tại
            if (document.getElementById('githubUsername')) {
                document.getElementById('githubUsername').value = githubConfig.username;
                document.getElementById('githubRepo').value = githubConfig.repo;
                document.getElementById('githubBranch').value = githubConfig.branch;
            }
            
            // Fill token input với placeholder nếu tồn tại
            if (githubConfig.token) {
                const tokenInput = document.getElementById('githubTokenInput');
                const tokenModal = document.getElementById('githubTokenModal');
                if (tokenInput) tokenInput.value = '••••••••••';
                if (tokenModal) tokenModal.value = '••••••••••';
            }
        } catch (e) {
            console.error('Error loading GitHub config:', e);
        }
    }
}

function showGitHubManager() {
    loadGitHubConfig();
    document.getElementById('githubModal').style.display = 'flex';
}

function closeGitHubModal() {
    document.getElementById('githubModal').style.display = 'none';
}

function saveGitHubConfig() {
    const username = document.getElementById('githubUsername').value.trim();
    const repo = document.getElementById('githubRepo').value.trim();
    const branch = document.getElementById('githubBranch').value.trim();
    const token = document.getElementById('githubTokenModal').value.trim();
    
    if (!username || !repo || !branch) {
        showStatus('Vui lòng nhập đầy đủ thông tin GitHub', 'error');
        return;
    }
    
    // Update config
    githubConfig.username = username;
    githubConfig.repo = repo;
    githubConfig.branch = branch;
    
    // Chỉ update token nếu user nhập mới
    if (token && token !== '••••••••••') {
        githubConfig.token = token;
    }
    
    // Lưu vào localStorage
    localStorage.setItem('luxurymove_github_config', JSON.stringify(githubConfig));
    
    // Update token input trong form login
    if (githubConfig.token && document.getElementById('githubTokenInput')) {
        document.getElementById('githubTokenInput').value = '••••••••••';
    }
    
    showStatus('Đã lưu cấu hình GitHub', 'success');
    closeGitHubModal();
}

async function testGitHubConnection() {
    let tokenToUse = githubConfig.token;
    
    // Nếu token chưa có hoặc là placeholder, lấy từ modal
    if (!tokenToUse || tokenToUse === '••••••••••') {
        const tokenInput = document.getElementById('githubTokenModal').value;
        if (tokenInput && tokenInput !== '••••••••••') {
            tokenToUse = tokenInput;
        } else {
            showStatusInModal('Vui lòng nhập GitHub Token', 'error');
            return;
        }
    }
    
    const statusDiv = document.getElementById('githubStatus');
    statusDiv.innerHTML = '<div style="color: var(--champagne);"><i class="fas fa-spinner fa-spin"></i> Đang kiểm tra kết nối...</div>';
    
    try {
        // Test 1: Kiểm tra repo có tồn tại không
        const repoResponse = await fetch(
            `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}`,
            {
                headers: {
                    'Authorization': `token ${tokenToUse}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!repoResponse.ok) {
            if (repoResponse.status === 404) {
                showStatusInModal('Repository không tồn tại', 'error');
            } else if (repoResponse.status === 401) {
                showStatusInModal('Token không hợp lệ', 'error');
            } else {
                showStatusInModal('Lỗi kết nối: ' + repoResponse.status, 'error');
            }
            return;
        }
        
        // Test 2: Kiểm tra quyền đọc/ghi
        const contentResponse = await fetch(
            `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents`,
            {
                headers: {
                    'Authorization': `token ${tokenToUse}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        let message = '';
        if (contentResponse.ok) {
            message = '✅ Kết nối thành công! Có quyền đọc/ghi repository.';
        } else if (contentResponse.status === 404) {
            message = '⚠️ Repository tồn tại nhưng thư mục data chưa có. Sẽ tự động tạo khi lưu.';
        } else {
            message = '❌ Lỗi quyền truy cập: ' + contentResponse.status;
        }
        
        showStatusInModal(message, contentResponse.ok ? 'success' : 'warning');
        
    } catch (error) {
        console.error('GitHub connection error:', error);
        showStatusInModal('❌ Lỗi kết nối: ' + error.message, 'error');
    }
}

function showStatusInModal(message, type = 'info') {
    const statusDiv = document.getElementById('githubStatus');
    const color = type === 'success' ? '#00C851' : 
                  type === 'error' ? '#ff4444' : 
                  type === 'warning' ? '#ffbb33' : 
                  '#D4AF37'; // champagne color
    
    statusDiv.innerHTML = `<div style="color: ${color}; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px;">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    </div>`;
}

// ===== DATA MANAGEMENT =====
async function loadServicesData() {
    showLoading(true);
    
    try {
        // Thử load từ GitHub trước
        let data = null;
        
        if (githubConfig.token && githubConfig.token !== '••••••••••') {
            data = await loadFromGitHub();
        }
        
        // Nếu GitHub fails, thử từ localStorage
        if (!data) {
            data = loadFromLocalStorage();
            if (data) {
                showStatus('Đã tải dữ liệu từ localStorage', data.services ? 'success' : 'warning');
            }
        }
        
        // Nếu vẫn không có data, dùng mặc định
        if (!data) {
            data = { services: getDefaultServices() };
            showStatus('Dùng dữ liệu mặc định', 'warning');
        }
        
        servicesData = data;
        renderServicesList();
        
    } catch (error) {
        console.error('Error loading data:', error);
        showStatus('Lỗi tải dữ liệu: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function loadFromGitHub() {
    if (!githubConfig.token || githubConfig.token === '••••••••••') {
        return null;
    }
    
    try {
        const response = await fetch(
            `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/data/services.json`,
            {
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3.raw'
                }
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            showStatus('Đã tải dữ liệu từ GitHub', 'success');
            return data;
        } else if (response.status === 404) {
            console.log('File chưa tồn tại trên GitHub');
            return null;
        } else {
            console.error('GitHub API error:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error loading from GitHub:', error);
        return null;
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('luxurymove_services');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.services) {
                return parsed;
            }
        }
    } catch (error) {
        console.log('⚠️ Lỗi đọc localStorage:', error.message);
    }
    return null;
}

function getDefaultServices() {
    return {
        'airport': {
            title: 'Đưa Đón Sân Bay',
            subtitle: 'Dịch vụ cao cấp - Đúng giờ - Chuyên nghiệp',
            images: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600', 'https://images.unsplash.com/photo-1464037866736-660e1870455e?w=600'],
            description: 'Dịch vụ đưa đón sân bay cao cấp với đội xe đời mới. Chúng tôi cam kết đón khách đúng giờ, hỗ trợ hành lý và đảm bảo hành trình thoải mái nhất.',
            features: ['Đón tận cửa, hỗ trợ hành lý', 'Xe đời mới, nội thất cao cấp', 'Tài xế mặc vest, chuyên nghiệp'],
            pricing: [{ label: 'Cam Ranh → Nha Trang', price: '450,000 VND' }, { label: 'Theo giờ (tối thiểu 4h)', price: '350,000 VND/giờ' }]
        },
        'tour': {
            title: 'Du Lịch Biển Đảo',
            subtitle: 'Khám phá vẻ đẹp miền Trung',
            images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600'],
            description: 'Dịch vụ xe du lịch chuyên nghiệp cho các tour biển đảo. Tài xế am hiểu địa phương, sẵn sàng tư vấn điểm đến hấp dẫn.',
            features: ['Thiết kế lịch trình riêng', 'Xe 4-16 chỗ tùy chọn', 'Nước uống miễn phí'],
            pricing: [{ label: 'Tour Nha Trang 1 ngày', price: '1,200,000 VND' }, { label: 'Tour Vĩnh Hy', price: '1,500,000 VND' }]
        }
        // Có thể thêm các dịch vụ khác ở đây
    };
}

function saveAllServices() {
    try {
        // Update timestamp
        servicesData.last_updated = new Date().toISOString();
        
        // Lưu vào localStorage
        localStorage.setItem('luxurymove_services', JSON.stringify(servicesData, null, 2));
        
        // Thử lưu lên GitHub nếu có token
        if (githubConfig.token && githubConfig.token !== '••••••••••') {
            saveToGitHub();
        } else {
            showStatus('Đã lưu vào localStorage', 'success');
        }
        
    } catch (error) {
        console.error('Error saving data:', error);
        showStatus('Lỗi lưu dữ liệu', 'error');
    }
}

async function saveToGitHub() {
    if (!githubConfig.token || githubConfig.token === '••••••••••') {
        showStatus('Chưa cấu hình GitHub Token', 'warning');
        return;
    }
    
    showLoading(true);
    
    try {
        // Cập nhật timestamp
        servicesData.last_updated = new Date().toISOString();
        
        // Thử lấy SHA nếu file đã tồn tại
        let sha = '';
        try {
            const getResponse = await fetch(
                `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/data/services.json`,
                {
                    headers: {
                        'Authorization': `token ${githubConfig.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (getResponse.ok) {
                const fileInfo = await getResponse.json();
                sha = fileInfo.sha;
            }
        } catch (e) {
            console.log('File chưa tồn tại, sẽ tạo mới');
        }
        
        // Tạo hoặc update file
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(servicesData, null, 2))));
        
        const response = await fetch(
            `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/data/services.json`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `Update services data - ${new Date().toLocaleString('vi-VN')}`,
                    content: content,
                    branch: githubConfig.branch,
                    sha: sha || undefined
                })
            }
        );
        
        if (response.ok) {
            showStatus('✅ Đã lưu lên GitHub thành công!', 'success');
            
            // Cũng lưu vào localStorage làm backup
            localStorage.setItem('luxurymove_services', JSON.stringify(servicesData, null, 2));
            
        } else {
            const error = await response.json();
            throw new Error(error.message || `GitHub API error: ${response.status}`);
        }
        
    } catch (error) {
        console.error('Error saving to GitHub:', error);
        showStatus('❌ Lỗi lưu lên GitHub: ' + error.message, 'error');
        
        // Fallback to localStorage
        localStorage.setItem('luxurymove_services', JSON.stringify(servicesData, null, 2));
        showStatus('Đã lưu vào localStorage làm backup', 'warning');
    } finally {
        showLoading(false);
    }
}

// ===== RENDER FUNCTIONS =====
function renderServicesList() {
    const container = document.getElementById('servicesList');
    const services = servicesData.services || {};
    
    if (Object.keys(services).length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-tertiary);">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3>Chưa có dịch vụ nào</h3>
                <p>Nhấn "Thêm dịch vụ mới" để bắt đầu</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    Object.entries(services).forEach(([id, service]) => {
        const firstImage = service.images && service.images.length > 0 ? service.images[0] : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600';
        
        html += `
            <div class="service-item" onclick="editService('${id}')">
                <div class="service-item-header">
                    <h3 class="service-item-title">${service.title || 'Chưa có tiêu đề'}</h3>
                    <div class="service-item-actions">
                        <button class="action-btn" onclick="editService('${id}'); event.stopPropagation();">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="deleteService('${id}'); event.stopPropagation();" style="background: rgba(255, 68, 68, 0.2);">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="service-item-image">
                    <img src="${firstImage}" alt="${service.title}">
                </div>
                <p class="service-item-desc">${service.description || 'Chưa có mô tả'}</p>
                <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 12px; color: var(--text-tertiary);">
                    <span><i class="fas fa-image"></i> ${service.images ? service.images.length : 0} ảnh</span>
                    <span><i class="fas fa-tag"></i> ${service.pricing ? service.pricing.length : 0} bảng giá</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== SERVICE EDITOR =====
function addNewService() {
    currentEditingId = null;
    
    // Reset form
    document.getElementById('serviceId').value = '';
    document.getElementById('serviceTitle').value = '';
    document.getElementById('serviceSubtitle').value = '';
    document.getElementById('serviceDescription').value = '';
    document.getElementById('imagesList').innerHTML = '';
    document.getElementById('featuresList').innerHTML = '';
    document.getElementById('pricingList').innerHTML = '';
    
    // Show editor
    document.getElementById('editorTitle').textContent = 'Thêm dịch vụ mới';
    document.getElementById('serviceEditor').style.display = 'block';
    document.getElementById('deleteBtn').style.display = 'none';
    
    // Add default feature
    addFeatureItem('Đón tận cửa, hỗ trợ hành lý');
    addFeatureItem('Xe đời mới, nội thất cao cấp');
    addFeatureItem('Tài xế mặc vest, chuyên nghiệp');
    
    // Scroll to editor
    document.getElementById('serviceEditor').scrollIntoView({ behavior: 'smooth' });
}

function editService(serviceId) {
    currentEditingId = serviceId;
    const service = servicesData.services[serviceId];
    
    if (!service) {
        showStatus('Không tìm thấy dịch vụ', 'error');
        return;
    }
    
    // Fill form
    document.getElementById('serviceId').value = serviceId;
    document.getElementById('serviceTitle').value = service.title || '';
    document.getElementById('serviceSubtitle').value = service.subtitle || '';
    document.getElementById('serviceDescription').value = service.description || '';
    
    // Render images
    const imagesList = document.getElementById('imagesList');
    imagesList.innerHTML = '';
    if (service.images && Array.isArray(service.images)) {
        service.images.forEach((img, index) => {
            addImageItem(img, index);
        });
    }
    
    // Render features
    const featuresList = document.getElementById('featuresList');
    featuresList.innerHTML = '';
    if (service.features && Array.isArray(service.features)) {
        service.features.forEach((feature, index) => {
            addFeatureItem(feature, index);
        });
    }
    
    // Render pricing
    const pricingList = document.getElementById('pricingList');
    pricingList.innerHTML = '';
    if (service.pricing && Array.isArray(service.pricing)) {
        service.pricing.forEach((price, index) => {
            addPriceItem(price, index);
        });
    }
    
    // Show editor
    document.getElementById('editorTitle').textContent = `Chỉnh sửa: ${service.title}`;
    document.getElementById('serviceEditor').style.display = 'block';
    document.getElementById('deleteBtn').style.display = 'block';
    
    // Scroll to editor
    document.getElementById('serviceEditor').scrollIntoView({ behavior: 'smooth' });
}

function closeEditor() {
    document.getElementById('serviceEditor').style.display = 'none';
    currentEditingId = null;
}

function saveService() {
    // Validate
    const serviceId = document.getElementById('serviceId').value.trim();
    const title = document.getElementById('serviceTitle').value.trim();
    const description = document.getElementById('serviceDescription').value.trim();
    
    if (!serviceId) {
        showStatus('Vui lòng nhập ID dịch vụ', 'error');
        return;
    }
    
    if (!title) {
        showStatus('Vui lòng nhập tiêu đề', 'error');
        return;
    }
    
    if (!description) {
        showStatus('Vui lòng nhập mô tả', 'error');
        return;
    }
    
    // Collect images
    const images = [];
    document.querySelectorAll('#imagesList .image-item img').forEach(img => {
        images.push(img.src);
    });
    
    // Collect features
    const features = [];
    document.querySelectorAll('#featuresList .feature-item input[type="text"]').forEach(input => {
        if (input.value.trim()) {
            features.push(input.value.trim());
        }
    });
    
    // Collect pricing
    const pricing = [];
    document.querySelectorAll('#pricingList .pricing-item').forEach(item => {
        const labelInput = item.querySelector('input[type="text"]:nth-child(1)');
        const priceInput = item.querySelector('input[type="text"]:nth-child(2)');
        
        if (labelInput.value.trim() && priceInput.value.trim()) {
            pricing.push({
                label: labelInput.value.trim(),
                price: priceInput.value.trim()
            });
        }
    });
    
    // Create service object
    const serviceData = {
        title: title,
        subtitle: document.getElementById('serviceSubtitle').value.trim() || title,
        images: images,
        description: description,
        features: features,
        pricing: pricing
    };
    
    // Save to data
    if (!servicesData.services) {
        servicesData.services = {};
    }
    
    servicesData.services[serviceId] = serviceData;
    servicesData.last_updated = new Date().toISOString();
    
    // Update list
    renderServicesList();
    
    // Save to storage
    localStorage.setItem('luxurymove_services', JSON.stringify(servicesData, null, 2));
    
    showStatus(`Đã lưu dịch vụ: ${title}`, 'success');
    closeEditor();
}

function deleteService(serviceId) {
    if (!serviceId && currentEditingId) {
        serviceId = currentEditingId;
    }
    
    if (!serviceId || !confirm(`Bạn có chắc muốn xóa dịch vụ "${serviceId}"?`)) {
        return;
    }
    
    if (servicesData.services && servicesData.services[serviceId]) {
        delete servicesData.services[serviceId];
        
        // Update storage
        localStorage.setItem('luxurymove_services', JSON.stringify(servicesData, null, 2));
        
        // Update UI
        renderServicesList();
        closeEditor();
        
        showStatus(`Đã xóa dịch vụ: ${serviceId}`, 'success');
    }
}

// ===== IMAGE MANAGEMENT =====
function addImageFromUrl() {
    const url = document.getElementById('imageUrl').value.trim();
    
    if (!url) {
        showStatus('Vui lòng nhập URL ảnh', 'error');
        return;
    }
    
    // Validate URL
    try {
        new URL(url);
    } catch (e) {
        showStatus('URL không hợp lệ', 'error');
        return;
    }
    
    addImageItem(url);
    document.getElementById('imageUrl').value = '';
    showStatus('Đã thêm ảnh', 'success');
}

function addImageItem(url, index = null) {
    const imagesList = document.getElementById('imagesList');
    const itemIndex = index !== null ? index : imagesList.children.length;
    
    const div = document.createElement('div');
    div.className = 'image-item';
    div.innerHTML = `
        <img src="${url}" alt="Service image ${itemIndex + 1}" loading="lazy">
        <button class="image-item-remove" onclick="removeImage(${itemIndex})">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    if (index !== null) {
        if (imagesList.children[index]) {
            imagesList.replaceChild(div, imagesList.children[index]);
        } else {
            imagesList.appendChild(div);
        }
    } else {
        imagesList.appendChild(div);
    }
}

function removeImage(index) {
    const imagesList = document.getElementById('imagesList');
    if (imagesList.children[index]) {
        imagesList.removeChild(imagesList.children[index]);
        
        // Re-index remaining items
        Array.from(imagesList.children).forEach((item, i) => {
            const btn = item.querySelector('.image-item-remove');
            btn.onclick = () => removeImage(i);
        });
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validate file
    if (!file.type.match('image.*')) {
        showStatus('Vui lòng chọn file ảnh', 'error');
        return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
        showStatus('File quá lớn (tối đa 2MB)', 'error');
        return;
    }
    
    // Convert to Data URL for preview
    const reader = new FileReader();
    reader.onload = function(e) {
        addImageItem(e.target.result);
        showStatus('Đã thêm ảnh từ file', 'success');
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    event.target.value = '';
}

// ===== FEATURES MANAGEMENT =====
function addFeature() {
    const input = document.getElementById('featureInput');
    const value = input.value.trim();
    
    if (!value) {
        showStatus('Vui lòng nhập tính năng', 'error');
        return;
    }
    
    addFeatureItem(value);
    input.value = '';
    showStatus('Đã thêm tính năng', 'success');
}

function addFeatureItem(feature, index = null) {
    const featuresList = document.getElementById('featuresList');
    const itemIndex = index !== null ? index : featuresList.children.length;
    
    const div = document.createElement('div');
    div.className = 'feature-item';
    div.innerHTML = `
        <input type="text" class="form-input" value="${feature.replace(/"/g, '&quot;')}" placeholder="Tính năng...">
        <button class="action-btn" onclick="removeFeature(${itemIndex})">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    if (index !== null) {
        if (featuresList.children[index]) {
            featuresList.replaceChild(div, featuresList.children[index]);
        } else {
            featuresList.appendChild(div);
        }
    } else {
        featuresList.appendChild(div);
    }
}

function removeFeature(index) {
    const featuresList = document.getElementById('featuresList');
    if (featuresList.children[index]) {
        featuresList.removeChild(featuresList.children[index]);
        
        // Re-index
        Array.from(featuresList.children).forEach((item, i) => {
            const btn = item.querySelector('button');
            btn.onclick = () => removeFeature(i);
        });
    }
}

// ===== PRICING MANAGEMENT =====
function addPrice() {
    const label = document.getElementById('priceLabel').value.trim();
    const value = document.getElementById('priceValue').value.trim();
    
    if (!label || !value) {
        showStatus('Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }
    
    addPriceItem({ label, price: value });
    
    document.getElementById('priceLabel').value = '';
    document.getElementById('priceValue').value = '';
    
    showStatus('Đã thêm bảng giá', 'success');
}

function addPriceItem(price, index = null) {
    const pricingList = document.getElementById('pricingList');
    const itemIndex = index !== null ? index : pricingList.children.length;
    
    const div = document.createElement('div');
    div.className = 'pricing-item';
    div.innerHTML = `
        <input type="text" class="form-input" value="${price.label.replace(/"/g, '&quot;')}" placeholder="Tên gói">
        <input type="text" class="form-input" value="${price.price.replace(/"/g, '&quot;')}" placeholder="Giá">
        <button class="action-btn" onclick="removePrice(${itemIndex})">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    if (index !== null) {
        if (pricingList.children[index]) {
            pricingList.replaceChild(div, pricingList.children[index]);
        } else {
            pricingList.appendChild(div);
        }
    } else {
        pricingList.appendChild(div);
    }
}

function removePrice(index) {
    const pricingList = document.getElementById('pricingList');
    if (pricingList.children[index]) {
        pricingList.removeChild(pricingList.children[index]);
        
        // Re-index
        Array.from(pricingList.children).forEach((item, i) => {
            const btn = item.querySelector('button');
            btn.onclick = () => removePrice(i);
        });
    }
}

// ===== UTILITY FUNCTIONS =====
function showStatus(message, type = 'success') {
    const statusBar = document.getElementById('statusBar');
    const statusIcon = document.getElementById('statusIcon');
    const statusMessage = document.getElementById('statusMessage');
    
    // Set icon based on type
    statusIcon.className = 'fas ' + (
        type === 'success' ? 'fa-check-circle status-success' :
        type === 'error' ? 'fa-exclamation-circle status-error' :
        'fa-info-circle status-warning'
    );
    
    statusMessage.textContent = message;
    statusBar.classList.add('show');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        statusBar.classList.remove('show');
    }, 5000);
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

// Export/Import functions (optional)
function exportData() {
    const dataStr = JSON.stringify(servicesData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `luxurymove-services-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showStatus('Đã xuất dữ liệu', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate data structure
            if (importedData.services && typeof importedData.services === 'object') {
                servicesData = importedData;
                localStorage.setItem('luxurymove_services', JSON.stringify(servicesData, null, 2));
                renderServicesList();
                showStatus('Đã nhập dữ liệu thành công', 'success');
            } else {
                showStatus('File không đúng định dạng', 'error');
            }
        } catch (error) {
            showStatus('Lỗi đọc file: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
}