// gallery.js - Hiển thị Gallery từ Firebase/Firestore
let galleryData = { featured: [] };

// ===== FIREBASE CONFIG =====
const firebaseConfig = {
    apiKey: "AIzaSyD4jWsR-BV9PBnISU5qUYqYjrm0hqP5pEI",
    authDomain: "luxurymove-9a7b8.firebaseapp.com",
    projectId: "luxurymove-9a7b8",
    storageBucket: "luxurymove-9a7b8.firebasestorage.app",
    messagingSenderId: "878288881534",
    appId: "1:878288881534:web:24c6cd3a4aebf36af17dd5"
};

// Initialize Firebase
let db;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    console.log("✅ Firebase initialized for Gallery");
} catch (error) {
    console.log("ℹ️ Firebase not available, using fallback");
}

// ===== LOAD GALLERY DATA =====
async function loadGalleryData() {
    console.log("🖼️ Đang tải Gallery...");
    
    try {
        // Ưu tiên 1: Firebase Firestore
        if (db) {
            const snapshot = await db.collection('gallery').doc('data').get();
            if (snapshot.exists()) {
                const data = snapshot.data();
                galleryData = data;
                console.log("✅ Gallery loaded from Firebase:", galleryData.featured?.length || 0, "items");
                renderGallery();
                return;
            }
        }
        
        // Ưu tiên 2: GitHub
        const githubData = await fetchGalleryFromGitHub();
        if (githubData) {
            galleryData = githubData;
            console.log("✅ Gallery loaded from GitHub:", galleryData.featured?.length || 0, "items");
            renderGallery();
            return;
        }
        
        // Ưu tiên 3: localStorage
        const localData = localStorage.getItem('luxurymove_gallery');
        if (localData) {
            galleryData = JSON.parse(localData);
            console.log("📂 Gallery loaded from localStorage:", galleryData.featured?.length || 0, "items");
            renderGallery();
            return;
        }
        
        // Fallback: Dữ liệu mặc định
        galleryData = { featured: getDefaultGallery() };
        console.log("📝 Using default gallery");
        renderGallery();
        
    } catch (error) {
        console.error("❌ Error loading gallery:", error);
        // Still try to render with whatever we have
        renderGallery();
    }
}

// ===== FETCH FROM GITHUB =====
async function fetchGalleryFromGitHub() {
    const GITHUB_GALLERY_URL = "https://raw.githubusercontent.com/Datkep92/hoangtung/main/data/gallery.json";
    
    try {
        const response = await fetch(`${GITHUB_GALLERY_URL}?t=${Date.now()}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log("ℹ️ gallery.json not found on GitHub");
                return null;
            }
            return null;
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.log("❌ Fetch gallery error:", error.message);
        return null;
    }
}

// ===== DEFAULT GALLERY DATA =====
function getDefaultGallery() {
    return [
        {
            id: 'car1',
            title: 'Mercedes V-Class Luxury',
            image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800',
            description: 'Xe 7 chỗ, nội thất da cao cấp, WiFi miễn phí, TV giải trí',
            category: 'premium',
            order: 1,
            tags: ['mercedes', 'v-class', 'luxury', '7-seater']
        },
        {
            id: 'car2',
            title: 'Toyota Innova Premium',
            image: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?auto=format&fit=crop&w=800',
            description: '7 chỗ tiện nghi, phù hợp cho gia đình và nhóm bạn',
            category: 'family',
            order: 2,
            tags: ['toyota', 'innova', 'family', '7-seater']
        },
        {
            id: 'car3',
            title: 'Ford Transit 16 chỗ',
            image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800',
            description: 'Xe 16 chỗ, không gian rộng rãi, tour đoàn',
            category: 'group',
            order: 3,
            tags: ['ford', 'transit', '16-seater', 'tour']
        },
        {
            id: 'car4',
            title: 'Limousine VIP',
            image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800',
            description: '4 chỗ đẳng cấp, trải nghiệm sang trọng',
            category: 'vip',
            order: 4,
            tags: ['limousine', 'vip', 'luxury', '4-seater']
        },
        {
            id: 'car5',
            title: 'Nội Thất Cao Cấp',
            image: 'https://images.unsplash.com/photo-1492144434746-1c80bb2787c3?auto=format&fit=crop&w=800',
            description: 'Nội thất da cao cấp, tiện nghi hiện đại',
            category: 'interior',
            order: 5,
            tags: ['interior', 'luxury', 'premium', 'comfort']
        },
        {
            id: 'car6',
            title: 'Tài Xế Chuyên Nghiệp',
            image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800',
            description: 'Đội ngũ tài xế chuyên nghiệp, mặc vest lịch sự',
            category: 'service',
            order: 6,
            tags: ['driver', 'professional', 'service', 'staff']
        }
    ];
}

// ===== RENDER GALLERY =====
function renderGallery() {
    const container = document.getElementById('galleryContainer');
    if (!container) {
        console.log("ℹ️ Gallery container not found on this page");
        return;
    }
    
    // Clear loading skeleton
    container.innerHTML = '';
    
    // Check if we have data
    const items = galleryData.featured || [];
    if (items.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-tertiary);">
                <i class="fas fa-images" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3>Đang cập nhật hình ảnh</h3>
                <p>Gallery sẽ được cập nhật sớm</p>
            </div>
        `;
        return;
    }
    
    // Create gallery container
    const galleryDiv = document.createElement('div');
    galleryDiv.className = 'gallery-container';
    
    // Sort by order
    const sortedItems = [...items].sort((a, b) => (a.order || 99) - (b.order || 99));
    
    // Create gallery cards
    sortedItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        
        card.innerHTML = `
            <div class="gallery-image-container">
                <img src="${item.image}" alt="${item.title}" class="gallery-image" loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800'">
                <div class="gallery-category-badge">${getCategoryName(item.category)}</div>
            </div>
            <div class="gallery-info">
                <h3 class="gallery-title">${item.title}</h3>
                <p class="gallery-description">${item.description || 'Đang cập nhật...'}</p>
                
                ${item.tags && item.tags.length > 0 ? `
                    <div class="gallery-tags">
                        ${item.tags.slice(0, 3).map(tag => `
                            <span class="gallery-tag">#${tag}</span>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="gallery-meta">
                    <span class="gallery-order">
                        <i class="fas fa-sort-numeric-up"></i> Thứ tự: ${item.order || 1}
                    </span>
                </div>
            </div>
        `;
        
        // Add click event to open full view
        card.addEventListener('click', function() {
            openGalleryDetail(item);
        });
        
        galleryDiv.appendChild(card);
    });
    
    container.appendChild(galleryDiv);
    
    // Add horizontal scroll hint
    const scrollHint = document.createElement('div');
    scrollHint.className = 'gallery-scroll-hint';
    scrollHint.innerHTML = `
        <span><i class="fas fa-hand-point-right"></i> Vuốt sang để xem thêm</span>
        <i class="fas fa-chevron-right"></i>
    `;
    container.appendChild(scrollHint);
    
    // Setup horizontal scroll on mobile
    setupGalleryScroll();
}

// ===== GALLERY DETAIL MODAL =====
function openGalleryDetail(item) {
    // Create modal if not exists
    let modal = document.getElementById('galleryDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'galleryDetailModal';
        modal.className = 'gallery-detail-modal';
        document.body.appendChild(modal);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .gallery-detail-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.95);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 20000;
                padding: 20px;
            }
            
            .gallery-detail-content {
                background: var(--card-black);
                border-radius: 20px;
                border: 2px solid var(--champagne);
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow: hidden;
                position: relative;
            }
            
            .gallery-detail-close {
                position: absolute;
                top: 15px;
                right: 15px;
                width: 40px;
                height: 40px;
                background: rgba(0,0,0,0.7);
                border: 1px solid var(--champagne);
                border-radius: 50%;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
                font-size: 20px;
            }
            
            .gallery-detail-close:hover {
                background: var(--champagne);
                color: #000;
            }
            
            .gallery-detail-image {
                width: 100%;
                height: 400px;
                object-fit: cover;
            }
            
            .gallery-detail-info {
                padding: 25px;
            }
            
            .gallery-detail-title {
                color: var(--champagne);
                font-size: 24px;
                margin-bottom: 10px;
            }
            
            .gallery-detail-category {
                display: inline-block;
                background: rgba(212, 175, 55, 0.2);
                color: var(--champagne);
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 14px;
                margin-bottom: 15px;
            }
            
            .gallery-detail-description {
                color: var(--text-secondary);
                line-height: 1.6;
                margin-bottom: 20px;
                font-size: 16px;
            }
            
            .gallery-detail-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 20px;
            }
            
            .gallery-detail-tag {
                background: rgba(255,255,255,0.1);
                color: var(--text-secondary);
                padding: 5px 10px;
                border-radius: 6px;
                font-size: 12px;
            }
            
            @media (max-width: 768px) {
                .gallery-detail-image {
                    height: 300px;
                }
                
                .gallery-detail-info {
                    padding: 20px;
                }
                
                .gallery-detail-title {
                    font-size: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Fill modal content
    modal.innerHTML = `
        <div class="gallery-detail-content">
            <button class="gallery-detail-close" onclick="closeGalleryDetail()">
                <i class="fas fa-times"></i>
            </button>
            
            <img src="${item.image}" alt="${item.title}" class="gallery-detail-image">
            
            <div class="gallery-detail-info">
                <div class="gallery-detail-category">${getCategoryName(item.category)}</div>
                <h2 class="gallery-detail-title">${item.title}</h2>
                <p class="gallery-detail-description">${item.description || 'Đang cập nhật...'}</p>
                
                <div class="gallery-detail-meta">
                    <div style="color: var(--text-tertiary); margin-bottom: 10px;">
                        <i class="fas fa-sort-numeric-up"></i> Thứ tự hiển thị: <strong>${item.order || 1}</strong>
                    </div>
                </div>
                
                ${item.tags && item.tags.length > 0 ? `
                    <div class="gallery-detail-tags">
                        ${item.tags.map(tag => `
                            <span class="gallery-detail-tag">#${tag}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Close on ESC
    document.addEventListener('keydown', function escClose(e) {
        if (e.key === 'Escape') {
            closeGalleryDetail();
            document.removeEventListener('keydown', escClose);
        }
    });
}

function closeGalleryDetail() {
    const modal = document.getElementById('galleryDetailModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ===== HELPER FUNCTIONS =====
function getCategoryName(category) {
    const categories = {
        'premium': 'Premium',
        'family': 'Gia đình',
        'business': 'Doanh nghiệp',
        'vip': 'VIP',
        'group': 'Đoàn thể',
        'interior': 'Nội thất',
        'service': 'Dịch vụ',
        'airport': 'Sân bay',
        'tour': 'Du lịch'
    };
    return categories[category] || category || 'Khác';
}

function setupGalleryScroll() {
    const galleryContainer = document.querySelector('.gallery-container');
    if (!galleryContainer) return;
    
    if (window.innerWidth <= 768) {
        let isDown = false;
        let startX;
        let scrollLeft;
        
        galleryContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - galleryContainer.offsetLeft;
            scrollLeft = galleryContainer.scrollLeft;
            galleryContainer.style.cursor = 'grabbing';
        });
        
        galleryContainer.addEventListener('mouseleave', () => {
            isDown = false;
            galleryContainer.style.cursor = 'grab';
        });
        
        galleryContainer.addEventListener('mouseup', () => {
            isDown = false;
            galleryContainer.style.cursor = 'grab';
        });
        
        galleryContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - galleryContainer.offsetLeft;
            const walk = (x - startX) * 2;
            galleryContainer.scrollLeft = scrollLeft - walk;
        });
        
        // Touch support
        galleryContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - galleryContainer.offsetLeft;
            scrollLeft = galleryContainer.scrollLeft;
        });
        
        galleryContainer.addEventListener('touchmove', (e) => {
            const x = e.touches[0].pageX - galleryContainer.offsetLeft;
            const walk = (x - startX) * 2;
            galleryContainer.scrollLeft = scrollLeft - walk;
            e.preventDefault();
        });
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("🖼️ Gallery System Initializing...");
    
    // Load gallery data
    loadGalleryData();
    
    // Auto-refresh every 5 minutes
    setInterval(loadGalleryData, 5 * 60 * 1000);
    
    // Listen for storage updates (from admin)
    window.addEventListener('storage', function(e) {
        if (e.key === 'luxurymove_gallery') {
            console.log("🔄 Gallery data updated, reloading...");
            loadGalleryData();
        }
    });
    
    // Custom event for updates from admin on same page
    window.addEventListener('galleryUpdated', function() {
        console.log("🔄 Gallery updated via event, reloading...");
        loadGalleryData();
    });
});

// ===== PUBLIC API =====
window.GalleryManager = {
    refresh: loadGalleryData,
    getData: () => galleryData,
    openDetail: openGalleryDetail,
    closeDetail: closeGalleryDetail
};