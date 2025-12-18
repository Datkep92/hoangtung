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

// ===== CẬP NHẬT HÀM loadServicesData =====
async function loadServicesData() {
    showLoading(true);
    
    try {
        // Load GitHub config first
        loadGitHubConfig();
        
        // Try loading from GitHub first
        let data = null;
        
        if (githubConfig.token && githubConfig.token !== '••••••••••') {
            data = await loadFromGitHub();
        }
        
        // If GitHub fails or no token, try local storage
        if (!data) {
            data = loadFromLocalStorage();
            if (data) {
                showStatus('Đã tải dữ liệu từ localStorage', data.services ? 'success' : 'warning');
            }
        }
        
        // If still no data, use default
        if (!data) {
            data = { services: getDefaultServices() };
            showStatus('Dùng dữ liệu mặc định', 'warning');
        }
        
        servicesData = data;
        renderServicesList();
        
    } catch (error) {
        console.error('Error loading data:', error);
        showStatus('Lỗi tải dữ liệu: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
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

// ===== AUTHENTICATION =====
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
        
        loadServicesData();
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



// ===== GITHUB DATA SYNC (FIXED CORS) =====
async function loadServicesData() {
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
    } catch (error) {
        console.error('Error loading data:', error);
        showStatus('Lỗi tải dữ liệu: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}
async function saveAllServices() {
    showLoading(true);
    
    // Sao lưu local trước
    localStorage.setItem('luxurymove_services', JSON.stringify(servicesData));

    if (!githubConfig.token) {
        showStatus('Chưa có GitHub Token để lưu', 'error');
        showLoading(false);
        return;
    }

    try {
        const path = 'data/services.json';
        const url = `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/${path}`;
        
        // 1. Lấy SHA của file hiện tại
        let sha = "";
        const getRes = await fetch(url, {
            headers: { 'Authorization': `token ${githubConfig.token}` }
        });
        
        if (getRes.ok) {
            const fileData = await getRes.json();
            sha = fileData.sha;
        }

        // 2. Push dữ liệu mới
        servicesData.last_updated = new Date().toISOString();
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(servicesData, null, 2))));
        
        const putRes = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubConfig.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Update services: ${new Date().toLocaleString('vi-VN')}`,
                content: content,
                sha: sha || undefined,
                branch: githubConfig.branch
            })
        });

        if (putRes.ok) {
            showStatus('✅ Đã lưu lên GitHub thành công!', 'success');
        } else {
            const err = await putRes.json();
            throw new Error(err.message);
        }
    } catch (error) {
        showStatus('❌ Lỗi GitHub: ' + error.message, 'error');
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

// Hàm xóa dịch vụ - GỌI LẠI saveAllServices()
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

function removeImage(index) {
    const imagesList = document.getElementById('imagesList');
    if (imagesList.children[index]) {
        imagesList.removeChild(imagesList.children[index]);
        
        // Re-index remaining items
        Array.from(imagesList.children).forEach((item, i) => {
            const btn = item.querySelector('.image-item-remove');
            btn.onclick = () => removeImage(i);
        });
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validate file
    if (!file.type.match('image.*')) {
        showStatus('Vui lòng chọn file ảnh', 'error');
        return;
    }
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showStatus('File quá lớn (tối đa 2MB)', 'error');
        return;
    }
    
    // Convert to Data URL for preview
    const reader = new FileReader();
    reader.onload = function(e) {
        // For production, you would upload to GitHub or other service
        // For now, we use Data URL (base64)
        addImageItem(e.target.result);
        showStatus('Đã thêm ảnh từ file', 'success');
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    event.target.value = '';
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


// Thêm các nút Export/Import vào admin-actions nếu cần
