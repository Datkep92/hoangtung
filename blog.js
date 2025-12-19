// blog.js - LuxuryMove Blog System với Firebase

let blogData = { posts: {} };
let currentPostId = null;
let blogDatabase = null;

// Firebase config (nên dùng chung với file script.js)
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
async function initBlog() {
    console.log("📚 Initializing LuxuryMove Blog with Firebase...");
    
    try {
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        blogDatabase = firebase.database();
        
        // Load blog data
        await loadBlogDataFromFirebase();
        
        // Setup event listeners
        setupBlogEventListeners();
        
        // Setup Firebase listeners
        setupFirebaseListeners();
        
        // Check if we should open a specific post
        const postToOpen = localStorage.getItem('luxurymove_open_post');
        if (postToOpen) {
            setTimeout(() => {
                openBlogPost(postToOpen);
                localStorage.removeItem('luxurymove_open_post');
            }, 500);
        }
        
    } catch (error) {
        console.error("❌ Error initializing blog:", error);
        await loadBlogDataFromLocalStorage();
        setupBlogEventListeners();
    }
}

// Load blog data from Firebase
async function loadBlogDataFromFirebase() {
    try {
        console.log("🔍 Loading blog data from Firebase...");
        
        const postsGrid = document.getElementById('postsGrid');
        if (!postsGrid) {
            console.error("❌ Element 'postsGrid' not found");
            return;
        }
        
        // Show loading
        postsGrid.innerHTML = `
            <div class="loading-posts" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--champagne); margin-bottom: 20px;"></i>
                <p style="color: var(--text-secondary);">Đang tải bài viết từ Firebase...</p>
            </div>
        `;
        
        // Fetch from Firebase
        const snapshot = await blogDatabase.ref('blog').once('value');
        const data = snapshot.val();
        
        if (data && data.posts) {
            blogData = data;
            console.log("✅ Loaded blog posts from Firebase:", Object.keys(data.posts).length);
            
            // Save to localStorage for offline use
            localStorage.setItem('luxurymove_blog', JSON.stringify(blogData));
            
            renderBlogPosts();
            updateCategoryCounts();
        } else {
            console.log("ℹ️ No blog data in Firebase, trying localStorage...");
            await loadBlogDataFromLocalStorage();
        }
        
    } catch (error) {
        console.error("❌ Error loading from Firebase:", error);
        await loadBlogDataFromLocalStorage();
    }
}

// Load blog data from localStorage
async function loadBlogDataFromLocalStorage() {
    try {
        console.log("📂 Loading blog from localStorage...");
        
        const localData = localStorage.getItem('luxurymove_blog');
        if (localData) {
            blogData = JSON.parse(localData);
            console.log("✅ Loaded blog from localStorage:", Object.keys(blogData.posts).length);
        } else {
            // Create sample posts
            blogData = { posts: getSamplePosts() };
            console.log("🎨 Created sample posts:", Object.keys(blogData.posts).length);
            
            // Save sample to localStorage
            localStorage.setItem('luxurymove_blog', JSON.stringify(blogData));
            
            // Try to save to Firebase too
            await saveBlogToFirebase();
        }
        
        renderBlogPosts();
        updateCategoryCounts();
        
    } catch (error) {
        console.error("❌ Error loading from localStorage:", error);
        // Last resort: create empty blog
        blogData = { posts: {} };
        renderBlogPosts();
    }
}

// Save blog to Firebase
async function saveBlogToFirebase() {
    try {
        if (!blogDatabase) return;
        
        await blogDatabase.ref('blog').set(blogData);
        console.log("✅ Blog saved to Firebase");
    } catch (error) {
        console.error("❌ Error saving blog to Firebase:", error);
    }
}

// Setup Firebase real-time listeners
function setupFirebaseListeners() {
    if (!blogDatabase) return;
    
    // Listen for blog updates
    blogDatabase.ref('blog').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && data.posts) {
            console.log("🔄 Blog data updated from Firebase");
            blogData = data;
            
            // Update localStorage
            localStorage.setItem('luxurymove_blog', JSON.stringify(blogData));
            
            // Update UI
            renderBlogPosts();
            updateCategoryCounts();
        }
    });
    
    // Listen for blog posts updates individually
    blogDatabase.ref('blog/posts').on('child_changed', (snapshot) => {
        console.log("🔄 Blog post updated:", snapshot.key);
        const updatedPost = snapshot.val();
        const postId = snapshot.key;
        
        if (blogData.posts[postId]) {
            blogData.posts[postId] = updatedPost;
            renderBlogPosts();
            updateCategoryCounts();
        }
    });
    
    // Listen for new blog posts
    blogDatabase.ref('blog/posts').on('child_added', (snapshot) => {
        console.log("🆕 New blog post added:", snapshot.key);
        const newPost = snapshot.val();
        const postId = snapshot.key;
        
        if (!blogData.posts[postId]) {
            blogData.posts[postId] = newPost;
            renderBlogPosts();
            updateCategoryCounts();
        }
    });
    
    // Listen for deleted blog posts
    blogDatabase.ref('blog/posts').on('child_removed', (snapshot) => {
        console.log("🗑️ Blog post removed:", snapshot.key);
        const postId = snapshot.key;
        
        if (blogData.posts[postId]) {
            delete blogData.posts[postId];
            renderBlogPosts();
            updateCategoryCounts();
        }
    });
}

// Các hàm còn lại giữ nguyên từ phiên bản trước, chỉ sửa chỗ cần thiết

// Sample posts for demo (giữ nguyên)
function getSamplePosts() {
    return {
        'post1': {
            id: 'post1',
            title: 'Kinh Nghiệm Du Lịch Nha Trang 2024',
            author: 'LuxuryMove Team',
            date: '2024-12-15',
            category: 'travel',
            image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800',
            excerpt: 'Khám phá những điểm đến hấp dẫn, ẩm thực đặc sắc và dịch vụ di chuyển cao cấp tại Nha Trang.',
            content: `
                <h2>Giới Thiệu Về Nha Trang</h2>
                <p>Nha Trang - thành phố biển xinh đẹp với những bãi cát trắng trải dài, làn nước trong xanh và nền ẩm thực phong phú.</p>
                
                <div class="features-section">
                    <h3>Điểm Đến Nổi Bật</h3>
                    <div class="feature-item">
                        <i class="fas fa-umbrella-beach"></i>
                        <span>Bãi Dài - Thiên đường nghỉ dưỡng</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-water"></i>
                        <span>Vinpearl Land - Vui chơi giải trí</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-mountain"></i>
                        <span>Hòn Tằm - Khám phá thiên nhiên</span>
                    </div>
                </div>
                
                <h3>Dịch Vụ Di Chuyển Cao Cấp</h3>
                <p>LuxuryMove cung cấp dịch vụ đưa đón tận nơi với đội xe sang trọng, tài xế chuyên nghiệp.</p>
                
                <div class="pricing-section">
                    <h3>Bảng Giá Tham Khảo</h3>
                    <div class="price-item">
                        <i class="fas fa-car"></i>
                        <span>Đưa đón sân bay: <strong>450,000 VND</strong></span>
                    </div>
                    <div class="price-item">
                        <i class="fas fa-road"></i>
                        <span>Tour Nha Trang 1 ngày: <strong>1,200,000 VND</strong></span>
                    </div>
                </div>
                
                <h3>Lời Khuyên Từ Chuyên Gia</h3>
                <ul>
                    <li>Nên đặt dịch vụ trước ít nhất 24h</li>
                    <li>Mang theo đồ chống nắng</li>
                    <li>Thử hải sản tươi sống tại chợ Đầm</li>
                </ul>
            `,
            tags: ['nha trang', 'du lịch', 'biển', 'kinh nghiệm'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        'post2': {
            id: 'post2',
            title: 'Top 5 Dịch Vụ Xe Cao Cấp Tại Miền Trung',
            author: 'Admin',
            date: '2024-12-10',
            category: 'service',
            image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800',
            excerpt: 'Khám phá những dịch vụ di chuyển cao cấp nhất tại khu vực miền Trung - Tây Nguyên.',
            content: `
                <h2>Dịch Vụ Xe Cao Cấp LuxuryMove</h2>
                <p>Với đội ngũ tài xế chuyên nghiệp và xe đời mới, LuxuryMove mang đến trải nghiệm di chuyển đẳng cấp.</p>
                
                <h3>5 Dịch Vụ Nổi Bật</h3>
                <div class="service-list">
                    <div class="service-item">
                        <h4>1. Đưa Đón Sân Bay VIP</h4>
                        <p>Tài xế mặc vest, xe sang trọng, hỗ trợ hành lý tận tay.</p>
                    </div>
                    <div class="service-item">
                        <h4>2. Tour Du Lịch Trọn Gói</h4>
                        <p>Thiết kế lịch trình riêng, xe 4-16 chỗ, hướng dẫn viên nhiệt tình.</p>
                    </div>
                    <div class="service-item">
                        <h4>3. Xe Cưới Cao Cấp</h4>
                        <p>Mercedes, BMW đội hình xe hoa tươi, trang trí lộng lẫy.</p>
                    </div>
                    <div class="service-item">
                        <h4>4. Vận Chuyển Liên Tỉnh</h4>
                        <p>Đón tận nhà, trả tận nơi, giá cả minh bạch.</p>
                    </div>
                    <div class="service-item">
                        <h4>5. Dịch Vụ Doanh Nghiệp</h4>
                        <p>Hợp đồng dài hạn, hóa đơn VAT, hỗ trợ 24/7.</p>
                    </div>
                </div>
                
                <div class="cta-section">
                    <p><strong>📞 Đặt xe ngay: 0931.243.679</strong></p>
                    <p>Phục vụ 24/7 - Đúng giờ 100% - Xe đời mới</p>
                </div>
            `,
            tags: ['dịch vụ', 'xe cao cấp', 'luxury', 'miền trung'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    };
}

// Render blog posts (sửa để hỗ trợ real-time updates)
function renderBlogPosts(category = 'all') {
    const postsGrid = document.getElementById('postsGrid');
    if (!postsGrid) {
        console.error("❌ Cannot render posts: postsGrid element not found");
        return;
    }
    
    const posts = blogData.posts || {};
    
    if (Object.keys(posts).length === 0) {
        postsGrid.innerHTML = `
            <div class="no-posts" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-newspaper" style="font-size: 48px; margin-bottom: 20px; color: var(--text-tertiary);"></i>
                <h3 style="color: var(--text-primary); margin-bottom: 10px;">Chưa có bài viết nào</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">Hãy đăng bài viết đầu tiên từ Admin Panel!</p>
                <a href="admin.html" target="_blank" class="btn btn-secondary" style="padding: 10px 20px;">
                    <i class="fas fa-pen"></i> Đăng bài viết
                </a>
            </div>
        `;
        return;
    }
    
    let html = '';
    let filteredPosts = Object.entries(posts);
    
    // Filter by category
    if (category !== 'all') {
        filteredPosts = filteredPosts.filter(([id, post]) => post.category === category);
    }
    
    // Sort by date (newest first)
    filteredPosts.sort((a, b) => new Date(b[1].date) - new Date(a[1].date));
    
    filteredPosts.forEach(([id, post]) => {
        const date = new Date(post.date).toLocaleDateString('vi-VN');
        const updatedAt = post.updated_at ? new Date(post.updated_at).toLocaleString('vi-VN') : '';
        
        html += `
            <div class="blog-post-card" onclick="openBlogPost('${id}')">
                <div class="post-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                    <span class="post-category">${getCategoryName(post.category)}</span>
                    ${updatedAt ? `<span class="post-updated" title="Cập nhật: ${updatedAt}"><i class="fas fa-sync-alt"></i></span>` : ''}
                </div>
                <div class="post-content">
                    <div class="post-meta">
                        <span class="post-author">
                            <i class="fas fa-user"></i> ${post.author}
                        </span>
                        <span class="post-date">
                            <i class="far fa-calendar"></i> ${date}
                        </span>
                    </div>
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    ${post.tags ? `
                        <div class="post-tags">
                            ${post.tags.slice(0, 3).map(tag => `
                                <span class="post-tag">#${tag}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                    <a href="#" class="read-more-btn" onclick="openBlogPost('${id}'); event.stopPropagation(); return false;">
                        Đọc tiếp <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    });
    
    postsGrid.innerHTML = html;
}

// Get category name
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

// Update category counts
function updateCategoryCounts() {
    const posts = blogData.posts || {};
    const counts = {
        all: Object.keys(posts).length,
        travel: 0,
        tips: 0,
        news: 0,
        review: 0,
        service: 0
    };
    
    Object.values(posts).forEach(post => {
        if (post.category && counts[post.category] !== undefined) {
            counts[post.category]++;
        }
    });
    
    // Update button texts
    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn) {
            const category = btn.dataset.category;
            const count = counts[category];
            if (count > 0) {
                btn.textContent = `${getCategoryName(category)} (${count})`;
            } else {
                btn.textContent = getCategoryName(category);
            }
        }
    });
}

// Open blog post in modal
function openBlogPost(postId) {
    const post = blogData.posts[postId];
    if (!post) {
        console.error("Post not found:", postId);
        return;
    }
    
    currentPostId = postId;
    
    const date = new Date(post.date).toLocaleDateString('vi-VN');
    
    // Kiểm tra và cập nhật modal content
    const modalCategory = document.getElementById('modalCategory');
    const modalDate = document.getElementById('modalDate');
    const modalTitle = document.getElementById('modalTitle');
    const modalAuthor = document.getElementById('modalAuthor');
    const modalContent = document.getElementById('modalContent');
    const blogModal = document.getElementById('blogModal');
    
    if (!modalCategory || !modalDate || !modalTitle || !modalAuthor || !modalContent || !blogModal) {
        console.error("❌ Modal elements not found");
        return;
    }
    
    modalCategory.textContent = getCategoryName(post.category);
    modalDate.textContent = date;
    modalTitle.textContent = post.title;
    modalAuthor.innerHTML = `<i class="fas fa-user"></i> ${post.author}`;
    
    // Set content with image
    modalContent.innerHTML = `
        <div class="blog-content">
            <div class="featured-image">
                <img src="${post.image}" alt="${post.title}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 10px; margin-bottom: 25px;">
            </div>
            ${post.content || `<p>${post.excerpt}</p>`}
            
            <div class="post-actions" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(212, 175, 55, 0.2);">
                <p style="color: var(--text-tertiary); font-size: 14px;">
                    <i class="fas fa-info-circle"></i> Bài viết được quản lý bởi LuxuryMove Admin Panel
                </p>
            </div>
        </div>
    `;
    
    // Show modal
    blogModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close blog modal
function closeBlogModal() {
    const blogModal = document.getElementById('blogModal');
    if (blogModal) {
        blogModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Book service from blog
function bookFromBlog() {
    const post = blogData.posts[currentPostId];
    if (!post) return;
    
    closeBlogModal();
    
    // Scroll to booking form in main page
    window.location.href = 'index.html#booking';
}

// Call from blog
function callFromBlog() {
    window.location.href = 'tel:0931243679';
}

// Setup event listeners
function setupBlogEventListeners() {
    console.log("🔧 Setting up blog event listeners...");
    
    // Category filter
    const categoryButtons = document.querySelectorAll('.category-btn');
    if (categoryButtons.length === 0) {
        console.warn("⚠️ No category buttons found");
    } else {
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                categoryButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                // Render posts for selected category
                renderBlogPosts(this.dataset.category);
            });
        });
    }
    
    // Close modal button
    const closeModalBtn = document.getElementById('closeBlogModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeBlogModal);
    } else {
        console.warn("⚠️ Close modal button not found");
    }
    
    // Close modal on overlay click
    const blogModal = document.getElementById('blogModal');
    if (blogModal) {
        blogModal.addEventListener('click', function(e) {
            if (e.target === this) closeBlogModal();
        });
    }
    
    // Close modal with ESC key
    document.addEventListener('keydown', function(e) {
        const blogModal = document.getElementById('blogModal');
        if (e.key === 'Escape' && blogModal && blogModal.style.display === 'flex') {
            closeBlogModal();
        }
    });
    
    console.log("✅ Blog event listeners setup complete");
}

// Refresh blog data
async function refreshBlogData() {
    console.log("🔄 Refreshing blog data...");
    await loadBlogDataFromFirebase();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initBlog);

// Export functions for admin panel
if (typeof window !== 'undefined') {
    window.refreshBlogData = refreshBlogData;
    window.openBlogPost = openBlogPost;
    window.closeBlogModal = closeBlogModal;
    window.bookFromBlog = bookFromBlog;
    window.callFromBlog = callFromBlog;
}