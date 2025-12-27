// Service Page JavaScript
let servicesData = null;
let database = null;

// Firebase config (sử dụng config từ script.js)
const firebaseConfig = {
    apiKey: "AIzaSyCeYPoizbE-Op79186r7pmndGpJ-JfESAk",
    authDomain: "hoangtung-af982.firebaseapp.com",
    databaseURL: "https://hoangtung-af982-default-rtdb.firebaseio.com",
    projectId: "hoangtung-af982",
    storageBucket: "hoangtung-af982.firebasestorage.app",
    messagingSenderId: "232719624914",
    appId: "1:232719624914:web:cac7ce833ae105d9255b0b",
    measurementId: "G-FWHFP1W032"
};

// Check if Firebase SDK is loaded
function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded. Loading now...');
        return false;
    }
    
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        database = firebase.database();
        return true;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return false;
    }
}

// Main function to load service page
async function loadServicePage(serviceId) {
    console.log('Loading service page for:', serviceId);
    
    // Initialize Firebase
    if (!initializeFirebase()) {
        console.warn('Firebase not available. Using fallback data.');
        renderFallbackService(serviceId);
        return;
    }
    
    try {
        // Load all services
        const snapshot = await database.ref('services').once('value');
        servicesData = snapshot.val();
        
        if (!servicesData || !servicesData.services) {
            console.warn('No services data from Firebase');
            renderFallbackService(serviceId);
            return;
        }
        
        // If serviceId exists, show single service detail
        // If serviceId is empty or 'service', show service list
        if (serviceId && serviceId !== 'service' && serviceId !== 'service.html' && serviceId !== 'index.html') {
            const service = servicesData.services[serviceId];
            if (service) {
                renderServiceDetail(serviceId, service);
                renderRelatedServices(serviceId);
                updateMetaTags(serviceId, service);
                updateBreadcrumb(service.title);
            } else {
                // Service not found, redirect to service list
                console.warn('Service not found:', serviceId);
                renderServiceList();
            }
        } else {
            // Show service list
            renderServiceList();
            updateMetaForList();
        }
        
    } catch (error) {
        console.error('Error loading service page:', error);
        renderFallbackService(serviceId);
    }
}

// Fallback khi Firebase không hoạt động
function renderFallbackService(serviceId) {
    const content = document.getElementById('serviceDetailContent');
    
    // Check if we have services in localStorage
    try {
        const localData = localStorage.getItem('HTUTransport_services');
        if (localData) {
            servicesData = JSON.parse(localData);
            
            if (servicesData && servicesData.services) {
                // Try to show specific service
                if (serviceId && serviceId !== 'service' && serviceId !== 'service.html') {
                    const service = servicesData.services[serviceId];
                    if (service) {
                        renderServiceDetail(serviceId, service);
                        return;
                    }
                }
                
                // Show service list
                renderServiceList();
                return;
            }
        }
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
    }
    
    // Default fallback - show static content
    if (serviceId && serviceId !== 'service' && serviceId !== 'service.html') {
        content.innerHTML = `
            <div class="service-detail-content">
                <div class="service-hero">
                    <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200" 
                         alt="Dịch vụ xe hợp đồng" 
                         loading="lazy">
                    <div class="service-hero-overlay">
                        <h1 class="service-hero-title">Dịch Vụ Xe Hợp Đồng</h1>
                        <p class="service-hero-subtitle">Chất lượng cao - Đúng giờ - Chuyên nghiệp</p>
                    </div>
                </div>
                
                <div class="service-info">
                    <div class="service-section">
                        <h3><i class="fas fa-info-circle"></i> Thông tin dịch vụ</h3>
                        <p class="service-description">
                            HTU Transport cung cấp dịch vụ xe hợp đồng cao cấp tại Phan Rang Tháp Chàm, Ninh Thuận. 
                            Chúng tôi chuyên đưa đón sân bay Cam Ranh, Liên Khương, xe du lịch 4-7-16 chỗ, phục vụ 24/7.
                        </p>
                    </div>
                    
                    <div class="service-section">
                        <h3><i class="fas fa-star"></i> Lợi ích</h3>
                        <div class="features-grid">
                            <div class="feature-item">
                                <i class="fas fa-check"></i>
                                <span>Đúng giờ 100%, không để khách chờ đợi</span>
                            </div>
                            <div class="feature-item">
                                <i class="fas fa-check"></i>
                                <span>Xe đời mới, sạch sẽ, tiện nghi</span>
                            </div>
                            <div class="feature-item">
                                <i class="fas fa-check"></i>
                                <span>Tài xế nhiều kinh nghiệm, am hiểu đường phố</span>
                            </div>
                            <div class="feature-item">
                                <i class="fas fa-check"></i>
                                <span>Giá cả cạnh tranh, không phát sinh</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="service-section">
                        <h3><i class="fas fa-phone-alt"></i> Đặt dịch vụ</h3>
                        <p class="service-description">
                            Gọi ngay <strong><a href="tel:0567033888" style="color: var(--champagne);">0567.033.888</a></strong> 
                            để được tư vấn và đặt xe nhanh chóng.
                        </p>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Show service list fallback
        content.innerHTML = `
            <div class="service-list-page">
                <div class="service-list-header">
                    <h1>Tất Cả Dịch Vụ</h1>
                    <p>Khám phá các dịch vụ xe hợp đồng cao cấp của HTU Transport</p>
                </div>
                
                <div class="service-list-grid">
                    <a href="service-don-san-bay.html" class="service-list-card">
                        <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=500" 
                             alt="Đưa đón sân bay">
                        <div class="service-list-content">
                            <h3>Đưa Đón Sân Bay</h3>
                            <p>Dịch vụ đưa đón sân bay Cam Ranh, Liên Khương 24/7 với xe đời mới, tài xế chuyên nghiệp</p>
                            <div class="service-list-link">
                                Xem chi tiết <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </a>
                    
                    <a href="service-xe-du-lich.html" class="service-list-card">
                        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=500" 
                             alt="Xe du lịch">
                        <div class="service-list-content">
                            <h3>Xe Du Lịch</h3>
                            <p>Thuê xe du lịch Ninh Thuận, Đà Lạt, Nha Trang. Xe 4-7-16 chỗ, phục vụ tour dài ngày</p>
                            <div class="service-list-link">
                                Xem chi tiết <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </a>
                    
                    <a href="service-xe-cuoi.html" class="service-list-card">
                        <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=500" 
                             alt="Xe cưới">
                        <div class="service-list-content">
                            <h3>Xe Cưới Cao Cấp</h3>
                            <p>Dịch vụ xe cưới sang trọng: Mercedes, BMW, Audi. Trang trí theo yêu cầu</p>
                            <div class="service-list-link">
                                Xem chi tiết <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        `;
    }
}

// Các hàm renderServiceDetail, renderServiceList, renderRelatedServices giữ nguyên
// ... (các hàm từ phiên bản trước)

// Render single service detail
function renderServiceDetail(serviceId, service) {
    const content = document.getElementById('serviceDetailContent');
    
    let imagesHTML = '';
    if (service.images && service.images.length > 0) {
        imagesHTML = `
            <div class="service-hero">
                <img src="${service.images[0]}" alt="${service.title}" loading="lazy">
                <div class="service-hero-overlay">
                    <h1 class="service-hero-title">${service.title}</h1>
                    <p class="service-hero-subtitle">${service.subtitle || 'Dịch vụ cao cấp - Chuyên nghiệp'}</p>
                </div>
            </div>
            
            ${service.images.length > 1 ? `
                <div class="service-section">
                    <h3><i class="fas fa-images"></i> Hình ảnh dịch vụ</h3>
                    <div class="service-gallery">
                        ${service.images.slice(1, 5).map((img, index) => `
                            <div class="gallery-item">
                                <img src="${img}" alt="${service.title} ${index + 2}" loading="lazy">
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    } else {
        imagesHTML = `
            <div class="service-hero">
                <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200" 
                     alt="${service.title}" 
                     loading="lazy">
                <div class="service-hero-overlay">
                    <h1 class="service-hero-title">${service.title}</h1>
                    <p class="service-hero-subtitle">${service.subtitle || 'Dịch vụ cao cấp - Chuyên nghiệp'}</p>
                </div>
            </div>
        `;
    }
    
    let featuresHTML = '';
    if (service.features && service.features.length > 0) {
        featuresHTML = `
            <div class="service-section">
                <h3><i class="fas fa-star"></i> Tính năng nổi bật</h3>
                <div class="features-grid">
                    ${service.features.map(feature => `
                        <div class="feature-item">
                            <i class="fas fa-check"></i>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        featuresHTML = `
            <div class="service-section">
                <h3><i class="fas fa-star"></i> Lợi ích dịch vụ</h3>
                <div class="features-grid">
                    <div class="feature-item">
                        <i class="fas fa-check"></i>
                        <span>Đúng giờ 100%, không để khách chờ đợi</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-check"></i>
                        <span>Xe đời mới, sạch sẽ, tiện nghi</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-check"></i>
                        <span>Tài xế nhiều kinh nghiệm, am hiểu đường phố</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-check"></i>
                        <span>Giá cả cạnh tranh, không phát sinh</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    let pricingHTML = '';
    if (service.pricing && service.pricing.length > 0) {
        pricingHTML = `
            <div class="service-section">
                <h3><i class="fas fa-tags"></i> Bảng giá tham khảo</h3>
                <table class="pricing-table">
                    <thead>
                        <tr>
                            <th>Loại dịch vụ</th>
                            <th>Mô tả</th>
                            <th>Giá tham khảo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${service.pricing.map(price => `
                            <tr>
                                <td>${price.label || service.title}</td>
                                <td>${price.description || 'Dịch vụ cao cấp'}</td>
                                <td class="price-value">${price.price || 'Liên hệ'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        pricingHTML = `
            <div class="service-section">
                <h3><i class="fas fa-tags"></i> Bảng giá</h3>
                <div class="features-grid">
                    <div class="feature-item">
                        <i class="fas fa-phone"></i>
                        <span>Liên hệ hotline <strong>0567.033.888</strong> để nhận báo giá chi tiết</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    const html = `
        <div class="service-detail-content">
            ${imagesHTML}
            <div class="service-info">
                <div class="service-section">
                    <h3><i class="fas fa-info-circle"></i> Mô tả dịch vụ</h3>
                    <p class="service-description">${service.description || 'HTU Transport cung cấp dịch vụ xe hợp đồng cao cấp tại Phan Rang Tháp Chàm, Ninh Thuận. Chúng tôi chuyên đưa đón sân bay Cam Ranh, Liên Khương, xe du lịch 4-7-16 chỗ, phục vụ 24/7 với đội ngũ tài xế chuyên nghiệp, xe đời mới.'}</p>
                </div>
                
                ${featuresHTML}
                ${pricingHTML}
                
                <div class="service-section">
                    <h3><i class="fas fa-phone-alt"></i> Đặt dịch vụ ngay</h3>
                    <p class="service-description">
                        Gọi ngay <strong><a href="tel:0567033888" style="color: var(--champagne);">0567.033.888</a></strong> 
                        hoặc điền form đặt xe để nhận ưu đãi đặc biệt.
                    </p>
                    <div class="cta-buttons" style="margin-top: 20px;">
                        <a href="tel:0567033888" class="btn btn-primary">
                            <i class="fas fa-phone-alt"></i> Gọi ngay: 0567.033.888
                        </a>
                        <a href="../#booking" class="btn btn-outline">
                            <i class="fas fa-calendar-alt"></i> Đặt xe trực tuyến
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    content.innerHTML = html;
}

// Render service list
function renderServiceList() {
    const content = document.getElementById('serviceDetailContent');
    
    if (!servicesData || !servicesData.services) {
        // Fallback to static list
        content.innerHTML = `
            <div class="service-list-page">
                <div class="service-list-header">
                    <h1>Tất Cả Dịch Vụ</h1>
                    <p>Khám phá các dịch vụ xe hợp đồng cao cấp của HTU Transport</p>
                </div>
                
                <div class="service-list-grid">
                    <div class="service-list-card" onclick="loadServiceDetail('don-san-bay')">
                        <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=500" 
                             alt="Đưa đón sân bay">
                        <div class="service-list-content">
                            <h3>Đưa Đón Sân Bay</h3>
                            <p>Đưa đón sân bay Cam Ranh, Liên Khương 24/7. Xe 4-7-16 chỗ, tài xế chuyên nghiệp</p>
                            <div class="service-list-features">
                                <span>Đúng giờ</span>
                                <span>Xe đời mới</span>
                                <span>24/7</span>
                            </div>
                            <div class="service-list-link">
                                Xem chi tiết <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="service-list-card" onclick="loadServiceDetail('xe-du-lich')">
                        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=500" 
                             alt="Xe du lịch">
                        <div class="service-list-content">
                            <h3>Xe Du Lịch</h3>
                            <p>Thuê xe du lịch Ninh Thuận, Đà Lạt, Nha Trang. Xe 4-7-16 chỗ, tour dài ngày</p>
                            <div class="service-list-features">
                                <span>Tour trọn gói</span>
                                <span>Linh hoạt</span>
                                <span>Giá tốt</span>
                            </div>
                            <div class="service-list-link">
                                Xem chi tiết <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="service-list-card" onclick="loadServiceDetail('xe-cuoi')">
                        <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=500" 
                             alt="Xe cưới">
                        <div class="service-list-content">
                            <h3>Xe Cưới Cao Cấp</h3>
                            <p>Dịch vụ xe cưới sang trọng: Mercedes, BMW, Audi. Trang trí theo yêu cầu</p>
                            <div class="service-list-features">
                                <span>Sang trọng</span>
                                <span>Đa dạng</span>
                                <span>Trang trí</span>
                            </div>
                            <div class="service-list-link">
                                Xem chi tiết <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    const services = Object.entries(servicesData.services);
    
    if (services.length === 0) {
        content.innerHTML = '<div class="error-message">Chưa có dịch vụ nào</div>';
        return;
    }
    
    const html = `
        <div class="service-list-page">
            <div class="service-list-header">
                <h1>Tất Cả Dịch Vụ</h1>
                <p>Khám phá các dịch vụ xe hợp đồng cao cấp của HTU Transport</p>
            </div>
            
            <div class="service-list-grid">
                ${services.map(([id, service]) => `
                    <div class="service-list-card" onclick="loadServiceDetail('${id}')">
                        <img src="${service.images && service.images[0] 
                            ? service.images[0] 
                            : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=500'}" 
                             alt="${service.title}">
                        <div class="service-list-content">
                            <h3>${service.title}</h3>
                            <p>${service.description 
                                ? service.description.substring(0, 100) + '...' 
                                : 'Dịch vụ xe hợp đồng cao cấp, chuyên nghiệp'}</p>
                            
                            ${service.features && service.features.length > 0 ? `
                                <div class="service-list-features">
                                    ${service.features.slice(0, 3).map(feature => `
                                        <span>${feature.substring(0, 15)}${feature.length > 15 ? '...' : ''}</span>
                                    `).join('')}
                                </div>
                            ` : ''}
                            
                            <div class="service-list-link">
                                Xem chi tiết <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    content.innerHTML = html;
}

// Helper function to load service detail
function loadServiceDetail(serviceId) {
    if (window.location.pathname.includes('/service/')) {
        // Navigate to service detail page
        window.location.href = `../service/${serviceId}.html`;
    } else {
        // Update current page
        loadServicePage(serviceId);
    }
}

// Render related services
function renderRelatedServices(currentServiceId) {
    const container = document.getElementById('relatedGrid');
    if (!container) return;
    
    if (!servicesData || !servicesData.services) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary);">Chưa có dịch vụ liên quan</p>';
        return;
    }
    
    const services = Object.entries(servicesData.services)
        .filter(([id]) => id !== currentServiceId)
        .slice(0, 3);
    
    if (services.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary);">Chưa có dịch vụ liên quan</p>';
        return;
    }
    
    const html = services.map(([id, service]) => `
        <div class="related-card" onclick="loadServiceDetail('${id}')">
            <img src="${service.images && service.images[0] 
                ? service.images[0] 
                : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=500'}" 
                 alt="${service.title}">
            <div class="related-card-content">
                <h4>${service.title}</h4>
                <p>${service.description 
                    ? service.description.substring(0, 80) + '...' 
                    : 'Dịch vụ xe hợp đồng cao cấp'}</p>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Update meta tags for SEO
function updateMetaTags(serviceId, service) {
    // Update page title
    document.title = `${service.title} | Dịch Vụ Xe Hợp Đồng - HTU Transport`;
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.content = service.description 
            ? service.description.substring(0, 160)
            : `Dịch vụ ${service.title} tại HTU Transport. Đưa đón sân bay Cam Ranh, xe du lịch Ninh Thuận, Đà Lạt, Nha Trang. Hotline: 0567.033.888`;
    }
}

// Update meta for service list page
function updateMetaForList() {
    document.title = "Danh Sách Dịch Vụ Xe Hợp Đồng | HTU Transport";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.content = "Khám phá tất cả dịch vụ xe hợp đồng cao cấp tại HTU Transport: đưa đón sân bay, xe du lịch, xe cưới, thuê xe dài hạn. Hotline: 0567.033.888";
    }
}

// Update breadcrumb
function updateBreadcrumb(serviceTitle) {
    const breadcrumb = document.getElementById('currentServiceBreadcrumb');
    if (breadcrumb) {
        breadcrumb.textContent = serviceTitle;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Get service ID from URL
    const urlPath = window.location.pathname;
    let serviceId = '';
    
    // Extract service ID from URL
    if (urlPath.includes('/service/')) {
        // URL format: /service/service1.html
        const parts = urlPath.split('/');
        serviceId = parts[parts.length - 1].replace('.html', '');
    } else if (window.location.search) {
        // URL format: /service.html?id=service1
        const params = new URLSearchParams(window.location.search);
        serviceId = params.get('id') || '';
    } else if (urlPath.includes('/service') || urlPath.includes('service.html')) {
        // Service list page
        serviceId = '';
    }
    
    // Load service page
    loadServicePage(serviceId);
});

// Update structured data for SEO
function updateStructuredData(serviceId, service) {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": service.title,
        "description": service.description || `Dịch vụ ${service.title} tại HTU Transport`,
        "provider": {
            "@type": "Organization",
            "name": "HTU Transport",
            "url": "https://htutransport.com",
            "telephone": "+84567033888"
        },
        "areaServed": {
            "@type": "State",
            "name": "Ninh Thuận, Khánh Hòa, Lâm Đồng, Bình Thuận"
        },
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Bảng giá dịch vụ",
            "itemListElement": (service.pricing || []).map(price => ({
                "@type": "Offer",
                "name": price.label || service.title,
                "description": price.description || service.title,
                "price": price.price || "Liên hệ",
                "priceCurrency": "VND"
            }))
        }
    };
    
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
        existingScript.remove();
    }
    
    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
}

// Show error message
function showError(message) {
    const content = document.getElementById('serviceDetailContent');
    content.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 60px 20px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff4444; margin-bottom: 20px; display: block;"></i>
            <h3 style="color: white; margin-bottom: 15px;">Đã xảy ra lỗi</h3>
            <p style="color: var(--text-tertiary); margin-bottom: 30px;">${message}</p>
            <a href="/" class="btn btn-primary" style="margin-right: 15px;">
                <i class="fas fa-home"></i> Về trang chủ
            </a>
            <a href="javascript:location.reload()" class="btn btn-outline">
                <i class="fas fa-redo"></i> Thử lại
            </a>
        </div>
    `;
}
