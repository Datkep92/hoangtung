// ===== PRICING SYSTEM - OPTIMIZED VERSION =====
let pricingData = { prices: [], services: [] };
let pricingDatabase = null;
let showAllPricing = false; // Biến để kiểm soát hiển thị

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
        let [pricingSnapshot, servicesSnapshot] = await Promise.all([
            pricingDatabase.ref('pricing').once('value'),
            pricingDatabase.ref('services').once('value')
        ]);
        
        const pricing = pricingSnapshot.val();
        const services = servicesSnapshot.val();
        
        pricingData = {
            prices: pricing?.prices || getDefaultPricing(),
            services: extractServicesPricing(services),
            last_updated: new Date().toISOString()
        };
        
        localStorage.setItem('luxurymove_pricing', JSON.stringify(pricingData));
        renderPricingTable();
        
    } catch (error) {
        console.error("Error loading pricing data:", error);
        loadPricingFromLocalStorage();
    }
}

// Trích xuất giá từ dịch vụ (chỉ lấy tiêu đề và giá)
function extractServicesPricing(servicesData) {
    const servicesPricing = [];
    
    if (servicesData && servicesData.services) {
        Object.entries(servicesData.services).forEach(([id, service]) => {
            if (service.pricing && service.pricing.length > 0) {
                // Chỉ lấy mục đầu tiên của mỗi dịch vụ
                const priceItem = service.pricing[0];
                servicesPricing.push({
                    id: `service_${id}`,
                    source: 'service',
                    service_id: id,
                    category: 'Dịch Vụ',
                    title: service.title,
                    description: service.description?.substring(0, 80) + '...' || '',
                    current_price: priceItem.price,
                    note: priceItem.label ? `(${priceItem.label})` : '',
                    order: parseInt(service.order || 999)
                });
            }
        });
        
        // Sắp xếp theo order
        servicesPricing.sort((a, b) => a.order - b.order);
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
    
    // Gộp tất cả items và sắp xếp
    let allItems = [
        ...prices.map(item => ({...item, source: 'pricing'})),
        ...services
    ];
    
    // Sắp xếp theo order hoặc mặc định
    allItems.sort((a, b) => (a.order || 999) - (b.order || 999));
    
    // Chỉ lấy 5 mục đầu nếu chưa bấm "Xem thêm"
    const displayItems = showAllPricing ? allItems : allItems.slice(0, 5);
    const hasMoreItems = allItems.length > 5;
    
    let html = `
    <div class="pricing-container">
        <div class="pricing-header">
            <div class="header-top">
                <h2 class="pricing-title">
                    <i class="fas fa-tags"></i>
                    Bảng Giá Tham Khảo
                </h2>
                <div class="pricing-updated">
                    <i class="fas fa-history"></i>
                    Cập nhật: ${lastUpdated}
                </div>
                <br>
                <div class="pricing-note">
                <i class="fas fa-info-circle"></i>
                <span>Giá có thể thay đổi theo thời điểm. Vui lòng liên hệ để có giá tốt nhất</span>
            </div>
            </div>
            
            
        </div>
        
        <div class="pricing-grid">
`;
    
    // Render các items
    displayItems.forEach((item, index) => {
        const isService = item.source === 'service';
        const hasDiscount = item.original_price && item.current_price;
        
        html += `
            <div class="pricing-card ${isService ? 'service-card' : ''} ${hasDiscount ? 'has-discount' : ''}">
                <div class="card-header">
                    ${isService ? 
                        `<span class="service-badge">
                            <i class="fas fa-car"></i> Dịch vụ
                        </span>` : 
                        `<span class="route-badge">
                            <i class="fas fa-map-marker-alt"></i> ${item.category || 'Tuyến đường'}
                        </span>`
                    }
                </div>
                
                <div class="card-content">
                    <h3 class="item-title">${item.title}</h3>
                    
                    ${item.description ? `
                        <div class="item-desc">
                            <i class="fas fa-info"></i>
                            ${item.description}
                        </div>
                    ` : ''}
                    
                    ${item.note ? `
                        <div class="item-note">
                            <i class="fas fa-star"></i>
                            ${item.note}
                        </div>
                    ` : ''}
                </div>
                
                <div class="card-footer">
                    <div class="price-section">
                        ${hasDiscount ? `
                            <div class="price-original">
                                <del>${item.original_price}</del>
                            </div>
                        ` : ''}
                        
                        <div class="price-current">
                            <span class="price-amount">${item.current_price || 'Liên hệ'}</span>
                            ${!item.current_price ? '<small>Để có giá tốt nhất</small>' : ''}
                        </div>
                    </div>
                    
                    <button class="btn-quote" onclick="requestQuote('${item.title}', '${item.current_price || ''}')">
                        <i class="fas fa-phone-alt"></i>
                        Lấy báo giá
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
    `;
    
    // Nút "Xem thêm" nếu có nhiều hơn 5 items
    if (hasMoreItems) {
        html += `
            <div class="pricing-more">
                <button class="btn-view-more" onclick="toggleViewMore()">
                    <i class="fas fa-${showAllPricing ? 'chevron-up' : 'chevron-down'}"></i>
                    ${showAllPricing ? 'Thu gọn' : `Xem thêm ${allItems.length - 5} dịch vụ khác`}
                </button>
            </div>
        `;
    }
    
    // Contact section
    html += `
            <div class="pricing-contact">
                <div class="contact-card">
                    <div class="contact-icon">
                        <i class="fas fa-headset"></i>
                    </div>
                    <div class="contact-info">
                        <h4>Hỗ trợ 24/7</h4>
                        <div class="phone-number">
                            <i class="fas fa-phone-alt"></i>
                            <strong>0931.243.679</strong>
                        </div>
                        <small>Tư vấn miễn phí - Đặt xe nhanh chóng</small>
                    </div>
                    <button class="btn-call-now" onclick="window.location.href='tel:0931243679'">
                        <i class="fas fa-phone"></i>
                        Gọi ngay
                    </button>
                </div>
                
                <div class="disclaimer">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Giá trên chỉ mang tính chất tham khảo, có thể thay đổi tùy thời điểm, quãng đường và số lượng khách.</p>
                </div>
            </div>
        </div>
    `;
    
    pricingSection.innerHTML = html;
}

// Toggle hiển thị tất cả
function toggleViewMore() {
    showAllPricing = !showAllPricing;
    renderPricingTable();
    
    // Cuộn đến phần pricing nếu đang mở rộng
    if (showAllPricing) {
        document.getElementById('pricingSection').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Request quote function
function requestQuote(title, price) {
    const phoneNumber = '0931243679';
    const message = `Xin chào, tôi muốn nhận báo giá cho: ${title} ${price ? `(Giá tham khảo: ${price})` : ''}`;
    const whatsappUrl = `https://wa.me/84${phoneNumber.substring(1)}?text=${encodeURIComponent(message)}`;
    const zaloUrl = `https://zalo.me/${phoneNumber}`;
    
    // Hiển thị modal hoặc chuyển hướng
    if (confirm(`Bạn muốn liên hệ qua WhatsApp hay Zalo để nhận báo giá chi tiết cho "${title}"?`)) {
        window.open(whatsappUrl, '_blank');
    } else {
        window.open(zaloUrl, '_blank');
    }
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
window.addEventListener('pricingUpdated', () => {
    showAllPricing = false;
    loadAllPricingData();
});

window.addEventListener('servicesUpdated', () => {
    showAllPricing = false;
    loadAllPricingData();
});

// Lưu vào localStorage
function loadPricingFromLocalStorage() {
    const saved = localStorage.getItem('luxurymove_pricing');
    if (saved) {
        pricingData = JSON.parse(saved);
        renderPricingTable();
    } else {
        pricingData = {
            prices: getDefaultPricing(),
            services: [],
            last_updated: new Date().toISOString()
        };
        renderPricingTable();
    }
}

// Khởi tạo khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    initPricing();
});