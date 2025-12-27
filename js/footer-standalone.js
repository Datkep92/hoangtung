// footer-standalone.js - HOÀN TOÀN ĐỘC LẬP
// Tạo footer chân trang động, chỉ cần include file này

class StandaloneFooter {
    constructor(options = {}) {
        this.options = {
            companyName: 'HTU Transport',
            phoneNumber: '0567033888',
            email: 'cskh@htutransport.com',
            address: 'TP. Nha Trang, Khánh Hòa',
            copyrightYear: new Date().getFullYear(),
            designer: 'Datkep92',
            socialLinks: {
                facebook: 'https://facebook.com/htutransport',
                zalo: 'https://zalo.me/0567033888',
                email: 'mailto:cskh@htutransport.com',
                phone: 'tel:0567033888'
            },
            quickLinks: [
                { text: 'Admin Panel', url: 'admin.html', icon: 'fas fa-cog' },
                { text: 'Chính sách bảo mật', url: 'privacy-policy.html', icon: 'fas fa-shield-alt' },
                { text: 'Điều khoản dịch vụ', url: 'terms-of-service.html', icon: 'fas fa-file-contract' }
            ],
            ...options
        };

        this.createFooter();
        this.injectFooterCSS();
        this.bindContactAnchor();

        console.log('🚀 Standalone Footer initialized');
    }

    createFooter() {
        if (document.getElementById('standaloneFooter')) return;

        const footerHTML = `
            <footer class="standalone-footer" 
                    id="contact"
                    role="contentinfo"
                    aria-label="Liên hệ">
                <div class="standalone-footer-container">

                    <div class="standalone-footer-top">
                        <div class="standalone-footer-section" itemscope itemtype="https://schema.org/Organization">
                            <div class="standalone-footer-logo">
                                <i class="fas fa-crown"></i>
                                <span>${this.options.companyName}<span>Transport</span></span>
                            </div>
                            <p class="standalone-footer-desc">
                                Đơn vị vận tải cao cấp hàng đầu khu vực miền Trung - Tây Nguyên
                            </p>
                            <div class="standalone-social-links">
                                ${this.renderSocialLinks()}
                            </div>
                        </div>

                        <div class="standalone-footer-section">
                            <h4 class="standalone-footer-heading">Liên Hệ</h4>
                            <div class="standalone-contact-info">
                                <p><i class="fas fa-phone-alt"></i>
                                    <a href="tel:${this.options.phoneNumber}">
                                        ${this.formatPhone(this.options.phoneNumber)}
                                    </a>
                                </p>
                                <p><i class="fas fa-map-marker-alt"></i>${this.options.address}</p>
                                <p><i class="fas fa-clock"></i>Hoạt động 24/7</p>
                                <p><i class="fas fa-envelope"></i>
                                    <a href="mailto:${this.options.email}">
                                        ${this.options.email}
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div class="standalone-footer-section">
                            <h4 class="standalone-footer-heading">Hệ Thống</h4>
                            <ul class="standalone-footer-links">
                                ${this.renderQuickLinks()}
                            </ul>
                        </div>

                        <div class="standalone-footer-section">
                            <h4 class="standalone-footer-heading">Dịch Vụ</h4>
                            <ul class="standalone-footer-services">
                                <li><i class="fas fa-plane"></i> Đưa đón sân bay</li>
                                <li><i class="fas fa-car"></i> Xe du lịch</li>
                                <li><i class="fas fa-calendar-alt"></i> Xe hợp đồng</li>
                                <li><i class="fas fa-heart"></i> Xe cưới</li>
                                <li><i class="fas fa-bus"></i> Đưa đón công ty</li>
                            </ul>
                        </div>
                    </div>

                    <div class="standalone-footer-divider">
                        <div class="divider-line"></div>
                        <div class="divider-icon"><i class="fas fa-car"></i></div>
                        <div class="divider-line"></div>
                    </div>

                    <div class="standalone-footer-bottom">
                        <div class="standalone-copyright">
                            <p>© ${this.options.copyrightYear} ${this.options.companyName}</p>
                            <p class="standalone-copyright-note">
                                Thiết kế bởi ${this.options.designer}
                            </p>
                        </div>
                    </div>

                </div>
            </footer>
        `;

        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }

    bindContactAnchor() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href="#contact"]');
            if (!link) return;

            e.preventDefault();

            const tryScroll = () => {
                const footer = document.getElementById('contact');
                if (footer) {
                    footer.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    return true;
                }
                return false;
            };

            if (!tryScroll()) {
                let count = 0;
                const timer = setInterval(() => {
                    if (tryScroll() || ++count > 20) {
                        clearInterval(timer);
                    }
                }, 100);
            }
        });
    }

    renderSocialLinks() {
        const s = this.options.socialLinks;
        return `
            <a href="${s.facebook}" target="_blank"><i class="fab fa-facebook-f"></i></a>
            <a href="${s.zalo}" target="_blank"><span class="standalone-zalo-icon">Z</span></a>
            <a href="${s.email}"><i class="fas fa-envelope"></i></a>
            <a href="${s.phone}"><i class="fas fa-phone-alt"></i></a>
        `;
    }

    renderQuickLinks() {
        return this.options.quickLinks.map(l => `
            <li>
                <a href="${l.url}">
                    <i class="${l.icon}"></i> ${l.text}
                </a>
            </li>
        `).join('');
    }

    formatPhone(p) {
        return p.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3');
    }

    injectFooterCSS() {
        if (document.getElementById('standalone-footer-css')) return;
        
        const css = `
            /* Standalone Footer CSS */
            .standalone-footer {
                background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
                color: var(--text-primary);
                padding: 60px 0 30px;
                position: relative;
                margin-top: 80px;
                border-top: 1px solid rgba(212, 175, 55, 0.3);
            }
            
            .standalone-footer::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    var(--champagne) 50%, 
                    transparent 100%);
            }
            
            .standalone-footer-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 20px;
                position: relative;
            }
            
            /* Footer Top */
            .standalone-footer-top {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 40px;
                margin-bottom: 40px;
            }
            
            @media (max-width: 768px) {
                .standalone-footer-top {
                    grid-template-columns: 1fr;
                    gap: 30px;
                }
            }
            
            /* Footer Section */
            .standalone-footer-section {
                animation: fadeInUp 0.6s ease;
            }
            
            .standalone-footer-logo {
                display: flex;
                align-items: center;
                gap: 12px;
                color: var(--champagne);
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 15px;
            }
            
            .standalone-footer-logo i {
                font-size: 28px;
            }
            
            .standalone-footer-logo span span {
                color: #fff;
                font-weight: 400;
            }
            
            .standalone-footer-desc {
                color: var(--text-secondary);
                font-size: 14px;
                line-height: 1.6;
                margin-bottom: 20px;
            }
            
            /* Social Links */
            .standalone-social-links {
                display: flex;
                gap: 15px;
                margin-top: 20px;
            }
            
            .standalone-social-link {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.05);
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-primary);
                font-size: 18px;
                transition: all 0.3s ease;
                text-decoration: none;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .standalone-social-link:hover {
                background: var(--champagne);
                color: var(--primary-black);
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
            }
            
            .standalone-zalo-icon {
                font-weight: 700;
                font-size: 16px;
                color: #0068FF;
            }
            
            .standalone-social-link:hover .standalone-zalo-icon {
                color: var(--primary-black);
            }
            
            /* Footer Headings */
            .standalone-footer-heading {
                color: var(--champagne);
                font-size: 18px;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid rgba(212, 175, 55, 0.3);
                position: relative;
            }
            
            .standalone-footer-heading::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                width: 40px;
                height: 2px;
                background: var(--champagne);
            }
            
            /* Contact Info */
            .standalone-contact-info p {
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--text-secondary);
                font-size: 14px;
            }
            
            .standalone-contact-info i {
                color: var(--champagne);
                width: 20px;
                text-align: center;
            }
            
            .standalone-contact-info a {
                color: var(--text-primary);
                text-decoration: none;
                transition: color 0.3s ease;
            }
            
            .standalone-contact-info a:hover {
                color: var(--champagne);
            }
            
            /* Footer Links */
            .standalone-footer-links,
            .standalone-footer-services {
                list-style: none;
                padding: 0;
            }
            
            .standalone-footer-links li,
            .standalone-footer-services li {
                margin-bottom: 12px;
                animation: fadeInUp 0.6s ease;
                animation-fill-mode: both;
            }
            
            .standalone-footer-links li:nth-child(1) { animation-delay: 0.1s; }
            .standalone-footer-links li:nth-child(2) { animation-delay: 0.2s; }
            .standalone-footer-links li:nth-child(3) { animation-delay: 0.3s; }
            
            .standalone-footer-link {
                color: var(--text-secondary);
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: all 0.3s ease;
                font-size: 14px;
            }
            
            .standalone-footer-link:hover {
                color: var(--champagne);
                transform: translateX(5px);
            }
            
            .standalone-footer-link i {
                color: var(--champagne);
                font-size: 12px;
                width: 20px;
            }
            
            .standalone-footer-services li {
                color: var(--text-secondary);
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 14px;
            }
            
            .standalone-footer-services i {
                color: var(--champagne);
                font-size: 12px;
                width: 20px;
            }
            
            /* Footer Divider */
            .standalone-footer-divider {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px;
                margin: 30px 0;
                opacity: 0.5;
            }
            
            .divider-line {
                flex: 1;
                height: 1px;
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(212, 175, 55, 0.5) 50%, 
                    transparent 100%);
            }
            
            .divider-icon {
                color: var(--champagne);
                font-size: 18px;
            }
            
            /* Footer Bottom */
            .standalone-footer-bottom {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 20px;
                padding-top: 30px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            @media (max-width: 768px) {
                .standalone-footer-bottom {
                    flex-direction: column;
                    text-align: center;
                }
            }
            
            /* Copyright */
            .standalone-copyright {
                color: var(--text-tertiary);
                font-size: 13px;
            }
            
            .standalone-copyright p {
                margin-bottom: 5px;
            }
            
            .standalone-copyright-note {
                font-size: 12px;
                opacity: 0.7;
            }
            
            /* Payment Methods */
            .standalone-payment-methods {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .payment-title {
                color: var(--text-tertiary);
                font-size: 12px;
            }
            
            .payment-icons {
                display: flex;
                gap: 10px;
            }
            
            .payment-icons i {
                color: var(--text-secondary);
                font-size: 20px;
                transition: color 0.3s ease;
            }
            
            .payment-icons i:hover {
                color: var(--champagne);
            }
            
            /* Back to Top Button */
            .standalone-back-to-top {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                background: rgba(212, 175, 55, 0.9);
                border: none;
                border-radius: 50%;
                color: var(--primary-black);
                font-size: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999;
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px);
                box-shadow: 0 5px 20px rgba(212, 175, 55, 0.3);
            }
            
            .standalone-back-to-top.visible {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .standalone-back-to-top:hover {
                background: var(--champagne);
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(212, 175, 55, 0.5);
            }
            
            /* Animations */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Basic CSS Variables */
            :root {
                --champagne: #d4af37;
                --primary-black: #0a0a0a;
                --text-primary: #ffffff;
                --text-secondary: #cccccc;
                --text-tertiary: #999999;
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'standalone-footer-css';
        style.textContent = css;
        document.head.appendChild(style);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StandaloneFooter({
        companyName: 'Hà Tùng',
        designer: 'Datkep92'
    });
});
