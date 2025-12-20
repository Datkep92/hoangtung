
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

// Biến toàn cục - SỬA TÊN BIẾN BLOG
let servicesData = { services: {} };
let experiencesData = { experiences: {} };
let homepageBlogData = { posts: {} }; // ĐỔI TÊN THÀNH homepageBlogData
let database = null;

// ===== HORIZONTAL SCROLL FUNCTIONS =====
function setupHorizontalScroll() {
    console.log('Setting up horizontal scroll...');
    
    const experienceRow = document.querySelector('.user-experience-row');
    const blogRow = document.querySelector('.blog-horizontal-row');
    const galleryGrid = document.querySelector('.gallery-grid');
    
    if (experienceRow) {
        fixScrollContainer(experienceRow);
    }
    if (blogRow) {
        fixScrollContainer(blogRow);
    }
    if (galleryGrid) {
        fixScrollContainer(galleryGrid);
    }
}

function fixScrollContainer(container) {
    if (!container) return;
    
    // Đảm bảo có đúng CSS
    container.style.display = 'flex';
    container.style.flexWrap = 'nowrap';
    container.style.overflowX = 'auto';
    container.style.scrollBehavior = 'smooth';
    container.style.WebkitOverflowScrolling = 'touch';
    container.style.scrollbarWidth = 'none';
    container.style.msOverflowStyle = 'none';
    
    // Kiểm tra và fix các items bên trong
    const items = container.children;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        item.style.flexShrink = '0';
        item.style.flexGrow = '0';
        
        // Đặt width cố định nếu chưa có
        if (!item.style.width) {
            if (container.classList.contains('user-experience-row')) {
                item.style.width = '280px';
            } else if (container.classList.contains('blog-horizontal-row')) {
                item.style.width = '320px';
            } else if (container.classList.contains('gallery-grid')) {
                item.style.width = '300px';
            }
        }
    }
}

// ===== BLOG FUNCTIONS FOR HOMEPAGE =====
async function fetchBlogFromFirebase() {
    if (!database) return null;
    
    try {
        const snapshot = await database.ref('blog').once('value');
        const data = snapshot.val();
        
        if (data) {
            console.log("✅ Loaded blog from Firebase:", Object.keys(data.posts || {}).length, "posts");
            localStorage.setItem('luxurymove_blog', JSON.stringify(data));
            return data;
        }
        return null;
    } catch (error) {
        console.error("❌ Error fetching blog from Firebase:", error);
        return null;
    }
}

async function loadBlogForHomepage() {
    try {
        console.log("📚 Loading blog for homepage...");
        
        // Try Firebase first
        let blog = await fetchBlogFromFirebase();
        
        if (!blog || !blog.posts) {
            // Fallback to localStorage
            const localData = localStorage.getItem('luxurymove_blog');
            if (localData) {
                blog = JSON.parse(localData);
                console.log("📂 Loaded blog from localStorage:", Object.keys(blog.posts || {}).length);
            } else {
                // Use sample data
                blog = { posts: getSampleBlogPosts() };
                console.log("🎨 Using sample blog posts");
            }
        }
        
        homepageBlogData = blog; // SỬ DỤNG homepageBlogData
        renderBlogRow();
        
    } catch (error) {
        console.error("❌ Error loading blog for homepage:", error);
        // Show error state
        showBlogError();
    }
}

function renderBlogRow() {
    const blogRow = document.getElementById('blogRow');
    if (!blogRow) {
        console.error("❌ blogRow element not found");
        return;
    }
    
    const posts = homepageBlogData.posts || {}; // SỬ DỤNG homepageBlogData
    
    if (Object.keys(posts).length === 0) {
        blogRow.innerHTML = `
            <div class="empty-blog" style="min-width: 300px; text-align: center; padding: 40px; color: var(--text-tertiary);">
                <i class="fas fa-newspaper" style="font-size: 32px; margin-bottom: 15px; display: block;"></i>
                <p>Chưa có bài viết nào</p>
                <a href="blog.html" class="btn btn-outline" style="margin-top: 15px; font-size: 14px; padding: 8px 16px;">
                    <i class="fas fa-plus"></i> Đăng bài viết
                </a>
            </div>
        `;
        return;
    }
    
    // Get latest posts sorted by date
    const latestPosts = Object.entries(posts)
        .sort((a, b) => {
            const dateA = new Date(a[1].date || '2000-01-01');
            const dateB = new Date(b[1].date || '2000-01-01');
            return dateB - dateA;
        })
        .slice(0, 6);
    
    if (latestPosts.length === 0) {
        blogRow.innerHTML = `
            <div class="empty-blog">
                <i class="fas fa-newspaper"></i>
                <p>Chưa có bài viết nào</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    latestPosts.forEach(([id, post]) => {
        const date = new Date(post.date || new Date()).toLocaleDateString('vi-VN');
        const categoryName = getCategoryName(post.category);
        
        html += `
            <div class="blog-horizontal-card" onclick="openBlogPostFromHomepage('${id}')">
                <div class="blog-card-image">
                    <img src="${post.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800'}" 
                         alt="${post.title}" 
                         loading="lazy"
                         onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800'">
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
                    
                    ${post.tags && post.tags.length > 0 ? `
                        <div class="blog-card-tags">
                            ${post.tags.slice(0, 2).map(tag => `
                                <span class="blog-card-tag">#${tag}</span>
                            `).join('')}
                            ${post.tags.length > 2 ? `<span class="blog-card-tag">+${post.tags.length - 2}</span>` : ''}
                        </div>
                    ` : ''}
                    
                    <a href="#" class="blog-read-more" onclick="openBlogPostFromHomepage('${id}'); event.stopPropagation(); return false;">
                        Đọc tiếp <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    });
    
    blogRow.innerHTML = html;
    
    // Setup horizontal scroll after rendering
    setTimeout(() => {
        setupHorizontalScroll();
    }, 100);
}

function showBlogError() {
    const blogRow = document.getElementById('blogRow');
    if (!blogRow) return;
    
    blogRow.innerHTML = `
        <div class="blog-error" style="min-width: 300px; text-align: center; padding: 40px; color: var(--text-tertiary);">
            <i class="fas fa-exclamation-triangle" style="font-size: 32px; margin-bottom: 15px; color: #ff4444; display: block;"></i>
            <p>Không thể tải bài viết</p>
            <button onclick="loadBlogForHomepage()" class="btn btn-secondary" style="margin-top: 15px; font-size: 14px; padding: 8px 16px;">
                <i class="fas fa-redo"></i> Thử lại
            </button>
        </div>
    `;
}

function openBlogPostFromHomepage(postId) {
    // Save postId to localStorage to open in blog.html
    localStorage.setItem('luxurymove_open_post', postId);
    
    // Redirect to blog.html
    window.location.href = 'blog.html';
}

// ===== UPDATE INITIALIZATION =====
async function loadAllData() {
    console.log("🔄 Loading all data...");
    
    try {
        // Load services, experiences, gallery, and blog in parallel
        const [services, experiences, gallery, blog] = await Promise.allSettled([
            fetchFromFirebase('services'),
            fetchFromFirebase('experiences'),
            fetchFromFirebase('gallery'),
            fetchBlogFromFirebase()
        ]);
        
        // Xử lý services
        servicesData = services.value || JSON.parse(localStorage.getItem('luxurymove_services')) || { services: {} };
        
        // Xử lý experiences
        experiencesData = experiences.value || JSON.parse(localStorage.getItem('luxurymove_experiences')) || { experiences: getDefaultExperiences() };
        
        // Xử lý gallery - chỉ gọi nếu có gallery.js
        if (typeof window.renderGallery === 'function' && gallery.value) {
            window.galleryData = gallery.value;
            window.renderGallery();
        }
        
        // Xử lý blog - SỬ DỤNG homepageBlogData
        if (blog.status === 'fulfilled' && blog.value) {
            homepageBlogData = blog.value;
        } else {
            const localBlog = localStorage.getItem('luxurymove_blog');
            homepageBlogData = localBlog ? JSON.parse(localBlog) : { posts: getSampleBlogPosts() };
        }
        
        // Render UI
        renderUI();
        renderExperiencesUI();
        renderBlogRow();
        
        console.log("✅ All data loaded successfully");
        
    } catch (error) {
        console.error("❌ Error loading data:", error);
        // Fallback to localStorage
        loadFromLocalStorage();
        renderBlogRow();
    }
}

// ===== FIREBASE LISTENER FOR BLOG UPDATES =====
function setupBlogFirebaseListener() {
    if (!database) return;
    
    // Listen for blog updates in real-time
    database.ref('blog/posts').on('value', (snapshot) => {
        console.log("🔄 Blog data updated from Firebase");
        const data = snapshot.val();
        
        if (data) {
            homepageBlogData.posts = data; // SỬ DỤNG homepageBlogData
            localStorage.setItem('luxurymove_blog', JSON.stringify({ posts: data }));
            renderBlogRow();
        }
    });
}

// ===== INITIALIZATION =====
async function initApp() {
    try {
        console.log("🚀 LuxuryMove Website Initializing...");
        
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        database = firebase.database();
        
        // Load all data
        await loadAllData();
        
        // Setup event listeners
        setupEventListeners();
        setupMobileTouch();
        setupHorizontalScroll(); // GỌI HÀM NÀY
        
        // Setup blog Firebase listener for real-time updates
        setupBlogFirebaseListener();
        
        console.log("✅ Website initialized successfully");
        
    } catch (error) {
        console.error("❌ Lỗi khởi tạo:", error);
        // Load from localStorage as fallback
        loadFromLocalStorage();
        renderBlogRow();
        setupHorizontalScroll(); // VẪN GỌI KHI CÓ LỖI
    }
}

// ===== CÁC HÀM CÒN LẠI GIỮ NGUYÊN =====
// ... (các hàm fetchFromFirebase, loadFromLocalStorage, renderUI, 
// renderExperiencesUI, setupEventListeners, setupMobileTouch,
// getDefaultExperiences, getSampleBlogPosts, getCategoryName,
// showServiceDetail, bookThisService, changeDetailImage vẫn giữ nguyên) ...

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

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



// ===== SERVICE DETAIL MODAL =====
function showServiceDetail(serviceId) {
    const service = servicesData.services[serviceId];
    if (!service) {
        console.error('Service not found:', serviceId);
        alert('Không tìm thấy thông tin dịch vụ');
        return;
    }
    
    const modal = document.getElementById('serviceDetails');
    if (!modal) {
        console.error('Modal element not found');
        return;
    }
    
    // Cập nhật tiêu đề - KIỂM TRA PHẦN TỬ TỒN TẠI TRƯỚC KHI SET
    const detailTitle = document.getElementById('detailTitle');
    const detailSubtitle = document.getElementById('detailSubtitle');
    
    if (detailTitle) detailTitle.textContent = service.title || 'Dịch vụ';
    if (detailSubtitle) detailSubtitle.textContent = service.subtitle || service.title || 'Dịch vụ cao cấp';
    
    // Lấy container nội dung
    const detailContent = document.getElementById('detailContent');
    if (!detailContent) {
        console.error('Detail content element not found');
        return;
    }
    
    // Tạo HTML nội dung
    let contentHTML = `
        <div class="details-images">
    `;
    
    // Xử lý hình ảnh
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
    } else {
        // Ảnh mặc định nếu không có
        contentHTML += `
            <div class="detail-image-main">
                <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800" alt="${service.title}" loading="lazy">
            </div>
        `;
    }
    
    contentHTML += `
        </div>
        
        <div class="details-info">
            <h4>Mô tả dịch vụ</h4>
            <p class="detail-description">${service.description || 'Đang cập nhật thông tin chi tiết...'}</p>
            
            <h4>Tính năng nổi bật</h4>
            <div class="detail-features">
    `;
    
    // Xử lý tính năng
    if (service.features && service.features.length > 0) {
        service.features.forEach(feature => {
            contentHTML += `
                <div class="detail-feature-item">
                    <i class="fas fa-check-circle"></i>
                    <span>${feature}</span>
                </div>
            `;
        });
    } else {
        // Tính năng mặc định
        contentHTML += `
            <div class="detail-feature-item">
                <i class="fas fa-check-circle"></i>
                <span>Chất lượng cao cấp</span>
            </div>
            <div class="detail-feature-item">
                <i class="fas fa-check-circle"></i>
                <span>Đúng giờ 100%</span>
            </div>
            <div class="detail-feature-item">
                <i class="fas fa-check-circle"></i>
                <span>Tài xế chuyên nghiệp</span>
            </div>
        `;
    }
    
    contentHTML += `
            </div>
            
            <h4>Bảng giá tham khảo</h4>
            <div class="detail-pricing">
    `;
    
    // Xử lý bảng giá
    if (service.pricing && service.pricing.length > 0) {
        service.pricing.forEach(price => {
            contentHTML += `
                <div class="detail-price-item">
                    <span class="price-label">${price.label || 'Dịch vụ'}</span>
                    <span class="price-value">${price.price || 'Liên hệ'}</span>
                </div>
            `;
        });
    } else {
        // Giá mặc định
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
    
    // Gán nội dung vào modal
    detailContent.innerHTML = contentHTML;
    
    // Hiển thị modal
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
