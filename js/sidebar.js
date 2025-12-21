// ===== SIDEBAR MODULE =====

class SidebarManager {
    constructor() {
        this.isOpen = false;
        this.statisticsEngine = null;
        this.updateInterval = null;
        this.userSessionId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.lastUpdateTime = null;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.toggleSidebar = this.toggleSidebar.bind(this);
        this.closeSidebar = this.closeSidebar.bind(this);
        this.renderSidebarContent = this.renderSidebarContent.bind(this);
        this.updateStatistics = this.updateStatistics.bind(this);
        this.registerUserSession = this.registerUserSession.bind(this);
        this.calculateSmartStatistics = this.calculateSmartStatistics.bind(this);
    }
    
    async init() {
        console.log("🚀 Initializing Sidebar Manager...");
        
        // Initialize Firebase structure
        await this.initializeFirebaseStructure();
        
        // Register user session
        await this.registerUserSession();
        
        // Setup DOM elements
        this.setupDOMElements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start statistics updates
        this.startStatisticsUpdates();
        
        // Initial render
        await this.updateStatistics();
        
        console.log("✅ Sidebar Manager initialized");
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
    
    toggleSidebar() {
        if (this.isOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }
    
    openSidebar() {
        this.isOpen = true;
        this.sidebar.classList.add('active');
        this.sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Update statistics when opening
        this.updateStatistics();
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
            // Initialize statistics structure if not exists
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
            
            // Update session activity every minute
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
        // Clear existing interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Update every 30 seconds
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
            
            // Get statistics config
            const configSnapshot = await database.ref('statistics/config').once('value');
            const config = configSnapshot.val();
            
            if (!config) {
                this.showErrorMessage("Không tải được cấu hình");
                return;
            }
            
            // Calculate smart statistics
            const calculatedStats = this.calculateSmartStatistics(config);
            
            // Get real data
            const realData = await this.getRealStatistics();
            
            // Merge data (prefer real data when available)
            const finalStats = {
                current_online: realData?.real_online > 0 ? realData.real_online : calculatedStats.online,
                bookings_today: realData?.real_bookings > 0 ? realData.real_bookings : calculatedStats.bookings,
                available_cars: calculatedStats.available_cars,
                is_peak_hour: calculatedStats.is_peak_hour,
                updated_at: Date.now()
            };
            
            // Check for manual overrides
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
            
            // Save to Firebase if auto_update is enabled or forced
            if (config.auto_update || forceRefresh) {
                await database.ref('statistics/live').set(finalStats);
            }
            
            // Update UI
            this.updateUI(finalStats);
            
            // Update last update time
            this.lastUpdateTime = new Date();
            if (this.lastUpdateTimeEl) {
                const timeStr = this.lastUpdateTime.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                this.lastUpdateTimeEl.textContent = timeStr;
            }
            
            // Update online badge
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
        const isWeekend = [0, 6].includes(now.getDay()); // 0=Sunday, 6=Saturday
        
        // Determine hour multiplier
        let hourMultiplier = 1.0;
        if (hour >= 0 && hour < 6) hourMultiplier = config.hourly_multipliers["00-06"] || 0.2;
        else if (hour >= 6 && hour < 9) hourMultiplier = config.hourly_multipliers["06-09"] || 0.6;
        else if (hour >= 9 && hour < 12) hourMultiplier = config.hourly_multipliers["09-12"] || 0.9;
        else if (hour >= 12 && hour < 14) hourMultiplier = config.hourly_multipliers["12-14"] || 1.0;
        else if (hour >= 14 && hour < 18) hourMultiplier = config.hourly_multipliers["14-18"] || 1.2;
        else if (hour >= 18 && hour < 21) hourMultiplier = config.hourly_multipliers["18-21"] || 1.5;
        else hourMultiplier = config.hourly_multipliers["21-24"] || 0.8;
        
        // Apply weekend boost
        if (isWeekend) {
            hourMultiplier *= (config.weekend_boost || 1.3);
        }
        
        // Calculate with random variation
        const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 - 1.1
        const online = Math.round(config.base_online * hourMultiplier * randomFactor);
        
        const bookingRandomFactor = 0.8 + Math.random() * 0.4; // 0.8 - 1.2
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
            // Count real online users (active in last 5 minutes)
            const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
            const sessionsSnapshot = await database.ref('user_sessions').once('value');
            const sessions = sessionsSnapshot.val() || {};
            
            const realOnline = Object.values(sessions).filter(session => 
                session.last_active > fiveMinutesAgo
            ).length;
            
            // Count today's bookings
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
        
        // Render sidebar content
        this.sidebarContent.innerHTML = this.renderSidebarContent(stats);
        
        // Setup interactive elements
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
            
            <!-- Quick Routes -->
            <div class="stats-section">
                <h4><i class="fas fa-route"></i> TUYẾN PHỔ BIẾN</h4>
                
                <div class="quick-route-item">
                    <div class="route-header">
                        <div class="route-icon">
                            <i class="fas fa-plane"></i>
                        </div>
                        <div class="route-title">Sân bay Cam Ranh → Nha Trang</div>
                    </div>
                    <div class="route-details">
                        <span class="route-distance">
                            <i class="fas fa-road"></i> 40km • 50 phút
                        </span>
                        <span class="route-price">
                            <i class="fas fa-tag"></i> 450.000đ
                        </span>
                    </div>
                </div>
                
                <div class="quick-route-item">
                    <div class="route-header">
                        <div class="route-icon">
                            <i class="fas fa-umbrella-beach"></i>
                        </div>
                        <div class="route-title">Bãi biển → Vinpearl Land</div>
                    </div>
                    <div class="route-details">
                        <span class="route-distance">
                            <i class="fas fa-road"></i> 8km • 15 phút
                        </span>
                        <span class="route-price">
                            <i class="fas fa-tag"></i> 150.000đ
                        </span>
                    </div>
                </div>
                
                <div class="quick-route-item">
                    <div class="route-header">
                        <div class="route-icon">
                            <i class="fas fa-hotel"></i>
                        </div>
                        <div class="route-title">KS 5* → Sân bay</div>
                    </div>
                    <div class="route-details">
                        <span class="route-distance">
                            <i class="fas fa-road"></i> 15km • 25 phút
                        </span>
                        <span class="route-price">
                            <i class="fas fa-tag"></i> 300.000đ
                        </span>
                    </div>
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
                    <div class="setting-item active" data-theme="dark">
                        <div class="setting-icon">
                            <i class="fas fa-moon"></i>
                        </div>
                        <div class="setting-label">Chế độ tối</div>
                    </div>
                    
                    <div class="setting-item" data-theme="light">
                        <div class="setting-icon">
                            <i class="fas fa-sun"></i>
                        </div>
                        <div class="setting-label">Chế độ sáng</div>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <div class="setting-label" style="margin-bottom: 10px; text-align: center;">Cỡ chữ</div>
                    <div class="font-size-controls">
                        <button class="font-size-btn" data-size="small">S</button>
                        <button class="font-size-btn active" data-size="medium">M</button>
                        <button class="font-size-btn" data-size="large">L</button>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="stats-section">
                <h4><i class="fas fa-bolt"></i> HÀNH ĐỘNG NHANH</h4>
                
                <div style="display: grid; gap: 10px; margin-top: 15px;">
                    <a href="#booking" class="btn btn-primary" style="width: 100%; text-align: center; padding: 12px;" onclick="window.sidebarManager.closeSidebar()">
                        <i class="fas fa-calendar-alt"></i> Đặt xe ngay
                    </a>
                    
                    <a href="tel:0931243679" class="btn btn-outline" style="width: 100%; text-align: center; padding: 12px;">
                        <i class="fas fa-phone-alt"></i> Gọi: 0931.243.679
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
        
        // Quick route click handlers
        const routeItems = this.sidebarContent.querySelectorAll('.quick-route-item');
        routeItems.forEach((item, index) => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                const routes = [
                    { from: 'Sân bay Cam Ranh', to: 'Nha Trang', price: '450.000đ' },
                    { from: 'Bãi biển', to: 'Vinpearl Land', price: '150.000đ' },
                    { from: 'KS 5*', to: 'Sân bay', price: '300.000đ' }
                ];
                
                if (index < routes.length) {
                    const route = routes[index];
                    alert(`📌 Tuyến đường: ${route.from} → ${route.to}\n💵 Giá: ${route.price}\n\n📞 Liên hệ đặt xe: 0931.243.679`);
                }
            });
        });
        
        // Car item click handlers
        const carItems = this.sidebarContent.querySelectorAll('.car-item');
        carItems.forEach(item => {
            item.addEventListener('click', () => {
                const carName = item.querySelector('.car-name').textContent;
                const status = item.classList.contains('available') ? 'Sẵn sàng' : 'Đã đặt';
                alert(`🚗 ${carName}\n📊 Trạng thái: ${status}\n\n📞 Liên hệ đặt xe: 0931.243.679`);
            });
        });
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
                    <button class="btn btn-secondary" onclick="window.sidebarManager.updateStatistics(true)" style="margin-top: 15px;">
                        <i class="fas fa-redo"></i> Thử lại
                    </button>
                </div>
            `;
        }
    }
    
    // Public method to manually refresh
    refresh() {
        this.updateStatistics(true);
    }
}

// Initialize sidebar manager when DOM is ready
let sidebarManager = null;

document.addEventListener('DOMContentLoaded', () => {
    sidebarManager = new SidebarManager();
    
    // Initialize after a short delay to ensure Firebase is ready
    setTimeout(() => {
        sidebarManager.init();
    }, 1000);
});

// Make it globally available
window.sidebarManager = sidebarManager;