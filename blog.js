// blog.js - LuxuryMove Blog System

let blogData = { posts: {} };
let currentPostId = null;

// Initialize blog
async function initBlog() {
    console.log("📚 Initializing LuxuryMove Blog...");
    await loadBlogData();
    setupBlogEventListeners();
}

// Load blog data from GitHub
async function loadBlogData() {
    try {
        // Try from GitHub first
        const data = await fetchBlogFromGitHub();
        
        if (data && data.posts) {
            blogData = data;
            console.log("✅ Loaded blog posts:", Object.keys(data.posts).length);
            renderBlogPosts();
            updateCategoryCounts();
        } else {
            // Try from localStorage
            const localData = localStorage.getItem('luxurymove_blog');
            if (localData) {
                blogData = JSON.parse(localData);
                console.log("📂 Loaded blog from localStorage");
                renderBlogPosts();
                updateCategoryCounts();
            } else {
                // Create sample posts
                blogData = { posts: getSamplePosts() };
                renderBlogPosts();
                updateCategoryCounts();
            }
        }
    } catch (error) {
        console.error("❌ Error loading blog:", error);
    }
}

// Fetch blog from GitHub
async function fetchBlogFromGitHub() {
    const GITHUB_BLOG_URL = "https://raw.githubusercontent.com/Datkep92/hoangtung/main/data/blog.json";
    
    try {
        const response = await fetch(`${GITHUB_BLOG_URL}?t=${Date.now()}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log("ℹ️ blog.json doesn't exist yet");
                return null;
            }
            console.log("❌ Cannot fetch blog:", response.status);
            return null;
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.log("❌ Fetch blog error:", error.message);
        return null;
    }
}

// Sample posts for demo
function getSamplePosts() {
    return {
        'post1': {
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
            tags: ['nha trang', 'du lịch', 'biển', 'kinh nghiệm']
        },
        'post2': {
            title: 'Top 5 Dịch Vụ Xe Cao Cấp Tại Miền Trung',
            author: 'Admin',
            date: '2024-12-10',
            category: 'service',
            image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800',
            excerpt: 'Khám phá những dịch vụ di chuyển cao cấp nhất tại khu vực miền Trung - Tây Nguyên.',
            content: 'Nội dung bài viết về dịch vụ xe cao cấp...',
            tags: ['dịch vụ', 'xe cao cấp', 'luxury', 'miền trung']
        }
        // Add more sample posts...
    };
}

// Render blog posts
function renderBlogPosts(category = 'all') {
    const postsGrid = document.getElementById('postsGrid');
    const posts = blogData.posts || {};
    
    if (Object.keys(posts).length === 0) {
        postsGrid.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-newspaper" style="font-size: 48px; margin-bottom: 20px; color: var(--text-tertiary);"></i>
                <h3>Chưa có bài viết nào</h3>
                <p>Hãy quay lại sau để đọc những bài viết mới nhất!</p>
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
        
        html += `
            <div class="blog-post-card" onclick="openBlogPost('${id}')">
                <div class="post-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                    <span class="post-category">${getCategoryName(post.category)}</span>
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
                    <a href="#" class="read-more-btn" onclick="openBlogPost('${id}'); return false;">
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
        const category = btn.dataset.category;
        const count = counts[category];
        if (count > 0) {
            btn.textContent = `${getCategoryName(category)} (${count})`;
        }
    });
}

// Open blog post in modal
function openBlogPost(postId) {
    const post = blogData.posts[postId];
    if (!post) return;
    
    currentPostId = postId;
    
    const date = new Date(post.date).toLocaleDateString('vi-VN');
    
    // Update modal content
    document.getElementById('modalCategory').textContent = getCategoryName(post.category);
    document.getElementById('modalDate').textContent = date;
    document.getElementById('modalTitle').textContent = post.title;
    document.getElementById('modalAuthor').innerHTML = `<i class="fas fa-user"></i> ${post.author}`;
    
    // Set content with image
    document.getElementById('modalContent').innerHTML = `
        <div class="blog-content">
            <div class="featured-image">
                <img src="${post.image}" alt="${post.title}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 10px; margin-bottom: 25px;">
            </div>
            ${post.content || `<p>${post.excerpt}</p>`}
        </div>
    `;
    
    // Show modal
    document.getElementById('blogModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close blog modal
function closeBlogModal() {
    document.getElementById('blogModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Book service from blog
function bookFromBlog() {
    const post = blogData.posts[currentPostId];
    if (!post) return;
    
    closeBlogModal();
    
    // Scroll to booking form
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
        
        // Fill service type if available
        const serviceSelect = document.getElementById('serviceType');
        if (serviceSelect && post.category === 'service') {
            serviceSelect.value = 'tour'; // Default to tour
        }
    }
}

// Call from blog
function callFromBlog() {
    window.location.href = 'tel:0931243679';
}

// Setup event listeners
function setupBlogEventListeners() {
    // Category filter
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderBlogPosts(this.dataset.category);
        });
    });
    
    // Close modal
    document.getElementById('closeBlogModal').addEventListener('click', closeBlogModal);
    
    // Close modal on overlay click
    document.getElementById('blogModal').addEventListener('click', function(e) {
        if (e.target === this) closeBlogModal();
    });
    
    // Close modal with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('blogModal').style.display === 'flex') {
            closeBlogModal();
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initBlog);