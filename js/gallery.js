

// ===== GALLERY FUNCTIONS =====
// Sử dụng IIFE và module pattern để tránh xung đột global
(function() {
    'use strict';
    
    // Biến private
    let galleryData = { featured: [] };
    let galleryDatabase = null;
    let isGalleryInitialized = false;
    
    // Touch handling variables - sử dụng local scope
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouchScrolling = false;
    let touchStartTime = 0;
    let currentGalleryContainer = null;
    
    // Utility functions
    const GalleryUtils = {
        // Debounce function để tránh xử lý quá nhiều lần
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Throttle function cho scroll events
        throttle: function(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        // Kiểm tra thiết bị touch
        isTouchDevice: function() {
            return 'ontouchstart' in window || 
                   navigator.maxTouchPoints > 0 || 
                   navigator.msMaxTouchPoints > 0;
        },
        
        // Prevent default behavior
        preventDefault: function(e) {
            if (e.cancelable) {
                e.preventDefault();
            }
        },
        
        // Stop propagation
        stopPropagation: function(e) {
            e.stopPropagation();
            e.stopImmediatePropagation();
        }
    };
    
    // Touch event handlers
    const TouchHandler = {
        handleTouchStart: function(e) {
            // Chỉ xử lý nếu là gallery container
            if (!e.target.closest('.gallery-container')) return;
            
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
                isTouchScrolling = false;
                
                // Thêm class để chỉ định đang xử lý touch
                e.currentTarget.classList.add('touch-active');
            }
        },
        
        handleTouchMove: function(e) {
            // Chỉ xử lý nếu là gallery container
            const galleryContainer = e.target.closest('.gallery-container');
            if (!galleryContainer) return;
            
            if (e.touches.length === 1 && touchStartX && touchStartY) {
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                
                const diffX = Math.abs(touchStartX - touchX);
                const diffY = Math.abs(touchStartY - touchY);
                
                // Xác định xem đang scroll ngang hay dọc
                if (diffX > 5 && diffX > diffY) {
                    isTouchScrolling = true;
                    
                    // Ngăn chặn các hành vi mặc định khi đang scroll gallery
                    if (Math.abs(diffX) > 10) {
                        GalleryUtils.preventDefault(e);
                    }
                }
                
                // Nếu đang scroll ngang, không cho phép scroll dọc
                if (isTouchScrolling && diffX > diffY) {
                    GalleryUtils.preventDefault(e);
                }
            }
        },
        
        handleTouchEnd: function(e) {
            // Chỉ xử lý nếu là gallery container
            if (!e.target.closest('.gallery-container')) return;
            
            const touchDuration = Date.now() - touchStartTime;
            
            // Nếu là quick tap (dưới 200ms) và không phải đang scroll
            if (touchDuration < 200 && !isTouchScrolling) {
                // Tìm card được click
                const card = e.target.closest('.gallery-card');
                if (card) {
                    // Xử lý click trên card
                    GalleryUtils.preventDefault(e);
                    GalleryUtils.stopPropagation(e);
                    
                    // Gọi hàm xử lý click
                    setTimeout(() => {
                        handleCardClick(card);
                    }, 10);
                }
            }
            
            // Reset touch state
            touchStartX = 0;
            touchStartY = 0;
            isTouchScrolling = false;
            
            // Xóa class touch-active
            if (e.currentTarget && e.currentTarget.classList) {
                e.currentTarget.classList.remove('touch-active');
            }
        },
        
        handleClick: function(e) {
            // Chỉ xử lý click trên desktop (không phải từ touch events)
            if (!GalleryUtils.isTouchDevice()) {
                const card = e.target.closest('.gallery-card');
                if (card) {
                    GalleryUtils.preventDefault(e);
                    handleCardClick(card);
                }
            }
        }
    };
    
    // Card click handler
    function handleCardClick(card) {
        console.log('Gallery card clicked:', card.querySelector('.gallery-title')?.textContent);
        // Có thể mở lightbox ở đây
        // openGalleryLightbox(index);
    }
    
    // Setup touch events với proper event listeners
    function setupGalleryTouchEvents(container) {
        if (!container) return;
        
        // Lưu reference đến container hiện tại
        currentGalleryContainer = container;
        
        // Kiểm tra nếu đã setup events
        if (container.dataset.touchSetup === 'true') return;
        container.dataset.touchSetup = 'true';
        
        // Xóa tất cả event listeners cũ (nếu có)
        container.removeEventListener('touchstart', TouchHandler.handleTouchStart);
        container.removeEventListener('touchmove', TouchHandler.handleTouchMove);
        container.removeEventListener('touchend', TouchHandler.handleTouchEnd);
        container.removeEventListener('click', TouchHandler.handleClick);
        
        // Thêm event listeners với capture phase để chạy trước các script khác
        container.addEventListener('touchstart', TouchHandler.handleTouchStart, { 
            passive: true, 
            capture: true 
        });
        
        container.addEventListener('touchmove', TouchHandler.handleTouchMove, { 
            passive: false, // Để có thể preventDefault khi cần
            capture: true 
        });
        
        container.addEventListener('touchend', TouchHandler.handleTouchEnd, { 
            passive: true, 
            capture: true 
        });
        
        // Thêm click event cho desktop
        container.addEventListener('click', TouchHandler.handleClick, { 
            capture: true 
        });
        
        console.log('✅ Gallery touch events setup complete');
    }
    
    // Khởi tạo gallery
    async function initGallery() {
        if (isGalleryInitialized) return;
        
        try {
            // Chỉ init Firebase nếu chưa có
            if (typeof firebase !== 'undefined' && !firebase.apps.length) {
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
            
            if (typeof firebase !== 'undefined') {
                galleryDatabase = firebase.database();
            }
            
            await loadGalleryData();
            isGalleryInitialized = true;
            
        } catch (error) {
            console.error("Gallery initialization error:", error);
            loadGalleryFromLocalStorage();
        }
    }
    
    // Tải dữ liệu gallery
    async function loadGalleryData() {
        try {
            const galleryContainer = document.getElementById('galleryContainer');
            if (!galleryContainer) return;
            
            // Hiển thị loading
            galleryContainer.innerHTML = `
                <div class="gallery-skeleton">
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                </div>
            `;
            
            // Lấy dữ liệu từ Firebase
            let data = null;
            if (galleryDatabase) {
                const snapshot = await galleryDatabase.ref('gallery').once('value');
                data = snapshot.val();
            }
            
            // Fallback to localStorage
            if (!data) {
                const localData = localStorage.getItem('HTUTransport_gallery');
                data = localData ? JSON.parse(localData) : null;
            }
            
            galleryData = data || { featured: getDefaultGallery() };
            
            // Lưu vào localStorage để dùng sau
            localStorage.setItem('HTUTransport_gallery', JSON.stringify(galleryData));
            
            // Render gallery
            renderGallery();
            
        } catch (error) {
            console.error("Error loading gallery:", error);
            loadGalleryFromLocalStorage();
        }
    }
    
    function loadGalleryFromLocalStorage() {
        try {
            const localData = localStorage.getItem('HTUTransport_gallery');
            galleryData = localData ? JSON.parse(localData) : { featured: getDefaultGallery() };
            renderGallery();
        } catch (error) {
            console.error("Error loading gallery from localStorage:", error);
            galleryData = { featured: getDefaultGallery() };
            renderGallery();
        }
    }
    
    // Render gallery với touch optimization
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
        
        // Create gallery container với ID duy nhất
        const galleryId = 'gallery-' + Date.now();
        const galleryDiv = document.createElement('div');
        galleryDiv.className = 'gallery-container gallery-touch-scroll';
        galleryDiv.id = galleryId;
        
        // Sort by order
        const sortedItems = [...items].sort((a, b) => (a.order || 99) - (b.order || 99));
        
        // Create gallery cards
        sortedItems.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'gallery-card gallery-touch-item';
            card.dataset.index = index;
            
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
                </div>
            `;
            
            // Thêm data attribute để nhận diện
            card.dataset.galleryItem = 'true';
            
            galleryDiv.appendChild(card);
        });
        
        container.appendChild(galleryDiv);
        
        // Setup touch events sau khi render
        setTimeout(() => {
            setupGalleryTouchEvents(galleryDiv);
        }, 100);
        
        // Add horizontal scroll hint
        const scrollHint = document.createElement('div');
        scrollHint.className = 'gallery-scroll-hint';
        scrollHint.innerHTML = `
            <span><i class="fas fa-hand-point-right"></i> Vuốt sang để xem thêm</span>
            <i class="fas fa-chevron-right"></i>
        `;
        container.appendChild(scrollHint);
        
        // Thêm CSS nếu chưa có
        addGalleryStyles();
    }
    
    // Thêm CSS động để tránh xung đột
    function addGalleryStyles() {
        const styleId = 'gallery-custom-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Gallery touch optimization */
            .gallery-touch-scroll {
                touch-action: pan-x !important;
                -webkit-overflow-scrolling: touch !important;
                overscroll-behavior-x: contain !important;
            }
            
            .gallery-touch-item {
                touch-action: pan-x !important;
                -webkit-tap-highlight-color: transparent !important;
            }
            
            .gallery-image {
                pointer-events: none !important;
                user-select: none !important;
                -webkit-user-drag: none !important;
            }
            
            .gallery-container.touch-active {
                cursor: grabbing !important;
            }
            
            /* Prevent other scripts from interfering */
            .gallery-container * {
                -webkit-touch-callout: none !important;
            }
            
            /* Fix for iOS */
            @supports (-webkit-touch-callout: none) {
                .gallery-container {
                    cursor: pointer;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Lightbox functions (giữ nguyên)
    function openGalleryLightbox(index) {
        const galleryItems = galleryData.featured || [];
        if (index < 0 || index >= galleryItems.length) return;
        
        const item = galleryItems[index];
        
        const lightboxHTML = `
            <div class="gallery-lightbox" id="galleryLightbox">
                <div class="lightbox-content">
                    <button class="lightbox-close" onclick="window.galleryCloseLightbox()">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="lightbox-image">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="lightbox-info">
                        <h3>${item.title}</h3>
                        <p>${item.description || ''}</p>
                        <div class="lightbox-meta">
                            <span><i class="fas fa-tag"></i> ${item.category || 'Premium'}</span>
                        </div>
                    </div>
                    <div class="lightbox-nav">
                        ${index > 0 ? `<button class="lightbox-prev" onclick="window.galleryChangeLightboxImage(${index - 1})"><i class="fas fa-chevron-left"></i></button>` : ''}
                        ${index < galleryItems.length - 1 ? `<button class="lightbox-next" onclick="window.galleryChangeLightboxImage(${index + 1})"><i class="fas fa-chevron-right"></i></button>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        document.body.style.overflow = 'hidden';
    }
    
    function closeGalleryLightbox() {
        const lightbox = document.getElementById('galleryLightbox');
        if (lightbox) {
            lightbox.remove();
            document.body.style.overflow = 'auto';
        }
    }
    
    function changeLightboxImage(newIndex) {
        closeGalleryLightbox();
        setTimeout(() => openGalleryLightbox(newIndex), 50);
    }
    
    // Expose lightbox functions to window với tên riêng
    window.galleryCloseLightbox = closeGalleryLightbox;
    window.galleryChangeLightboxImage = changeLightboxImage;
    
    // Default gallery data
    function getDefaultGallery() {
        return [
            {
                id: 'car1',
                title: 'Mercedes V-Class Luxury',
                image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800',
                description: 'Xe 7 chỗ, nội thất da cao cấp, WiFi miễn phí',
                category: 'premium',
                order: 1
            },
            {
                id: 'car2',
                title: 'Toyota Innova Premium',
                image: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?auto=format&fit=crop&w=800',
                description: '7 chỗ tiện nghi, phù hợp gia đình',
                category: 'family',
                order: 2
            },
            {
                id: 'car3',
                title: 'Mercedes S-Class Executive',
                image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800',
                description: 'Xe hạng sang, phục vụ doanh nhân',
                category: 'business',
                order: 3
            },
            {
                id: 'car4',
                title: 'Ford Transit Luxury',
                image: 'https://images.unsplash.com/photo-1563720223488-8f2f62a6e71a?auto=format&fit=crop&w=800',
                description: 'Xe 16 chỗ, phù hợp đoàn thể',
                category: 'group',
                order: 4
            }
        ];
    }
    
    function getCategoryName(category) {
        const categories = {
            'premium': 'Premium',
            'family': 'Gia Đình',
            'business': 'Doanh Nhân',
            'group': 'Đoàn Thể'
        };
        return categories[category] || 'Premium';
    }
    
    // Event listeners với proper cleanup
    function setupEventListeners() {
        // Xóa listeners cũ nếu có
        if (window.galleryInitialized) {
            window.removeEventListener('galleryUpdated', handleGalleryUpdate);
            document.removeEventListener('DOMContentLoaded', handleDOMReady);
        }
        
        // Lắng nghe sự kiện cập nhật gallery
        window.addEventListener('galleryUpdated', handleGalleryUpdate);
        
        // Khởi tạo khi DOM sẵn sàng
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', handleDOMReady);
        } else {
            handleDOMReady();
        }
        
        window.galleryInitialized = true;
    }
    
    function handleGalleryUpdate() {
        loadGalleryData();
    }
    
    function handleDOMReady() {
        // Debounce để tránh xung đột với các script khác
        setTimeout(() => {
            initGallery();
        }, 100);
    }
    
    // Cleanup function để tránh memory leak
    function cleanup() {
        if (currentGalleryContainer) {
            currentGalleryContainer.removeEventListener('touchstart', TouchHandler.handleTouchStart);
            currentGalleryContainer.removeEventListener('touchmove', TouchHandler.handleTouchMove);
            currentGalleryContainer.removeEventListener('touchend', TouchHandler.handleTouchEnd);
            currentGalleryContainer.removeEventListener('click', TouchHandler.handleClick);
            currentGalleryContainer = null;
        }
        
        isGalleryInitialized = false;
    }
    
    // Expose public API với tên riêng để tránh xung đột
    window.HTUGallery = {
        init: initGallery,
        reload: loadGalleryData,
        cleanup: cleanup,
        openLightbox: openGalleryLightbox
    };
    
    // Khởi tạo
    setupEventListeners();
    
    // Auto cleanup khi page unload
    window.addEventListener('beforeunload', cleanup);
    
})();
