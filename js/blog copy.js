// blog-new.js - HTUTransport Blog System với Single Page Router

const firebaseConfig = {
    apiKey: "AIzaSyCeYPoizbE-Op79186r7pmndGpJ-JfESAk",
    authDomain: "hoangtung-af982.firebasestorage.app",
    databaseURL: "https://hoangtung-af982-default-rtdb.firebaseio.com",
    projectId: "hoangtung-af982",
    storageBucket: "hoangtung-af982.firebasestorage.app",
    messagingSenderId: "232719624914",
    appId: "1:232719624914:web:cac7ce833ae105d9255b0b",
    measurementId: "G-FWHFP1W032"
};

let blogData = { posts: {} };
let blogDatabase = null;
let currentPage = 1;
const postsPerPage = 9;
let currentCategory = 'all';
let isSinglePostPage = false;

// Router để xử lý URL
class BlogRouter {
    constructor() {
        this.routes = {
            '/blog.html': this.showBlogList,
            '/post/:id': this.showSinglePost,
            '/category/:category': this.showCategory
        };
        this.currentPath = window.location.pathname;
        this.searchParams = new URLSearchParams(window.location.search);
        this.init();
    }

    init() {
        // Kiểm tra nếu là trang bài viết đơn
        if (this.searchParams.has('post')) {
            isSinglePostPage = true;
            this.showSinglePost(this.searchParams.get('post'));
        } else if (window.location.hash.startsWith('#post-')) {
            // Handle hash-based URLs
            const postId = window.location.hash.replace('#post-', '');
            isSinglePostPage = true;
            this.showSinglePost(postId);
        } else {
            // Hiển thị blog list
            this.showBlogList();
        }

        // Setup history listener
        window.addEventListener('popstate', () => {
            this.handleRouteChange();
        });
    }

    handleRouteChange() {
        this.currentPath = window.location.pathname;
        this.searchParams = new URLSearchParams(window.location.search);
        
        if (this.searchParams.has('post')) {
            isSinglePostPage = true;
            this.showSinglePost(this.searchParams.get('post'));
        } else {
            isSinglePostPage = false;
            this.showBlogList();
        }
    }

    navigateToPost(postId, postTitle) {
        const slug = this.generateSlug(postTitle);
        const url = `blog.html?post=${postId}&title=${slug}`;
        
        // Update URL không reload page
        history.pushState({ postId, postTitle }, postTitle, url);
        
        // Hiển thị bài viết
        this.showSinglePost(postId);
    }

    generateSlug(title) {
        return title
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
    }

    showBlogList() {
        isSinglePostPage = false;
        document.title = "HTUTransport Blog - Kinh Nghiệm Du Lịch & Dịch Vụ Xe Cao Cấp";
        
        // Hiển thị trang blog list
        this.renderBlogListPage();
        
        // Load data
        this.loadBlogData();
    }

    async showSinglePost(postId) {
        isSinglePostPage = true;
        
        try {
            const post = await this.loadSinglePost(postId);
            if (post) {
                this.renderSinglePostPage(post);
                this.updateMetaTags(post);
                this.incrementViewCount(postId);
                this.loadRelatedPosts(post);
            } else {
                // Redirect to blog list if post not found
                this.showBlogList();
            }
        } catch (error) {
            console.error("Error loading post:", error);
            this.showBlogList();
        }
    }

    showCategory(category) {
        isSinglePostPage = false;
        currentCategory = category;
        currentPage = 1;
        this.renderBlogListPage();
        this.loadBlogData();
    }

    // Các phương thức render và data loading...
    async loadBlogData() {
        try {
            if (!blogDatabase) {
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                blogDatabase = firebase.database();
            }

            const snapshot = await blogDatabase.ref('blog').once('value');
            const data = snapshot.val();
            
            if (data && data.posts) {
                blogData = data;
                console.log("✅ Loaded blog data:", Object.keys(data.posts).length);
                
                // Save to localStorage
                localStorage.setItem('HTUTransport_blog', JSON.stringify(blogData));
                
                if (!isSinglePostPage) {
                    this.renderBlogListPage();
                }
            } else {
                await this.loadFromLocalStorage();
            }
        } catch (error) {
            console.error("❌ Error loading blog data:", error);
            await this.loadFromLocalStorage();
        }
    }

    async loadSinglePost(postId) {
        try {
            if (!blogDatabase) {
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                blogDatabase = firebase.database();
            }

            // Try Firebase first
            const snapshot = await blogDatabase.ref(`blog/posts/${postId}`).once('value');
            let post = snapshot.val();
            
            if (!post) {
                // Try localStorage
                const localData = localStorage.getItem('HTUTransport_blog');
                if (localData) {
                    const blogData = JSON.parse(localData);
                    post = blogData.posts[postId];
                }
            }
            
            return post;
        } catch (error) {
            console.error("❌ Error loading post:", error);
            return null;
        }
    }

    renderBlogListPage() {
        // Render blog list page
        const mainContent = `
            <section class="blog-hero-section">
                <div class="container">
                    <div class="blog-hero-content">
                        <h1 class="seo-main-title" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;">
                            HTUTransport Blog - Chia Sẻ Kinh Nghiệm Du Lịch & Dịch Vụ Xe Cao Cấp
                        </h1>
                        
                        <h2 class="blog-hero-title">HTUTransport Blog</h2>
                        <p class="blog-hero-subtitle">Nơi chia sẻ kinh nghiệm du lịch & dịch vụ vận chuyển cao cấp</p>
                        
                        <div class="blog-stats">
                            <div class="stat-item">
                                <i class="fas fa-newspaper"></i>
                                <span id="totalPosts">${Object.keys(blogData.posts || {}).length}</span> Bài viết
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="blog-categories-section" id="categories">
                <div class="container">
                    <h3 class="section-subtitle">Danh mục bài viết</h3>
                    <div class="categories-container">
                        ${this.renderCategories()}
                    </div>
                </div>
            </section>

            <section class="all-posts-section">
                <div class="container">
                    <div class="section-header">
                        <h3 class="section-title">Tất cả bài viết</h3>
                    </div>
                    
                    <div class="posts-grid" id="postsGrid">
                        ${this.renderPostsGrid()}
                    </div>
                    
                    ${Object.keys(blogData.posts || {}).length > postsPerPage ? `
                        <div class="load-more-container">
                            <button id="loadMoreBtn" class="btn btn-outline">
                                <i class="fas fa-plus"></i> Xem thêm bài viết
                            </button>
                        </div>
                    ` : ''}
                </div>
            </section>
        `;

        // Replace main content
        this.updateMainContent(mainContent);
        
        // Setup event listeners
        this.setupBlogListEvents();
    }

    renderSinglePostPage(post) {
        const date = new Date(post.date || new Date()).toLocaleDateString('vi-VN');
        
        const postHTML = `
            <div class="single-post-container">
                <nav class="breadcrumb">
                    <a href="blog.html" onclick="blogRouter.showBlogList(); return false;">Blog</a>
                    <i class="fas fa-chevron-right"></i>
                    <span>${post.title}</span>
                </nav>
                
                <header class="post-header">
                    <div class="post-category">${this.getCategoryName(post.category)}</div>
                    <h1 class="post-title">${post.title}</h1>
                    <div class="post-meta">
                        <span><i class="fas fa-user"></i> ${post.author || 'Admin'}</span>
                        <span><i class="far fa-calendar"></i> ${date}</span>
                        ${post.view_count ? `<span><i class="fas fa-eye"></i> ${post.view_count} lượt xem</span>` : ''}
                    </div>
                </header>
                
                <div class="post-featured-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                </div>
                
                <div class="post-content">
                    ${post.content || `<p>${post.excerpt}</p>`}
                </div>
                
                ${post.tags && post.tags.length > 0 ? `
                    <div class="post-tags-section">
                        <h4><i class="fas fa-tags"></i> Tags:</h4>
                        <div class="tags-container">
                            ${post.tags.map(tag => `
                                <a href="javascript:void(0)" onclick="blogRouter.showCategory('${tag}')" class="tag-link">#${tag}</a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="post-cta-box">
                    <h3>Sẵn sàng cho chuyến đi của bạn?</h3>
                    <p>Liên hệ ngay để được tư vấn và đặt dịch vụ</p>
                    <div class="cta-buttons">
                        <a href="tel:0567033888" class="btn btn-primary">
                            <i class="fas fa-phone-alt"></i> Gọi ngay: 0567.033.888
                        </a>
                        <a href="index.html#booking" class="btn btn-outline">
                            <i class="fas fa-calendar-alt"></i> Đặt xe online
                        </a>
                    </div>
                </div>
                
                <div class="related-posts-section">
                    <h3>Bài viết liên quan</h3>
                    <div class="related-posts-grid" id="relatedPosts">
                        <!-- Related posts will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        // Update page title
        document.title = `${post.title} | HTUTransport Blog`;
        
        // Update main content
        this.updateMainContent(postHTML);
        
        // Add back button to header
        this.addBackButton();
    }

    updateMainContent(html) {
        // Tìm hoặc tạo main element
        let mainElement = document.querySelector('main');
        if (!mainElement) {
            mainElement = document.createElement('main');
            const app = document.querySelector('.app-header')?.nextElementSibling || document.body;
            app.parentNode.insertBefore(mainElement, app.nextSibling);
        }
        mainElement.innerHTML = html;
    }

    renderCategories() {
        const categories = ['travel', 'tips', 'news', 'service', 'review'];
        const counts = {};
        
        // Count posts per category
        Object.values(blogData.posts || {}).forEach(post => {
            if (post.category) {
                counts[post.category] = (counts[post.category] || 0) + 1;
            }
        });

        return categories.map(category => `
            <a href="javascript:void(0)" 
               class="category-card ${currentCategory === category ? 'active' : ''}" 
               data-category="${category}"
               onclick="blogRouter.showCategory('${category}')">
                <i class="fas fa-${this.getCategoryIcon(category)}"></i>
                <h4>${this.getCategoryName(category)}</h4>
                <p>${this.getCategoryDescription(category)}</p>
                ${counts[category] ? `<span class="category-count">${counts[category]}</span>` : ''}
            </a>
        `).join('');
    }

    renderPostsGrid() {
        const posts = blogData.posts || {};
        let filteredPosts = Object.entries(posts);
        
        if (currentCategory !== 'all') {
            filteredPosts = filteredPosts.filter(([id, post]) => post.category === currentCategory);
        }
        
        filteredPosts.sort((a, b) => {
            const dateA = new Date(a[1].date || new Date());
            const dateB = new Date(b[1].date || new Date());
            return dateB - dateA;
        });
        
        const paginatedPosts = filteredPosts.slice(0, currentPage * postsPerPage);
        
        if (paginatedPosts.length === 0) {
            return `
                <div class="no-posts">
                    <i class="fas fa-newspaper"></i>
                    <h3>Chưa có bài viết nào</h3>
                    <p>Hãy quay lại sau để xem các bài viết mới!</p>
                    <a href="admin.html" target="_blank" class="btn btn-secondary">
                        <i class="fas fa-pen"></i> Đăng bài viết
                    </a>
                </div>
            `;
        }
        
        return paginatedPosts.map(([id, post]) => {
            const date = new Date(post.date || new Date()).toLocaleDateString('vi-VN');
            
            return `
                <article class="post-card">
                    <a href="javascript:void(0)" onclick="blogRouter.navigateToPost('${id}', '${post.title.replace(/'/g, "\\'")}')" class="post-card-link">
                        <div class="post-card-image">
                            <img src="${post.image}" alt="${post.title}" loading="lazy">
                            <span class="post-card-category">${this.getCategoryName(post.category)}</span>
                        </div>
                        <div class="post-card-content">
                            <h3 class="post-card-title">${post.title}</h3>
                            <p class="post-card-excerpt">${post.excerpt || 'Đang cập nhật...'}</p>
                            <div class="post-card-meta">
                                <span><i class="fas fa-user"></i> ${post.author || 'Admin'}</span>
                                <span><i class="far fa-calendar"></i> ${date}</span>
                            </div>
                        </div>
                    </a>
                </article>
            `;
        }).join('');
    }

    setupBlogListEvents() {
        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                currentPage++;
                document.getElementById('postsGrid').innerHTML = this.renderPostsGrid();
                
                // Hide button if no more posts
                const totalPosts = Object.keys(blogData.posts || {}).length;
                if (currentPage * postsPerPage >= totalPosts) {
                    loadMoreBtn.style.display = 'none';
                }
            });
        }
    }

    addBackButton() {
        const headerContent = document.querySelector('.header-content');
        if (headerContent) {
            // Remove existing back button
            const existingBtn = headerContent.querySelector('.back-to-blog');
            if (existingBtn) existingBtn.remove();
            
            // Add new back button
            const backBtn = document.createElement('a');
            backBtn.href = 'javascript:void(0)';
            backBtn.className = 'back-to-blog';
            backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Quay lại Blog';
            backBtn.onclick = () => {
                blogRouter.showBlogList();
                history.pushState({}, 'Blog', 'blog.html');
            };
            headerContent.appendChild(backBtn);
        }
    }

    async incrementViewCount(postId) {
        try {
            if (!blogDatabase) return;
            
            await blogDatabase.ref(`blog/posts/${postId}/view_count`).transaction(current => {
                return (current || 0) + 1;
            });
        } catch (error) {
            console.error("❌ Error incrementing view count:", error);
        }
    }

    loadRelatedPosts(post) {
        const relatedContainer = document.getElementById('relatedPosts');
        if (!relatedContainer) return;
        
        const posts = blogData.posts || {};
        const relatedPosts = Object.entries(posts)
            .filter(([id, p]) => {
                return (p.category === post.category || 
                       p.tags?.some(tag => post.tags?.includes(tag))) && 
                       id !== post.id;
            })
            .slice(0, 3);
        
        if (relatedPosts.length === 0) {
            relatedContainer.parentElement.style.display = 'none';
            return;
        }
        
        relatedContainer.innerHTML = relatedPosts.map(([id, p]) => {
            const date = new Date(p.date || new Date()).toLocaleDateString('vi-VN');
            
            return `
                <article class="related-post-card">
                    <a href="javascript:void(0)" onclick="blogRouter.navigateToPost('${id}', '${p.title.replace(/'/g, "\\'")}')">
                        <div class="related-post-image">
                            <img src="${p.image}" alt="${p.title}">
                        </div>
                        <div class="related-post-content">
                            <h4>${p.title}</h4>
                            <div class="related-post-meta">
                                <span><i class="far fa-calendar"></i> ${date}</span>
                            </div>
                        </div>
                    </a>
                </article>
            `;
        }).join('');
    }

    updateMetaTags(post) {
        // Update meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = post.excerpt || post.title;
        
        // Update Open Graph tags
        const ogTags = {
            'og:title': post.title,
            'og:description': post.excerpt || post.title,
            'og:image': post.image,
            'og:url': window.location.href
        };
        
        for (const [property, content] of Object.entries(ogTags)) {
            let tag = document.querySelector(`meta[property="${property}"]`);
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute('property', property);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        }
    }

    async loadFromLocalStorage() {
        try {
            const localData = localStorage.getItem('HTUTransport_blog');
            if (localData) {
                blogData = JSON.parse(localData);
                console.log("✅ Loaded from localStorage:", Object.keys(blogData.posts).length);
            } else {
                blogData = { posts: this.getSamplePosts() };
            }
        } catch (error) {
            console.error("❌ Error loading from localStorage:", error);
            blogData = { posts: {} };
        }
    }

    getCategoryIcon(category) {
        const icons = {
            'travel': 'umbrella-beach',
            'tips': 'lightbulb',
            'news': 'newspaper',
            'service': 'car',
            'review': 'star'
        };
        return icons[category] || 'file-alt';
    }

    getCategoryName(category) {
        const categories = {
            'travel': 'Du lịch',
            'tips': 'Mẹo hay',
            'news': 'Tin tức',
            'review': 'Đánh giá',
            'service': 'Dịch vụ'
        };
        return categories[category] || 'Khác';
    }

    getCategoryDescription(category) {
        const descriptions = {
            'travel': 'Khám phá điểm đến',
            'tips': 'Kinh nghiệm hữu ích',
            'news': 'Cập nhật mới nhất',
            'service': 'Đánh giá dịch vụ',
            'review': 'Trải nghiệm thực tế'
        };
        return descriptions[category] || 'Bài viết chung';
    }

    getSamplePosts() {
        return {
            'ninh_thuan_1': {
                id: 'ninh_thuan_1',
                title: 'Combo Nắng Du Lịch Ninh Thuận 2025: Trải Nghiệm Trọn Vẹn Từ Biển Đến Đồi Nho',
                author: 'HTUTransport Team',
                date: '2024-12-20',
                category: 'travel',
                image: 'https://images.unsplash.com/photo-1573843989-c9d7ad15bd30?auto=format&fit=crop&w=800',
                excerpt: 'Khám phá Ninh Thuận với combo trọn gói: từ những bãi biển hoang sơ đến những đồi nho bạt ngàn.',
                content: `
                    <h2>Giới Thiệu Về Ninh Thuận</h2>
                    <p>Ninh Thuận - vùng đất của nắng và gió với những bãi biển đẹp, đồi nho xanh mướt và văn hóa Chăm độc đáo.</p>
                    
                    <h3>Điểm Đến Nổi Bật</h3>
                    <ul>
                        <li><strong>Vịnh Vĩnh Hy</strong>: Bãi biển hoang sơ, nước trong xanh</li>
                        <li><strong>Đồi Nho Ba Mọi</strong>: Trải nghiệm hái nho tươi</li>
                        <li><strong>Tháp Chàm Poklong Garai</strong>: Di tích văn hóa Chăm Pa</li>
                        <li><strong>Bãi biển Ninh Chữ</strong>: Thiên đường nghỉ dưỡng</li>
                    </ul>
                    
                    <h3>Dịch Vụ Di Chuyển Cao Cấp</h3>
                    <p>HTUTransport cung cấp combo đưa đón trọn gói với xe 4-7-16 chỗ đời mới.</p>
                    
                    <h3>Bảng Giá Combo 3 Ngày 2 Đêm</h3>
                    <table>
                        <tr>
                            <th>Hạng mục</th>
                            <th>Chi tiết</th>
                            <th>Giá</th>
                        </tr>
                        <tr>
                            <td>Xe đưa đón</td>
                            <td>Xe 7 chỗ, tài xế chuyên nghiệp</td>
                            <td>2,500,000 VND</td>
                        </tr>
                        <tr>
                            <td>Khách sạn</td>
                            <td>3 sao, 2 đêm</td>
                            <td>1,800,000 VND</td>
                        </tr>
                        <tr>
                            <td>Tour tham quan</td>
                            <td>Hướng dẫn viên địa phương</td>
                            <td>800,000 VND</td>
                        </tr>
                    </table>
                    
                    <h3>Mẹo Du Lịch Ninh Thuận</h3>
                    <ol>
                        <li>Nên đi từ tháng 1 đến tháng 8 (tránh mùa mưa)</li>
                        <li>Mang theo kem chống nắng và nón rộng vành</li>
                        <li>Thử rượu vang nho Ninh Thuận</li>
                        <li>Đặt tour trước ít nhất 3 ngày</li>
                    </ol>
                `,
                tags: ['ninh thuận', 'du lịch', 'biển', 'nho', 'combo'],
                view_count: 0
            },
            'taxi_san_bay': {
                id: 'taxi_san_bay',
                title: 'Dịch Vụ Taxi Sân Bay Cam Ranh: Đón Tiếp Chuyên Nghiệp, Giá Cả Minh Bạch',
                author: 'HTUTransport Team',
                date: '2024-12-18',
                category: 'service',
                image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800',
                excerpt: 'Dịch vụ đón tiếp sân bay Cam Ranh chuyên nghiệp với đội xe sang trọng, tài xế nhiều kinh nghiệm.',
                content: `
                    <h2>Dịch Vụ Taxi Sân Bay Cam Ranh</h2>
                    <p>Với hơn 5 năm kinh nghiệm, HTUTransport cung cấp dịch vụ đón tiếp sân bay Cam Ranh chuyên nghiệp.</p>
                    
                    <h3>Lợi Ích Khi Sử Dụng Dịch Vụ</h3>
                    <ul>
                        <li><strong>Đón đúng giờ</strong>: Theo dõi chuyến bay real-time</li>
                        <li><strong>Tài xế chuyên nghiệp</strong>: Mặc vest, nói tiếng Anh cơ bản</li>
                        <li><strong>Xe đời mới</strong>: Mercedes, BMW, Toyota Innova</li>
                        <li><strong>Hỗ trợ 24/7</strong>: Luôn có người trực điện thoại</li>
                    </ul>
                    
                    <h3>Bảng Giá Tham Khảo</h3>
                    <table>
                        <tr>
                            <th>Tuyến đường</th>
                            <th>Xe 4 chỗ</th>
                            <th>Xe 7 chỗ</th>
                            <th>Xe 16 chỗ</th>
                        </tr>
                        <tr>
                            <td>Sân bay → Nha Trang</td>
                            <td>350,000 VND</td>
                            <td>450,000 VND</td>
                            <td>850,000 VND</td>
                        </tr>
                        <tr>
                            <td>Sân bay → Phan Rang</td>
                            <td>450,000 VND</td>
                            <td>550,000 VND</td>
                            <td>950,000 VND</td>
                        </tr>
                        <tr>
                            <td>Sân bay → Đà Lạt</td>
                            <td>1,200,000 VND</td>
                            <td>1,500,000 VND</td>
                            <td>2,500,000 VND</td>
                        </tr>
                    </table>
                    
                    <h3>Quy Trình Đặt Xe</h3>
                    <ol>
                        <li>Gọi hotline 0567.033.888 hoặc đặt online</li>
                        <li>Cung cấp thông tin chuyến bay</li>
                        <li>Nhận xác nhận qua SMS/Zalo</li>
                        <li>Tài xế đón tại cổng với bảng tên</li>
                    </ol>
                    
                    <div class="booking-cta">
                        <p><strong>📞 Đặt xe ngay: 0567.033.888</strong></p>
                        <p>Phục vụ 24/7 - Đón đúng giờ 100% - Hóa đơn VAT đầy đủ</p>
                    </div>
                `,
                tags: ['taxi', 'sân bay cam ranh', 'đón tiếp', 'dịch vụ', 'nha trang'],
                view_count: 0
            }
        };
    }
}

// Khởi tạo router
let blogRouter;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    blogRouter = new BlogRouter();
    
    // Make router available globally
    window.blogRouter = blogRouter;
});

// Hàm để gọi từ các trang khác
function openBlogPostFromHomepage(postId) {
    if (typeof blogRouter !== 'undefined') {
        blogRouter.navigateToPost(postId, 'Bài viết');
    } else {
        // Redirect to blog page with post parameter
        window.location.href = `blog.html?post=${postId}`;
    }
}