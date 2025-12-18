// admin.js - LuxuryMove Admin Panel
const DEFAULT_ADMIN_TOKEN = '123123';
let adminToken = DEFAULT_ADMIN_TOKEN;
let servicesData = {};


// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    loadGitHubConfig();
    
    // Tự động đăng nhập nếu đã ghi nhớ
    const savedAdminToken = localStorage.getItem('luxurymove_admin_token');
    if (savedAdminToken === adminToken) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('editorSection').style.display = 'block';
        loadServicesData();
    }
});



function logoutAdmin() {
    localStorage.removeItem('luxurymove_admin_token');
    window.location.reload();
}

function saveGitHubConfig() {
    const username = document.getElementById('githubUsername').value.trim();
    const repo = document.getElementById('githubRepo').value.trim();
    const branch = document.getElementById('githubBranch').value.trim();
    const token = document.getElementById('githubTokenModal').value.trim();
    
    if (!username || !repo || !branch) {
        showStatus('Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }
    
    githubConfig.username = username;
    githubConfig.repo = repo;
    githubConfig.branch = branch;
    
    if (token && token !== '••••••••••') {
        githubConfig.token = token;
    }
    
    localStorage.setItem('luxurymove_github_config', JSON.stringify(githubConfig));
    showStatus('Đã cập nhật cấu hình GitHub', 'success');
    closeGitHubModal();
    loadServicesData(); // Tải lại dữ liệu với cấu hình mới
}
// ===== UI HELPERS =====
function showStatus(message, type = 'info') {
    const statusBar = document.getElementById('statusBar');
    const statusMsg = document.getElementById('statusMessage');
    const statusIcon = document.getElementById('statusIcon');
    
    if (!statusBar) return;

    statusBar.className = `status-bar show ${type}`;
    statusMsg.textContent = message;
    
    if (type === 'success') statusIcon.className = 'fas fa-check-circle status-success';
    else if (type === 'error') statusIcon.className = 'fas fa-exclamation-circle status-error';
    else statusIcon.className = 'fas fa-info-circle status-warning';
    
    setTimeout(() => {
        statusBar.classList.remove('show');
    }, 4000);
}



function showGitHubManager() {
    loadGitHubConfig();
    document.getElementById('githubModal').style.display = 'flex';
}

function closeGitHubModal() {
    document.getElementById('githubModal').style.display = 'none';
}


function showStatusInModal(message, type = 'info') {
    const statusDiv = document.getElementById('githubStatus');
    
    // Get CSS variable value
    const root = document.documentElement;
    const champagneColor = getComputedStyle(root).getPropertyValue('--champagne').trim() || '#D4AF37';
    
    const color = type === 'success' ? '#00C851' : 
                  type === 'error' ? '#ff4444' : 
                  type === 'warning' ? '#ffbb33' : 
                  champagneColor;
    
    statusDiv.innerHTML = `<div style="color: ${color}; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px;">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    </div>`;
}



async function loadFromGitHub() {
    const path = 'data/services.json';
    // Thêm timestamp vào URL thay vì dùng Cache-Control header để tránh lỗi CORS
    const url = `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/${path}?ref=${githubConfig.branch}&t=${new Date().getTime()}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${githubConfig.token}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
        });

        if (response.ok) {
            const data = await response.json();
            showStatus('Đã đồng bộ từ GitHub', 'success');
            return data;
        } else if (response.status === 404) {
            showStatus('File dữ liệu chưa tồn tại trên GitHub', 'warning');
            return null;
        } else {
            const err = await response.json();
            throw new Error(err.message);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showStatus('Lỗi kết nối GitHub: ' + error.message, 'error');
        return null;
    }
}

// Updated saveToGitHub function
async function saveToGitHub() {
    if (!githubConfig.token || githubConfig.token === '••••••••••') {
        showStatus('Chưa cấu hình GitHub Token', 'warning');
        return;
    }
    
    showLoading(true);
    
    try {
        // Update timestamp
        servicesData.last_updated = new Date().toISOString();
        
        // First, try to get file SHA if exists
        let sha = '';
        try {
            const getResponse = await fetch(
                `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/data/services.json`,
                {
                    headers: {
                        'Authorization': `token ${githubConfig.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (getResponse.ok) {
                const fileInfo = await getResponse.json();
                sha = fileInfo.sha;
            }
        } catch (e) {
            // File doesn't exist yet
            console.log('File chưa tồn tại, sẽ tạo mới');
        }
        
        // Create or update the file
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(servicesData, null, 2))));
        
        const response = await fetch(
            `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/data/services.json`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `Update services data - ${new Date().toLocaleString('vi-VN')}`,
                    content: content,
                    branch: githubConfig.branch,
                    sha: sha || undefined
                })
            }
        );
        
        if (response.ok) {
            showStatus('✅ Đã lưu lên GitHub thành công!', 'success');
            
            // Also save to localStorage as backup
            localStorage.setItem('luxurymove_services', JSON.stringify(servicesData, null, 2));
            
        } else {
            const error = await response.json();
            throw new Error(error.message || `GitHub API error: ${response.status}`);
        }
        
    } catch (error) {
        console.error('Error saving to GitHub:', error);
        showStatus('❌ Lỗi lưu lên GitHub: ' + error.message, 'error');
        
        // Fallback to localStorage
        localStorage.setItem('luxurymove_services', JSON.stringify(servicesData, null, 2));
        showStatus('Đã lưu vào localStorage làm backup', 'warning');
    } finally {
        showLoading(false);
    }
}

function loginAdmin() {
    const inputToken = document.getElementById('adminToken').value;
    const githubTokenInput = document.getElementById('githubToken').value;
    
    // Kiểm tra token admin
    if (!inputToken) {
        showStatus('Vui lòng nhập token admin', 'error');
        return;
    }
    
    if (inputToken !== adminToken) {
        // Nếu token nhập không đúng, kiểm tra xem có phải token mới không
        const savedToken = localStorage.getItem('luxurymove_admin_token');
        if (inputToken !== savedToken) {
            showStatus('Token không đúng', 'error');
            return;
        }
        adminToken = inputToken;
    }
    
    // Lưu token admin nếu chưa có
    if (!localStorage.getItem('luxurymove_admin_token')) {
        localStorage.setItem('luxurymove_admin_token', adminToken);
    }
    
    // Lưu GitHub token nếu có
    if (githubTokenInput && githubTokenInput !== '••••••••••') {
        githubToken = githubTokenInput;
        localStorage.setItem('luxurymove_github_token', githubToken);
        document.getElementById('githubToken').value = '••••••••••';
    }
    
    // Hiển thị editor
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('editorSection').style.display = 'block';
    
    // Load dữ liệu
    loadServicesData();
    
    showStatus('Đăng nhập thành công', 'success');
}


// Biến toàn cục
let currentEditingId = null;
let githubToken = '';
// admin.js - FIXED LOGIC
let githubConfig = {
    username: 'Datkep92',
    repo: 'hoangtung',
    branch: 'main',
    token: ''
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    loadGitHubConfig();
    
    const savedAdminToken = localStorage.getItem('luxurymove_admin_token');
    const statusLabel = document.getElementById('savedTokenStatus');

    if (savedAdminToken) {
        adminToken = savedAdminToken;
        if(statusLabel) {
            statusLabel.textContent = 'Đã ghi nhớ';
            statusLabel.style.color = '#00C851';
        }
        // Tự động vào bảng điều khiển nếu đã lưu mã truy cập
        handleLogin(true);
    }
});

function handleLogin(isAuto = false) {
    const inputPass = document.getElementById('adminToken').value;
    const inputGit = document.getElementById('githubToken').value;
    const remember = document.getElementById('rememberMe').checked;
    const savedPass = localStorage.getItem('luxurymove_admin_token') || DEFAULT_ADMIN_TOKEN;

    if (isAuto || inputPass === savedPass) {
        if (remember) {
            localStorage.setItem('luxurymove_admin_token', savedPass);
        }
        
        // Cập nhật token GitHub nếu người dùng nhập ở màn hình login
        if (inputGit && inputGit !== '••••••••••') {
            githubConfig.token = inputGit;
            localStorage.setItem('luxurymove_github_config', JSON.stringify(githubConfig));
        }

        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('editorSection').style.display = 'block';
        // Load all data
        loadAllData(); // Replace loadServicesData() with this
        
        showStatus('Đã kết nối hệ thống', 'success');
        // GỌI CẢ HAI HÀM ĐỂ LOAD DỮ LIỆU
        loadServicesData();
        loadExperiencesData(); // THÊM DÒNG NÀY
        
        showStatus('Đã kết nối hệ thống', 'success');
    } else {
        showStatus('Mã truy cập không đúng', 'error');
    }
}

async function testGitHubConnection() {
    const token = document.getElementById('githubTokenModal').value;
    const user = document.getElementById('githubUsername').value;
    const repo = document.getElementById('githubRepo').value;
    
    const finalToken = (token === '••••••••••') ? githubConfig.token : token;
    
    showLoading(true);
    try {
        // Fix lỗi 404: Đảm bảo URL đúng cấu trúc https://api.github.com/repos/USER/REPO
        const response = await fetch(`https://api.github.com/repos/${user}/${repo}`, {
            headers: { 'Authorization': `token ${finalToken}` }
        });

        if (response.ok) {
            showStatus('Kết nối GitHub thành công!', 'success');
            document.getElementById('githubStatus').innerHTML = '<span style="color: #00C851;">✅ Thông tin Repo hợp lệ</span>';
        } else {
            throw new Error('Không tìm thấy Repo hoặc Token sai');
        }
    } catch (error) {
        showStatus(error.message, 'error');
        document.getElementById('githubStatus').innerHTML = '<span style="color: #ff4444;">❌ Lỗi: ' + error.message + '</span>';
    } finally {
        showLoading(false);
    }
}

// ===== CONFIG MANAGEMENT =====
function loadGitHubConfig() {
    const saved = localStorage.getItem('luxurymove_github_config');
    if (saved) {
        githubConfig = JSON.parse(saved);
        // Cập nhật giá trị vào modal nếu modal đang mở
        if(document.getElementById('githubUsername')) {
            document.getElementById('githubUsername').value = githubConfig.username;
            document.getElementById('githubRepo').value = githubConfig.repo;
            document.getElementById('githubBranch').value = githubConfig.branch;
            document.getElementById('githubTokenModal').value = githubConfig.token ? '••••••••••' : '';
        }
    }
}

// ===== TOKEN MANAGEMENT =====
function showTokenManager() {
    document.getElementById('tokenModal').style.display = 'flex';
    document.getElementById('currentTokenDisplay').value = 
        localStorage.getItem('luxurymove_admin_token') || 'Chưa có token';
}

function closeTokenModal() {
    document.getElementById('tokenModal').style.display = 'none';
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
    
    // Lưu token mới
    localStorage.setItem('luxurymove_admin_token', newToken);
    adminToken = newToken;
    
    showStatus('Đã cập nhật token thành công', 'success');
    closeTokenModal();
    
    // Cập nhật hiển thị
    document.getElementById('savedTokenStatus').textContent = 'Đã lưu';
    document.getElementById('savedTokenStatus').style.color = '#00C851';
}



async function loadServicesData() {
    await ensureImagesFolder();
    showLoading(true);
    try {
        loadGitHubConfig();
        let data = null;

        // Ưu tiên tải từ GitHub
        if (githubConfig.token && githubConfig.token.trim() !== '') {
            data = await loadFromGitHub();
        }

        // Nếu GitHub chưa có hoặc lỗi, dùng LocalStorage
        if (!data) {
            const localData = localStorage.getItem('luxurymove_services');
            if (localData) {
                data = JSON.parse(localData);
                showStatus('Đã tải dữ liệu từ bộ nhớ tạm', 'warning');
            }
        }

        if (data) {
            servicesData = data;
            renderServicesList();
        } else {
            showStatus('Vui lòng cấu hình GitHub để tải dữ liệu', 'info');
        }
        
        // THÊM: Load experiences data
        await loadExperiencesData(); // DÒNG NÀY RẤT QUAN TRỌNG
        
    } catch (error) {
        console.error('Error loading data:', error);
        showStatus('Lỗi tải dữ liệu: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function updateWebsiteData() {
    // This function would be called from the main website to load the updated data
    // For now, we just log it
    console.log('Data updated:', servicesData);
    
    // You can also trigger a webhook or other mechanism to update the live site
    showStatus('Dữ liệu đã sẵn sàng để cập nhật website', 'success');
}

// ===== RENDER FUNCTIONS =====
function renderServicesList() {
    const container = document.getElementById('servicesList');
    const services = servicesData.services || {};
    
    if (Object.keys(services).length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-tertiary);">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3>Chưa có dịch vụ nào</h3>
                <p>Nhấn "Thêm dịch vụ mới" để bắt đầu</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    Object.entries(services).forEach(([id, service]) => {
        const firstImage = service.images && service.images.length > 0 ? service.images[0] : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600';
        
        html += `
            <div class="service-item" onclick="editService('${id}')">
                <div class="service-item-header">
                    <h3 class="service-item-title">${service.title || 'Chưa có tiêu đề'}</h3>
                    <div class="service-item-actions">
                        <button class="action-btn" onclick="editService('${id}'); event.stopPropagation();">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="deleteService('${id}'); event.stopPropagation();" style="background: rgba(255, 68, 68, 0.2);">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="service-item-image">
                    <img src="${firstImage}" alt="${service.title}">
                </div>
                <p class="service-item-desc">${service.description || 'Chưa có mô tả'}</p>
                <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 12px; color: var(--text-tertiary);">
                    <span><i class="fas fa-image"></i> ${service.images ? service.images.length : 0} ảnh</span>
                    <span><i class="fas fa-tag"></i> ${service.pricing ? service.pricing.length : 0} bảng giá</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== SERVICE EDITOR =====
function addNewService() {
    currentEditingId = null;
    
    // Reset form
    document.getElementById('serviceId').value = '';
    document.getElementById('serviceTitle').value = '';
    document.getElementById('serviceSubtitle').value = '';
    document.getElementById('serviceDescription').value = '';
    document.getElementById('imagesList').innerHTML = '';
    document.getElementById('featuresList').innerHTML = '';
    document.getElementById('pricingList').innerHTML = '';
    
    // Show editor
    document.getElementById('editorTitle').textContent = 'Thêm dịch vụ mới';
    document.getElementById('serviceEditor').style.display = 'block';
    document.getElementById('deleteBtn').style.display = 'none';
    
    // Add default feature
    addFeatureItem('Đón tận cửa, hỗ trợ hành lý');
    addFeatureItem('Xe đời mới, nội thất cao cấp');
    addFeatureItem('Tài xế mặc vest, chuyên nghiệp');
    
    // Scroll to editor
    document.getElementById('serviceEditor').scrollIntoView({ behavior: 'smooth' });
}

function editService(serviceId) {
    currentEditingId = serviceId;
    const service = servicesData.services[serviceId];
    
    if (!service) {
        showStatus('Không tìm thấy dịch vụ', 'error');
        return;
    }
    
    // Fill form
    document.getElementById('serviceId').value = serviceId;
    document.getElementById('serviceTitle').value = service.title || '';
    document.getElementById('serviceSubtitle').value = service.subtitle || '';
    document.getElementById('serviceDescription').value = service.description || '';
    
    // Render images
    const imagesList = document.getElementById('imagesList');
    imagesList.innerHTML = '';
    if (service.images && Array.isArray(service.images)) {
        service.images.forEach((img, index) => {
            addImageItem(img, index);
        });
    }
    
    // Render features
    const featuresList = document.getElementById('featuresList');
    featuresList.innerHTML = '';
    if (service.features && Array.isArray(service.features)) {
        service.features.forEach((feature, index) => {
            addFeatureItem(feature, index);
        });
    }
    
    // Render pricing
    const pricingList = document.getElementById('pricingList');
    pricingList.innerHTML = '';
    if (service.pricing && Array.isArray(service.pricing)) {
        service.pricing.forEach((price, index) => {
            addPriceItem(price, index);
        });
    }
    
    // Show editor
    document.getElementById('editorTitle').textContent = `Chỉnh sửa: ${service.title}`;
    document.getElementById('serviceEditor').style.display = 'block';
    document.getElementById('deleteBtn').style.display = 'block';
    
    // Scroll to editor
    document.getElementById('serviceEditor').scrollIntoView({ behavior: 'smooth' });
}

function closeEditor() {
    document.getElementById('serviceEditor').style.display = 'none';
    currentEditingId = null;
}
// Hàm lưu dịch vụ - GỌI LẠI saveAllServices()
function saveService() {
    const serviceId = document.getElementById('serviceId').value.trim();
    const title = document.getElementById('serviceTitle').value.trim();
    
    if (!serviceId || !title) {
        showStatus('Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }
    
    // Collect data
    const images = [];
    document.querySelectorAll('#imagesList .image-item img').forEach(img => {
        images.push(img.src);
    });
    
    const features = [];
    document.querySelectorAll('#featuresList .feature-item input').forEach(input => {
        if (input.value.trim()) features.push(input.value.trim());
    });
    
    const pricing = [];
    document.querySelectorAll('#pricingList .pricing-item').forEach(item => {
        const label = item.querySelector('input:nth-child(1)').value.trim();
        const price = item.querySelector('input:nth-child(2)').value.trim();
        if (label && price) pricing.push({ label, price });
    });
    
    // Save to local data
    if (!servicesData.services) servicesData.services = {};
    servicesData.services[serviceId] = {
        title: title,
        subtitle: document.getElementById('serviceSubtitle').value.trim() || title,
        images: images,
        description: document.getElementById('serviceDescription').value.trim() || 'Đang cập nhật...',
        features: features.length > 0 ? features : ['Chất lượng cao cấp', 'Đúng giờ 100%', 'Tài xế chuyên nghiệp'],
        pricing: pricing
    };
    
    servicesData.last_updated = new Date().toISOString();
    
    // Update UI
    renderServicesList();
    
    // GỌI HÀM ĐÃ CÓ ĐỂ LƯU TẤT CẢ
    saveAllServices();
    
    closeEditor();
}

function deleteService(serviceId) {
    if (!serviceId && currentEditingId) {
        serviceId = currentEditingId;
    }
    
    if (!serviceId || !confirm(`Xóa dịch vụ "${serviceId}"?`)) {
        return;
    }
    
    if (servicesData.services && servicesData.services[serviceId]) {
        delete servicesData.services[serviceId];
        servicesData.last_updated = new Date().toISOString();
        
        // Update UI
        renderServicesList();
        closeEditor();
        
        // GỌI HÀM ĐÃ CÓ ĐỂ LƯU TẤT CẢ
        saveAllServices();
        
        showStatus(`✅ Đã xóa: ${serviceId}`, 'success');
    }
}

// Hàm xóa dịch vụ khỏi GitHub
async function deleteFromGitHub(data) {
    if (!githubConfig.token || githubConfig.token === '••••••••••') {
        throw new Error('Chưa cấu hình GitHub Token');
    }
    
    // 1. Lấy SHA của file hiện tại
    const getResponse = await fetch(
        `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/data/services.json`,
        {
            headers: {
                'Authorization': `token ${githubConfig.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        }
    );
    
    if (!getResponse.ok) {
        throw new Error('Không thể lấy thông tin file từ GitHub');
    }
    
    const fileInfo = await getResponse.json();
    const sha = fileInfo.sha;
    
    // 2. Encode nội dung mới
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    
    // 3. Cập nhật file lên GitHub
    const putResponse = await fetch(
        `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/data/services.json`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubConfig.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Xóa dịch vụ - ${new Date().toLocaleString('vi-VN')}`,
                content: content,
                branch: githubConfig.branch,
                sha: sha
            })
        }
    );
    
    if (!putResponse.ok) {
        const error = await putResponse.json();
        throw new Error(error.message || 'Lỗi khi cập nhật GitHub');
    }
    
    return true;
}
async function ensureImagesFolder() {
    if (!githubConfig.token) return;
    
    try {
        // Kiểm tra thư mục images có tồn tại không
        const response = await fetch(
            `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/images`,
            {
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (response.status === 404) {
            // Tạo thư mục images với README
            await fetch(
                `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/images/README.md`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${githubConfig.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: 'Create images folder',
                        content: btoa('# Images Folder\n\nThis folder contains uploaded images for LuxuryMove services.'),
                        branch: githubConfig.branch
                    })
                }
            );
            console.log('✅ Created images folder');
        }
    } catch (error) {
        console.log('Images folder check:', error.message);
    }
}


// Thêm nút "Xóa khỏi GitHub" riêng
function addGitHubDeleteButton() {
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) {
        // Thêm nút xóa khỏi GitHub bên cạnh
        deleteBtn.insertAdjacentHTML('afterend', `
            <button class="btn btn-danger" onclick="forceDeleteFromGitHub()" id="githubDeleteBtn" style="display: none; margin-left: 10px;">
                <i class="fab fa-github"></i> Xóa khỏi GitHub
            </button>
        `);
    }
}

// Force delete từ GitHub
async function forceDeleteFromGitHub() {
    const serviceId = document.getElementById('serviceId').value;
    if (!serviceId) return;
    
    if (!confirm(`⚠️ CẢNH BÁO!\n\nBạn sắp xóa vĩnh viễn dịch vụ "${serviceId}" khỏi GitHub.\nHành động này KHÔNG THỂ HOÀN TÁC!\n\nTiếp tục?`)) {
        return;
    }
    
    showLoading(true);
    try {
        // Xóa khỏi dữ liệu
        if (servicesData.services[serviceId]) {
            delete servicesData.services[serviceId];
            servicesData.last_updated = new Date().toISOString();
            
            // Cập nhật lên GitHub
            await deleteFromGitHub(servicesData);
            
            // Xóa khỏi LocalStorage
            localStorage.setItem('luxurymove_services', JSON.stringify(servicesData, null, 2));
            
            showStatus(`✅ Đã xóa vĩnh viễn "${serviceId}" khỏi GitHub`, 'success');
            renderServicesList();
            closeEditor();
        }
    } catch (error) {
        showStatus(`❌ Lỗi: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// ===== IMAGE MANAGEMENT =====
function addImageFromUrl() {
    const url = document.getElementById('imageUrl').value.trim();
    
    if (!url) {
        showStatus('Vui lòng nhập URL ảnh', 'error');
        return;
    }
    
    // Validate URL
    try {
        new URL(url);
    } catch (e) {
        showStatus('URL không hợp lệ', 'error');
        return;
    }
    
    addImageItem(url);
    document.getElementById('imageUrl').value = '';
    showStatus('Đã thêm ảnh', 'success');
}

function addImageItem(url, index = null) {
    const imagesList = document.getElementById('imagesList');
    const itemIndex = index !== null ? index : imagesList.children.length;
    
    const div = document.createElement('div');
    div.className = 'image-item';
    div.innerHTML = `
        <img src="${url}" alt="Service image ${itemIndex + 1}">
        <button class="image-item-remove" onclick="removeImage(${itemIndex})">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    if (index !== null) {
        // Replace existing
        if (imagesList.children[index]) {
            imagesList.replaceChild(div, imagesList.children[index]);
        } else {
            imagesList.appendChild(div);
        }
    } else {
        imagesList.appendChild(div);
    }
}


// ===== GITHUB IMAGE UPLOAD =====
async function uploadImageToGitHub(file) {
    if (!githubConfig.token || githubConfig.token === '••••••••••') {
        showStatus('⚠️ Chưa có GitHub Token', 'error');
        return null;
    }
    
    showLoading(true);
    
    try {
        // Tạo tên file unique
        const timestamp = Date.now();
        const fileName = `image_${timestamp}_${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`;
        const path = `images/${fileName}`;
        
        // Convert file to base64
        const base64 = await fileToBase64(file);
        
        // Upload to GitHub
        const response = await fetch(
            `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/${path}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `Upload image: ${fileName}`,
                    content: base64.split(',')[1], // Remove data:image/... prefix
                    branch: githubConfig.branch
                })
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            // Lấy raw URL
            const rawUrl = data.content.download_url;
            showStatus(`✅ Đã upload ảnh lên GitHub`, 'success');
            return rawUrl;
        } else {
            const error = await response.json();
            throw new Error(error.message);
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        showStatus(`❌ Lỗi upload: ${error.message}`, 'error');
        return null;
    } finally {
        showLoading(false);
    }
}

// Helper: Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
async function deleteImageFromGitHub(imageUrl) {
    if (!githubConfig.token || !imageUrl.includes('github.com')) {
        return; // Không phải GitHub URL
    }
    
    try {
        // Extract path từ URL
        // https://raw.githubusercontent.com/username/repo/branch/images/filename.jpg
        const urlParts = imageUrl.split('/');
        const branchIndex = urlParts.indexOf(githubConfig.branch);
        const path = urlParts.slice(branchIndex + 1).join('/');
        
        // Lấy SHA của file
        const getResponse = await fetch(
            `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/${path}`,
            {
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (getResponse.ok) {
            const fileInfo = await getResponse.json();
            const sha = fileInfo.sha;
            
            // Xóa file
            await fetch(
                `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/${path}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `token ${githubConfig.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Delete image: ${path.split('/').pop()}`,
                        sha: sha,
                        branch: githubConfig.branch
                    })
                }
            );
            
            console.log(`✅ Deleted image: ${path}`);
        }
    } catch (error) {
        console.error('Delete image error:', error);
    }
}

// Sửa hàm removeImage
function removeImage(index) {
    const imagesList = document.getElementById('imagesList');
    if (imagesList.children[index]) {
        const img = imagesList.children[index].querySelector('img');
        if (img && img.src.includes('github.com')) {
            // Xóa trên GitHub
            deleteImageFromGitHub(img.src);
        }
        
        imagesList.removeChild(imagesList.children[index]);
        
        // Re-index
        Array.from(imagesList.children).forEach((item, i) => {
            const btn = item.querySelector('.image-item-remove');
            btn.onclick = () => removeImage(i);
        });
    }
}
async function handleImageUpload(event) {
    const file = event.target.files[0];
    const uploadArea = document.querySelector('.image-upload-area');
    const progressDiv = document.getElementById('uploadProgress');
    
    if (!file) return;
    
    // Validate
    if (!file.type.match('image.*')) {
        showStatus('Vui lòng chọn file ảnh', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showStatus('File quá lớn (tối đa 5MB)', 'error');
        return;
    }
    
    // Hiển thị progress
    uploadArea.classList.add('uploading');
    progressDiv.classList.remove('hidden');
    
    try {
        // Upload to GitHub
        const imageUrl = await uploadImageToGitHub(file);
        
        if (imageUrl) {
            addImageItem(imageUrl);
            showStatus(`✅ Đã upload: ${file.name}`, 'success');
        }
        
    } catch (error) {
        showStatus(`❌ Upload thất bại: ${error.message}`, 'error');
    } finally {
        // Ẩn progress
        uploadArea.classList.remove('uploading');
        progressDiv.classList.add('hidden');
        event.target.value = '';
    }
}


// ===== FEATURES MANAGEMENT =====
function addFeature() {
    const input = document.getElementById('featureInput');
    const value = input.value.trim();
    
    if (!value) {
        showStatus('Vui lòng nhập tính năng', 'error');
        return;
    }
    
    addFeatureItem(value);
    input.value = '';
    showStatus('Đã thêm tính năng', 'success');
}

function addFeatureItem(feature, index = null) {
    const featuresList = document.getElementById('featuresList');
    const itemIndex = index !== null ? index : featuresList.children.length;
    
    const div = document.createElement('div');
    div.className = 'feature-item';
    div.innerHTML = `
        <input type="text" class="form-input" value="${feature.replace(/"/g, '&quot;')}" placeholder="Tính năng...">
        <button class="action-btn" onclick="removeFeature(${itemIndex})">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    if (index !== null) {
        if (featuresList.children[index]) {
            featuresList.replaceChild(div, featuresList.children[index]);
        } else {
            featuresList.appendChild(div);
        }
    } else {
        featuresList.appendChild(div);
    }
}

function removeFeature(index) {
    const featuresList = document.getElementById('featuresList');
    if (featuresList.children[index]) {
        featuresList.removeChild(featuresList.children[index]);
        
        // Re-index
        Array.from(featuresList.children).forEach((item, i) => {
            const btn = item.querySelector('button');
            btn.onclick = () => removeFeature(i);
        });
    }
}

// ===== PRICING MANAGEMENT =====
function addPrice() {
    const label = document.getElementById('priceLabel').value.trim();
    const value = document.getElementById('priceValue').value.trim();
    
    if (!label || !value) {
        showStatus('Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }
    
    addPriceItem({ label, price: value });
    
    document.getElementById('priceLabel').value = '';
    document.getElementById('priceValue').value = '';
    
    showStatus('Đã thêm bảng giá', 'success');
}

function addPriceItem(price, index = null) {
    const pricingList = document.getElementById('pricingList');
    const itemIndex = index !== null ? index : pricingList.children.length;
    
    const div = document.createElement('div');
    div.className = 'pricing-item';
    div.innerHTML = `
        <input type="text" class="form-input" value="${price.label.replace(/"/g, '&quot;')}" placeholder="Tên gói">
        <input type="text" class="form-input" value="${price.price.replace(/"/g, '&quot;')}" placeholder="Giá">
        <button class="action-btn" onclick="removePrice(${itemIndex})">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    if (index !== null) {
        if (pricingList.children[index]) {
            pricingList.replaceChild(div, pricingList.children[index]);
        } else {
            pricingList.appendChild(div);
        }
    } else {
        pricingList.appendChild(div);
    }
}

function removePrice(index) {
    const pricingList = document.getElementById('pricingList');
    if (pricingList.children[index]) {
        pricingList.removeChild(pricingList.children[index]);
        
        // Re-index
        Array.from(pricingList.children).forEach((item, i) => {
            const btn = item.querySelector('button');
            btn.onclick = () => removePrice(i);
        });
    }
}


function showLoading(isLoading) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.toggle('show', isLoading);
    }
}

// ===== EXPORT/IMPORT =====
function exportData() {
    const dataStr = JSON.stringify(servicesData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `luxurymove-services-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showStatus('Đã xuất dữ liệu', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate data structure
            if (importedData.services && typeof importedData.services === 'object') {
                servicesData = importedData;
                localStorage.setItem('luxurymove_services', JSON.stringify(servicesData, null, 2));
                renderServicesList();
                showStatus('Đã nhập dữ liệu thành công', 'success');
            } else {
                showStatus('File không đúng định dạng', 'error');
            }
        } catch (error) {
            showStatus('Lỗi đọc file: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
}

// ===== EXPERIENCE MANAGEMENT =====
let experiencesData = { experiences: {} };
let currentEditingExperienceId = null;



// Load experiences data
async function loadExperiencesData() {
    try {
        // Thử tải từ GitHub trước
        if (githubConfig.token && githubConfig.token !== '••••••••••') {
            const data = await loadExperiencesFromGitHub();
            if (data) {
                experiencesData = data;
                showStatus('Đã tải trải nghiệm từ GitHub', 'success');
                renderExperiencesList();
                return;
            }
        }
        
        // Thử từ localStorage
        const localData = localStorage.getItem('luxurymove_experiences');
        if (localData) {
            experiencesData = JSON.parse(localData);
            showStatus('Đã tải trải nghiệm từ localStorage', 'warning');
            renderExperiencesList();
            return;
        }
        
        // Dùng dữ liệu mặc định
        experiencesData = { experiences: getDefaultExperiences() };
        renderExperiencesList();
        showStatus('Dùng dữ liệu trải nghiệm mặc định', 'warning');
        
    } catch (error) {
        console.error('Error loading experiences:', error);
        showStatus('Lỗi tải trải nghiệm: ' + error.message, 'error');
    }
}

// Get default experiences (giống với dữ liệu trong index.html)
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
        },
        'business': {
            title: 'Cho Công Việc',
            image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=500',
            description: 'Chuyên nghiệp cho mọi chuyến công tác',
            benefits: [
                'Đúng giờ tuyệt đối',
                'WiFi miễn phí làm việc trên đường',
                'Hóa đơn VAT đầy đủ'
            ]
        },
        'tourist': {
            title: 'Cho Du Khách',
            image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8df0?auto=format&fit=crop&w=500',
            description: 'Khám phá vùng đất mới cùng người dẫn đường',
            benefits: [
                'Tài xế am hiểu địa phương',
                'Gợi ý điểm đến & ẩm thực',
                'Hỗ trợ đa ngôn ngữ'
            ]
        }
    };
}

// Render experiences list
function renderExperiencesList() {
    const container = document.getElementById('experienceList');
    const experiences = experiencesData.experiences || {};
    
    if (Object.keys(experiences).length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-tertiary);">
                <i class="fas fa-users" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3>Chưa có trải nghiệm nào</h3>
                <p>Nhấn "Thêm trải nghiệm mới" để bắt đầu</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    Object.entries(experiences).forEach(([id, experience]) => {
        html += `
            <div class="experience-card" onclick="editExperience('${id}')">
                <div class="experience-header">
                    <div class="experience-image">
                        <img src="${experience.image}" alt="${experience.title}">
                    </div>
                    <div class="experience-content">
                        <h3 class="experience-name">${experience.title}</h3>
                        <p class="experience-desc">${experience.description || 'Chưa có mô tả'}</p>
                    </div>
                    <div class="service-item-actions">
                        <button class="action-btn" onclick="editExperience('${id}'); event.stopPropagation();">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="deleteExperienceConfirm('${id}'); event.stopPropagation();" style="background: rgba(255, 68, 68, 0.2);">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="experience-benefits">
                    ${(experience.benefits || []).slice(0, 3).map(benefit => `
                        <span class="benefit-tag">${benefit}</span>
                    `).join('')}
                    ${(experience.benefits || []).length > 3 ? `<span class="benefit-tag">+${(experience.benefits || []).length - 3} khác</span>` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Add new experience
function addNewExperience() {
    currentEditingExperienceId = null;
    
    // Reset form
    document.getElementById('experienceId').value = '';
    document.getElementById('experienceTitle').value = '';
    document.getElementById('experienceImage').value = '';
    document.getElementById('experienceDescription').value = '';
    document.getElementById('benefitsList').innerHTML = '';
    
    // Add default benefits
    addBenefitItem('Lợi ích 1');
    addBenefitItem('Lợi ích 2');
    addBenefitItem('Lợi ích 3');
    
    // Show editor
    document.getElementById('experienceEditorTitle').textContent = 'Thêm trải nghiệm mới';
    document.getElementById('experienceEditor').style.display = 'block';
    document.getElementById('deleteExperienceBtn').style.display = 'none';
    
    // Scroll to editor
    document.getElementById('experienceEditor').scrollIntoView({ behavior: 'smooth' });
}

// Edit experience
function editExperience(experienceId) {
    currentEditingExperienceId = experienceId;
    const experience = experiencesData.experiences[experienceId];
    
    if (!experience) {
        showStatus('Không tìm thấy trải nghiệm', 'error');
        return;
    }
    
    // Fill form
    document.getElementById('experienceId').value = experienceId;
    document.getElementById('experienceTitle').value = experience.title || '';
    document.getElementById('experienceImage').value = experience.image || '';
    document.getElementById('experienceDescription').value = experience.description || '';
    
    // Render benefits
    const benefitsList = document.getElementById('benefitsList');
    benefitsList.innerHTML = '';
    if (experience.benefits && Array.isArray(experience.benefits)) {
        experience.benefits.forEach((benefit, index) => {
            addBenefitItem(benefit, index);
        });
    }
    
    // Show editor
    document.getElementById('experienceEditorTitle').textContent = `Chỉnh sửa: ${experience.title}`;
    document.getElementById('experienceEditor').style.display = 'block';
    document.getElementById('deleteExperienceBtn').style.display = 'block';
    
    // Scroll to editor
    document.getElementById('experienceEditor').scrollIntoView({ behavior: 'smooth' });
}

// Close experience editor
function closeExperienceEditor() {
    document.getElementById('experienceEditor').style.display = 'none';
    currentEditingExperienceId = null;
}
// Hàm sync từng loại data riêng biệt
async function syncSingleToGitHub(type, data) {
    if (!githubConfig.token || githubConfig.token === '••••••••••') {
        console.log('ℹ️ Không có token, bỏ qua sync');
        return false;
    }
    
    const filenames = {
        'services': 'data/services.json',
        'experiences': 'data/experiences.json',
        'blog': 'data/blog.json'
    };
    
    const filename = filenames[type];
    if (!filename) {
        console.error('❌ Loại data không hợp lệ:', type);
        return false;
    }
    
    console.log(`🔄 Bắt đầu sync ${type} lên GitHub...`);
    
    try {
        // 1. Lấy SHA hiện tại từ GitHub
        let sha = '';
        try {
            const getRes = await fetch(
                `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/${filename}`,
                {
                    headers: { 'Authorization': `token ${githubConfig.token}` },
                    signal: AbortSignal.timeout(5000) // Timeout 5s
                }
            );
            
            if (getRes.ok) {
                const fileInfo = await getRes.json();
                sha = fileInfo.sha;
                console.log(`📄 Lấy được SHA: ${sha.substring(0, 8)}...`);
            } else if (getRes.status === 404) {
                console.log(`📝 File ${filename} chưa tồn tại, sẽ tạo mới`);
            } else {
                console.warn(`⚠️ Lỗi khi lấy file: ${getRes.status}`);
                return false;
            }
        } catch (error) {
            console.warn(`⚠️ Không thể kết nối đến GitHub:`, error.message);
            return false;
        }
        
        // 2. Chuẩn bị nội dung
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
        
        // 3. Upload lên GitHub
        const putRes = await fetch(
            `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/${filename}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update ${type} - ${new Date().toLocaleString('vi-VN')}`,
                    content: content,
                    sha: sha || undefined,
                    branch: githubConfig.branch
                }),
                signal: AbortSignal.timeout(10000) // Timeout 10s
            }
        );
        
        if (putRes.ok) {
            console.log(`✅ Đã sync ${type} thành công`);
            showBackgroundStatus(`✅ ${type} đã đồng bộ`, 'success');
            return true;
        } else {
            const errorData = await putRes.json();
            console.error(`❌ Lỗi sync ${type}:`, errorData.message);
            
            // Xử lý lỗi 409 (Conflict)
            if (putRes.status === 409) {
                console.log('🔄 Phát hiện conflict, thử lại với SHA mới...');
                // Có thể thêm retry logic ở đây
            }
            
            showBackgroundStatus(`❌ Lỗi sync ${type}`, 'error');
            return false;
        }
        
    } catch (error) {
        console.error(`💥 Lỗi nghiêm trọng khi sync ${type}:`, error);
        return false;
    }
}
function saveExperience() {
    showLoading(true, 'Đang lưu trải nghiệm...');
    
    // 1. Lấy dữ liệu từ form
    const expId = document.getElementById('experienceId').value.trim();
    const title = document.getElementById('experienceTitle').value.trim();
    
    if (!expId || !title) {
        showStatus('Vui lòng nhập ID và tiêu đề', 'error');
        showLoading(false);
        return;
    }
    
    // 2. Thu thập benefits
    const benefits = [];
    document.querySelectorAll('#benefitsList .benefit-item input').forEach(input => {
        if (input.value.trim()) benefits.push(input.value.trim());
    });
    
    // 3. Tạo object data
    const expData = {
        title: title,
        image: document.getElementById('experienceImage').value.trim(),
        description: document.getElementById('experienceDescription').value.trim() || title,
        benefits: benefits.length > 0 ? benefits : ['Lợi ích 1', 'Lợi ích 2']
    };
    
    // 4. LƯU VÀO LOCALSTORAGE NGAY
    if (!experiencesData.experiences) experiencesData.experiences = {};
    experiencesData.experiences[expId] = expData;
    experiencesData.last_updated = new Date().toISOString();
    
    localStorage.setItem('luxurymove_experiences', JSON.stringify(experiencesData));
    
    // 5. CẬP NHẬT UI NGAY
    renderExperiencesList();
    showStatus(`✅ Đã lưu "${title}"`, 'success');
    
    // 6. SYNC LÊN GITHUB RIÊNG LẺ (KHÔNG gọi saveAllData)
    syncSingleToGitHub('experiences', experiencesData);
    
    showLoading(false);
    closeExperienceEditor();
}
// Delete experience confirmation
function deleteExperienceConfirm(experienceId) {
    if (confirm(`Bạn có chắc muốn xóa trải nghiệm "${experienceId}"?`)) {
        deleteExperience(experienceId);
    }
}

// Delete experience
function deleteExperience(experienceId = null) {
    if (!experienceId && currentEditingExperienceId) {
        experienceId = currentEditingExperienceId;
    }
    
    if (!experienceId) return;
    
    if (experiencesData.experiences && experiencesData.experiences[experienceId]) {
        delete experiencesData.experiences[experienceId];
        
        // Update storage
        localStorage.setItem('luxurymove_experiences', JSON.stringify(experiencesData, null, 2));
        
        // Update UI
        renderExperiencesList();
        closeExperienceEditor();
        
        showStatus(`Đã xóa trải nghiệm: ${experienceId}`, 'success');
    }
}

// Preview experience image
function previewExperienceImage() {
    const imageUrl = document.getElementById('experienceImage').value.trim();
    if (!imageUrl) {
        showStatus('Vui lòng nhập URL ảnh', 'error');
        return;
    }
    
    // Tạo preview nếu chưa có
    let previewContainer = document.getElementById('imagePreviewContainer');
    if (!previewContainer) {
        previewContainer = document.createElement('div');
        previewContainer.id = 'imagePreviewContainer';
        previewContainer.className = 'image-preview-container';
        previewContainer.innerHTML = `
            <div class="image-preview">
                <img src="" alt="Preview" id="imagePreview">
            </div>
            <small style="color: var(--text-tertiary);">Preview - Ảnh này sẽ hiển thị trên website</small>
        `;
        
        const imageInput = document.getElementById('experienceImage');
        imageInput.parentNode.insertBefore(previewContainer, imageInput.nextSibling);
    }
    
    // Cập nhật ảnh preview
    document.getElementById('imagePreview').src = imageUrl;
    showStatus('Đã cập nhật preview ảnh', 'success');
}

// Benefit management functions
function addBenefit() {
    const input = document.getElementById('benefitInput');
    const value = input.value.trim();
    
    if (!value) {
        showStatus('Vui lòng nhập lợi ích', 'error');
        return;
    }
    
    addBenefitItem(value);
    input.value = '';
    showStatus('Đã thêm lợi ích', 'success');
}

function addBenefitItem(benefit, index = null) {
    const benefitsList = document.getElementById('benefitsList');
    const itemIndex = index !== null ? index : benefitsList.children.length;
    
    const div = document.createElement('div');
    div.className = 'feature-item benefit-item';
    div.innerHTML = `
        <input type="text" class="form-input" value="${benefit.replace(/"/g, '&quot;')}" placeholder="Lợi ích...">
        <button class="action-btn" onclick="removeBenefit(${itemIndex})">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    if (index !== null) {
        if (benefitsList.children[index]) {
            benefitsList.replaceChild(div, benefitsList.children[index]);
        } else {
            benefitsList.appendChild(div);
        }
    } else {
        benefitsList.appendChild(div);
    }
}

function removeBenefit(index) {
    const benefitsList = document.getElementById('benefitsList');
    if (benefitsList.children[index]) {
        benefitsList.removeChild(benefitsList.children[index]);
        
        // Re-index
        Array.from(benefitsList.children).forEach((item, i) => {
            const btn = item.querySelector('button');
            btn.onclick = () => removeBenefit(i);
        });
    }
}

// Load experiences from GitHub
async function loadExperiencesFromGitHub() {
    if (!githubConfig.token || githubConfig.token === '••••••••••') {
        return null;
    }
    
    try {
        const response = await fetch(
            `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/data/experiences.json`,
            {
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3.raw'
                }
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            return data;
        } else if (response.status === 404) {
            console.log('File experiences.json chưa tồn tại trên GitHub');
            return null;
        } else {
            console.error('GitHub API error:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error loading experiences from GitHub:', error);
        return null;
    }
}

function showTab(tabName) {
    // Ẩn tất cả các tab
    const tabs = ['services', 'experiences', 'blog', 'settings'];
    tabs.forEach(tab => {
        document.getElementById(`${tab}Tab`).style.display = 'none';
        document.querySelector(`button[onclick="showTab('${tab}')"]`).classList.remove('active');
    });
    
    // Hiển thị tab được chọn
    document.getElementById(`${tabName}Tab`).style.display = 'block';
    document.querySelector(`button[onclick="showTab('${tabName}')"]`).classList.add('active');
    
    // Load dữ liệu cho tab
    switch(tabName) {
        case 'services':
            renderServicesList();
            break;
        case 'experiences':
            renderExperiencesList();
            break;
        case 'blog':
            renderBlogList();
            break;
    }
}
// Save experiences to GitHub
async function saveExperiencesToGitHub() {
    if (!githubConfig.token || githubConfig.token === '••••••••••') {
        showStatus('Chưa cấu hình GitHub Token', 'warning');
        return;
    }
    
    showLoading(true);
    
    try {
        // Cập nhật timestamp
        experiencesData.last_updated = new Date().toISOString();
        
        // Thử lấy SHA nếu file đã tồn tại
        let sha = '';
        try {
            const getResponse = await fetch(
                `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/data/experiences.json`,
                {
                    headers: {
                        'Authorization': `token ${githubConfig.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (getResponse.ok) {
                const fileInfo = await getResponse.json();
                sha = fileInfo.sha;
            }
        } catch (e) {
            console.log('File experiences.json chưa tồn tại, sẽ tạo mới');
        }
        
        // Tạo hoặc update file
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(experiencesData, null, 2))));
        
        const response = await fetch(
            `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/data/experiences.json`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `Update experiences data - ${new Date().toLocaleString('vi-VN')}`,
                    content: content,
                    branch: githubConfig.branch,
                    sha: sha || undefined
                })
            }
        );
        
        if (response.ok) {
            showStatus('✅ Đã lưu trải nghiệm lên GitHub thành công!', 'success');
            
            // Cũng lưu vào localStorage làm backup
            localStorage.setItem('luxurymove_experiences', JSON.stringify(experiencesData, null, 2));
            
        } else {
            const error = await response.json();
            throw new Error(error.message || `GitHub API error: ${response.status}`);
        }
        
    } catch (error) {
        console.error('Error saving experiences to GitHub:', error);
        showStatus('❌ Lỗi lưu lên GitHub: ' + error.message, 'error');
        
        // Fallback to localStorage
        localStorage.setItem('luxurymove_experiences', JSON.stringify(experiencesData, null, 2));
        showStatus('Đã lưu vào localStorage làm backup', 'warning');
    } finally {
        showLoading(false);
    }
}




// ===== AUTO SYNC MANAGER =====
const SyncManager = {
    queue: [],
    isProcessing: false,
    pendingSyncs: new Set(), // Tránh sync trùng lặp
    
    // Thêm task vào queue
    addToQueue(type, data, action = 'update') {
        const taskId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Nếu đang có pending cùng type, bỏ qua để tránh conflict
        if (this.pendingSyncs.has(type)) {
            console.log(`⏭️ Bỏ qua sync ${type} vì đang có pending`);
            return;
        }
        
        this.queue.push({
            id: taskId,
            type: type,
            data: JSON.parse(JSON.stringify(data)), // Deep clone
            action: action,
            timestamp: Date.now(),
            retries: 0
        });
        
        this.pendingSyncs.add(type);
        this.processQueue();
    },
    
    // Xử lý queue
    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.queue.length > 0) {
            const task = this.queue[0];
            
            try {
                console.log(`🔄 Đang sync ${task.type}...`);
                const success = await this.syncToGitHub(task.type, task.data);
                
                if (success) {
                    // Thành công - xóa task
                    this.queue.shift();
                    this.pendingSyncs.delete(task.type);
                    console.log(`✅ Đã sync ${task.type}`);
                } else {
                    // Thất bại - thử lại hoặc bỏ
                    task.retries++;
                    
                    if (task.retries >= 3) {
                        console.warn(`❌ Bỏ qua ${task.type} sau 3 lần thử`);
                        this.queue.shift();
                        this.pendingSyncs.delete(task.type);
                    } else {
                        // Delay trước khi thử lại
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            } catch (error) {
                console.error(`Sync error ${task.type}:`, error);
                this.queue.shift();
                this.pendingSyncs.delete(task.type);
            }
        }
        
        this.isProcessing = false;
    },
    
    // Sync lên GitHub
    async syncToGitHub(type, data) {
        if (!githubConfig.token || githubConfig.token === '••••••••••') {
            return false;
        }
        
        const filenames = {
            'services': 'data/services.json',
            'experiences': 'data/experiences.json',
            'blog': 'data/blog.json'
        };
        
        const filename = filenames[type];
        if (!filename) return false;
        
        try {
            // 1. Luôn lấy SHA mới nhất
            let sha = '';
            try {
                const getRes = await fetch(
                    `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/${filename}`,
                    {
                        headers: { 'Authorization': `token ${githubConfig.token}` },
                        signal: AbortSignal.timeout(5000) // Timeout 5s
                    }
                );
                
                if (getRes.ok) {
                    const fileInfo = await getRes.json();
                    sha = fileInfo.sha;
                }
            } catch (e) {
                // File chưa tồn tại hoặc lỗi mạng
                console.log(`ℹ️ ${filename} chưa tồn tại trên GitHub`);
            }
            
            // 2. Cập nhật timestamp
            data.last_updated = new Date().toISOString();
            
            // 3. Upload
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
            
            const putRes = await fetch(
                `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/${filename}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${githubConfig.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Auto-sync ${type} - ${new Date().toLocaleString('vi-VN')}`,
                        content: content,
                        sha: sha || undefined,
                        branch: githubConfig.branch
                    }),
                    signal: AbortSignal.timeout(10000) // Timeout 10s
                }
            );
            
            return putRes.ok;
        } catch (error) {
            console.error(`GitHub sync error (${type}):`, error);
            return false;
        }
    }
};
////
// ===== BLOG MANAGEMENT =====
let blogData = { posts: {} };
let currentEditingPostId = null;

// Load blog data
async function loadBlogData() {
    try {
        // Try from GitHub
        if (githubConfig.token && githubConfig.token !== '••••••••••') {
            const data = await loadBlogFromGitHub();
            if (data) {
                blogData = data;
                showStatus('Đã tải blog từ GitHub', 'success');
                renderBlogList();
                return;
            }
        }
        
        // Try from localStorage
        const localData = localStorage.getItem('luxurymove_blog');
        if (localData) {
            blogData = JSON.parse(localData);
            showStatus('Đã tải blog từ localStorage', 'warning');
            renderBlogList();
            return;
        }
        
        // Create default
        blogData = { posts: {} };
        renderBlogList();
        
    } catch (error) {
        console.error('Error loading blog:', error);
        showStatus('Lỗi tải blog: ' + error.message, 'error');
    }
}

// Load blog from GitHub
async function loadBlogFromGitHub() {
    if (!githubConfig.token || githubConfig.token === '••••••••••') {
        return null;
    }
    
    try {
        const response = await fetch(
            `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/data/blog.json`,
            {
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3.raw'
                }
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            return data;
        } else if (response.status === 404) {
            console.log('File blog.json chưa tồn tại trên GitHub');
            return null;
        } else {
            console.error('GitHub API error:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error loading blog from GitHub:', error);
        return null;
    }
}

// Render blog list
function renderBlogList() {
    const container = document.getElementById('blogList');
    const posts = blogData.posts || {};
    
    if (Object.keys(posts).length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-tertiary);">
                <i class="fas fa-newspaper" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3>Chưa có bài viết nào</h3>
                <p>Nhấn "Thêm bài viết mới" để bắt đầu</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    Object.entries(posts).forEach(([id, post]) => {
        const date = new Date(post.date).toLocaleDateString('vi-VN');
        
        html += `
            <div class="service-item" onclick="editBlogPost('${id}')">
                <div class="service-item-header">
                    <h3 class="service-item-title">${post.title}</h3>
                    <div class="service-item-actions">
                        <button class="action-btn" onclick="editBlogPost('${id}'); event.stopPropagation();">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="deleteBlogPostConfirm('${id}'); event.stopPropagation();" style="background: rgba(255, 68, 68, 0.2);">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="service-item-image">
                    <img src="${post.image}" alt="${post.title}">
                </div>
                <p class="service-item-desc">${post.excerpt || 'Chưa có mô tả'}</p>
                <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 12px; color: var(--text-tertiary);">
                    <span><i class="fas fa-user"></i> ${post.author}</span>
                    <span><i class="far fa-calendar"></i> ${date}</span>
                    <span><i class="fas fa-tag"></i> ${post.category || 'Khác'}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Add new post
function addNewPost() {
    currentEditingPostId = null;
    
    // Reset form
    document.getElementById('postId').value = '';
    document.getElementById('postTitle').value = '';
    document.getElementById('postAuthor').value = 'LuxuryMove Team';
    document.getElementById('postDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('postCategory').value = 'travel';
    document.getElementById('postImage').value = '';
    document.getElementById('postExcerpt').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('postTags').value = '';
    
    // Hide preview
    document.getElementById('postImagePreview').style.display = 'none';
    
    // Show editor
    document.getElementById('blogEditorTitle').textContent = 'Thêm bài viết mới';
    document.getElementById('blogEditorModal').style.display = 'flex';
    document.getElementById('deleteBlogPostBtn').style.display = 'none';
}

// Edit post
function editBlogPost(postId) {
    currentEditingPostId = postId;
    const post = blogData.posts[postId];
    
    if (!post) {
        showStatus('Không tìm thấy bài viết', 'error');
        return;
    }
    
    // Fill form
    document.getElementById('postId').value = postId;
    document.getElementById('postTitle').value = post.title || '';
    document.getElementById('postAuthor').value = post.author || 'LuxuryMove Team';
    document.getElementById('postDate').value = post.date || new Date().toISOString().split('T')[0];
    document.getElementById('postCategory').value = post.category || 'travel';
    document.getElementById('postImage').value = post.image || '';
    document.getElementById('postExcerpt').value = post.excerpt || '';
    document.getElementById('postContent').value = post.content || '';
    document.getElementById('postTags').value = post.tags ? post.tags.join(', ') : '';
    
    // Show preview if image exists
    if (post.image) {
        const preview = document.getElementById('postImagePreview');
        preview.querySelector('img').src = post.image;
        preview.style.display = 'block';
    }
    
    // Show editor
    document.getElementById('blogEditorTitle').textContent = `Chỉnh sửa: ${post.title}`;
    document.getElementById('blogEditorModal').style.display = 'flex';
    document.getElementById('deleteBlogPostBtn').style.display = 'block';
}

// Close blog editor
function closeBlogEditor() {
    document.getElementById('blogEditorModal').style.display = 'none';
    currentEditingPostId = null;
}

// Save blog post
async function saveBlogPost() {
    const postId = document.getElementById('postId').value.trim();
    const title = document.getElementById('postTitle').value.trim();
    const image = document.getElementById('postImage').value.trim();
    const excerpt = document.getElementById('postExcerpt').value.trim();
    const content = document.getElementById('postContent').value.trim();
    
    if (!postId || !title || !image || !excerpt || !content) {
        showStatus('Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }
    
    // Collect tags
    const tagsInput = document.getElementById('postTags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // Create post object
    const postData = {
        title: title,
        author: document.getElementById('postAuthor').value.trim() || 'LuxuryMove Team',
        date: document.getElementById('postDate').value || new Date().toISOString().split('T')[0],
        category: document.getElementById('postCategory').value,
        image: image,
        excerpt: excerpt,
        content: content,
        tags: tags
    };
    
    // Save to data
    if (!blogData.posts) {
        blogData.posts = {};
    }
    
    blogData.posts[postId] = postData;
    blogData.last_updated = new Date().toISOString();
    
    // Update list
    renderBlogList();
    
    // Save to storage
    localStorage.setItem('luxurymove_blog', JSON.stringify(blogData, null, 2));
    // Try to save to GitHub
    await saveBlogToGitHub();
    
    showStatus(`Đã lưu bài viết: ${title}`, 'success');
    closeBlogEditor();
}

// Save blog to GitHub
async function saveBlogToGitHub() {
    if (!githubConfig.token || githubConfig.token === '••••••••••') {
        return;
    }
    
    showLoading(true);
    
    try {
        // Update timestamp
        blogData.last_updated = new Date().toISOString();
        
        // Get SHA if exists
        let sha = '';
        try {
            const getResponse = await fetch(
                `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/data/blog.json`,
                {
                    headers: {
                        'Authorization': `token ${githubConfig.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (getResponse.ok) {
                const fileInfo = await getResponse.json();
                sha = fileInfo.sha;
            }
        } catch (e) {
            console.log('File blog.json chưa tồn tại, sẽ tạo mới');
        }
        
        // Create or update file
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(blogData, null, 2))));
        
        const response = await fetch(
            `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/data/blog.json`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubConfig.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `Update blog data - ${new Date().toLocaleString('vi-VN')}`,
                    content: content,
                    branch: githubConfig.branch,
                    sha: sha || undefined
                })
            }
        );
        
        if (response.ok) {
            showStatus('✅ Đã lưu blog lên GitHub!', 'success');
        } else {
            const error = await response.json();
            throw new Error(error.message || `GitHub API error: ${response.status}`);
        }
        
    } catch (error) {
        console.error('Error saving blog to GitHub:', error);
        // Continue anyway - it's saved locally
    } finally {
        showLoading(false);
    }
}

// Delete post confirmation
function deleteBlogPostConfirm(postId) {
    if (confirm(`Bạn có chắc muốn xóa bài viết "${postId}"?`)) {
        deleteBlogPost(postId);
    }
}

async function deleteBlogPost(postId = null) {
    if (!postId && currentEditingPostId) postId = currentEditingPostId;
    if (!postId || !confirm(`Xóa bài "${postId}"?`)) return;
    
    showLoading(true, 'Đang xóa...');
    
    // 1. XÓA LOCAL NGAY
    if (blogData.posts[postId]) {
        delete blogData.posts[postId];
        blogData.last_updated = new Date().toISOString();
        localStorage.setItem('luxurymove_blog', JSON.stringify(blogData));
        
        // 2. CẬP NHẬT UI NGAY
        renderBlogList();
        showStatus(`✅ Đã xóa bài viết`, 'success');
        
        // 3. AUTO-SYNC LÊN GITHUB
        SyncManager.addToQueue('blog', blogData, 'delete');
    }
    
    showLoading(false);
    closeBlogEditor();
}

// Preview image
function previewPostImage() {
    const imageUrl = document.getElementById('postImage').value.trim();
    if (!imageUrl) {
        showStatus('Vui lòng nhập URL ảnh', 'error');
        return;
    }
    
    const preview = document.getElementById('postImagePreview');
    preview.querySelector('img').src = imageUrl;
    preview.style.display = 'block';
    showStatus('Đã cập nhật preview ảnh', 'success');
}

// Preview blog post
function previewBlogPost() {
    // This would open a preview window
    // For now, just show a message
    showStatus('Chức năng xem trước đang phát triển', 'info');
}

// Insert HTML tags
function insertContentTag(tag, placeholder) {
    const textarea = document.getElementById('postContent');
    let insertText = '';
    
    switch(tag) {
        case 'h2':
            insertText = '<h2>Tiêu đề phụ</h2>\n';
            break;
        case 'p':
            insertText = '<p>Đoạn văn nội dung...</p>\n';
            break;
        case 'img':
            insertText = '<img src="https://images.unsplash.com/photo-..." alt="Mô tả ảnh" style="max-width: 100%; border-radius: 10px; margin: 20px 0;">\n';
            break;
        case 'ul':
            insertText = '<ul>\n<li>Mục 1</li>\n<li>Mục 2</li>\n<li>Mục 3</li>\n</ul>\n';
            break;
    }
    
    textarea.value += insertText;
    textarea.focus();
}

// Insert features section
function insertFeaturesSection() {
    const textarea = document.getElementById('postContent');
    const features = `<div class="features-section">
    <h3>Tính năng nổi bật</h3>
    <div class="feature-item">
        <i class="fas fa-check-circle"></i>
        <span>Tính năng 1 - Mô tả ngắn</span>
    </div>
    <div class="feature-item">
        <i class="fas fa-check-circle"></i>
        <span>Tính năng 2 - Mô tả ngắn</span>
    </div>
    <div class="feature-item">
        <i class="fas fa-check-circle"></i>
        <span>Tính năng 3 - Mô tả ngắn</span>
    </div>
</div>\n`;
    
    textarea.value += features;
    textarea.focus();
}

// Insert pricing section
function insertPricingSection() {
    const textarea = document.getElementById('postContent');
    const pricing = `<div class="pricing-section">
    <h3>Bảng giá tham khảo</h3>
    <div class="price-item">
        <i class="fas fa-car"></i>
        <span>Dịch vụ A: <strong>500,000 VND</strong></span>
    </div>
    <div class="price-item">
        <i class="fas fa-road"></i>
        <span>Dịch vụ B: <strong>1,000,000 VND</strong></span>
    </div>
    <div class="price-item">
        <i class="fas fa-clock"></i>
        <span>Theo giờ: <strong>350,000 VND/giờ</strong></span>
    </div>
</div>\n`;
    
    textarea.value += pricing;
    textarea.focus();
}

// Update loadAllData to include blog
async function loadAllData() {
    showLoading(true);
    try {
        await Promise.allSettled([
            loadServicesData(),
            loadExperiencesData(),
            loadBlogData() // Add this line
        ]);
        
        showStatus('Đã tải tất cả dữ liệu', 'success');
    } catch (error) {
        console.error('Error loading all data:', error);
        showStatus('Lỗi tải dữ liệu: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

