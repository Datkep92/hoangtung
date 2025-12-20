// ===== GALLERY FUNCTIONS =====
let galleryData = { featured: [] };
let galleryDatabase = null;

// Khởi tạo gallery
async function initGallery() {
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
        galleryDatabase = firebase.database();
        await loadGalleryData();
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
            const localData = localStorage.getItem('luxurymove_gallery');
            data = localData ? JSON.parse(localData) : null;
        }
        
        galleryData = data || { featured: getDefaultGallery() };
        
        // Lưu vào localStorage để dùng sau
        localStorage.setItem('luxurymove_gallery', JSON.stringify(galleryData));
        
        // Render gallery
        renderGallery();
        
    } catch (error) {
        console.error("Error loading gallery:", error);
        loadGalleryFromLocalStorage();
    }
}

function loadGalleryFromLocalStorage() {
    try {
        const localData = localStorage.getItem('luxurymove_gallery');
        galleryData = localData ? JSON.parse(localData) : { featured: getDefaultGallery() };
        renderGallery();
    } catch (error) {
        console.error("Error loading gallery from localStorage:", error);
        galleryData = { featured: getDefaultGallery() };
        renderGallery();
    }
}

// Render gallery
function renderGallery() {
    const galleryContainer = document.getElementById('galleryContainer');
    if (!galleryContainer) return;
    
    const galleryItems = galleryData.featured || [];
    
    if (galleryItems.length === 0) {
        galleryContainer.innerHTML = `
            <div class="empty-gallery">
                <i class="fas fa-images"></i>
                <p>Chưa có hình ảnh nào</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="gallery-grid">';
    
    galleryItems.sort((a, b) => (a.order || 99) - (b.order || 99)).forEach((item, index) => {
        html += `
            <div class="gallery-card" onclick="openGalleryLightbox(${index})">
                <div class="gallery-card-image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                    <div class="gallery-card-overlay">
                        <div class="gallery-card-category">${item.category || 'Premium'}</div>
                        <h3 class="gallery-card-title">${item.title}</h3>
                        <p class="gallery-card-desc">${item.description || ''}</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    galleryContainer.innerHTML = html;
}

// Lightbox
function openGalleryLightbox(index) {
    const galleryItems = galleryData.featured || [];
    if (index < 0 || index >= galleryItems.length) return;
    
    const item = galleryItems[index];
    
    const lightboxHTML = `
        <div class="gallery-lightbox" id="galleryLightbox">
            <div class="lightbox-content">
                <button class="lightbox-close" onclick="closeGalleryLightbox()">
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
                    ${index > 0 ? `<button class="lightbox-prev" onclick="changeLightboxImage(${index - 1})"><i class="fas fa-chevron-left"></i></button>` : ''}
                    ${index < galleryItems.length - 1 ? `<button class="lightbox-next" onclick="changeLightboxImage(${index + 1})"><i class="fas fa-chevron-right"></i></button>` : ''}
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

// Lắng nghe sự kiện cập nhật gallery từ admin
window.addEventListener('galleryUpdated', function() {
    loadGalleryData();
});

// Khởi tạo gallery khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    initGallery();
});