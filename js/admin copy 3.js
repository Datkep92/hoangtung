// ===== FIREBASE CONFIG (CHỈ KHAI BÁO Ở ĐÂY) =====
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
const DEFAULT_ADMIN_TOKEN = '123123';
let adminToken = DEFAULT_ADMIN_TOKEN;
let currentEditorType = null;
let currentEditingId = null;
let database = null;

// Data storage
let dataStore = {
    services: { services: {} },
    experiences: { experiences: {} },
    gallery: { featured: [] },
    blog: { posts: {} }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin Panel Initializing...');
    
    // Auto-login if token exists
    const savedToken = localStorage.getItem('luxurymove_admin_token');
    if (savedToken === adminToken) {
        showEditorSection();
        initializeFirebase();
    }
});

// ===== FIREBASE INIT =====
function initializeFirebase() {
    try {
        // Check if Firebase already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("✅ Firebase initialized successfully");
        } else {
            console.log("✅ Firebase already initialized");
        }
        
        database = firebase.database();
        loadAllData();
        
    } catch (error) {
        console.error("❌ Firebase initialization error:", error);
        showStatus('Không thể kết nối Firebase, sử dụng localStorage', 'warning');
        loadFromLocalStorage();
    }
}

// ===== DATA FUNCTIONS =====
async function fetchFromFirebase(path) {
    if (!database) {
        console.warn("Firebase not initialized");
        return loadFromLocalStorage(path);
    }
    
    try {
        const snapshot = await database.ref(path).once('value');
        const data = snapshot.val();
        
        if (data) {
            console.log(`✅ Loaded ${path} from Firebase`);
            localStorage.setItem(`luxurymove_${path}`, JSON.stringify(data));
        }
        
        return data;
    } catch (error) {
        console.error(`❌ Firebase fetch error (${path}):`, error.message);
        showStatus(`Lỗi tải ${path}: ${error.message}`, 'warning');
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

async function saveToFirebase(path, data) {
    if (!database) {
        console.warn("Firebase not initialized, saving to localStorage only");
        localStorage.setItem(`luxurymove_${path}`, JSON.stringify(data));
        return false;
    }
    
    try {
        await database.ref(path).set(data);
        console.log(`✅ Saved ${path} to Firebase`);
        
        // Also save to localStorage
        localStorage.setItem(`luxurymove_${path}`, JSON.stringify(data));
        return true;
        
    } catch (error) {
        console.error(`❌ Firebase save error (${path}):`, error.message);
        
        // Fallback to localStorage
        localStorage.setItem(`luxurymove_${path}`, JSON.stringify(data));
        showStatus('Đã lưu vào localStorage (Firebase lỗi)', 'warning');
        return false;
    }
}

// ===== LOGIN SYSTEM =====
function handleLogin() {
    const inputToken = document.getElementById('adminToken').value;
    
    if (!inputToken) {
        showStatus('Vui lòng nhập token admin', 'error');
        return;
    }
    
    // Check token
    if (inputToken !== adminToken) {
        const savedToken = localStorage.getItem('luxurymove_admin_token');
        if (inputToken !== savedToken) {
            showStatus('Token không đúng', 'error');
            return;
        }
        adminToken = inputToken;
    }
    
    // Save admin token
    if (document.getElementById('rememberMe').checked) {
        localStorage.setItem('luxurymove_admin_token', adminToken);
        document.getElementById('savedTokenStatus').textContent = 'Đã lưu';
        document.getElementById('savedTokenStatus').style.color = '#00C851';
    }
    
    // Show editor
    showEditorSection();
    initializeFirebase();
    
    showStatus('Đăng nhập thành công', 'success');
}

// ===== CÁC HÀM CÒN LẠI GIỮ NGUYÊN TỪ PHIÊN BẢN TRƯỚC =====
// ... (các hàm render, form, utility giữ nguyên) ...
function showEditorSection() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('editorSection').style.display = 'block';
}

function logoutAdmin() {
    localStorage.removeItem('luxurymove_admin_token');
    window.location.reload();
}

// ===== DATA LOADING =====
async function loadAllData() {
    showLoading(true);
    
    try {
        // Load từ Firebase
        const [services, experiences, gallery, blog] = await Promise.allSettled([
            fetchFromFirebase('services'),
            fetchFromFirebase('experiences'),
            fetchFromFirebase('gallery'),
            fetchFromFirebase('blog')
        ]);
        
        // Xử lý services
        if (services.status === 'fulfilled' && services.value) {
            dataStore.services = services.value;
        } else {
            dataStore.services = { services: {} };
        }
        
        // Xử lý experiences
        if (experiences.status === 'fulfilled' && experiences.value) {
            dataStore.experiences = experiences.value;
        } else {
            dataStore.experiences = { experiences: getDefaultExperiences() };
        }
        
        // Xử lý gallery
        if (gallery.status === 'fulfilled' && gallery.value) {
            dataStore.gallery = gallery.value;
        } else {
            dataStore.gallery = { featured: getDefaultGallery() };
        }
        
        // Xử lý blog
        if (blog.status === 'fulfilled' && blog.value) {
            dataStore.blog = blog.value;
        } else {
            dataStore.blog = { posts: getSampleBlogPosts() };
        }
        
        // Render all tabs
        renderServices();
        renderExperiences();
        renderGallery();
        renderBlog();
        
        showStatus('Đã tải dữ liệu từ Firebase', 'success');
    } catch (error) {
        showStatus('Lỗi tải dữ liệu: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ===== SAVE FUNCTIONS (ĐƠN GIẢN HÓA) =====
async function saveItem() {
    if (!currentEditorType) return;
    
    let data;
    
    switch(currentEditorType) {
        case 'service':
            data = getServiceFormData();
            if (!data) return;
            await saveServiceData(data);
            break;
        case 'experience':
            data = getExperienceFormData();
            if (!data) return;
            await saveExperienceData(data);
            break;
        case 'gallery':
            data = getGalleryFormData();
            if (!data) return;
            await saveGalleryData(data);
            break;
        case 'blog':
            data = getBlogFormData();
            if (!data) return;
            await saveBlogData(data);
            break;
    }
    
    closeEditor();
    
    // Hiển thị lại tab
    const tabMap = {
        'service': 'services',
        'experience': 'experiences',
        'gallery': 'gallery',
        'blog': 'blog'
    };
    
    const tabToShow = tabMap[currentEditorType] || 'services';
    showTab(tabToShow);
}

async function saveServiceData(formData) {
    console.log('📦 Saving service to Firebase:', formData.id);
    
    if (!dataStore.services.services) {
        dataStore.services.services = {};
    }
    
    dataStore.services.services[formData.id] = formData.data;
    dataStore.services.last_updated = new Date().toISOString();
    
    // Lưu cả Firebase và localStorage
    await saveToFirebase('services', dataStore.services);
    renderServices();
    
    showStatus(`Đã lưu dịch vụ: ${formData.data.title}`, 'success');
}

async function saveExperienceData(formData) {
    console.log('📦 Saving experience to Firebase:', formData.id);
    
    if (!dataStore.experiences.experiences) {
        dataStore.experiences.experiences = {};
    }
    
    dataStore.experiences.experiences[formData.id] = formData.data;
    dataStore.experiences.last_updated = new Date().toISOString();
    
    await saveToFirebase('experiences', dataStore.experiences);
    renderExperiences();
    
    showStatus(`Đã lưu trải nghiệm: ${formData.data.title}`, 'success');
}

async function saveGalleryData(formData) {
    console.log('📦 Saving gallery to Firebase:', formData.id);
    
    if (!dataStore.gallery.featured) {
        dataStore.gallery.featured = [];
    }
    
    const galleryItem = formData.data;
    
    // Update or add
    if (currentEditingId) {
        const index = dataStore.gallery.featured.findIndex(item => 
            item.id === currentEditingId || item.id === galleryItem.id
        );
        if (index !== -1) {
            dataStore.gallery.featured[index] = galleryItem;
        } else {
            dataStore.gallery.featured.push(galleryItem);
        }
    } else {
        dataStore.gallery.featured.push(galleryItem);
    }
    
    // Sort by order
    dataStore.gallery.featured.sort((a, b) => (a.order || 99) - (b.order || 99));
    dataStore.gallery.last_updated = new Date().toISOString();
    
    await saveToFirebase('gallery', dataStore.gallery);
    renderGallery();
    
    showStatus(`Đã lưu ảnh: ${galleryItem.title}`, 'success');
// Thêm dòng này để trigger refresh trên trang chủ
    window.dispatchEvent(new Event('galleryUpdated'));
    localStorage.setItem('luxurymove_gallery_updated', Date.now().toString());
}

async function saveBlogData(formData) {
    console.log('📦 Saving blog to Firebase:', formData.id);
    
    if (!dataStore.blog.posts) {
        dataStore.blog.posts = {};
    }
    
    dataStore.blog.posts[formData.id] = formData.data;
    dataStore.blog.last_updated = new Date().toISOString();
    
    await saveToFirebase('blog', dataStore.blog);
    renderBlog();
    
    showStatus(`Đã lưu bài viết: ${formData.data.title}`, 'success');
}

// ===== DELETE FUNCTIONS =====
async function deleteItem(type = null, id = null) {
    if (!type) type = currentEditorType;
    if (!id) id = currentEditingId;
    
    if (!type || !id) return;
    
    if (!confirm(`Bạn có chắc muốn xóa ${type} này?`)) return;
    
    switch(type) {
        case 'service':
            if (dataStore.services.services && dataStore.services.services[id]) {
                delete dataStore.services.services[id];
                await saveToFirebase('services', dataStore.services);
                renderServices();
                showStatus('Đã xóa dịch vụ', 'success');
            }
            break;
            
        case 'experience':
            if (dataStore.experiences.experiences && dataStore.experiences.experiences[id]) {
                delete dataStore.experiences.experiences[id];
                await saveToFirebase('experiences', dataStore.experiences);
                renderExperiences();
                showStatus('Đã xóa trải nghiệm', 'success');
            }
            break;
            
        case 'gallery':
            if (dataStore.gallery.featured) {
                dataStore.gallery.featured = dataStore.gallery.featured.filter(item => 
                    item.id !== id && item.id !== parseInt(id)
                );
                await saveToFirebase('gallery', dataStore.gallery);
                renderGallery();
                showStatus('Đã xóa ảnh', 'success');
            }
            break;
            
        case 'blog':
            if (dataStore.blog.posts && dataStore.blog.posts[id]) {
                delete dataStore.blog.posts[id];
                await saveToFirebase('blog', dataStore.blog);
                renderBlog();
                showStatus('Đã xóa bài viết', 'success');
            }
            break;
    }
    
    closeEditor();
}

// ===== RENDER FUNCTIONS (giữ nguyên từ bản gốc) =====
function renderServices() {
    const container = document.getElementById('servicesList');
    const services = dataStore.services.services || {};
    
    if (Object.keys(services).length === 0) {
        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-tertiary);">Chưa có dịch vụ nào</div>';
        return;
    }
    
    let html = '';
    Object.entries(services).forEach(([id, service]) => {
        const image = service.images && service.images.length > 0 ? service.images[0] : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600';
        
        html += `
            <div class="grid-item" onclick="openEditor('service', '${id}')">
                <div class="grid-item-header">
                    <h3 class="grid-item-title">${service.title || 'Chưa có tiêu đề'}</h3>
                    <div class="grid-item-actions">
                        <button class="action-btn" onclick="openEditor('service', '${id}'); event.stopPropagation();">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="deleteItem('service', '${id}'); event.stopPropagation();" style="background: rgba(255, 68, 68, 0.2);">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="grid-item-image">
                    <img src="${image}" alt="${service.title}">
                </div>
                <p style="color: var(--text-tertiary); font-size: 14px; line-height: 1.5;">${service.description?.substring(0, 100) || 'Chưa có mô tả'}...</p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderExperiences() {
    const container = document.getElementById('experiencesList');
    const experiences = dataStore.experiences.experiences || getDefaultExperiences();
    
    let html = '';
    Object.entries(experiences).forEach(([id, exp]) => {
        html += `
            <div class="grid-item" onclick="openEditor('experience', '${id}')">
                <div class="grid-item-header">
                    <h3 class="grid-item-title">${exp.title}</h3>
                    <div class="grid-item-actions">
                        <button class="action-btn" onclick="openEditor('experience', '${id}'); event.stopPropagation();">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="deleteItem('experience', '${id}'); event.stopPropagation();" style="background: rgba(255, 68, 68, 0.2);">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="grid-item-image">
                    <img src="${exp.image}" alt="${exp.title}">
                </div>
                <p style="color: var(--text-tertiary); font-size: 14px; line-height: 1.5;">${exp.description || 'Chưa có mô tả'}</p>
                <div style="margin-top: 10px;">
                    ${(exp.benefits || []).slice(0, 2).map(benefit => `
                        <span style="background: rgba(212, 175, 55, 0.1); color: var(--champagne); padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 5px;">${benefit}</span>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderGallery() {
    const container = document.getElementById('galleryList');
    const gallery = dataStore.gallery.featured || getDefaultGallery();
    
    let html = '';
    gallery.forEach((item, index) => {
        html += `
            <div class="grid-item" onclick="openEditor('gallery', '${item.id || index}')">
                <div class="grid-item-header">
                    <h3 class="grid-item-title">${item.title}</h3>
                    <div class="grid-item-actions">
                        <button class="action-btn" onclick="openEditor('gallery', '${item.id || index}'); event.stopPropagation();">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="deleteItem('gallery', '${item.id || index}'); event.stopPropagation();" style="background: rgba(255, 68, 68, 0.2);">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="grid-item-image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <p style="color: var(--text-tertiary); font-size: 14px; line-height: 1.5;">${item.description || 'Chưa có mô tả'}</p>
                <div style="margin-top: 10px; font-size: 12px; color: var(--champagne);">
                    <i class="fas fa-tag"></i> ${item.category || 'Chưa phân loại'}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html || '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-tertiary);">Chưa có ảnh nào</div>';
}

function renderBlog() {
    const container = document.getElementById('blogList');
    const posts = dataStore.blog.posts || getSampleBlogPosts();
    
    let html = '';
    Object.entries(posts).forEach(([id, post]) => {
        const date = new Date(post.date || new Date()).toLocaleDateString('vi-VN');
        
        html += `
            <div class="grid-item" onclick="openEditor('blog', '${id}')">
                <div class="grid-item-header">
                    <h3 class="grid-item-title">${post.title}</h3>
                    <div class="grid-item-actions">
                        <button class="action-btn" onclick="openEditor('blog', '${id}'); event.stopPropagation();">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="deleteItem('blog', '${id}'); event.stopPropagation();" style="background: rgba(255, 68, 68, 0.2);">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="grid-item-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                </div>
                <p style="color: var(--text-tertiary); font-size: 14px; line-height: 1.5;">${post.excerpt?.substring(0, 100) || 'Chưa có mô tả'}...</p>
                <div style="margin-top: 10px; display: flex; justify-content: space-between; font-size: 12px; color: var(--text-tertiary);">
                    <span><i class="fas fa-user"></i> ${post.author || 'Admin'}</span>
                    <span><i class="far fa-calendar"></i> ${date}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== EDITOR FUNCTIONS (giữ nguyên) =====
function openEditor(type, id = null) {
    currentEditorType = type;
    currentEditingId = id;
    
    const titles = {
        'service': id ? 'Chỉnh sửa Dịch vụ' : 'Thêm Dịch vụ mới',
        'experience': id ? 'Chỉnh sửa Trải nghiệm' : 'Thêm Trải nghiệm mới',
        'gallery': id ? 'Chỉnh sửa Ảnh' : 'Thêm Ảnh mới',
        'blog': id ? 'Chỉnh sửa Bài viết' : 'Thêm Bài viết mới'
    };
    
    document.getElementById('editorModalTitle').textContent = titles[type];
    document.getElementById('deleteItemBtn').style.display = id ? 'block' : 'none';
    
    loadEditorForm(type, id);
    showModal('editorModal');
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function closeEditor() {
    closeModal('editorModal');
    currentEditorType = null;
    currentEditingId = null;
}

// ===== UTILITY FUNCTIONS =====
function showTab(tabName) {
    // Ẩn tất cả tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active từ tất cả buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Tìm tab element
    const tabElement = document.getElementById(`${tabName}Tab`);
    const tabButton = document.querySelector(`button[onclick*="showTab('${tabName}')"]`);
    
    if (!tabElement) {
        console.error(`❌ Tab not found: ${tabName}Tab`);
        const fallbackTab = document.getElementById('servicesTab');
        const fallbackBtn = document.querySelector(`button[onclick*="showTab('services')"]`);
        if (fallbackTab && fallbackBtn) {
            fallbackTab.classList.add('active');
            fallbackBtn.classList.add('active');
        }
        return;
    }
    
    // Hiển thị tab
    tabElement.classList.add('active');
    if (tabButton) {
        tabButton.classList.add('active');
    }
    
    // Load data cho tab
    switch(tabName) {
        case 'services':
            renderServices();
            break;
        case 'experiences':
            renderExperiences();
            break;
        case 'gallery':
            renderGallery();
            break;
        case 'blog':
            renderBlog();
            break;
    }
}

function showLoading(show, message = 'Đang xử lý...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.toggle('show', show);
    }
}

function showStatus(message, type = 'success') {
    const statusBar = document.getElementById('statusBar');
    const statusIcon = document.getElementById('statusIcon');
    const statusMessage = document.getElementById('statusMessage');
    
    if (!statusBar) return;
    
    statusBar.className = `status-bar show ${type}`;
    statusIcon.className = `fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`;
    statusMessage.textContent = message;
    
    setTimeout(() => {
        statusBar.classList.remove('show');
    }, 4000);
}




function loadEditorForm(type, id) {
    const container = document.getElementById('editorModalBody');
    container.innerHTML = '';
    
    // Get existing data if editing
    let data = null;
    if (id) {
        switch(type) {
            case 'service':
                data = dataStore.services.services?.[id];
                break;
            case 'experience':
                data = dataStore.experiences.experiences?.[id];
                break;
            case 'gallery':
                const gallery = dataStore.gallery.featured || [];
                data = gallery.find(item => item.id === id || item.id === parseInt(id));
                break;
            case 'blog':
                data = dataStore.blog.posts?.[id];
                break;
        }
    }
    
    // Generate form based on type
    let formHTML = '';
    
    switch(type) {
        case 'service':
            formHTML = getServiceForm(data, id);
            break;
        case 'experience':
            formHTML = getExperienceForm(data, id);
            break;
        case 'gallery':
            formHTML = getGalleryForm(data, id);
            break;
        case 'blog':
            formHTML = getBlogForm(data, id);
            break;
    }
    
    container.innerHTML = formHTML;
}

// Form templates
// Thay thế các hàm getXXXForm() bằng phiên bản chi tiết hơn

// ===== SERVICE FORM (CHI TIẾT NHƯ GỐC) =====
function getServiceForm(data = null, id = null) {
    const features = data?.features || ['Đón tận cửa, hỗ trợ hành lý', 'Xe đời mới, nội thất cao cấp', 'Tài xế mặc vest, chuyên nghiệp'];
    const pricing = data?.pricing || [{ label: 'Liên hệ để có giá tốt nhất', price: '0931.243.679' }];
    const images = data?.images || [];
    
    return `
        <input type="hidden" id="editId" value="${id || ''}">
        
        <div class="form-group">
            <label class="form-label">ID Dịch vụ *</label>
            <input type="text" id="editServiceId" class="form-input" value="${id || ''}" ${id ? 'readonly' : ''} 
                   placeholder="airport, tour, business, wedding" required>
            <small style="color: var(--text-tertiary);">Không dấu, không khoảng trắng</small>
        </div>
        
        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div class="form-group">
                <label class="form-label">Tiêu đề *</label>
                <input type="text" id="editTitle" class="form-input" value="${data?.title || ''}" 
                       placeholder="Đưa Đón Sân Bay" required>
            </div>
            <div class="form-group">
                <label class="form-label">Phụ đề</label>
                <input type="text" id="editSubtitle" class="form-input" value="${data?.subtitle || ''}" 
                       placeholder="Dịch vụ cao cấp - Đúng giờ - Chuyên nghiệp">
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Mô tả chi tiết *</label>
            <textarea id="editDescription" class="form-input" rows="4" 
                      placeholder="Mô tả chi tiết về dịch vụ..." required>${data?.description || ''}</textarea>
        </div>
        
        <!-- HÌNH ẢNH -->
        <div class="form-group">
            <label class="form-label" style="margin-bottom: 15px; color: var(--champagne);">
                <i class="fas fa-images"></i> Hình ảnh dịch vụ
            </label>
            
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                <input type="text" id="newImageUrl" class="form-input" 
                       placeholder="https://images.unsplash.com/photo-...">
                <button type="button" class="btn btn-secondary" onclick="addServiceImage()" style="white-space: nowrap;">
                    <i class="fas fa-plus"></i> Thêm ảnh
                </button>
            </div>
            
            <div id="serviceImagesList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; margin-top: 10px;">
                ${images.map((img, index) => `
                    <div class="image-item" style="position: relative; height: 80px; border-radius: 8px; overflow: hidden; border: 2px solid rgba(212, 175, 55, 0.3);">
                        <img src="${img}" alt="Service image" style="width: 100%; height: 100%; object-fit: cover;">
                        <button type="button" onclick="removeServiceImage(${index})" 
                                style="position: absolute; top: 5px; right: 5px; width: 24px; height: 24px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                            <i class="fas fa-times" style="font-size: 12px;"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            <input type="hidden" id="editImages" value='${JSON.stringify(images)}'>

        </div>
        
        <!-- TÍNH NĂNG NỔI BẬT -->
        <div class="form-group">
            <label class="form-label" style="margin-bottom: 15px; color: var(--champagne);">
                <i class="fas fa-star"></i> Tính năng nổi bật
            </label>
            
            <div id="serviceFeaturesList" style="margin-bottom: 10px;">
                ${features.map((feature, index) => `
                    <div class="feature-item" style="display: flex; gap: 10px; margin-bottom: 8px; align-items: center;">
                        <input type="text" class="form-input" value="${feature}" 
                               placeholder="Tính năng..." data-index="${index}" style="flex: 1;">
                        <button type="button" onclick="removeServiceFeature(${index})" class="action-btn" style="background: rgba(255, 68, 68, 0.2);">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            
            <div style="display: flex; gap: 10px;">
                <input type="text" id="newFeature" class="form-input" placeholder="Tính năng mới...">
                <button type="button" class="btn btn-secondary" onclick="addServiceFeature()" style="white-space: nowrap;">
                    <i class="fas fa-plus"></i> Thêm
                </button>
            </div>
            <input type="hidden" id="editFeatures" value='${JSON.stringify(features)}'>

        </div>
        
        <!-- BẢNG GIÁ THAM KHẢO -->
        <div class="form-group">
            <label class="form-label" style="margin-bottom: 15px; color: var(--champagne);">
                <i class="fas fa-tags"></i> Bảng giá tham khảo
            </label>
            
            <div id="servicePricingList" style="margin-bottom: 10px;">
                ${pricing.map((price, index) => `
                    <div class="pricing-item" style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 10px; margin-bottom: 8px; align-items: center;">
                        <input type="text" class="form-input" value="${price.label}" 
                               placeholder="Tên gói" data-index="${index}">
                        <input type="text" class="form-input" value="${price.price}" 
                               placeholder="Giá" data-index="${index}">
                        <button type="button" onclick="removeServicePrice(${index})" class="action-btn" style="background: rgba(255, 68, 68, 0.2);">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            
            <div style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 10px;">
                <input type="text" id="newPriceLabel" class="form-input" placeholder="Tên gói (vd: Tour Nha Trang 1 ngày)">
                <input type="text" id="newPriceValue" class="form-input" placeholder="Giá (vd: 1,200,000 VND)">
                <button type="button" class="btn btn-secondary" onclick="addServicePrice()" style="white-space: nowrap;">
                    <i class="fas fa-plus"></i> Thêm
                </button>
            </div>
            <input type="hidden" id="editPricing" value='${JSON.stringify(pricing)}'>

        </div>
    `;
}

// ===== EXPERIENCE FORM (CHI TIẾT) =====
function getExperienceForm(data = null, id = null) {
    const benefits = data?.benefits || [];
    
    return `
        <input type="hidden" id="editId" value="${id || ''}">
        
        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div class="form-group">
                <label class="form-label">ID Trải nghiệm *</label>
                <input type="text" id="editExpId" class="form-input" value="${id || ''}" ${id ? 'readonly' : ''}
                       placeholder="family, friends, business, tourist" required>
                <small style="color: var(--text-tertiary);">Không dấu, không khoảng trắng</small>
            </div>
            <div class="form-group">
                <label class="form-label">Tiêu đề *</label>
                <input type="text" id="editExpTitle" class="form-input" value="${data?.title || ''}"
                       placeholder="Cho Gia Đình" required>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">URL Ảnh đại diện *</label>
            <div style="display: flex; gap: 10px;">
                <input type="text" id="editExpImage" class="form-input" value="${data?.image || ''}"
                       placeholder="https://images.unsplash.com/photo-..." required>
                <button type="button" class="btn btn-secondary" onclick="previewExpImage()" style="white-space: nowrap;">
                    <i class="fas fa-eye"></i> Xem trước
                </button>
            </div>
            <div id="expImagePreview" style="margin-top: 10px; ${data?.image ? 'display: block;' : 'display: none;'}">
                <img src="${data?.image || ''}" alt="Preview" style="max-width: 200px; border-radius: 8px; border: 2px solid var(--champagne);">
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Mô tả ngắn *</label>
            <textarea id="editExpDescription" class="form-input" rows="3" 
                      placeholder="Hành trình ấm cúng, an tâm cho gia đình bạn" required>${data?.description || ''}</textarea>
        </div>
        
        <!-- LỢI ÍCH NỔI BẬT -->
        <div class="form-group">
            <label class="form-label" style="margin-bottom: 15px; color: var(--champagne);">
                <i class="fas fa-check-circle"></i> Lợi ích nổi bật (3-4 lợi ích)
            </label>
            
            <div id="expBenefitsList" style="margin-bottom: 10px;">
                ${benefits.map((benefit, index) => `
                    <div class="feature-item" style="display: flex; gap: 10px; margin-bottom: 8px; align-items: center;">
                        <input type="text" class="form-input" value="${benefit}" 
                               placeholder="Lợi ích..." data-index="${index}" style="flex: 1;">
                        <button type="button" onclick="removeExpBenefit(${index})" class="action-btn" style="background: rgba(255, 68, 68, 0.2);">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            
            <div style="display: flex; gap: 10px;">
                <input type="text" id="newExpBenefit" class="form-input" placeholder="Lợi ích mới...">
                <button type="button" class="btn btn-secondary" onclick="addExpBenefit()" style="white-space: nowrap;">
                    <i class="fas fa-plus"></i> Thêm
                </button>
            </div>
            <input type="hidden" id="editExpBenefits" value="${JSON.stringify(benefits)}">
        </div>
    `;
}

// ===== GALLERY FORM (CHI TIẾT) =====
function getGalleryForm(data = null, id = null) {
    return `
        <input type="hidden" id="editId" value="${id || ''}">
        
        <div class="form-group">
            <label class="form-label">Tiêu đề ảnh *</label>
            <input type="text" id="editGalleryTitle" class="form-input" value="${data?.title || ''}"
                   placeholder="Mercedes V-Class Luxury" required>
        </div>
        
        <div class="form-group">
            <label class="form-label">URL Ảnh *</label>
            <div style="display: flex; gap: 10px;">
                <input type="text" id="editGalleryImage" class="form-input" value="${data?.image || ''}"
                       placeholder="https://images.unsplash.com/photo-..." required>
                <button type="button" class="btn btn-secondary" onclick="previewGalleryImage()" style="white-space: nowrap;">
                    <i class="fas fa-eye"></i> Xem trước
                </button>
            </div>
            <div id="galleryPreview" style="margin-top: 10px; ${data?.image ? 'display: block;' : 'display: none;'}">
                <img src="${data?.image || ''}" alt="Preview" style="max-width: 100%; border-radius: 8px; border: 2px solid var(--champagne);">
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Mô tả ảnh</label>
            <textarea id="editGalleryDescription" class="form-input" rows="3" 
                      placeholder="Xe 7 chỗ, nội thất da cao cấp, WiFi miễn phí, TV giải trí...">${data?.description || ''}</textarea>
        </div>
        
        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div class="form-group">
                <label class="form-label">Danh mục</label>
                <select id="editGalleryCategory" class="form-input">
                    <option value="premium" ${data?.category === 'premium' ? 'selected' : ''}>Premium</option>
                    <option value="family" ${data?.category === 'family' ? 'selected' : ''}>Family</option>
                    <option value="business" ${data?.category === 'business' ? 'selected' : ''}>Business</option>
                    <option value="vip" ${data?.category === 'vip' ? 'selected' : ''}>VIP</option>
                    <option value="interior" ${data?.category === 'interior' ? 'selected' : ''}>Nội thất</option>
                    <option value="service" ${data?.category === 'service' ? 'selected' : ''}>Dịch vụ</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Thứ tự hiển thị</label>
                <input type="number" id="editGalleryOrder" class="form-input" 
                       value="${data?.order || 1}" min="1" max="100">
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Tags (phân cách bằng dấu phẩy)</label>
            <input type="text" id="editGalleryTags" class="form-input" 
                   value="${data?.tags?.join(', ') || ''}" placeholder="mercedes, xe 7 chỗ, cao cấp, luxury">
        </div>
    `;
}

// ===== BLOG FORM (CHI TIẾT) =====
function getBlogForm(data = null, id = null) {
    const date = data?.date || new Date().toISOString().split('T')[0];
    const tags = data?.tags || [];
    
    return `
        <input type="hidden" id="editId" value="${id || ''}">
        
        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div class="form-group">
                <label class="form-label">ID Bài viết *</label>
                <input type="text" id="editPostId" class="form-input" value="${id || ''}" ${id ? 'readonly' : ''}
                       placeholder="post1, post2, ..." required>
            </div>
            <div class="form-group">
                <label class="form-label">Tiêu đề *</label>
                <input type="text" id="editPostTitle" class="form-input" value="${data?.title || ''}"
                       placeholder="Kinh nghiệm du lịch Nha Trang 2024" required>
            </div>
        </div>
        
        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div class="form-group">
                <label class="form-label">Tác giả</label>
                <input type="text" id="editPostAuthor" class="form-input" 
                       value="${data?.author || 'LuxuryMove Team'}" placeholder="LuxuryMove Team">
            </div>
            <div class="form-group">
                <label class="form-label">Ngày đăng</label>
                <input type="date" id="editPostDate" class="form-input" value="${date}">
            </div>
        </div>
        
        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div class="form-group">
                <label class="form-label">Danh mục</label>
                <select id="editPostCategory" class="form-input">
                    <option value="travel" ${data?.category === 'travel' ? 'selected' : ''}>Du lịch</option>
                    <option value="tips" ${data?.category === 'tips' ? 'selected' : ''}>Mẹo hay</option>
                    <option value="news" ${data?.category === 'news' ? 'selected' : ''}>Tin tức</option>
                    <option value="review" ${data?.category === 'review' ? 'selected' : ''}>Đánh giá</option>
                    <option value="service" ${data?.category === 'service' ? 'selected' : ''}>Dịch vụ</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">URL Ảnh đại diện *</label>
                <input type="text" id="editPostImage" class="form-input" value="${data?.image || ''}"
                       placeholder="https://images.unsplash.com/photo-..." required>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Mô tả ngắn *</label>
            <textarea id="editPostExcerpt" class="form-input" rows="3" 
                      placeholder="Mô tả ngắn sẽ hiển thị trên card bài viết..." required>${data?.excerpt || ''}</textarea>
        </div>
        
        <div class="form-group">
            <label class="form-label">Nội dung chi tiết (HTML) *</label>
            <div style="margin-bottom: 10px; display: flex; flex-wrap: wrap; gap: 5px;">
                <button type="button" class="btn btn-secondary" onclick="insertContentTag('h2', 'Tiêu đề')" style="font-size: 12px; padding: 6px 10px;">
                    <i class="fas fa-heading"></i> Tiêu đề
                </button>
                <button type="button" class="btn btn-secondary" onclick="insertContentTag('p', 'Đoạn văn')" style="font-size: 12px; padding: 6px 10px;">
                    <i class="fas fa-paragraph"></i> Đoạn văn
                </button>
                <button type="button" class="btn btn-secondary" onclick="insertContentTag('img', 'Ảnh')" style="font-size: 12px; padding: 6px 10px;">
                    <i class="fas fa-image"></i> Ảnh
                </button>
                <button type="button" class="btn btn-secondary" onclick="insertContentTag('ul', 'Danh sách')" style="font-size: 12px; padding: 6px 10px;">
                    <i class="fas fa-list"></i> Danh sách
                </button>
                <button type="button" class="btn btn-secondary" onclick="insertFeaturesSection()" style="font-size: 12px; padding: 6px 10px; background: rgba(0,200,81,0.2);">
                    <i class="fas fa-star"></i> Tính năng
                </button>
                <button type="button" class="btn btn-secondary" onclick="insertPricingSection()" style="font-size: 12px; padding: 6px 10px; background: rgba(212,175,55,0.2);">
                    <i class="fas fa-tag"></i> Bảng giá
                </button>
            </div>
            <textarea id="editPostContent" class="form-input" rows="8" 
                      placeholder="Nội dung bài viết (có thể sử dụng HTML)..." required>${data?.content || ''}</textarea>
            <small style="color: var(--text-tertiary); display: block; margin-top: 5px;">
                <i class="fas fa-info-circle"></i> Có thể sử dụng HTML để chèn ảnh, link, và định dạng
            </small>
        </div>
        
        <div class="form-group">
            <label class="form-label">Tags (phân cách bằng dấu phẩy)</label>
            <input type="text" id="editPostTags" class="form-input" 
                   value="${tags.join(', ')}" placeholder="du lịch, nha trang, kinh nghiệm, biển">
        </div>
    `;
}

// ===== HELPER FUNCTIONS FOR SERVICE EDITOR =====
function addServiceImage() {
    const urlInput = document.getElementById('newImageUrl');
    const url = urlInput.value.trim();
    
    if (!url) {
        showStatus('Vui lòng nhập URL ảnh', 'error');
        return;
    }
    
    try {
        new URL(url); // Validate URL
    } catch {
        showStatus('URL không hợp lệ', 'error');
        return;
    }
    
    const imagesList = document.getElementById('serviceImagesList');
    const images = JSON.parse(document.getElementById('editImages').value || '[]');
    
    // Add to array
    images.push(url);
    document.getElementById('editImages').value = JSON.stringify(images);
    
    // Add to UI
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';
    imageItem.innerHTML = `
        <img src="${url}" alt="Service image" style="width: 100%; height: 100%; object-fit: cover;">
        <button type="button" onclick="removeServiceImage(${images.length - 1})" 
                style="position: absolute; top: 5px; right: 5px; width: 24px; height: 24px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <i class="fas fa-times" style="font-size: 12px;"></i>
        </button>
    `;
    
    imagesList.appendChild(imageItem);
    urlInput.value = '';
    showStatus('Đã thêm ảnh', 'success');
}

function removeServiceImage(index) {
    const images = JSON.parse(document.getElementById('editImages').value || '[]');
    if (index >= 0 && index < images.length) {
        images.splice(index, 1);
        document.getElementById('editImages').value = JSON.stringify(images);
        
        // Re-render images list
        const imagesList = document.getElementById('serviceImagesList');
        imagesList.innerHTML = images.map((img, i) => `
            <div class="image-item" style="position: relative; height: 80px; border-radius: 8px; overflow: hidden; border: 2px solid rgba(212, 175, 55, 0.3);">
                <img src="${img}" alt="Service image" style="width: 100%; height: 100%; object-fit: cover;">
                <button type="button" onclick="removeServiceImage(${i})" 
                        style="position: absolute; top: 5px; right: 5px; width: 24px; height: 24px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <i class="fas fa-times" style="font-size: 12px;"></i>
                </button>
            </div>
        `).join('');
    }
}

function addServiceFeature() {
    const input = document.getElementById('newFeature');
    const feature = input.value.trim();
    
    if (!feature) {
        showStatus('Vui lòng nhập tính năng', 'error');
        return;
    }
    
    const features = JSON.parse(document.getElementById('editFeatures').value || '[]');
    features.push(feature);
    document.getElementById('editFeatures').value = JSON.stringify(features);
    
    // Add to UI
    const featuresList = document.getElementById('serviceFeaturesList');
    const featureItem = document.createElement('div');
    featureItem.className = 'feature-item';
    featureItem.innerHTML = `
        <input type="text" class="form-input" value="${feature}" 
               placeholder="Tính năng..." data-index="${features.length - 1}" style="flex: 1;">
        <button type="button" onclick="removeServiceFeature(${features.length - 1})" class="action-btn" style="background: rgba(255, 68, 68, 0.2);">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    featuresList.appendChild(featureItem);
    input.value = '';
    showStatus('Đã thêm tính năng', 'success');
}

function removeServiceFeature(index) {
    const features = JSON.parse(document.getElementById('editFeatures').value || '[]');
    if (index >= 0 && index < features.length) {
        features.splice(index, 1);
        document.getElementById('editFeatures').value = JSON.stringify(features);
        
        // Re-render features list
        const featuresList = document.getElementById('serviceFeaturesList');
        featuresList.innerHTML = features.map((feat, i) => `
            <div class="feature-item" style="display: flex; gap: 10px; margin-bottom: 8px; align-items: center;">
                <input type="text" class="form-input" value="${feat}" 
                       placeholder="Tính năng..." data-index="${i}" style="flex: 1;">
                <button type="button" onclick="removeServiceFeature(${i})" class="action-btn" style="background: rgba(255, 68, 68, 0.2);">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
}

function addServicePrice() {
    const labelInput = document.getElementById('newPriceLabel');
    const valueInput = document.getElementById('newPriceValue');
    const label = labelInput.value.trim();
    const value = valueInput.value.trim();
    
    if (!label || !value) {
        showStatus('Vui lòng nhập đầy đủ thông tin giá', 'error');
        return;
    }
    
    const pricing = JSON.parse(document.getElementById('editPricing').value || '[]');
    pricing.push({ label, price: value });
    document.getElementById('editPricing').value = JSON.stringify(pricing);
    
    // Add to UI
    const pricingList = document.getElementById('servicePricingList');
    const priceItem = document.createElement('div');
    priceItem.className = 'pricing-item';
    priceItem.innerHTML = `
        <input type="text" class="form-input" value="${label}" 
               placeholder="Tên gói" data-index="${pricing.length - 1}">
        <input type="text" class="form-input" value="${value}" 
               placeholder="Giá" data-index="${pricing.length - 1}">
        <button type="button" onclick="removeServicePrice(${pricing.length - 1})" class="action-btn" style="background: rgba(255, 68, 68, 0.2);">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    pricingList.appendChild(priceItem);
    labelInput.value = '';
    valueInput.value = '';
    showStatus('Đã thêm bảng giá', 'success');
}

function removeServicePrice(index) {
    const pricing = JSON.parse(document.getElementById('editPricing').value || '[]');
    if (index >= 0 && index < pricing.length) {
        pricing.splice(index, 1);
        document.getElementById('editPricing').value = JSON.stringify(pricing);
        
        // Re-render pricing list
        const pricingList = document.getElementById('servicePricingList');
        pricingList.innerHTML = pricing.map((price, i) => `
            <div class="pricing-item" style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 10px; margin-bottom: 8px; align-items: center;">
                <input type="text" class="form-input" value="${price.label}" 
                       placeholder="Tên gói" data-index="${i}">
                <input type="text" class="form-input" value="${price.price}" 
                       placeholder="Giá" data-index="${i}">
                <button type="button" onclick="removeServicePrice(${i})" class="action-btn" style="background: rgba(255, 68, 68, 0.2);">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
}

// ===== HELPER FUNCTIONS FOR EXPERIENCE EDITOR =====
function previewExpImage() {
    const imageUrl = document.getElementById('editExpImage').value.trim();
    if (!imageUrl) {
        showStatus('Vui lòng nhập URL ảnh', 'error');
        return;
    }
    
    const preview = document.getElementById('expImagePreview');
    const img = preview.querySelector('img');
    img.src = imageUrl;
    preview.style.display = 'block';
}

function addExpBenefit() {
    const input = document.getElementById('newExpBenefit');
    const benefit = input.value.trim();
    
    if (!benefit) {
        showStatus('Vui lòng nhập lợi ích', 'error');
        return;
    }
    
    const benefits = JSON.parse(document.getElementById('editExpBenefits').value || '[]');
    benefits.push(benefit);
    document.getElementById('editExpBenefits').value = JSON.stringify(benefits);
    
    // Add to UI
    const benefitsList = document.getElementById('expBenefitsList');
    const benefitItem = document.createElement('div');
    benefitItem.className = 'feature-item';
    benefitItem.innerHTML = `
        <input type="text" class="form-input" value="${benefit}" 
               placeholder="Lợi ích..." data-index="${benefits.length - 1}" style="flex: 1;">
        <button type="button" onclick="removeExpBenefit(${benefits.length - 1})" class="action-btn" style="background: rgba(255, 68, 68, 0.2);">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    benefitsList.appendChild(benefitItem);
    input.value = '';
    showStatus('Đã thêm lợi ích', 'success');
}

function removeExpBenefit(index) {
    const benefits = JSON.parse(document.getElementById('editExpBenefits').value || '[]');
    if (index >= 0 && index < benefits.length) {
        benefits.splice(index, 1);
        document.getElementById('editExpBenefits').value = JSON.stringify(benefits);
        
        // Re-render benefits list
        const benefitsList = document.getElementById('expBenefitsList');
        benefitsList.innerHTML = benefits.map((benefit, i) => `
            <div class="feature-item" style="display: flex; gap: 10px; margin-bottom: 8px; align-items: center;">
                <input type="text" class="form-input" value="${benefit}" 
                       placeholder="Lợi ích..." data-index="${i}" style="flex: 1;">
                <button type="button" onclick="removeExpBenefit(${i})" class="action-btn" style="background: rgba(255, 68, 68, 0.2);">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
}

function getServiceFormData() {
    const id = document.getElementById('editServiceId')?.value.trim() || 
               document.getElementById('editId')?.value.trim();
    const title = document.getElementById('editTitle')?.value.trim();
    const description = document.getElementById('editDescription')?.value.trim();
    
    if (!id || !title || !description) {
        showStatus('Vui lòng nhập ID, tiêu đề và mô tả', 'error');
        return null;
    }
    
    // LẤY DỮ LIỆU TỪ FORM ĐÚNG CÁCH
    const imagesInput = document.getElementById('editImages');
    const featuresInput = document.getElementById('editFeatures');
    const pricingInput = document.getElementById('editPricing');
    
    // DÙNG HÀM SAFE PARSE MỚI
    const images = safeJsonParse(imagesInput?.value, []);
    const features = safeJsonParse(featuresInput?.value, []);
    const pricing = safeJsonParse(pricingInput?.value, []);
    
    return {
        id: id,
        data: {
            title: title,
            subtitle: document.getElementById('editSubtitle')?.value.trim() || title,
            images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600'],
            description: description,
            features: features.length > 0 ? features : ['Chất lượng cao cấp', 'Đúng giờ 100%', 'Tài xế chuyên nghiệp'],
            pricing: pricing.length > 0 ? pricing : [{ label: 'Liên hệ để có giá tốt nhất', price: '0931.243.679' }]
        }
    };
}

function getExperienceFormData() {
    const id = document.getElementById('editExpId')?.value.trim() || 
               document.getElementById('editId')?.value.trim();
    const title = document.getElementById('editExpTitle')?.value.trim();
    const image = document.getElementById('editExpImage')?.value.trim();
    const description = document.getElementById('editExpDescription')?.value.trim();
    
    if (!id || !title || !image || !description) {
        showStatus('Vui lòng nhập đầy đủ thông tin', 'error');
        return null;
    }
    
    const benefitsInput = document.getElementById('editExpBenefits');
    const benefits = safeJsonParse(benefitsInput?.value, []);
    
    return {
        id: id,
        data: {
            title: title,
            image: image,
            description: description,
            benefits: benefits.length > 0 ? benefits : ['Lợi ích 1', 'Lợi ích 2', 'Lợi ích 3']
        }
    };
}
function safeJsonParse(str, defaultValue = []) {
    if (!str || typeof str !== 'string' || str.trim() === '') {
        return defaultValue;
    }
    
    try {
        let cleanStr = str.trim();
        
        // FIX THÊM: Kiểm tra chuỗi không hợp lệ
        if (cleanStr === '[' || cleanStr === '{') {
            console.warn('Incomplete JSON string:', cleanStr);
            return defaultValue;
        }
        
        if (cleanStr === '[object Object]' || cleanStr === 'undefined') {
            return defaultValue;
        }
        
        const parsed = JSON.parse(cleanStr);
        
        if (Array.isArray(parsed)) {
            return parsed;
        } else if (parsed && typeof parsed === 'object') {
            return Object.values(parsed);
        }
        
        return defaultValue;
    } catch (error) {
        console.error('JSON parse error:', error.message, 'String:', str);
        return defaultValue;
    }
}

// ==== FIX HÀM getGalleryFormData() ====
function getGalleryFormData() {
    // Kiểm tra tất cả các element trước khi dùng .value
    const titleInput = document.getElementById('editGalleryTitle');
    const imageInput = document.getElementById('editGalleryImage');
    const categoryInput = document.getElementById('editGalleryCategory');
    const orderInput = document.getElementById('editGalleryOrder');
    const descriptionInput = document.getElementById('editGalleryDescription');
    const tagsInput = document.getElementById('editGalleryTags');
    
    // Kiểm tra null
    if (!titleInput || !imageInput) {
        showStatus('Form không hợp lệ, vui lòng thử lại', 'error');
        return null;
    }
    
    const title = titleInput.value.trim();
    const image = imageInput.value.trim();
    
    if (!title || !image) {
        showStatus('Vui lòng nhập tiêu đề và URL ảnh', 'error');
        return null;
    }
    
    // Lấy các giá trị khác (có thể null)
    const category = categoryInput ? categoryInput.value : 'premium';
    const order = orderInput ? parseInt(orderInput.value) || 1 : 1;
    const description = descriptionInput ? descriptionInput.value.trim() : '';
    const tagsText = tagsInput ? tagsInput.value.trim() : '';
    const tags = tagsText ? tagsText.split(',').map(t => t.trim()).filter(t => t) : [];
    
    const id = currentEditingId || 'gallery_' + Date.now();
    
    return {
        id: id,
        data: {
            title: title,
            image: image,
            description: description || title,
            category: category,
            order: order,
            tags: tags
        }
    };
}

function getBlogFormData() {
    const id = document.getElementById('editPostId').value.trim() || document.getElementById('editId').value.trim();
    const title = document.getElementById('editPostTitle').value.trim();
    const image = document.getElementById('editPostImage').value.trim();
    const excerpt = document.getElementById('editPostExcerpt').value.trim();
    
    if (!id || !title || !image || !excerpt) {
        showStatus('Vui lòng nhập đầy đủ thông tin', 'error');
        return null;
    }
    
    const tagsText = document.getElementById('editPostTags').value.trim();
    const tags = tagsText ? tagsText.split(',').map(t => t.trim()).filter(t => t) : [];
    
    return {
        id: id,
        data: {
            title: title,
            author: document.getElementById('editPostAuthor').value.trim() || 'LuxuryMove Team',
            date: document.getElementById('editPostDate').value,
            category: document.getElementById('editPostCategory').value,
            image: image,
            excerpt: excerpt,
            content: document.getElementById('editPostContent').value.trim() || '<p>Đang cập nhật nội dung...</p>',
            tags: tags
        }
    };
}



function saveExperienceData(formData) {
    console.log('📦 Saving experience:', formData.id, formData.data);
    
    // Đảm bảo cấu trúc đúng
    if (!dataStore.experiences || typeof dataStore.experiences !== 'object') {
        dataStore.experiences = { experiences: {} };
    }
    
    if (!dataStore.experiences.experiences) {
        dataStore.experiences.experiences = {};
    }
    
    // Lưu đúng định dạng JSON chuẩn
    dataStore.experiences.experiences[formData.id] = {
        title: formData.data.title || '',
        image: formData.data.image || '',
        description: formData.data.description || formData.data.title || '',
        benefits: Array.isArray(formData.data.benefits) ? formData.data.benefits : []
    };
    
    dataStore.experiences.last_updated = new Date().toISOString();
    
    console.log('✅ Experience saved structure:', {
        id: formData.id,
        data: dataStore.experiences.experiences[formData.id]
    });
    
    localStorage.setItem('luxurymove_experiences', JSON.stringify(dataStore.experiences, null, 2));
    saveToGitHub('experiences', dataStore.experiences);
    
    showStatus(`Đã lưu trải nghiệm: ${formData.data.title}`, 'success');
}



function deleteItemConfirm(type, id) {
    if (confirm(`Bạn có chắc muốn xóa ${type} này?`)) {
        deleteItem(type, id);
    }
}



// ===== GALLERY PREVIEW =====
function previewGalleryImage() {
    const imageUrl = document.getElementById('editGalleryImage').value.trim();
    if (!imageUrl) {
        showStatus('Vui lòng nhập URL ảnh', 'error');
        return;
    }
    
    const preview = document.getElementById('galleryPreview');
    const img = preview.querySelector('img');
    img.src = imageUrl;
    preview.style.display = 'block';
}



function updateToken() {
    const newToken = document.getElementById('newToken').value;
    const confirmToken = document.getElementById('confirmToken').value;
    
    if (!newToken || !confirmToken) {
        showStatus('Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }
    
    if (newToken !== confirmToken) {
        showStatus('Token không khớp', 'error');
        return;
    }
    
    if (newToken.length < 6) {
        showStatus('Token phải có ít nhất 6 ký tự', 'error');
        return;
    }
    
    localStorage.setItem('luxurymove_admin_token', newToken);
    adminToken = newToken;
    
    showStatus('Đã cập nhật token thành công', 'success');
    closeModal('tokenModal');
}



// ===== DEFAULT DATA =====
function getDefaultExperiences() {
    return {
        'family': {
            title: 'Cho Gia Đình',
            image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=500',
            description: 'Hành trình ấm cúng, an tâm cho gia đình bạn',
            benefits: ['An toàn tuyệt đối cho người thân', 'Tiện nghi cho trẻ em & người lớn tuổi', 'Không gian riêng tư, thoải mái']
        },
        'friends': {
            title: 'Cho Bạn Bè',
            image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=500',
            description: 'Chuyến đi vui vẻ cùng những người bạn thân',
            benefits: ['Thoải mái trò chuyện, tạo kỷ niệm', 'Điểm dừng linh hoạt theo nhóm', 'Chi phí chia sẻ hợp lý']
        }
    };
}

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
        }
    ];
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
            content: '<p>Nội dung bài viết...</p>',
            tags: ['nha trang', 'du lịch', 'kinh nghiệm']
        }
    };
}



function showStatus(message, type = 'success') {
    const statusBar = document.getElementById('statusBar');
    const statusIcon = document.getElementById('statusIcon');
    const statusMessage = document.getElementById('statusMessage');
    
    if (!statusBar) return;
    
    statusBar.className = `status-bar show ${type}`;
    statusIcon.className = `fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`;
    statusMessage.textContent = message;
    
    setTimeout(() => {
        statusBar.classList.remove('show');
    }, 4000);
}