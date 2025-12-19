// ===== PRICING SYSTEM =====
let pricingData = { prices: [], services: [] };
let pricingDatabase = null;

// Khởi tạo pricing system
async function initPricing() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp({
                apiKey: "AIzaSyCeYPoizbE-Op79186r7pmndGpJ-JfESAk",
                authDomain: "hoangtung-af982.firebaseapp.com",
                databaseURL: "https://hoangtung-af982-default-rtdb.firebaseio.com",
                projectId: "hoangtung-af982",
                storageBucket: "hoangtung-af982.firebasestorage.app",
                messagingSenderId: "232719624914",
                appId: "1:232719624914:web:cac7ce833ae105d9255b0b",
                measurementId: "G-FWHFP1W032"
            });
        }
        pricingDatabase = firebase.database();
        await loadAllPricingData();
    } catch (error) {
        console.error("Pricing initialization error:", error);
        loadPricingFromLocalStorage();
    }
}

// Tải tất cả dữ liệu
async function loadAllPricingData() {
    try {
        // Tải cả pricing và services
        let [pricingSnapshot, servicesSnapshot] = await Promise.all([
            pricingDatabase.ref('pricing').once('value'),
            pricingDatabase.ref('services').once('value')
        ]);
        
        const pricing = pricingSnapshot.val();
        const services = servicesSnapshot.val();
        
        // Kết hợp dữ liệu
        pricingData = {
            prices: pricing?.prices || getDefaultPricing(),
            services: extractServicesPricing(services),
            last_updated: new Date().toISOString()
        };
        
        // Lưu vào localStorage
        localStorage.setItem('luxurymove_pricing', JSON.stringify(pricingData));
        
        // Render bảng giá
        renderPricingTable();
        
    } catch (error) {
        console.error("Error loading pricing data:", error);
        loadPricingFromLocalStorage();
    }
}

// Trích xuất giá từ dịch vụ
function extractServicesPricing(servicesData) {
    const servicesPricing = [];
    
    if (servicesData && servicesData.services) {
        Object.entries(servicesData.services).forEach(([id, service]) => {
            if (service.pricing && service.pricing.length > 0) {
                service.pricing.forEach((priceItem, index) => {
                    servicesPricing.push({
                        id: `service_${id}_${index}`,
                        source: 'service',
                        service_id: id,
                        category: 'Dịch Vụ',
                        title: service.title + (priceItem.label ? ` - ${priceItem.label}` : ''),
                        description: service.description?.substring(0, 100) || '',
                        current_price: priceItem.price,
                        order: index
                    });
                });
            } else {
                // Nếu dịch vụ không có pricing, thêm mặc định
                servicesPricing.push({
                    id: `service_${id}`,
                    source: 'service',
                    service_id: id,
                    category: 'Dịch Vụ',
                    title: service.title,
                    description: service.description?.substring(0, 100) || '',
                    current_price: 'Liên hệ',
                    note: 'Cập nhật giá trong quản lý dịch vụ',
                    order: 0
                });
            }
        });
    }
    
    return servicesPricing;
}

// Render bảng giá trên website
function renderPricingTable() {
    const pricingSection = document.getElementById('pricingSection');
    if (!pricingSection) return;
    
    const { prices = [], services = [] } = pricingData;
    const lastUpdated = pricingData.last_updated ? new Date(pricingData.last_updated).toLocaleDateString('vi-VN') : 'Chưa cập nhật';
    
    if (prices.length === 0 && services.length === 0) {
        pricingSection.innerHTML = `
            <div class="empty-pricing">
                <i class="fas fa-tags"></i>
                <p>Chưa có bảng giá</p>
                <small>Vui lòng liên hệ: 0931.243.679</small>
            </div>
        `;
        return;
    }
    
    // Phân loại theo category
    const categories = {};
    
    // Thêm pricing items
    prices.forEach(price => {
        if (!categories[price.category]) {
            categories[price.category] = [];
        }
        categories[price.category].push({
            ...price,
            source: 'pricing'
        });
    });
    
    // Thêm services items vào category "Dịch Vụ"
    if (services.length > 0) {
        categories['Dịch Vụ'] = services;
    }
    
    let html = `
        <div class="pricing-container">
            <div class="pricing-header">
                <h2 class="pricing-title">Bảng Giá Tham Khảo</h2>
                <div class="pricing-note">
                    <i class="fas fa-info-circle"></i>
                    <span>Giá có thể thay đổi theo thời điểm. Vui lòng liên hệ để có giá tốt nhất</span>
                </div>
                <div class="pricing-updated">
                    <i class="fas fa-history"></i>
                    <span>Cập nhật: ${lastUpdated}</span>
                </div>
            </div>
    `;
    
    // Render từng category
    Object.entries(categories).forEach(([category, items]) => {
        html += `
            <div class="pricing-category">
                <h3 class="category-title">
                    ${category === 'Dịch Vụ' ? '<i class="fas fa-car"></i>' : '<i class="fas fa-map-marker-alt"></i>'}
                    ${category}
                </h3>
                <div class="pricing-table">
        `;
        
        items.sort((a, b) => (a.order || 99) - (b.order || 99)).forEach(item => {
            const originalPrice = item.original_price ? `
                <div class="original-price">
                    <span class="price-amount">${item.original_price}</span>
                </div>
            ` : '';
            
            const currentPrice = item.current_price ? `
                <div class="current-price">
                    <span class="price-amount">${item.current_price}</span>
                </div>
            ` : '';
            
            const serviceTag = item.source === 'service' ? `
                <div class="service-tag">
                    <i class="fas fa-car"></i> Dịch vụ
                </div>
            ` : '';
            
            html += `
                <div class="pricing-row ${item.source === 'service' ? 'service-item' : ''}">
                    <div class="route-info">
                        <div class="route-header">
                            <div class="route-title">${item.title}</div>
                            ${serviceTag}
                        </div>
                        ${item.description ? `<div class="route-desc">${item.description}</div>` : ''}
                        ${item.note ? `<div class="route-note"><i class="fas fa-exclamation-circle"></i> ${item.note}</div>` : ''}
                    </div>
                    <div class="price-info">
                        ${originalPrice}
                        ${currentPrice}
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += `
            <div class="pricing-footer">
                <div class="contact-call">
                    <i class="fas fa-phone-alt"></i>
                    <div>
                        <strong>Đặt xe ngay: 0931.243.679</strong>
                        <small>Tư vấn miễn phí 24/7</small>
                    </div>
                </div>
                <div class="price-disclaimer">
                    <p><i class="fas fa-exclamation-triangle"></i> Giá trên chỉ mang tính chất tham khảo, có thể thay đổi tùy thời điểm và số lượng khách.</p>
                </div>
            </div>
        </div>
    `;
    
    pricingSection.innerHTML = html;
}

// Default pricing data
function getDefaultPricing() {
    return [
        {
            id: 'price1',
            category: 'Sân Bay Cam Ranh',
            title: 'Phan Rang ⇄ Sân Bay Cam Ranh',
            description: 'Đưa đón tận nơi, hỗ trợ hành lý',
            original_price: '800.000 VND',
            current_price: '500.000 VND',
            note: 'Giá cho xe 4-7 chỗ',
            order: 1
        },
        {
            id: 'price2',
            category: 'Tour Du Lịch',
            title: 'Du lịch Vĩnh Hy',
            description: 'Tour trọn gói nguyên ngày',
            current_price: '1.200.000 VND',
            note: 'Bao gồm xe, tài xế, nước uống',
            order: 2
        },
        {
            id: 'price3',
            category: 'Liên Tỉnh',
            title: 'Ninh Thuận ⇄ Đà Lạt (2 chiều)',
            description: 'Đón tại nhà, trả tận nơi',
            current_price: '800.000 VND',
            note: 'Xe 4 chỗ tiêu chuẩn',
            order: 3
        }
    ];
}

// Lắng nghe sự kiện cập nhật
window.addEventListener('pricingUpdated', function() {
    loadAllPricingData();
});

window.addEventListener('servicesUpdated', function() {
    loadAllPricingData();
});

// Khởi tạo khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    initPricing();
});