
// Thêm vào đầu script.js
const DATA_URL = 'https://raw.githubusercontent.com/username/repo/main/services-data.json';
// Hoặc từ Gist: const DATA_URL = 'https://gist.githubusercontent.com/username/gist_id/raw/services-data.json';

async function loadServicesData() {
    try {
        // Thêm cache buster để tránh cache trình duyệt
        const response = await fetch(`${DATA_URL}?t=${Date.now()}`);
        const data = await response.json();
        
        // Merge với dữ liệu mặc định (fallback)
        window.serviceDetails = { ...serviceDetails, ...data.services };
        
        console.log('Đã tải dữ liệu mới nhất từ GitHub');
    } catch (error) {
        console.warn('Không thể tải dữ liệu từ GitHub, sử dụng dữ liệu mặc định');
        // Giữ nguyên dữ liệu mặc định
    }
}



const serviceDetails = {
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
    },
    'business': {
        title: 'Dịch Vụ Doanh Nghiệp',
        subtitle: 'Giải pháp di chuyển chuyên nghiệp',
        images: ['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600', 'https://images.unsplash.com/photo-1521791136064-7986c2959d93?w=600'],
        description: 'Cung cấp giải pháp vận chuyển cho doanh nghiệp: đón đối tác, hội nghị, team building. Hợp đồng linh hoạt, có VAT.',
        features: ['Xe hạng sang cho đối tác', 'Hợp đồng dài hạn linh hoạt', 'Hóa đơn VAT đầy đủ'],
        pricing: [{ label: 'Đón tiếp đối tác', price: '500,000 VND' }, { label: 'Thuê xe hội nghị', price: '800,000 VND/ngày' }]
    },
    'rental': {
        title: 'Thuê Xe Có Tài Xế',
        subtitle: 'Linh hoạt - Tiện lợi - Chuyên nghiệp',
        images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600'],
        description: 'Thuê xe riêng có tài xế cho mọi nhu cầu: công tác, thăm thân. Đa dạng dòng xe, đặt xe nhanh chóng.',
        features: ['Đa dạng dòng xe 4-16 chỗ', 'Tài xế kinh nghiệm >5 năm', 'Giá cố định, không phát sinh'],
        pricing: [{ label: 'Xe 4 chỗ (8h/80km)', price: '800,000 VND' }, { label: 'Xe 7 chỗ (8h/80km)', price: '1,200,000 VND' }]
    },
    'mountain': {
        title: 'Tour Cao Nguyên',
        subtitle: 'Khám phá Đà Lạt - Lâm Đồng',
        images: ['https://images.unsplash.com/photo-1589182397057-b82d51970e2c?w=600', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600'],
        description: 'Tour du lịch chuyên các tuyến cao nguyên. Tài xế am hiểu địa hình, an toàn trên mọi cung đường đèo dốc.',
        features: ['Chuyên tour Đà Lạt/Bảo Lộc', 'An toàn đường đèo dốc', 'Hỗ trợ chụp ảnh tận tình'],
        pricing: [{ label: 'Tour Đà Lạt 1 ngày', price: '1,500,000 VND' }]
    },
    'wedding': {
        title: 'Xe Cưới & Sự Kiện',
        subtitle: 'Trọn vẹn ngày trọng đại',
        images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=600', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600'],
        description: 'Dịch vụ xe cưới sang trọng. Trang trí hoa theo yêu cầu, tài xế lịch sự, đúng giờ tuyệt đối.',
        features: ['Trang trí theo yêu cầu', 'Xe đời mới sang trọng', 'Đúng giờ tuyệt đối'],
        pricing: [{ label: 'Xe cưới (4h)', price: '1,500,000 VND' }]
    },
    'intercity': {
        title: 'Hợp Đồng Liên Tỉnh',
        subtitle: 'An toàn - Tiết kiệm - Nhanh chóng',
        images: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600'],
        description: 'Xe riêng đi tỉnh an toàn, riêng tư. Không bắt khách dọc đường, chạy thẳng tuyến theo yêu cầu.',
        features: ['Xe riêng tư tuyệt đối', 'Giá trọn gói cầu đường', 'Phục vụ 24/7'],
        pricing: [{ label: 'Đi tỉnh lân cận', price: 'Liên hệ báo giá' }]
    },
    'limo': {
        title: 'Xe VIP Limousine',
        subtitle: 'Trải nghiệm hạng thương gia',
        images: ['https://images.unsplash.com/photo-1551522435-a13afa10f103?w=600'],
        description: 'Dòng xe Limousine 9-12 chỗ đẳng cấp. Ghế massage, nội thất sang trọng, đầy đủ tiện nghi.',
        features: ['Ghế massage cao cấp', 'Wifi & Sạc USB tận ghế', 'Phục vụ nước uống, khăn lạnh'],
        pricing: [{ label: 'Thuê theo ngày', price: '3,500,000 VND' }]
    }
};

// DOM Elements
const serviceDetailsModal = document.getElementById('serviceDetails');
const detailContent = document.getElementById('detailContent');
const closeDetailsBtn = document.getElementById('closeDetails');

// Hàm Hiển thị chi tiết
function showServiceDetails(serviceType) {
    const service = serviceDetails[serviceType];
    if (!service) return;

    // Cập nhật Tiêu đề & Subtitle
    document.getElementById('detailTitle').textContent = service.title;
    document.getElementById('detailSubtitle').textContent = service.subtitle;

    // Tạo Gallery ảnh cuộn ngang
    let galleryHTML = '<div class="details-gallery">';
    service.images.forEach(img => {
        galleryHTML += `<div class="gallery-item"><img src="${img}" alt="LuxuryMove"></div>`;
    });
    galleryHTML += '</div>';

    // Tạo HTML Nội dung (Giữ nguyên cấu trúc CSS cũ của bạn)
    detailContent.innerHTML = `
        ${galleryHTML}
        
        <div class="details-description">
            ${service.description}
        </div>
        
        <div class="details-features">
            <h4 class="features-title">Đặc điểm nổi bật</h4>
            <ul class="features-list">
                ${service.features.map(f => `<li><i class="fas fa-check feature-icon"></i><span>${f}</span></li>`).join('')}
            </ul>
        </div>
        
        <div class="pricing-info">
            <h4 class="pricing-title">Bảng giá tham khảo</h4>
            ${service.pricing.map(p => `<div class="price-item"><span class="price-label">${p.label}</span><span class="price-value">${p.price}</span></div>`).join('')}
        </div>
        
        <div class="details-actions">
            <button class="btn btn-outline" id="closeDetailsBtnManual"><i class="fas fa-times"></i> Đóng</button>
            <button class="btn btn-primary" id="bookThisService"><i class="fas fa-calendar-alt"></i> Đặt ngay</button>
        </div>
    `;

    serviceDetailsModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Sự kiện cho nút trong Popup
    setTimeout(() => {
        document.getElementById('closeDetailsBtnManual').onclick = closeServiceDetails;
        document.getElementById('bookThisService').onclick = () => {
            closeServiceDetails();
            setTimeout(() => {
                document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
                document.getElementById('serviceType').value = serviceType;
            }, 300);
        };
    }, 50);
}

function closeServiceDetails() {
    serviceDetailsModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Khởi tạo khi load trang
document.addEventListener('DOMContentLoaded', () => {
    loadServicesData().then(() => {
        // Các sự kiện click card sau khi data loaded
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('click', () => {
                showServiceDetails(card.getAttribute('data-service'));
            });
        });
    });    // Click Card
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
            showServiceDetails(card.getAttribute('data-service'));
        });
    });

    // Đóng Modal
    if (closeDetailsBtn) closeDetailsBtn.onclick = closeServiceDetails;
    serviceDetailsModal.onclick = (e) => { if (e.target === serviceDetailsModal) closeServiceDetails(); };

    // Form Booking
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.onsubmit = (e) => {
            e.preventDefault();
            const phone = document.getElementById('phoneNumber').value;
            alert(`✅ Yêu cầu gửi thành công! Chúng tôi sẽ gọi lại số ${phone} ngay.`);
            bookingForm.reset();
        };
    }
});
