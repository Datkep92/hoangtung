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
let homepageBlogData = { posts: {} };
let database = null;
let horizontalScrollSetup = false; // ⭐ THÊM BIẾN NÀY

// ===== HORIZONTAL SCROLL FUNCTIONS - OPTIMIZED =====
function setupHorizontalScroll() {
    if (horizontalScrollSetup) {
        return; // ⭐ CHỈ CHẠY 1 LẦN
    }
    horizontalScrollSetup = true;
    
    console.log('Setting up horizontal scroll...');
    
    const containers = [
        '.user-experience-row',
        '.blog-horizontal-row', 
        '.gallery-grid'
    ];
    
    containers.forEach(selector => {
        const container = document.querySelector(selector);
        if (container) {
            fixScrollContainer(container);
        }
    });
}

function fixScrollContainer(container) {
    if (!container) return;
    
    // Optimized CSS setup
    Object.assign(container.style, {
        display: 'flex',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
    });
    
    // Set fixed widths for items
    const widthMap = {
        'user-experience-row': '280px',
        'blog-horizontal-row': '320px',
        'gallery-grid': '300px'
    };
    
    const className = Array.from(container.classList).find(cls => cls in widthMap);
    const defaultWidth = widthMap[className] || '300px';
    
    Array.from(container.children).forEach(item => {
        Object.assign(item.style, {
            flexShrink: '0',
            flexGrow: '0',
            width: item.style.width || defaultWidth
        });
    });
}

// ===== BLOG FUNCTIONS - OPTIMIZED =====
async function fetchBlogFromFirebase() {
    if (!database) return null;
    
    try {
        const snapshot = await database.ref('blog').once('value');
        const data = snapshot.val();
        
        if (data && data.posts) {
            console.log("✅ Loaded blog from Firebase:", Object.keys(data.posts).length, "posts");
            localStorage.setItem('HTUTransport_blog', JSON.stringify(data));
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
            const localData = localStorage.getItem('HTUTransport_blog');
            if (localData) {
                blog = JSON.parse(localData);
                console.log("📂 Loaded blog from localStorage:", Object.keys(blog.posts || {}).length);
            } else {
                // Use sample data
                blog = { posts: getSampleBlogPosts() };
                console.log("🎨 Using sample blog posts");
            }
        }
        
        homepageBlogData = blog;
        renderBlogRow();
        
    } catch (error) {
        console.error("❌ Error loading blog for homepage:", error);
        showBlogError();
    }
}

function renderBlogRow() {
    const blogRow = document.getElementById('blogRow');
    if (!blogRow) {
        console.error("❌ blogRow element not found");
        return;
    }
    
    const posts = homepageBlogData.posts || {};
    
    if (Object.keys(posts).length === 0) {
        blogRow.innerHTML = `
            <div class="empty-blog">
                <i class="fas fa-newspaper"></i>
                <p>Chưa có bài viết nào</p>
                <a href="blog.html" class="btn btn-outline">
                    <i class="fas fa-plus"></i> Đăng bài viết
                </a>
            </div>
        `;
        return;
    }
    
    // Get latest 6 posts sorted by date
    const latestPosts = Object.entries(posts)
        .sort((a, b) => new Date(b[1].date || 0) - new Date(a[1].date || 0))
        .slice(0, 6);
    
    if (latestPosts.length === 0) {
        blogRow.innerHTML = '<div class="empty-blog">Chưa có bài viết nào</div>';
        return;
    }
    
    let html = '';
    latestPosts.forEach(([id, post]) => {
        const date = new Date(post.date || new Date()).toLocaleDateString('vi-VN');
        const categoryName = getCategoryName(post.category);
        const tags = post.tags || [];
        
        html += `
            <div class="blog-horizontal-card" onclick="openBlogPostFromHomepage('${id}')">
                <div class="blog-card-image">
                    <img src="${post.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800'}" 
                         alt="${post.title}" 
                         loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800'">
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
                    
                    ${tags.length > 0 ? `
                        <div class="blog-card-tags">
                            ${tags.slice(0, 2).map(tag => `<span class="blog-card-tag">#${tag}</span>`).join('')}
                            ${tags.length > 2 ? `<span class="blog-card-tag">+${tags.length - 2}</span>` : ''}
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
    
    // Setup horizontal scroll once
    setTimeout(() => {
        if (!horizontalScrollSetup) {
            setupHorizontalScroll();
        }
    }, 100);
}

// ===== SITEMAP FUNCTION =====
function updateBlogSitemap() {
    if (window.SEOHelper && homepageBlogData?.posts && Object.keys(homepageBlogData.posts).length > 0) {
        console.log('📝 Updating sitemap with blog posts:', Object.keys(homepageBlogData.posts).length);
        window.SEOHelper.updateSitemapWithBlogPosts(homepageBlogData.posts);
    }
}

// ===== DATA LOADING - OPTIMIZED =====
async function loadAllData() {
    console.log("🔄 Loading all data...");
    
    try {
        const [services, experiences, gallery, blog] = await Promise.allSettled([
            fetchFromFirebase('services'),
            fetchFromFirebase('experiences'),
            fetchFromFirebase('gallery'),
            fetchBlogFromFirebase()
        ]);
        
        // Process services
        servicesData = services.value || JSON.parse(localStorage.getItem('HTUTransport_services')) || { services: {} };
        
        // Process experiences
        experiencesData = experiences.value || JSON.parse(localStorage.getItem('HTUTransport_experiences')) || { experiences: getDefaultExperiences() };
        
        // Process gallery
        if (typeof window.renderGallery === 'function' && gallery.value) {
            window.galleryData = gallery.value;
            window.renderGallery();
        }
        
        // Process blog
        let blogData = null;
        if (blog.status === 'fulfilled' && blog.value) {
            blogData = blog.value;
        } else {
            const localBlog = localStorage.getItem('HTUTransport_blog');
            blogData = localBlog ? JSON.parse(localBlog) : { posts: getSampleBlogPosts() };
        }
        
        homepageBlogData = blogData;
        updateBlogSitemap();
        
        // Render UI
        renderUI();
        renderExperiencesUI();
        renderBlogRow();
        
        console.log("✅ All data loaded successfully");
        
    } catch (error) {
        console.error("❌ Error loading data:", error);
        loadFromLocalStorage();
        renderBlogRow();
        updateBlogSitemap();
    }
}

// ===== INITIALIZATION - CLEAN =====
async function initApp() {
    try {
        if (window.location.pathname.includes('post-')) {
            console.log("📄 Single post page, skipping homepage initialization");
            return;
        }
        
        console.log("🚀 HTUTransport Website Initializing...");
        
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        database = firebase.database();
        
        // Load all data
        await loadAllData();
        
        // Setup horizontal scroll once
        if (!horizontalScrollSetup) {
            setupHorizontalScroll();
        }
        
        // Setup event listeners
        setupEventListeners();
        setupMobileTouch();
        setupBlogFirebaseListener();
        
        console.log("✅ Website initialized successfully");
        
    } catch (error) {
        console.error("❌ Lỗi khởi tạo:", error);
        loadFromLocalStorage();
        renderBlogRow();
        if (!horizontalScrollSetup) {
            setupHorizontalScroll();
        }
        updateBlogSitemap();
    }
}

// ===== FIREBASE LISTENER =====
function setupBlogFirebaseListener() {
    if (!database) return;
    
    database.ref('blog/posts').on('value', (snapshot) => {
        console.log("🔄 Blog data updated from Firebase");
        const data = snapshot.val();
        
        if (data) {
            homepageBlogData.posts = data;
            localStorage.setItem('HTUTransport_blog', JSON.stringify({ posts: data }));
            renderBlogRow();
            updateBlogSitemap();
        }
    });
}

// ===== OPEN BLOG POST =====
function openBlogPostFromHomepage(postId) {
    const post = homepageBlogData.posts[postId];
    if (!post) return;
    
    if (window.location.pathname.includes('blog.html')) {
        if (typeof blogRouter !== 'undefined') {
            blogRouter.navigateToPost(postId, post.title);
            return;
        }
    }
    
    window.location.href = `blog.html?post=${postId}`;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// ===== CÁC HÀM CÒN LẠI GIỮ NGUYÊN =====
// ... (các hàm fetchFromFirebase, loadFromLocalStorage, renderUI, 
// renderExperiencesUI, setupEventListeners, setupMobileTouch,
// getDefaultExperiences, getSampleBlogPosts, getCategoryName,
// showServiceDetail, bookThisService, changeDetailImage,
// showQuickBookToast, quickBookExperience, showExperienceInfo,
// closeExperienceModal, handleBookingSubmit, getClientIP,
// initializeFirebaseStructure vẫn giữ nguyên) ...


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




// Gọi hàm này trong loadAllData() sau khi blog được load
// Thêm hàm xử lý nếu đang ở trang bài viết đơn
function checkForSinglePost() {
    if (window.location.pathname.includes('post-')) {
        // Đây là trang bài viết đơn, không chạy các hàm khác
        return true;
    }
    return false;
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
            localStorage.setItem(`HTUTransport_${path}`, JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(`Firebase fetch error (${path}):`, error.message);
        return loadFromLocalStorage(path);
    }
}

function loadFromLocalStorage(path) {
    try {
        const data = localStorage.getItem(`HTUTransport_${path}`);
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
            <button class="btn-view-details" onclick="showServiceDetail('${id}')">Xem chi tiết</button>
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
            
            <!-- Thêm nút đặt lịch -->
            <div class="exp-book-section">
                <button class="exp-book-btn" onclick="quickBookExperience('${experience.title}')">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Đặt ngay ${experience.title}</span>
                </button>
                <button class="exp-info-btn" onclick="showExperienceInfo('${id}')">
                    <i class="fas fa-info-circle"></i>
                    <span>Chi tiết</span>
                </button>
            </div>
        `;
        
        experienceRow.appendChild(card);
    });
}

// Thêm CSS cho nút đặt lịch
const experienceButtonCSS = `
    .exp-book-section {
        display: flex;
        gap: 10px;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(212, 175, 55, 0.15);
    }
    
    .exp-book-btn, .exp-info-btn {
        flex: 1;
        padding: 12px 15px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: none;
        text-align: center;
        min-height: 44px;
    }
    
    .exp-book-btn {
        background: rgba(76, 175, 80, 0.1);
        color: #4CAF50;
        border: 2px solid rgba(76, 175, 80, 0.3);
    }
    
    .exp-book-btn:hover {
        background: rgba(76, 175, 80, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(76, 175, 80, 0.2);
    }
    
    .exp-book-btn:active {
        transform: translateY(0);
    }
    
    .exp-info-btn {
        background: rgba(212, 175, 55, 0.1);
        color: var(--champagne);
        border: 2px solid rgba(212, 175, 55, 0.3);
    }
    
    .exp-info-btn:hover {
        background: rgba(212, 175, 55, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(212, 175, 55, 0.2);
    }
    
    .exp-info-btn:active {
        transform: translateY(0);
    }
    
    .exp-book-btn i, .exp-info-btn i {
        font-size: 16px;
    }
    
    .exp-book-btn span, .exp-info-btn span {
        font-size: 13px;
        line-height: 1.2;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .exp-book-section {
            flex-direction: column;
            gap: 8px;
        }
        
        .exp-book-btn, .exp-info-btn {
            width: 100%;
        }
        
        .exp-book-btn span, .exp-info-btn span {
            font-size: 12px;
        }
    }
    
    @media (max-width: 480px) {
        .exp-book-btn, .exp-info-btn {
            padding: 10px 12px;
            min-height: 40px;
        }
        
        .exp-book-btn i, .exp-info-btn i {
            font-size: 14px;
        }
    }
`;
// Thêm sau phần CSS cho experienceButtonCSS
const highlightBookingCSS = `
    .highlight-booking {
        animation: highlight-pulse 2s ease-in-out;
        position: relative;
    }
    
    .highlight-booking::before {
        content: '';
        position: absolute;
        top: -5px;
        left: -5px;
        right: -5px;
        bottom: -5px;
        border: 2px solid var(--champagne);
        border-radius: 15px;
        animation: border-pulse 2s ease-in-out;
        z-index: -1;
    }
    
    @keyframes highlight-pulse {
        0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
        70% { box-shadow: 0 0 0 20px rgba(212, 175, 55, 0); }
        100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
    }
    
    @keyframes border-pulse {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.05); }
        100% { opacity: 0; transform: scale(1.1); }
    }
`;

// Thêm vào head nếu chưa có
if (!document.getElementById('highlightBookingCSS')) {
    const style = document.createElement('style');
    style.id = 'highlightBookingCSS';
    style.textContent = highlightBookingCSS;
    document.head.appendChild(style);
}
// Thêm CSS vào head nếu chưa có
if (!document.getElementById('experienceButtonCSS')) {
    const style = document.createElement('style');
    style.id = 'experienceButtonCSS';
    style.textContent = experienceButtonCSS;
    document.head.appendChild(style);
}
function showQuickBookToast(experienceTitle) {
    // Tạo toast element nếu chưa có
    if (!document.getElementById('quickBookToast')) {
        const toastHTML = `
            <div id="quickBookToast" class="quick-book-toast">
                <i class="fas fa-calendar-check"></i>
                <span class="toast-text">Đã chọn: <strong>${experienceTitle}</strong></span>
                <button class="toast-close" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', toastHTML);
        
        // Tự động xóa sau 3 giây
        setTimeout(() => {
            const toast = document.getElementById('quickBookToast');
            if (toast) {
                toast.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 3000);
        
        // Thêm CSS nếu chưa có
        if (!document.getElementById('toastCSS')) {
    const style = document.createElement('style');
    style.id = 'toastCSS';
    style.textContent = `
                .quick-book-toast {
                    position: fixed;
                    bottom: 100px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, var(--card-black), #1a1a1a);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    border-radius: 12px;
                    padding: 12px 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease forwards;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                }
                
                .quick-book-toast i.fa-calendar-check {
                    color: #4CAF50;
                    font-size: 18px;
                }
                
                .toast-text {
                    color: var(--text-primary);
                    font-size: 14px;
                }
                
                .toast-close {
                    background: transparent;
                    border: none;
                    color: var(--text-tertiary);
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 5px;
                    transition: all 0.2s ease;
                }
                
                .toast-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--text-primary);
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
                
                @keyframes slideOut {
                    from {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(-50%) translateY(30px);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}
// Function xử lý đặt lịch từ experience
function quickBookExperience(experienceTitle) {
    // Đóng modal bảng giá nếu đang mở
    if (document.getElementById('fullPricingModal')) {
        closeFullPricingPage();
    }
    
    // Lưu experience đã chọn
    const experienceData = {
        title: experienceTitle,
        type: 'experience',
        timestamp: Date.now()
    };
    
    sessionStorage.setItem('selectedService', JSON.stringify(experienceData));
    
    // Hiển thị toast thông báo
    showQuickBookToast(experienceTitle);
    
    // Chuyển đến section booking
    setTimeout(() => {
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
            // Cuộn đến booking section
            bookingSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // Thêm hiệu ứng highlight
            bookingSection.classList.add('highlight-booking');
            
            // Tự động điền vào form booking
            setTimeout(() => {
                // Điền vào service select
                const serviceSelect = document.querySelector('.form-select[name="service"]');
                if (serviceSelect) {
                    serviceSelect.focus();
                    
                    // Tìm option phù hợp
                    const options = Array.from(serviceSelect.options);
                    const matchingOption = options.find(option => 
                        option.text.toLowerCase().includes(experienceTitle.toLowerCase()) || 
                        experienceTitle.toLowerCase().includes(option.text.toLowerCase())
                    );
                    
                    if (matchingOption) {
                        serviceSelect.value = matchingOption.value;
                    } else {
                        // Nếu không tìm thấy, điền vào text input nếu có
                        const serviceInput = document.querySelector('.form-input[name="service"]');
                        if (serviceInput) {
                            serviceInput.value = experienceTitle;
                            serviceInput.focus();
                        }
                    }
                }
                
                // Xóa highlight sau 3 giây
                setTimeout(() => {
                    bookingSection.classList.remove('highlight-booking');
                }, 3000);
                
            }, 500);
        }
    }, 800);
}

// Function hiển thị chi tiết experience (tùy chọn)
function showExperienceInfo(experienceId) {
    const experience = experiencesData.experiences[experienceId];
    if (!experience) return;
    
    // Tạo modal hiển thị chi tiết
    const modalHTML = `
        <div class="experience-modal-overlay" id="experienceModal${experienceId}">
            <div class="experience-modal-container">
                <div class="experience-modal-header">
                    <h3 class="modal-title">
                        <i class="fas fa-star"></i>
                        ${experience.title}
                    </h3>
                    <button class="modal-close-btn" onclick="closeExperienceModal('${experienceId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="experience-modal-content">
                    <div class="modal-image">
                        <img src="${experience.image}" alt="${experience.title}" loading="lazy">
                    </div>
                    
                    <div class="modal-benefits">
                        <h4><i class="fas fa-check-circle"></i> Lợi ích</h4>
                        <ul>
                            ${(experience.benefits || []).map(benefit => `
                                <li><i class="fas fa-check"></i> ${benefit}</li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="modal-description">
                        <h4><i class="fas fa-info-circle"></i> Mô tả</h4>
                        <p>${experience.description || 'Chưa có mô tả chi tiết.'}</p>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="modal-book-btn" onclick="quickBookExperience('${experience.title}')">
                            <i class="fas fa-calendar-alt"></i>
                            Đặt ngay ${experience.title}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Thêm modal vào body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Thêm CSS nếu chưa có
    if (!document.getElementById('experienceModalCSS')) {
        const style = document.createElement('style');
        style.id = 'experienceModalCSS';
        style.textContent = `
            .experience-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                z-index: 99999;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                animation: fadeIn 0.3s ease;
                backdrop-filter: blur(10px);
            }
            
            .experience-modal-container {
                width: 100%;
                max-width: 500px;
                max-height: 90vh;
                background: var(--card-black);
                border-radius: 20px;
                border: 2px solid rgba(212, 175, 55, 0.3);
                overflow: hidden;
                animation: slideUp 0.3s ease;
            }
            
            .experience-modal-header {
                padding: 20px;
                background: rgba(20, 20, 20, 0.95);
                border-bottom: 1px solid rgba(212, 175, 55, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-title {
                font-size: 20px;
                color: var(--champagne);
                margin: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .modal-close-btn {
                width: 36px;
                height: 36px;
                background: rgba(212, 175, 55, 0.1);
                border: 1px solid rgba(212, 175, 55, 0.3);
                border-radius: 10px;
                color: var(--text-primary);
                font-size: 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            
            .modal-close-btn:hover {
                background: rgba(212, 175, 55, 0.2);
                transform: rotate(90deg);
            }
            
            .experience-modal-content {
                padding: 20px;
                overflow-y: auto;
                max-height: calc(90vh - 80px);
            }
            
            .modal-image {
                width: 100%;
                height: 200px;
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: 20px;
            }
            
            .modal-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .modal-benefits, .modal-description {
                margin-bottom: 20px;
            }
            
            .modal-benefits h4, .modal-description h4 {
                font-size: 16px;
                color: var(--text-primary);
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .modal-benefits ul {
                list-style: none;
                padding: 0;
            }
            
            .modal-benefits li {
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--text-secondary);
            }
            
            .modal-benefits li:last-child {
                border-bottom: none;
            }
            
            .modal-description p {
                color: var(--text-secondary);
                line-height: 1.6;
                margin: 0;
            }
            
            .modal-actions {
                text-align: center;
                margin-top: 25px;
            }
            
            .modal-book-btn {
                padding: 14px 28px;
                background: var(--gradient-gold);
                border: none;
                border-radius: 12px;
                color: var(--primary-black);
                font-weight: 700;
                font-size: 15px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 10px;
            }
            
            .modal-book-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 25px rgba(212, 175, 55, 0.3);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @media (max-width: 768px) {
                .experience-modal-container {
                    max-width: 95%;
                }
                
                .modal-image {
                    height: 150px;
                }
                
                .modal-book-btn {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function closeExperienceModal(experienceId) {
    const modal = document.getElementById(`experienceModal${experienceId}`);
    if (modal) {
        modal.remove();
    }
}

// Thêm event để đóng modal bằng ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Tìm tất cả experience modal và đóng
        document.querySelectorAll('[id^="experienceModal"]').forEach(modal => {
            modal.remove();
        });
    }
});



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
                <span class="price-value">0567.033.888</span>
            </div>
        `;
    }
    
    contentHTML += `
            </div>
            
            <div class="detail-actions">
                <button class="btn-book-now" onclick="bookThisService('${serviceId}')">
                    <i class="fas fa-calendar-alt"></i> Đặt dịch vụ ngay
                </button>
                <button class="btn-call-now" onclick="window.location.href='tel:0567033888'">
                    <i class="fas fa-phone-alt"></i> Gọi ngay: 0567.033.888
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
    
    document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('bookingForm');
    const serviceType = document.getElementById('serviceType');
    const customerNameInput = document.getElementById('customerName');
    const customerPhoneInput = document.getElementById('customerPhone');

    if (!bookingForm || !serviceType || !customerNameInput || !customerPhoneInput) {
        console.error('Form hoặc các trường chưa tồn tại');
        return;
    }

    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const customerName = customerNameInput.value.trim();
        const customerPhone = customerPhoneInput.value.trim();
        const serviceName = serviceType.options[serviceType.selectedIndex]?.text || 'Chưa chọn dịch vụ';

        alert(`✅ Đã gửi yêu cầu thành công!\n\n📞 Chúng tôi sẽ gọi lại số:\n${customerPhone}\n\n📋 Dịch vụ: ${serviceName}\n👤 Tên: ${customerName}\n\n⏳ Thời gian: Trong 3 phút`);

        bookingForm.reset();
    });
});

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
            author: 'HTUTransport Team',
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
// ===== ENHANCED FIREBASE STRUCTURE =====
async function initializeFirebaseStructure() {
    if (!database) return;
    
    try {
        // Kiểm tra và tạo cấu trúc mới nếu chưa có
        const statsRef = database.ref('statistics');
        const snapshot = await statsRef.once('value');
        
        if (!snapshot.exists()) {
            // Tạo cấu trúc mới
            await statsRef.set({
                config: {
                    // Cài đặt cơ bản
                    total_cars: 15,
                    base_online: 15,
                    base_bookings: 8,
                    auto_update: true,
                    last_reset: new Date().toISOString().split('T')[0],
                    
                    // Hệ số theo giờ (có thể điều chỉnh từ admin)
                    hourly_multipliers: {
                        "00-06": 0.2,  // 20% - Đêm khuya
                        "06-09": 0.6,  // 60% - Sáng sớm
                        "09-12": 0.9,  // 90% - Sáng
                        "12-14": 1.0,  // 100% - Trưa
                        "14-18": 1.2,  // 120% - Chiều
                        "18-21": 1.5,  // 150% - Tối (cao điểm)
                        "21-24": 0.8   // 80% - Tối muộn
                    },
                    
                    // Hệ số cuối tuần
                    weekend_boost: 1.3,  // +30% cuối tuần
                    
                    // Override thủ công (nếu có)
                    manual_override: {
                        online: null,
                        bookings: null,
                        cars: null
                    }
                },
                
                live: {
                    // Sẽ được tính toán tự động
                    current_online: 15,
                    bookings_today: 8,
                    available_cars: 10,
                    is_peak_hour: false,
                    updated_at: Date.now()
                },
                
                // Logs cho admin
                logs: {
                    daily_resets: [],
                    manual_updates: []
                }
            });
            
            console.log("✅ Created new Firebase statistics structure");
        } else {
            console.log("✅ Firebase statistics structure already exists");
        }
        
        // Kiểm tra và tạo user_sessions nếu chưa có
        const sessionsRef = database.ref('user_sessions');
        const sessionsSnapshot = await sessionsRef.once('value');
        if (!sessionsSnapshot.exists()) {
            await sessionsRef.set({});
        }
        
        // Kiểm tra và tạo booking_logs nếu chưa có
        const bookingsRef = database.ref('booking_logs');
        const bookingsSnapshot = await bookingsRef.once('value');
        if (!bookingsSnapshot.exists()) {
            await bookingsRef.set({});
        }
        
    } catch (error) {
        console.error("❌ Error initializing Firebase structure:", error);
    }
}

// ===== BOOKING FORM SUBMIT WITH LOGGING =====
async function handleBookingSubmit(formData) {
    if (!database) {
        alert(`✅ Đã gửi yêu cầu thành công!\n\n📞 Chúng tôi sẽ gọi lại số:\n${formData.phone}\n\n📋 Dịch vụ: ${formData.service}\n👤 Tên: ${formData.name}`);
        return;
    }
    
    try {
        // Log booking to Firebase
        const bookingId = 'booking_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        
        const bookingData = {
            timestamp: Date.now(),
            service: formData.service,
            customer_name: formData.name,
            customer_phone: formData.phone,
            status: 'confirmed',
            source: 'website',
            ip_address: await getClientIP()
        };
        
        await database.ref(`booking_logs/${bookingId}`).set(bookingData);
        
        // Increment booking counter
        await database.ref('statistics/live/bookings_today').transaction(current => {
            return (current || 0) + 1;
        });
        
        // Show success message
        alert(`✅ Đã gửi yêu cầu thành công!\n\n📞 Chúng tôi sẽ gọi lại số:\n${formData.phone}\n\n📋 Dịch vụ: ${formData.service}\n👤 Tên: ${formData.name}\n\n📊 Booking ID: ${bookingId.substr(0, 8)}`);
        
        // Reset form
        document.getElementById('bookingForm').reset();
        
    } catch (error) {
        console.error("❌ Error logging booking:", error);
        // Fallback to simple alert
        alert(`✅ Đã gửi yêu cầu thành công!\n\n📞 Chúng tôi sẽ gọi lại số:\n${formData.phone}\n\n📋 Dịch vụ: ${formData.service}\n👤 Tên: ${formData.name}`);
    }
}

// Helper function to get client IP (simplified)
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'unknown';
    }
}

// Update existing form submit handler
