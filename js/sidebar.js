// ===== SIDEBAR MODULE - FIXED VERSION =====

class SidebarManager {
    constructor() {
        this.isOpen = false;
        this.statisticsEngine = null;
        this.updateInterval = null;
        this.userSessionId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.lastUpdateTime = null;
        this.pricingData = { prices: [], services: [] };
        this.lastStats = null;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.toggleSidebar = this.toggleSidebar.bind(this);
        this.closeSidebar = this.closeSidebar.bind(this);
        this.openSidebar = this.openSidebar.bind(this);
        this.renderSidebarContent = this.renderSidebarContent.bind(this);
        this.updateStatistics = this.updateStatistics.bind(this);
        this.registerUserSession = this.registerUserSession.bind(this);
        this.calculateSmartStatistics = this.calculateSmartStatistics.bind(this);
        this.loadPricingData = this.loadPricingData.bind(this);
        this.renderPricingInSidebar = this.renderPricingInSidebar.bind(this);
        this.setupInteractiveElements = this.setupInteractiveElements.bind(this);
    }
    
    async init() {
        console.log("🚀 Initializing Sidebar Manager...");
        
        // Initialize Firebase structure
        await this.initializeFirebaseStructure();
        
        // Register user session
        await this.registerUserSession();
        
        // Load pricing data
        await this.loadPricingData();
        
        // Setup DOM elements
        this.setupDOMElements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load saved theme and font size
        this.loadSavedPreferences();
        
        // Start statistics updates
        this.startStatisticsUpdates();
        
        // Initial render
        await this.updateStatistics();
        
        console.log("✅ Sidebar Manager initialized");
    }
    
    async loadPricingData() {
        try {
            if (!database) {
                console.warn("Database not available for pricing data");
                return;
            }
            
            const pricingSnapshot = await database.ref('pricing').once('value');
            const pricing = pricingSnapshot.val();
            
            const servicesSnapshot = await database.ref('services').once('value');
            const services = servicesSnapshot.val();
            
            this.pricingData = {
                prices: pricing?.prices || this.getDefaultPricing(),
                services: this.extractServicesPricing(services),
                last_updated: new Date().toISOString()
            };
            
        } catch (error) {
            console.error("❌ Error loading pricing data for sidebar:", error);
            this.pricingData = {
                prices: this.getDefaultPricing(),
                services: [],
                last_updated: new Date().toISOString()
            };
        }
    }
    
    getDefaultPricing() {
        return [
            {
                id: 'price1',
                category: 'Sân Bay Cam Ranh',
                title: 'Phan Rang ⇄ Sân Bay Cam Ranh',
                description: 'Đưa đón tận nơi, hỗ trợ hành lý',
                current_price: '500.000 VND',
                note: 'Giá cho xe 4-7 chỗ',
                order: 1
            },
            {
                id: 'price2',
                category: 'Tour Du Lịch',
                title: 'Du lịch Vĩnh Hy',
                description: 'Tour trọn gói nguyên ngày',
                current_price: '1.200.000 VND',
                note: 'Bao gồm xe, tài xế, nước uống',
                order: 2
            },
            {
                id: 'price3',
                category: 'Liên Tỉnh',
                title: 'Ninh Thuận ⇄ Đà Lạt (2 chiều)',
                description: 'Đón tại nhà, trả tận nơi',
                current_price: '800.000 VND',
                note: 'Xe 4 chỗ tiêu chuẩn',
                order: 3
            }
        ];
    }
    
    extractServicesPricing(servicesData) {
        const servicesPricing = [];
        
        if (servicesData && servicesData.services) {
            Object.entries(servicesData.services).forEach(([id, service]) => {
                if (service.pricing && service.pricing.length > 0) {
                    const priceItem = service.pricing[0];
                    
                    servicesPricing.push({
                        id: `service_${id}`,
                        source: 'service',
                        service_id: id,
                        category: 'Dịch Vụ',
                        title: service.title,
                        description: service.description?.substring(0, 80) + '...' || '',
                        current_price: priceItem.price,
                        custom_price: service.custom_price || null,
                        original_price: service.original_price || null,
                        note: priceItem.label ? `(${priceItem.label})` : '',
                        order: parseInt(service.order || 999)
                    });
                }
            });
            
            servicesPricing.sort((a, b) => a.order - b.order);
        }
        
        return servicesPricing;
    }
    
    renderPricingInSidebar() {
        const { prices = [], services = [] } = this.pricingData;
        
        let allItems = prices.map(item => ({
            ...item,
            source: 'pricing'
        }));
        
        const serviceItems = services.map(item => ({
            ...item,
            source: 'service'
        }));
        
        allItems = [...allItems, ...serviceItems];
        allItems.sort((a, b) => (a.order || 999) - (b.order || 999));
        const topItems = allItems.slice(0, 3);
        
        if (topItems.length === 0) {
            return `
                <div class="quick-route-item">
                    <div class="route-header">
                        <div class="route-icon">
                            <i class="fas fa-info-circle"></i>
                        </div>
                        <div class="route-title">Đang tải bảng giá...</div>
                    </div>
                    <div class="route-details">
                        <span class="route-price">
                            <i class="fas fa-tag"></i> Vui lòng chờ
                        </span>
                    </div>
                </div>
            `;
        }
        
        let html = '';
        
        topItems.forEach((item, index) => {
            const isService = item.source === 'service';
            const hasDiscount = item.original_price && item.current_price;
            const priceValue = item.custom_price || item.current_price || 'Liên hệ';
            
            html += `
                <div class="quick-route-item pricing-item" data-item-id="${item.id}" data-item-type="${item.source}" data-item-title="${item.title}" data-item-price="${priceValue}">
                    <div class="route-header">
                        <div class="route-icon">
                            <i class="fas ${isService ? 'fa-car' : 'fa-map-marker-alt'}"></i>
                        </div>
                        <div class="route-title">${item.title}</div>
                    </div>
                    <div class="route-details">
                        <span class="route-distance">
                            <i class="fas fa-tags"></i> ${item.category || 'Bảng giá'}
                        </span>
                        <span class="route-price">
                            <i class="fas fa-tag"></i> ${priceValue}
                        </span>
                    </div>
                    ${item.description ? `
                        <div class="route-description">
                            ${item.description.substring(0, 60)}${item.description.length > 60 ? '...' : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        return html;
    }
    
    setupDOMElements() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.sidebarContent = document.getElementById('sidebarContent');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.sidebarClose = document.getElementById('sidebarClose');
        this.refreshStatsBtn = document.getElementById('refreshStatsBtn');
        this.lastUpdateTimeEl = document.getElementById('lastUpdateTime');
        this.onlineBadge = document.getElementById('onlineBadge');
    }
    
    setupEventListeners() {
        // Toggle sidebar
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', this.toggleSidebar);
        }
        
        // Close sidebar
        if (this.sidebarClose) {
            this.sidebarClose.addEventListener('click', this.closeSidebar);
        }
        
        // Close on overlay click
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', this.closeSidebar);
        }
        
        // Refresh statistics
        if (this.refreshStatsBtn) {
            this.refreshStatsBtn.addEventListener('click', () => {
                this.updateStatistics(true);
            });
        }
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeSidebar();
            }
        });
    }
    
    loadSavedPreferences() {
        // Load saved theme
        const savedTheme = localStorage.getItem('luxurymove_theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
        }
        
        // Load saved font size
        const savedFontSize = localStorage.getItem('luxurymove_fontsize');
        if (savedFontSize) {
            document.documentElement.style.fontSize = 
                savedFontSize === 'small' ? '14px' : 
                savedFontSize === 'large' ? '18px' : '16px';
        }
    }
    
    toggleSidebar() {
        if (this.isOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }
    
    async openSidebar() {
        this.isOpen = true;
        this.sidebar.classList.add('active');
        this.sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Load fresh pricing data khi mở sidebar
        await this.loadPricingData();
        
        // Update statistics khi mở
        await this.updateStatistics();
    }
    
    closeSidebar() {
        this.isOpen = false;
        this.sidebar.classList.remove('active');
        this.sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    async initializeFirebaseStructure() {
        if (!database) return;
        
        try {
            const statsRef = database.ref('statistics');
            const snapshot = await statsRef.once('value');
            
            if (!snapshot.exists()) {
                const defaultConfig = {
                    config: {
                        total_cars: 15,
                        base_online: 15,
                        base_bookings: 8,
                        auto_update: true,
                        last_reset: new Date().toISOString().split('T')[0],
                        hourly_multipliers: {
                            "00-06": 0.2, "06-09": 0.6, "09-12": 0.9,
                            "12-14": 1.0, "14-18": 1.2, "18-21": 1.5, "21-24": 0.8
                        },
                        weekend_boost: 1.3,
                        manual_override: { online: null, bookings: null, cars: null }
                    },
                    live: {
                        current_online: 15,
                        bookings_today: 8,
                        available_cars: 10,
                        is_peak_hour: false,
                        updated_at: Date.now()
                    },
                    logs: { daily_resets: [], manual_updates: [] }
                };
                
                await statsRef.set(defaultConfig);
                console.log("📊 Created Firebase statistics structure");
            }
        } catch (error) {
            console.error("❌ Error initializing Firebase structure:", error);
        }
    }
    
    async registerUserSession() {
        if (!database) return;
        
        try {
            const sessionData = {
                user_id: this.userSessionId,
                last_active: Date.now(),
                page: window.location.pathname,
                user_agent: navigator.userAgent,
                timestamp: Date.now()
            };
            
            await database.ref(`user_sessions/${this.userSessionId}`).set(sessionData);
            
            setInterval(async () => {
                if (database) {
                    await database.ref(`user_sessions/${this.userSessionId}/last_active`).set(Date.now());
                }
            }, 60000);
            
        } catch (error) {
            console.error("❌ Error registering user session:", error);
        }
    }
    
    startStatisticsUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(() => {
            this.updateStatistics();
        }, 30000);
    }
    
    async updateStatistics(forceRefresh = false) {
        try {
            if (!database) {
                this.showErrorMessage("Không thể kết nối đến server");
                return;
            }
            
            const configSnapshot = await database.ref('statistics/config').once('value');
            const config = configSnapshot.val();
            
            if (!config) {
                this.showErrorMessage("Không tải được cấu hình");
                return;
            }
            
            const calculatedStats = this.calculateSmartStatistics(config);
            
            const realData = await this.getRealStatistics();
            
            const finalStats = {
                current_online: realData?.real_online > 0 ? realData.real_online : calculatedStats.online,
                bookings_today: realData?.real_bookings > 0 ? realData.real_bookings : calculatedStats.bookings,
                available_cars: calculatedStats.available_cars,
                is_peak_hour: calculatedStats.is_peak_hour,
                updated_at: Date.now()
            };
            
            this.lastStats = finalStats;
            
            if (config.manual_override) {
                if (config.manual_override.online !== null) {
                    finalStats.current_online = config.manual_override.online;
                }
                if (config.manual_override.bookings !== null) {
                    finalStats.bookings_today = config.manual_override.bookings;
                }
                if (config.manual_override.cars !== null) {
                    finalStats.available_cars = config.manual_override.cars;
                }
            }
            
            if (config.auto_update || forceRefresh) {
                await database.ref('statistics/live').set(finalStats);
            }
            
            this.updateUI(finalStats);
            
            this.lastUpdateTime = new Date();
            if (this.lastUpdateTimeEl) {
                const timeStr = this.lastUpdateTime.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                this.lastUpdateTimeEl.textContent = timeStr;
            }
            
            if (this.onlineBadge) {
                this.onlineBadge.textContent = finalStats.current_online;
            }
            
        } catch (error) {
            console.error("❌ Error updating statistics:", error);
            this.showErrorMessage("Lỗi cập nhật dữ liệu");
        }
    }
    
    calculateSmartStatistics(config) {
        const now = new Date();
        const hour = now.getHours();
        const isWeekend = [0, 6].includes(now.getDay());
        
        let hourMultiplier = 1.0;
        if (hour >= 0 && hour < 6) hourMultiplier = config.hourly_multipliers["00-06"] || 0.2;
        else if (hour >= 6 && hour < 9) hourMultiplier = config.hourly_multipliers["06-09"] || 0.6;
        else if (hour >= 9 && hour < 12) hourMultiplier = config.hourly_multipliers["09-12"] || 0.9;
        else if (hour >= 12 && hour < 14) hourMultiplier = config.hourly_multipliers["12-14"] || 1.0;
        else if (hour >= 14 && hour < 18) hourMultiplier = config.hourly_multipliers["14-18"] || 1.2;
        else if (hour >= 18 && hour < 21) hourMultiplier = config.hourly_multipliers["18-21"] || 1.5;
        else hourMultiplier = config.hourly_multipliers["21-24"] || 0.8;
        
        if (isWeekend) {
            hourMultiplier *= (config.weekend_boost || 1.3);
        }
        
        const randomFactor = 0.9 + Math.random() * 0.2;
        const online = Math.round(config.base_online * hourMultiplier * randomFactor);
        
        const bookingRandomFactor = 0.8 + Math.random() * 0.4;
        const bookings = Math.round(config.base_bookings * hourMultiplier * bookingRandomFactor);
        
        const availableCars = Math.max(1, config.total_cars - Math.floor(bookings * 0.6));
        
        return {
            online: Math.max(1, online),
            bookings: Math.max(0, bookings),
            available_cars: Math.min(config.total_cars, availableCars),
            is_peak_hour: hourMultiplier > 1.0
        };
    }
    
    async getRealStatistics() {
        if (!database) return null;
        
        try {
            const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
            const sessionsSnapshot = await database.ref('user_sessions').once('value');
            const sessions = sessionsSnapshot.val() || {};
            
            const realOnline = Object.values(sessions).filter(session => 
                session.last_active > fiveMinutesAgo
            ).length;
            
            const today = new Date().toISOString().split('T')[0];
            const bookingsSnapshot = await database.ref('booking_logs').once('value');
            const bookings = bookingsSnapshot.val() || {};
            
            const realBookings = Object.values(bookings).filter(booking => {
                if (!booking.timestamp || !booking.status) return false;
                const bookingDate = new Date(booking.timestamp).toISOString().split('T')[0];
                return bookingDate === today && booking.status === 'confirmed';
            }).length;
            
            return {
                real_online: realOnline,
                real_bookings: realBookings,
                total_sessions: Object.keys(sessions).length
            };
            
        } catch (error) {
            console.error("❌ Error getting real statistics:", error);
            return null;
        }
    }
    
    updateUI(stats) {
        if (!this.sidebarContent) return;
        
        this.sidebarContent.innerHTML = this.renderSidebarContent(stats);
        
        this.setupInteractiveElements();
    }
    
    renderSidebarContent(stats) {
        const now = new Date();
        const hour = now.getHours();
        const isPeakHour = hour >= 18 && hour < 21;
        
        return `
            <!-- Statistics Section -->
            <div class="stats-section">
                <h4><i class="fas fa-chart-line"></i> THỐNG KÊ LIVE</h4>
                
                <div class="stat-item">
                    <div class="stat-icon online">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-label">Đang online</div>
                        <div class="stat-value">${stats.current_online}</div>
                        <div class="stat-sub">(trong 5 phút)</div>
                    </div>
                    <div class="stat-badge ${stats.is_peak_hour ? 'peak' : 'normal'}">
                        ${stats.is_peak_hour ? '⏰ Cao điểm' : '📊 Bình thường'}
                    </div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-icon booking">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-label">Đặt hôm nay</div>
                        <div class="stat-value">${stats.bookings_today}</div>
                        <div class="stat-sub">(${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')})</div>
                    </div>
                </div>
                
                <div class="stat-item">
                    <div class="stat-icon cars">
                        <i class="fas fa-car"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-label">Xe có sẵn</div>
                        <div class="stat-value">${stats.available_cars}/15</div>
                        <div class="stat-sub">(${Math.round(stats.available_cars/15*100)}% trống)</div>
                    </div>
                </div>
            </div>
            
            <!-- Bảng Giá -->
            <div class="stats-section">
                <h4><i class="fas fa-file-invoice-dollar"></i> BẢNG GIÁ MỚI NHẤT</h4>
                <div class="pricing-update-info">
                    <small><i class="fas fa-sync-alt"></i> Cập nhật khi mở sidebar</small>
                </div>
                
                ${this.renderPricingInSidebar()}
                
                <div style="margin-top: 10px; text-align: center;">
                    <button class="btn-view-all-pricing-sidebar" id="viewAllPricingBtn">
                        <i class="fas fa-list-alt"></i>
                        Xem Toàn Bộ Bảng Giá
                    </button>
                </div>
            </div>
            
            <!-- Available Cars -->
            <div class="stats-section">
                <h4><i class="fas fa-car-side"></i> XE CÓ SẴN</h4>
                
                <div class="car-list">
                    <div class="car-item available">
                        <div class="car-icon">
                            <i class="fas fa-car"></i>
                        </div>
                        <div class="car-name">Mercedes</div>
                        <div class="car-status available">Sẵn sàng</div>
                    </div>
                    
                    <div class="car-item available">
                        <div class="car-icon">
                            <i class="fas fa-shuttle-van"></i>
                        </div>
                        <div class="car-name">Innova</div>
                        <div class="car-status available">Sẵn sàng</div>
                    </div>
                    
                    <div class="car-item booked">
                        <div class="car-icon">
                            <i class="fas fa-bus"></i>
                        </div>
                        <div class="car-name">16 Chỗ</div>
                        <div class="car-status booked">Đã đặt</div>
                    </div>
                    
                    <div class="car-item available">
                        <div class="car-icon">
                            <i class="fas fa-taxi"></i>
                        </div>
                        <div class="car-name">Vios</div>
                        <div class="car-status available">Sẵn sàng</div>
                    </div>
                </div>
            </div>
            
            <!-- View Settings -->
            <div class="stats-section">
                <h4><i class="fas fa-cog"></i> CÀI ĐẶT HIỂN THỊ</h4>
                
                <div class="view-settings">
                    <div class="setting-item ${document.body.getAttribute('data-theme') === 'light' ? '' : 'active'}" data-theme="dark">
                        <div class="setting-icon">
                            <i class="fas fa-moon"></i>
                        </div>
                        <div class="setting-label">Chế độ tối</div>
                    </div>
                    
                    <div class="setting-item ${document.body.getAttribute('data-theme') === 'light' ? 'active' : ''}" data-theme="light">
                        <div class="setting-icon">
                            <i class="fas fa-sun"></i>
                        </div>
                        <div class="setting-label">Chế độ sáng</div>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <div class="setting-label" style="margin-bottom: 10px; text-align: center;">Cỡ chữ</div>
                    <div class="font-size-controls">
                        <button class="font-size-btn ${document.documentElement.style.fontSize === '14px' ? 'active' : ''}" data-size="small">S</button>
                        <button class="font-size-btn ${(!document.documentElement.style.fontSize || document.documentElement.style.fontSize === '16px') ? 'active' : ''}" data-size="medium">M</button>
                        <button class="font-size-btn ${document.documentElement.style.fontSize === '18px' ? 'active' : ''}" data-size="large">L</button>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="stats-section">
                <h4><i class="fas fa-bolt"></i> HÀNH ĐỘNG NHANH</h4>
                
                <div style="display: grid; gap: 10px; margin-top: 15px;">
                    <button class="btn btn-primary" id="sidebarBookNowBtn" style="width: 100%; text-align: center; padding: 12px;">
                        <i class="fas fa-calendar-alt"></i> Đặt xe ngay
                    </button>

                    <a href="tel:0567033888" class="btn btn-outline" style="width: 100%; text-align: center; padding: 12px;">
                        <i class="fas fa-phone-alt"></i> Gọi: 0567.033.888
                    </a>
                </div>
            </div>
        `;
    }
    
    setupInteractiveElements() {
        // Theme toggle
        const themeItems = this.sidebarContent.querySelectorAll('.setting-item[data-theme]');
        themeItems.forEach(item => {
            item.addEventListener('click', () => {
                themeItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                const theme = item.dataset.theme;
                document.body.setAttribute('data-theme', theme);
                localStorage.setItem('luxurymove_theme', theme);
                
                // Update active state in UI
                this.updateUI(this.lastStats);
            });
        });
        
        // Font size controls
        const fontSizeBtns = this.sidebarContent.querySelectorAll('.font-size-btn');
        fontSizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                fontSizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const size = btn.dataset.size;
                document.documentElement.style.fontSize = 
                    size === 'small' ? '14px' : 
                    size === 'large' ? '18px' : '16px';
                localStorage.setItem('luxurymove_fontsize', size);
            });
        });
        
        // Pricing item click handlers
        const pricingItems = this.sidebarContent.querySelectorAll('.pricing-item');
        pricingItems.forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                const title = item.dataset.itemTitle;
                const price = item.dataset.itemPrice;
                
                this.handlePricingClick(title, price);
            });
        });
        
        // Car item click handlers
        const carItems = this.sidebarContent.querySelectorAll('.car-item');
        carItems.forEach(item => {
            item.addEventListener('click', () => {
                const carName = item.querySelector('.car-name').textContent;
                const status = item.classList.contains('available') ? 'Sẵn sàng' : 'Đã đặt';
                this.showAlert(`🚗 ${carName}\n📊 Trạng thái: ${status}\n\n📞 Liên hệ đặt xe: 0567.033.888`);
            });
        });
        
        // View all pricing button
        const viewAllBtn = this.sidebarContent.querySelector('#viewAllPricingBtn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.closeSidebar();
                setTimeout(() => {
                    if (typeof openFullPricingPage === 'function') {
                        openFullPricingPage();
                    } else {
                        console.warn("openFullPricingPage function not found");
                    }
                }, 300);
            });
        }
        
        // Book now button in sidebar - FIXED
        const bookNowBtn = this.sidebarContent.querySelector('#sidebarBookNowBtn');
        if (bookNowBtn) {
            bookNowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Đóng sidebar
                this.closeSidebar();
                
                // Scroll đến booking section sau khi sidebar đóng
                setTimeout(() => {
                    const bookingSection = document.getElementById('booking');
                    if (bookingSection) {
                        bookingSection.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // Thêm hiệu ứng highlight
                        bookingSection.classList.add('highlight-booking');
                        setTimeout(() => {
                            bookingSection.classList.remove('highlight-booking');
                        }, 3000);
                    }
                }, 300);
            });
        }
    }
    
    handlePricingClick(title, price) {
        this.closeSidebar();
        
        setTimeout(() => {
            // Sử dụng hàm quickBookPricing nếu có
            if (typeof window.quickBookPricing === 'function') {
                window.quickBookPricing(title, price);
            } else {
                this.showAlert(`📌 ${title}\n💵 Giá: ${price}\n\n📞 Liên hệ đặt xe: 0567.033.888`);
            }
        }, 300);
    }
    
    showAlert(message) {
        alert(message);
    }
    
    showErrorMessage(message) {
        if (this.sidebarContent) {
            this.sidebarContent.innerHTML = `
                <div class="sidebar-error">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h4>Lỗi tải dữ liệu</h4>
                    <p>${message}</p>
                    <button class="btn btn-secondary" id="retryButton" style="margin-top: 15px;">
                        <i class="fas fa-redo"></i> Thử lại
                    </button>
                </div>
            `;
            
            // Thêm event listener cho nút thử lại
            const retryBtn = this.sidebarContent.querySelector('#retryButton');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    this.updateStatistics(true);
                });
            }
        }
    }
    
    refresh() {
        this.updateStatistics(true);
    }
    
    refreshPricing() {
        this.loadPricingData();
        if (this.lastStats) {
            this.updateUI(this.lastStats);
        }
    }
}

// Initialize sidebar manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
    
    // Initialize after a short delay to ensure Firebase is ready
    setTimeout(() => {
        window.sidebarManager.init();
    }, 1000);
});

// Thêm CSS cho sidebar
const sidebarCSS = `
    .stats-section .pricing-update-info {
        margin-bottom: 12px;
        text-align: right;
        opacity: 0.7;
        font-size: 11px;
    }
    
    .pricing-item {
        border-left: 3px solid var(--champagne);
        background: rgba(212, 175, 55, 0.03);
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .pricing-item:hover {
        background: rgba(212, 175, 55, 0.08);
        transform: translateX(5px);
    }
    
    .pricing-item .route-header {
        align-items: flex-start;
    }
    
    .pricing-item .route-icon {
        background: rgba(212, 175, 55, 0.1);
        color: var(--champagne);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    
    .pricing-item .route-title {
        font-weight: 600;
        color: var(--text-primary);
        line-height: 1.3;
        flex: 1;
    }
    
    .pricing-item .route-description {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px dashed rgba(255, 255, 255, 0.1);
        font-size: 12px;
        color: var(--text-tertiary);
        line-height: 1.4;
    }
    
    .pricing-item .route-details {
        margin-top: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
    }
    
    .pricing-item .route-distance {
        font-size: 12px;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .pricing-item .route-price {
        font-weight: 700;
        color: var(--champagne);
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .btn-view-all-pricing-sidebar {
        width: 100%;
        padding: 10px 15px;
        background: rgba(212, 175, 55, 0.1);
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: 8px;
        color: var(--champagne);
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    .btn-view-all-pricing-sidebar:hover {
        background: rgba(212, 175, 55, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
    }
    
    .setting-item.active {
        background: rgba(212, 175, 55, 0.1);
        border-color: var(--champagne);
    }
    
    .font-size-btn.active {
        background: var(--champagne);
        color: var(--primary-black);
    }
    
    .highlight-booking {
        animation: highlightPulse 2s ease;
        position: relative;
    }
    
    @keyframes highlightPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.01); }
        100% { transform: scale(1); }
    }
    
    .sidebar-error {
        text-align: center;
        padding: 30px 20px;
    }
    
    .error-icon {
        font-size: 48px;
        color: #ff6b6b;
        margin-bottom: 20px;
    }
    
    .sidebar-error h4 {
        color: var(--text-primary);
        margin-bottom: 10px;
    }
    
    .sidebar-error p {
        color: var(--text-secondary);
        margin-bottom: 20px;
    }
    
    [data-theme="light"] {
        --primary-black: #ffffff;
        --text-primary: #1a1a1a;
        --text-secondary: #666666;
        --text-tertiary: #999999;
    }
    
    [data-theme="light"] .sidebar,
    [data-theme="light"] .stats-section {
        background: #f8f9fa;
        color: #1a1a1a;
    }
    
    [data-theme="light"] .stats-section h4 {
        color: #1a1a1a;
        border-bottom-color: rgba(0, 0, 0, 0.1);
    }
    
    [data-theme="light"] .stat-label,
    [data-theme="light"] .stat-sub {
        color: #666666;
    }
    
    [data-theme="light"] .pricing-item {
        background: rgba(212, 175, 55, 0.05);
        border-left-color: var(--champagne);
    }
    
    [data-theme="light"] .pricing-item:hover {
        background: rgba(212, 175, 55, 0.1);
    }
    
    [data-theme="light"] .btn-view-all-pricing-sidebar {
        background: rgba(212, 175, 55, 0.1);
        color: #b8941b;
        border-color: rgba(212, 175, 55, 0.3);
    }
    
    [data-theme="light"] .car-item {
        background: rgba(0, 0, 0, 0.03);
    }
`;

// Thêm CSS vào head
if (!document.getElementById('sidebarCustomCSS')) {
    const style = document.createElement('style');
    style.id = 'sidebarCustomCSS';
    style.textContent = sidebarCSS;
    document.head.appendChild(style);
}

// Global fallback để tránh lỗi
window.safeCloseSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
    
    return false;
};
