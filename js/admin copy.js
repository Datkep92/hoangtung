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
const DEFAULT_ADMIN_TOKEN = '123123';
let adminToken = DEFAULT_ADMIN_TOKEN;
let currentEditorType = null;
let currentEditingId = null;
let database = null;
let dataStore = {
    services: { services: {} },
    experiences: { experiences: {} },
    gallery: { featured: [] },
    blog: { posts: {} }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    const savedToken = localStorage.getItem('luxurymove_admin_token');
    if (savedToken === adminToken) {
        showEditorSection();
        initializeFirebase();
    }
});

// ===== FIREBASE INIT =====
function initializeFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        database = firebase.database();
        loadAllData();
    } catch (error) {
        console.error("Firebase initialization error:", error);
        showStatus('Không thể kết nối Firebase, sử dụng localStorage', 'warning');
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

async function saveToFirebase(path, data) {
    if (!database) {
        localStorage.setItem(`luxurymove_${path}`, JSON.stringify(data));
        return false;
    }
    
    try {
        await database.ref(path).set(data);
        localStorage.setItem(`luxurymove_${path}`, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Firebase save error (${path}):`, error.message);
        localStorage.setItem(`luxurymove_${path}`, JSON.stringify(data));
        showStatus('Đã lưu vào localStorage (Firebase lỗi)', 'warning');
        return false;
    }
}

// ===== LOGIN SYSTEM =====
function handleLogin() {
    const inputToken = document.getElementById('adminToken').value;
    const savedToken = localStorage.getItem('luxurymove_admin_token');
    
    if (!inputToken) {
        showStatus('Vui lòng nhập token admin', 'error');
        return;
    }
    
    if (inputToken !== adminToken && inputToken !== savedToken) {
        showStatus('Token không đúng', 'error');
        return;
    }
    
    adminToken = inputToken;
    
    if (document.getElementById('rememberMe').checked) {
        localStorage.setItem('luxurymove_admin_token', adminToken);
    }
    
    showEditorSection();
    initializeFirebase();
    showStatus('Đăng nhập thành công', 'success');
}

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
    try {
        const [services, experiences, gallery, blog] = await Promise.allSettled([
            fetchFromFirebase('services'),
            fetchFromFirebase('experiences'),
            fetchFromFirebase('gallery'),
            fetchFromFirebase('blog')
        ]);
        
        dataStore.services = services.value || { services: {} };
        dataStore.experiences = experiences.value || { experiences: getDefaultExperiences() };
        dataStore.gallery = gallery.value || { featured: getDefaultGallery() };
        dataStore.blog = blog.value || { posts: getSampleBlogPosts() };
        
        renderAllTabs();
        showStatus('Đã tải dữ liệu từ Firebase', 'success');
    } catch (error) {
        showStatus('Lỗi tải dữ liệu: ' + error.message, 'error');
    }
}

function renderAllTabs() {
    renderServices();
    renderExperiences();
    renderGallery();
    renderBlog();
}

// ===== SAVE FUNCTIONS =====
async function saveItem() {
    if (!currentEditorType) return;
    
    let formData;
    switch(currentEditorType) {
        case 'service': formData = getServiceFormData(); break;
        case 'experience': formData = getExperienceFormData(); break;
        case 'gallery': formData = getGalleryFormData(); break;
        case 'blog': formData = getBlogFormData(); break;
    }
    
    if (!formData) return;
    
    switch(currentEditorType) {
        case 'service': await saveServiceData(formData); break;
        case 'experience': await saveExperienceData(formData); break;
        case 'gallery': await saveGalleryData(formData); break;
        case 'blog': await saveBlogData(formData); break;
    }
    
    closeEditor();
    
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
    if (!dataStore.services.services) dataStore.services.services = {};
    dataStore.services.services[formData.id] = formData.data;
    dataStore.services.last_updated = new Date().toISOString();
    
    await saveToFirebase('services', dataStore.services);
    renderServices();
    showStatus(`Đã lưu dịch vụ: ${formData.data.title}`, 'success');
}

async function saveExperienceData(formData) {
    if (!dataStore.experiences.experiences) dataStore.experiences.experiences = {};
    dataStore.experiences.experiences[formData.id] = formData.data;
    dataStore.experiences.last_updated = new Date().toISOString();
    
    await saveToFirebase('experiences', dataStore.experiences);
    renderExperiences();
    showStatus(`Đã lưu trải nghiệm: ${formData.data.title}`, 'success');
}

async function saveGalleryData(formData) {
    if (!dataStore.gallery.featured) dataStore.gallery.featured = [];
    
    const galleryItem = formData.data;
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
    
    dataStore.gallery.featured.sort((a, b) => (a.order || 99) - (b.order || 99));
    dataStore.gallery.last_updated = new Date().toISOString();
    
    await saveToFirebase('gallery', dataStore.gallery);
    renderGallery();
    showStatus(`Đã lưu ảnh: ${galleryItem.title}`, 'success');
    window.dispatchEvent(new Event('galleryUpdated'));
}

async function saveBlogData(formData) {
    if (!dataStore.blog.posts) dataStore.blog.posts = {};
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
    if (!type || !id || !confirm(`Bạn có chắc muốn xóa ${type} này?`)) return;
    
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

// ===== RENDER FUNCTIONS =====
function renderServices() {
    const container = document.getElementById('servicesList');
    const services = dataStore.services.services || {};
    
    if (Object.keys(services).length === 0) {
        container.innerHTML = '<div class="empty-state">Chưa có dịch vụ nào</div>';
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
                        <button class="action-btn" onclick="deleteItem('service', '${id}'); event.stopPropagation();">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="grid-item-image">
                    <img src="${image}" alt="${service.title}">
                </div>
                <p>${service.description?.substring(0, 100) || 'Chưa có mô tả'}...</p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderExperiences() {
    const container = document.getElementById('experiencesList');
    const experiences = dataStore.experiences.experiences || {};
    
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
                        <button class="action-btn" onclick="deleteItem('experience', '${id}'); event.stopPropagation();">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="grid-item-image">
                    <img src="${exp.image}" alt="${exp.title}">
                </div>
                <p>${exp.description || 'Chưa có mô tả'}</p>
                <div class="benefits-tags">
                    ${(exp.benefits || []).slice(0, 2).map(benefit => `
                        <span class="benefit-tag">${benefit}</span>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderGallery() {
    const container = document.getElementById('galleryList');
    const gallery = dataStore.gallery.featured || [];
    
    let html = '';
    gallery.forEach((item) => {
        html += `
            <div class="grid-item" onclick="openEditor('gallery', '${item.id}')">
                <div class="grid-item-header">
                    <h3 class="grid-item-title">${item.title}</h3>
                    <div class="grid-item-actions">
                        <button class="action-btn" onclick="openEditor('gallery', '${item.id}'); event.stopPropagation();">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="deleteItem('gallery', '${item.id}'); event.stopPropagation();">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="grid-item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <p>${item.description || 'Chưa có mô tả'}</p>
                <div class="category-tag">
                    <i class="fas fa-tag"></i> ${item.category || 'Chưa phân loại'}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html || '<div class="empty-state">Chưa có ảnh nào</div>';
}

function renderBlog() {
    const container = document.getElementById('blogList');
    const posts = dataStore.blog.posts || {};
    
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
                        <button class="action-btn" onclick="deleteItem('blog', '${id}'); event.stopPropagation();">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="grid-item-image">
                    <img src="${post.image}" alt="${post.title}">
                </div>
                <p>${post.excerpt?.substring(0, 100) || 'Chưa có mô tả'}...</p>
                <div class="blog-meta">
                    <span><i class="fas fa-user"></i> ${post.author || 'Admin'}</span>
                    <span><i class="far fa-calendar"></i> ${date}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== EDITOR FUNCTIONS =====
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

function loadEditorForm(type, id) {
    const container = document.getElementById('editorModalBody');
    
    let data = null;
    if (id) {
        switch(type) {
            case 'service': data = dataStore.services.services?.[id]; break;
            case 'experience': data = dataStore.experiences.experiences?.[id]; break;
            case 'gallery': 
                const gallery = dataStore.gallery.featured || [];
                data = gallery.find(item => item.id === id || item.id === parseInt(id));
                break;
            case 'blog': data = dataStore.blog.posts?.[id]; break;
        }
    }
    
    let formHTML = '';
    switch(type) {
        case 'service': formHTML = getServiceForm(data, id); break;
        case 'experience': formHTML = getExperienceForm(data, id); break;
        case 'gallery': formHTML = getGalleryForm(data, id); break;
        case 'blog': formHTML = getBlogForm(data, id); break;
    }
    
    container.innerHTML = formHTML;
}

// ===== FORM FUNCTIONS =====
function getServiceForm(data = null, id = null) {
    const features = data?.features || ['Đón tận cửa, hỗ trợ hành lý', 'Xe đời mới, nội thất cao cấp', 'Tài xế mặc vest, chuyên nghiệp'];
    const pricing = data?.pricing || [{ label: 'Liên hệ để có giá tốt nhất', price: '0931.243.679' }];
    const images = data?.images || [];
    
    return `
        <input type="hidden" id="editId" value="${id || ''}">
        
        <div class="form-group">
            <label class="form-label">ID Dịch vụ *</label>
            <input type="text" id="editServiceId" class="form-input" value="${id || ''}" ${id ? 'readonly' : ''} 
                   placeholder="airport, tour, business" required>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Tiêu đề *</label>
                <input type="text" id="editTitle" class="form-input" value="${data?.title || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Phụ đề</label>
                <input type="text" id="editSubtitle" class="form-input" value="${data?.subtitle || ''}">
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Mô tả chi tiết *</label>
            <textarea id="editDescription" class="form-input" rows="4" required>${data?.description || ''}</textarea>
        </div>
        
        <div class="form-group">
            <label class="form-label">Hình ảnh dịch vụ</label>
            <div class="image-input-row">
                <input type="text" id="newImageUrl" class="form-input" placeholder="URL ảnh">
                <button type="button" class="btn btn-secondary" onclick="addServiceImage()">Thêm ảnh</button>
            </div>
            <div id="serviceImagesList" class="images-grid">
                ${images.map((img, index) => `
                    <div class="image-item">
                        <img src="${img}" alt="Service image">
                        <button type="button" onclick="removeServiceImage(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            <input type="hidden" id="editImages" value='${JSON.stringify(images)}'>
        </div>
        
        <div class="form-group">
            <label class="form-label">Tính năng nổi bật</label>
            <div id="serviceFeaturesList">
                ${features.map((feature, index) => `
                    <div class="feature-item">
                        <input type="text" class="form-input" value="${feature}" data-index="${index}">
                        <button type="button" onclick="removeServiceFeature(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="feature-input-row">
                <input type="text" id="newFeature" class="form-input" placeholder="Tính năng mới">
                <button type="button" class="btn btn-secondary" onclick="addServiceFeature()">Thêm</button>
            </div>
            <input type="hidden" id="editFeatures" value='${JSON.stringify(features)}'>
        </div>
        
        <div class="form-group">
            <label class="form-label">Bảng giá tham khảo</label>
            <div id="servicePricingList">
                ${pricing.map((price, index) => `
                    <div class="pricing-item">
                        <input type="text" class="form-input" value="${price.label}" data-index="${index}">
                        <input type="text" class="form-input" value="${price.price}" data-index="${index}">
                        <button type="button" onclick="removeServicePrice(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="pricing-input-row">
                <input type="text" id="newPriceLabel" class="form-input" placeholder="Tên gói">
                <input type="text" id="newPriceValue" class="form-input" placeholder="Giá">
                <button type="button" class="btn btn-secondary" onclick="addServicePrice()">Thêm</button>
            </div>
            <input type="hidden" id="editPricing" value='${JSON.stringify(pricing)}'>
        </div>
    `;
}

function getExperienceForm(data = null, id = null) {
    const benefits = data?.benefits || [];
    
    return `
        <input type="hidden" id="editId" value="${id || ''}">
        
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">ID Trải nghiệm *</label>
                <input type="text" id="editExpId" class="form-input" value="${id || ''}" ${id ? 'readonly' : ''} required>
            </div>
            <div class="form-group">
                <label class="form-label">Tiêu đề *</label>
                <input type="text" id="editExpTitle" class="form-input" value="${data?.title || ''}" required>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">URL Ảnh đại diện *</label>
            <div class="image-preview-row">
                <input type="text" id="editExpImage" class="form-input" value="${data?.image || ''}" required>
                <button type="button" class="btn btn-secondary" onclick="previewExpImage()">Xem trước</button>
            </div>
            <div id="expImagePreview" style="${data?.image ? 'display: block;' : 'display: none;'}">
                <img src="${data?.image || ''}" alt="Preview">
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Mô tả ngắn *</label>
            <textarea id="editExpDescription" class="form-input" rows="3" required>${data?.description || ''}</textarea>
        </div>
        
        <div class="form-group">
            <label class="form-label">Lợi ích nổi bật</label>
            <div id="expBenefitsList">
                ${benefits.map((benefit, index) => `
                    <div class="feature-item">
                        <input type="text" class="form-input" value="${benefit}" data-index="${index}">
                        <button type="button" onclick="removeExpBenefit(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="feature-input-row">
                <input type="text" id="newExpBenefit" class="form-input" placeholder="Lợi ích mới">
                <button type="button" class="btn btn-secondary" onclick="addExpBenefit()">Thêm</button>
            </div>
            <input type="hidden" id="editExpBenefits" value="${JSON.stringify(benefits)}">
        </div>
    `;
}

function getGalleryForm(data = null, id = null) {
    return `
        <input type="hidden" id="editId" value="${id || ''}">
        
        <div class="form-group">
            <label class="form-label">Tiêu đề ảnh *</label>
            <input type="text" id="editGalleryTitle" class="form-input" value="${data?.title || ''}" required>
        </div>
        
        <div class="form-group">
            <label class="form-label">URL Ảnh *</label>
            <div class="image-preview-row">
                <input type="text" id="editGalleryImage" class="form-input" value="${data?.image || ''}" required>
                <button type="button" class="btn btn-secondary" onclick="previewGalleryImage()">Xem trước</button>
            </div>
            <div id="galleryPreview" style="${data?.image ? 'display: block;' : 'display: none;'}">
                <img src="${data?.image || ''}" alt="Preview">
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">Mô tả ảnh</label>
            <textarea id="editGalleryDescription" class="form-input" rows="3">${data?.description || ''}</textarea>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Danh mục</label>
                <select id="editGalleryCategory" class="form-input">
                    <option value="premium" ${data?.category === 'premium' ? 'selected' : ''}>Premium</option>
                    <option value="family" ${data?.category === 'family' ? 'selected' : ''}>Family</option>
                    <option value="business" ${data?.category === 'business' ? 'selected' : ''}>Business</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Thứ tự hiển thị</label>
                <input type="number" id="editGalleryOrder" class="form-input" value="${data?.order || 1}" min="1" max="100">
            </div>
        </div>
    `;
}

function getBlogForm(data = null, id = null) {
    const date = data?.date || new Date().toISOString().split('T')[0];
    const tags = data?.tags || [];
    
    return `
        <input type="hidden" id="editId" value="${id || ''}">
        
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">ID Bài viết *</label>
                <input type="text" id="editPostId" class="form-input" value="${id || ''}" ${id ? 'readonly' : ''} required>
            </div>
            <div class="form-group">
                <label class="form-label">Tiêu đề *</label>
                <input type="text" id="editPostTitle" class="form-input" value="${data?.title || ''}" required>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Tác giả</label>
                <input type="text" id="editPostAuthor" class="form-input" value="${data?.author || 'LuxuryMove Team'}">
            </div>
            <div class="form-group">
                <label class="form-label">Ngày đăng</label>
                <input type="date" id="editPostDate" class="form-input" value="${date}">
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">URL Ảnh đại diện *</label>
            <input type="text" id="editPostImage" class="form-input" value="${data?.image || ''}" required>
        </div>
        
        <div class="form-group">
            <label class="form-label">Mô tả ngắn *</label>
            <textarea id="editPostExcerpt" class="form-input" rows="3" required>${data?.excerpt || ''}</textarea>
        </div>
        
        <div class="form-group">
            <label class="form-label">Nội dung chi tiết *</label>
            <textarea id="editPostContent" class="form-input" rows="8" required>${data?.content || ''}</textarea>
        </div>
        
        <div class="form-group">
            <label class="form-label">Tags (phân cách bằng dấu phẩy)</label>
            <input type="text" id="editPostTags" class="form-input" value="${tags.join(', ')}">
        </div>
    `;
}

// ===== FORM DATA GETTERS =====
function getServiceFormData() {
    const id = document.getElementById('editServiceId')?.value.trim() || document.getElementById('editId')?.value.trim();
    const title = document.getElementById('editTitle')?.value.trim();
    const description = document.getElementById('editDescription')?.value.trim();
    
    if (!id || !title || !description) {
        showStatus('Vui lòng nhập ID, tiêu đề và mô tả', 'error');
        return null;
    }
    
    const images = safeJsonParse(document.getElementById('editImages')?.value, []);
    const features = safeJsonParse(document.getElementById('editFeatures')?.value, []);
    const pricing = safeJsonParse(document.getElementById('editPricing')?.value, []);
    
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
    const id = document.getElementById('editExpId')?.value.trim() || document.getElementById('editId')?.value.trim();
    const title = document.getElementById('editExpTitle')?.value.trim();
    const image = document.getElementById('editExpImage')?.value.trim();
    const description = document.getElementById('editExpDescription')?.value.trim();
    
    if (!id || !title || !image || !description) {
        showStatus('Vui lòng nhập đầy đủ thông tin', 'error');
        return null;
    }
    
    const benefits = safeJsonParse(document.getElementById('editExpBenefits')?.value, []);
    
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

function getGalleryFormData() {
    const titleInput = document.getElementById('editGalleryTitle');
    const imageInput = document.getElementById('editGalleryImage');
    
    if (!titleInput || !imageInput) {
        showStatus('Form không hợp lệ', 'error');
        return null;
    }
    
    const title = titleInput.value.trim();
    const image = imageInput.value.trim();
    
    if (!title || !image) {
        showStatus('Vui lòng nhập tiêu đề và URL ảnh', 'error');
        return null;
    }
    
    const id = currentEditingId || 'gallery_' + Date.now();
    
    return {
        id: id,
        data: {
            title: title,
            image: image,
            description: document.getElementById('editGalleryDescription')?.value.trim() || title,
            category: document.getElementById('editGalleryCategory')?.value || 'premium',
            order: parseInt(document.getElementById('editGalleryOrder')?.value) || 1
        }
    };
}

function getBlogFormData() {
    const id = document.getElementById('editPostId')?.value.trim() || document.getElementById('editId')?.value.trim();
    const title = document.getElementById('editPostTitle')?.value.trim();
    const image = document.getElementById('editPostImage')?.value.trim();
    const excerpt = document.getElementById('editPostExcerpt')?.value.trim();
    
    if (!id || !title || !image || !excerpt) {
        showStatus('Vui lòng nhập đầy đủ thông tin', 'error');
        return null;
    }
    
    const tagsText = document.getElementById('editPostTags')?.value.trim() || '';
    const tags = tagsText ? tagsText.split(',').map(t => t.trim()).filter(t => t) : [];
    
    return {
        id: id,
        data: {
            title: title,
            author: document.getElementById('editPostAuthor')?.value.trim() || 'LuxuryMove Team',
            date: document.getElementById('editPostDate')?.value,
            image: image,
            excerpt: excerpt,
            content: document.getElementById('editPostContent')?.value.trim() || '<p>Đang cập nhật nội dung...</p>',
            tags: tags
        }
    };
}

// ===== UTILITY FUNCTIONS =====
function safeJsonParse(str, defaultValue = []) {
    if (!str || typeof str !== 'string' || str.trim() === '') return defaultValue;
    
    try {
        const parsed = JSON.parse(str.trim());
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === 'object') return Object.values(parsed);
        return defaultValue;
    } catch (error) {
        console.error('JSON parse error:', error.message);
        return defaultValue;
    }
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

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    const tabElement = document.getElementById(`${tabName}Tab`);
    const tabButton = document.querySelector(`button[onclick*="showTab('${tabName}')"]`);
    
    if (!tabElement) return;
    
    tabElement.classList.add('active');
    if (tabButton) tabButton.classList.add('active');
    
    switch(tabName) {
        case 'services': renderServices(); break;
        case 'experiences': renderExperiences(); break;
        case 'gallery': renderGallery(); break;
        case 'blog': renderBlog(); break;
    }
}

function showStatus(message, type = 'success') {
    const statusBar = document.getElementById('statusBar');
    if (!statusBar) return;
    
    const statusIcon = document.getElementById('statusIcon');
    const statusMessage = document.getElementById('statusMessage');
    
    statusBar.className = `status-bar show ${type}`;
    statusIcon.className = `fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`;
    statusMessage.textContent = message;
    
    setTimeout(() => {
        statusBar.classList.remove('show');
    }, 4000);
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


