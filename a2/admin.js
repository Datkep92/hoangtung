// admin.js
const GITHUB_TOKEN = 'YOUR_GITHUB_PAT_TOKEN';
const GIST_ID = 'YOUR_GIST_ID'; // Hoặc repo path
const ADMIN_TOKEN = 'luxurymove2024'; // Token đơn giản

let currentData = {};
let selectedService = null;

// Đăng nhập admin
function loginAdmin() {
    const token = document.getElementById('adminToken').value;
    if (token === ADMIN_TOKEN) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('editorSection').style.display = 'block';
        loadDataFromGitHub();
    } else {
        alert('Token không đúng!');
    }
}

// Load dữ liệu từ GitHub
async function loadDataFromGitHub() {
    try {
        // Cách 1: Từ Gist
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`);
        const gist = await response.json();
        const content = JSON.parse(gist.files['services-data.json'].content);
        currentData = content;
        
        // Cách 2: Từ raw file trong repo
        // const response = await fetch('https://raw.githubusercontent.com/username/repo/main/services-data.json');
        // currentData = await response.json();
        
        populateServiceSelect();
        alert('Đã tải dữ liệu thành công!');
    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
        alert('Không thể tải dữ liệu từ GitHub');
    }
}

// Populate dropdown dịch vụ
function populateServiceSelect() {
    const select = document.getElementById('serviceSelect');
    select.innerHTML = '<option value="">-- Chọn dịch vụ --</option><option value="new">+ Thêm dịch vụ mới</option>';
    
    Object.keys(currentData.services).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = currentData.services[key].title;
        select.appendChild(option);
    });
    
    select.onchange = function() {
        if (this.value === 'new') {
            resetForm();
            document.getElementById('serviceId').value = '';
        } else if (this.value) {
            loadService(this.value);
        }
    };
}

// Load dịch vụ vào form
function loadService(serviceId) {
    selectedService = serviceId;
    const service = currentData.services[serviceId];
    
    document.getElementById('serviceId').value = serviceId;
    document.getElementById('serviceTitle').value = service.title;
    document.getElementById('serviceDescription').value = service.description;
    
    // Load ảnh
    const imageList = document.getElementById('imageList');
    imageList.innerHTML = '';
    service.images.forEach((img, index) => {
        const div = document.createElement('div');
        div.innerHTML = `
            <img src="${img}" style="width: 100px; height: 60px; object-fit: cover;">
            <button onclick="removeImage(${index})">Xóa</button>
        `;
        imageList.appendChild(div);
    });
    
    // Load bảng giá
    const pricingList = document.getElementById('pricingList');
    pricingList.innerHTML = '';
    service.pricing.forEach((price, index) => {
        const div = document.createElement('div');
        div.innerHTML = `
            ${price.label}: ${price.price}
            <button onclick="removePrice(${index})">Xóa</button>
        `;
        pricingList.appendChild(div);
    });
}

// Reset form
function resetForm() {
    selectedService = null;
    document.getElementById('serviceId').value = '';
    document.getElementById('serviceTitle').value = '';
    document.getElementById('serviceDescription').value = '';
    document.getElementById('imageList').innerHTML = '';
    document.getElementById('pricingList').innerHTML = '';
}

// Thêm ảnh
function addImage() {
    const url = document.getElementById('imageUrl').value;
    if (!url) return;
    
    const imageList = document.getElementById('imageList');
    const index = imageList.children.length;
    
    const div = document.createElement('div');
    div.innerHTML = `
        <img src="${url}" style="width: 100px; height: 60px; object-fit: cover;">
        <button onclick="removeImage(${index})">Xóa</button>
    `;
    imageList.appendChild(div);
    document.getElementById('imageUrl').value = '';
}

// Thêm giá
function addPrice() {
    const label = document.getElementById('priceLabel').value;
    const value = document.getElementById('priceValue').value;
    if (!label || !value) return;
    
    const pricingList = document.getElementById('pricingList');
    const index = pricingList.children.length;
    
    const div = document.createElement('div');
    div.innerHTML = `
        ${label}: ${value}
        <button onclick="removePrice(${index})">Xóa</button>
    `;
    pricingList.appendChild(div);
    
    document.getElementById('priceLabel').value = '';
    document.getElementById('priceValue').value = '';
}

// Lưu dịch vụ
function saveService() {
    const serviceId = document.getElementById('serviceId').value || 
                     document.getElementById('serviceTitle').value.toLowerCase().replace(/\s+/g, '_');
    
    // Thu thập ảnh từ UI
    const images = Array.from(document.querySelectorAll('#imageList img')).map(img => img.src);
    
    // Thu thập giá từ UI
    const pricing = Array.from(document.querySelectorAll('#pricingList div')).map(div => {
        const text = div.textContent.replace('Xóa', '').trim();
        const parts = text.split(': ');
        return { label: parts[0], price: parts[1] };
    });
    
    // Tạo object dịch vụ
    const serviceData = {
        title: document.getElementById('serviceTitle').value,
        subtitle: document.getElementById('serviceTitle').value,
        images: images,
        description: document.getElementById('serviceDescription').value,
        features: ["Đặc điểm 1", "Đặc điểm 2"], // Có thể thêm input riêng
        pricing: pricing
    };
    
    // Lưu vào currentData
    currentData.services[serviceId] = serviceData;
    currentData.last_updated = new Date().toISOString();
    
    alert('Đã lưu dịch vụ! Nhấn "Xuất bản" để cập nhật lên GitHub.');
    populateServiceSelect();
}

// Xuất bản lên GitHub Gist
async function publishToGist() {
    try {
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    'services-data.json': {
                        content: JSON.stringify(currentData, null, 2)
                    }
                }
            })
        });
        
        if (response.ok) {
            alert('✅ Đã cập nhật dữ liệu lên GitHub thành công!');
        } else {
            alert('❌ Lỗi khi cập nhật GitHub');
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('❌ Không thể kết nối đến GitHub');
    }
}