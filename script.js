// ===== FIREBASE CONFIG =====
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

// Biến toàn cục
let servicesData = { services: {} };
let experiencesData = { experiences: {} };
let blogData = { posts: {} };
let database = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        database = firebase.database();
        await loadAllData();
        setupEventListeners();
        setupMobileTouch();
    } catch (error) {
        console.error("Initialization error:", error);
        loadFromLocalStorage();
    }
}

// ===== DATA FUNCTIONS =====
async function fetchFromFirebase(path) {
    if (!database) return loadFromLocalStorage(path);
    
    try {
        const snapshot = await database.ref(path).once('value');
        const data = snapshot.val();
        if (data) {
            localStorage.setItem(`luxurymove_${path}`, JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(`Firebase fetch error (${path}):`, error.message);
        return loadFromLocalStorage(path);
    }
}

function loadFromLocalStorage(path) {
    try {
        const data = localStorage.getItem(`luxurymove_${path}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`LocalStorage load error (${path}):`, error);
        return null;
    }
}

// ===== DATA LOADING =====
async function loadAllData() {
    try {
        const [services, experiences, blog] = await Promise.allSettled([
            fetchFromFirebase('services'),
            fetchFromFirebase('experiences'),
            fetchFromFirebase('blog')
        ]);
        
        servicesData = services.value || JSON.parse(localStorage.getItem('luxurymove_services')) || { services: {} };
        experiencesData = experiences.value || JSON.parse(localStorage.getItem('luxurymove_experiences')) || { experiences: getDefaultExperiences() };
        blogData = blog.value || JSON.parse(localStorage.getItem('luxurymove_blog')) || { posts: getSampleBlogPosts() };
        
        renderUI();
        renderExperiencesUI();
        renderBlogRow();
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

// ===== RENDER FUNCTIONS =====
function renderUI() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;
    
    const services = servicesData.services || {};
    
    if (Object.keys(services).length === 0) {
        servicesGrid.innerHTML = '';
        return;
    }
    
    servicesGrid.innerHTML = '';
    
    Object.entries(services).forEach(([id, item]) => {
        const imageUrl = item.images && item.images.length > 0 
            ? item.images[0] 
            : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=500';
        
        const features = item.features || [];
        const displayFeatures = features.slice(0, 3);
        
        const card = document.createElement('div');
        card.className = 'service-card';
        card.setAttribute('data-service', id);
        
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

function renderExperiencesUI() {
    const experienceRow = document.querySelector('.user-experience-row');
    if (!experienceRow || !experiencesData.experiences) return;
    
    experienceRow.innerHTML = '';
    
    Object.entries(experiencesData.experiences).forEach(([id, experience]) => {
        const card = document.createElement('div');
        card.className = 'experience-card';
        
        card.innerHTML = `
            <div class="exp-header-top">
                <div class="exp-img-box">
                    <img src="${experience.image}" alt="${experience.title}" loading="lazy">
                </div>
                <h3 class="exp-title">${experience.title}</h3>
            </div>
            <div class="exp-benefits">
                ${(experience.benefits || []).map(benefit => `
                    <div class="benefit-item">
                        <i class="fas fa-check"></i>
                        <span>${benefit}</span>
                    </div>
                `).join('')}
            </div>
            <p class="exp-desc">${experience.description || ''}</p>
        `;
        
        experienceRow.appendChild(card);
    });
}

function renderBlogRow() {
    const blogRow = document.getElementById('blogRow');
    const posts = blogData.posts || {};
    
    if (!blogRow) return;
    
    if (Object.keys(posts).length === 0) {
        blogRow.innerHTML = `
            <div class="empty-blog">
                <i class="fas fa-newspaper"></i>
                <p>Chưa có bài viết nào</p>
                <a href="blog.html" class="btn btn-outline">Xem blog</a>
            </div>
        `;
        return;
    }
    
    const latestPosts = Object.entries(posts)
        .sort((a, b) => {
            const dateA = new Date(a[1].date || '2000-01-01');
            const dateB = new Date(b[1].date || '2000-01-01');
            return dateB - dateA;
        })
        .slice(0, 8);
    
    let html = '';
    latestPosts.forEach(([id, post]) => {
        const date = new Date(post.date || new Date()).toLocaleDateString('vi-VN');
        const categoryName = getCategoryName(post.category);
        
        html += `
            <div class="blog-horizontal-card" onclick="openBlogPostFromHomepage('${id}')">
                <div class="blog-card-image">
                    <img src="${post.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800'}" 
                         alt="${post.title}" 
                         loading="lazy">
                    <span class="blog-card-category">${categoryName}</span>
                </div>
                <div class="blog-card-content">
                    <div class="blog-card-meta">
                        <span class="blog-card-author">
                            <i class="fas fa-user"></i> ${post.author || 'Admin'}
                        </span>
                        <span class="blog-card-date">
                            <i class="far fa-calendar"></i> ${date}
                        </span>
                    </div>
                    <h3 class="blog-card-title">${post.title || 'Bài viết mới'}</h3>
                    <p class="blog-card-excerpt">${post.excerpt || 'Đang cập nhật nội dung...'}</p>
                    <a href="#" class="blog-read-more" onclick="openBlogPostFromHomepage('${id}'); return false;">
                        Đọc tiếp <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    });
    
    blogRow.innerHTML = html;
}

// ===== SERVICE DETAIL MODAL =====
function showServiceDetail(serviceId) {
    const service = servicesData.services[serviceId];
    if (!service) return;
    
    const modal = document.getElementById('serviceDetails');
    if (!modal) return;
    
    document.getElementById('detailTitle').textContent = service.title;
    document.getElementById('detailSubtitle').textContent = service.subtitle || service.title;
    
    const detailContent = document.getElementById('detailContent');
    
    let contentHTML = `
        <div class="details-images">
    `;
    
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
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// ===== HELPER FUNCTIONS =====
function changeDetailImage(thumbElement, imageUrl) {
    const mainImage = document.querySelector('.detail-image-main img');
    if (mainImage) {
        mainImage.src = imageUrl;
    }
    
    document.querySelectorAll('.detail-thumb').forEach(thumb => {
        thumb.classList.remove('active');
    });
    thumbElement.classList.add('active');
}

function bookThisService(serviceId) {
    const service = servicesData.services[serviceId];
    if (!service) return;
    
    const serviceSelect = document.getElementById('serviceType');
    if (serviceSelect) {
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
            const newOption = new Option(service.title, serviceId);
            serviceSelect.add(newOption);
            serviceSelect.value = serviceId;
        }
    }
    
    document.getElementById('serviceDetails').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
        
        setTimeout(() => {
            const nameInput = document.getElementById('customerName');
            if (nameInput) nameInput.focus();
        }, 500);
    }
}

function getCategoryName(category) {
    const categories = {
        'travel': 'Du lịch',
        'tips': 'Mẹo hay',
        'news': 'Tin tức',
        'review': 'Đánh giá',
        'service': 'Dịch vụ'
    };
    return categories[category] || 'Khác';
}

function openBlogPostFromHomepage(postId) {
    if (typeof openBlogPost === 'function') {
        openBlogPost(postId);
    } else {
        window.location.href = `blog.html#post-${postId}`;
    }
}

// ===== SETUP FUNCTIONS =====
function setupEventListeners() {
    // Modal chi tiết dịch vụ
    const modal = document.getElementById('serviceDetails');
    const closeBtn = document.getElementById('closeDetails');
    
    if (modal && closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Form đặt xe
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const serviceType = document.getElementById('serviceType');
            const customerName = document.getElementById('customerName').value;
            const customerPhone = document.getElementById('customerPhone').value;
            
            const serviceName = serviceType.options[serviceType.selectedIndex].text;
            alert(`✅ Đã gửi yêu cầu thành công!\n\n📞 Chúng tôi sẽ gọi lại số:\n${customerPhone}\n\n📋 Dịch vụ: ${serviceName}\n👤 Tên: ${customerName}\n\n⏳ Thời gian: Trong 3 phút`);
            
            bookingForm.reset();
        });
    }
}

function setupMobileTouch() {
    if (window.innerWidth <= 767) {
        document.querySelectorAll('.experience-card').forEach(card => {
            let touchTimer;
            
            card.addEventListener('touchstart', function() {
                touchTimer = setTimeout(() => {
                    const desc = this.querySelector('.exp-desc');
                    if (desc) {
                        desc.style.display = 'block';
                    }
                }, 500);
            });
            
            card.addEventListener('touchend', function() {
                clearTimeout(touchTimer);
                
                const desc = this.querySelector('.exp-desc');
                if (desc && desc.style.display === 'block') {
                    setTimeout(() => {
                        desc.style.display = 'none';
                    }, 2000);
                }
            });
            
            card.addEventListener('touchmove', function() {
                clearTimeout(touchTimer);
            });
        });
    }
}

// ===== DEFAULT DATA =====
function getDefaultExperiences() {
    return {
        'family': {
            title: 'Cho Gia Đình',
            image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=500',
            description: 'Hành trình ấm cúng, an tâm cho gia đình bạn',
            benefits: [
                'An toàn tuyệt đối cho người thân',
                'Tiện nghi cho trẻ em & người lớn tuổi',
                'Không gian riêng tư, thoải mái'
            ]
        },
        'friends': {
            title: 'Cho Bạn Bè',
            image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=500',
            description: 'Chuyến đi vui vẻ cùng những người bạn thân',
            benefits: [
                'Thoải mái trò chuyện, tạo kỷ niệm',
                'Điểm dừng linh hoạt theo nhóm',
                'Chi phí chia sẻ hợp lý'
            ]
        }
    };
}

function getSampleBlogPosts() {
    return {
        'post1': {
            title: 'Kinh Nghiệm Du Lịch Nha Trang 2024',
            author: 'LuxuryMove Team',
            date: '2024-12-15',
            category: 'travel',
            image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800',
            excerpt: 'Khám phá những điểm đến hấp dẫn tại Nha Trang',
            content: `<h2>Giới Thiệu Về Nha Trang</h2><p>Nha Trang - thành phố biển xinh đẹp...</p>`,
            tags: ['nha trang', 'du lịch', 'biển', 'kinh nghiệm']
        }
    };
}

//
