// seo-helper.js - Tự động SEO optimization
class SEOHelper {
    constructor() {
        this.apiEndpoints = {
            googleIndexing: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
            bingSubmit: 'https://www.bing.com/webmaster/api.svc/json/SubmitUrl'
        };
    }

    // Tự động thêm URL blog vào sitemap
    async updateSitemapWithBlogPosts(blogPosts) {
        try {
            console.log('📝 Updating sitemap with blog posts:', Object.keys(blogPosts).length);
            
            // Tạo XML entries
            const entries = this.generateBlogSitemapEntries(blogPosts);
            
            // Log cho developer
            console.log('✅ Generated sitemap entries for blog posts');
            console.log('📊 Add this to your sitemap.xml manually:');
            console.log(entries);
            
            return true;
        } catch (error) {
            console.error('❌ Error updating sitemap:', error);
            return false;
        }
    }

    generateBlogSitemapEntries(posts) {
        let entries = '';
        
        Object.entries(posts).forEach(([postId, post]) => {
            const url = `https://htutransport.com/blog.html?post=${postId}`;
            const date = post.date || new Date().toISOString().split('T')[0];
            
            entries += `    <url>
        <loc>${url}</loc>
        <lastmod>${date}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
        <image:image>
            <image:loc>${post.image}</image:loc>
            <image:title>${post.title}</image:title>
            <image:caption>${post.excerpt}</image:caption>
        </image:image>
    </url>\n`;
        });
        
        return entries;
    }

    // Thêm JSON-LD cho Breadcrumb động
    addDynamicBreadcrumb(pageType, pageTitle) {
        const breadcrumbSchema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Trang chủ",
                    "item": "https://htutransport.com/"
                }
            ]
        };

        if (pageType === 'blog') {
            breadcrumbSchema.itemListElement.push({
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://htutransport.com/blog.html"
            });
            
            if (pageTitle) {
                breadcrumbSchema.itemListElement.push({
                    "@type": "ListItem",
                    "position": 3,
                    "name": pageTitle,
                    "item": window.location.href
                });
            }
        }

        // Thêm vào head
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(breadcrumbSchema);
        document.head.appendChild(script);
        
        console.log('✅ Added dynamic breadcrumb schema');
    }

    // Tối ưu hình ảnh lazy loading
    optimizeImages() {
        let optimizedCount = 0;
        
        document.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
                optimizedCount++;
            }
            if (!img.hasAttribute('decoding')) {
                img.setAttribute('decoding', 'async');
            }
            
            // Thêm width và height nếu có data
            if (!img.hasAttribute('width') && !img.hasAttribute('height')) {
                const originalSrc = img.src;
                const tempImg = new Image();
                tempImg.onload = function() {
                    img.setAttribute('width', this.width);
                    img.setAttribute('height', this.height);
                };
                tempImg.src = originalSrc;
            }
            
            // Thêm error handling
            img.onerror = function() {
                this.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800';
                console.warn('⚠️ Image failed to load, using fallback:', this.alt);
            };
        });
        
        console.log(`✅ Optimized ${optimizedCount} images with lazy loading`);
    }

    // Thêm sự kiện tracking cho SEO
    setupSEOTracking() {
        // Track internal clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.href.includes(window.location.origin)) {
                this.trackEvent('internal_link_click', {
                    url: link.href,
                    text: link.textContent.trim().substring(0, 100),
                    timestamp: Date.now()
                });
            }
        });

        // Track time on page
        let timeStart = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - timeStart) / 1000);
            this.trackEvent('page_time_spent', {
                url: window.location.href,
                seconds: timeSpent,
                timestamp: Date.now()
            });
        });

        // Track scroll depth
        let scrollDepth = {
            25: false,
            50: false,
            75: false,
            100: false
        };

        const trackScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercentage = scrollHeight > 0 ? Math.round((window.scrollY / scrollHeight) * 100) : 0;
            
            Object.keys(scrollDepth).forEach(depth => {
                if (scrollPercentage >= parseInt(depth) && !scrollDepth[depth]) {
                    scrollDepth[depth] = true;
                    this.trackEvent('scroll_depth', {
                        url: window.location.href,
                        depth: `${depth}%`,
                        timestamp: Date.now()
                    });
                }
            });
        };

        // Debounce scroll tracking
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(trackScroll, 100);
        });

        console.log('✅ SEO tracking initialized');
    }

    trackEvent(eventName, data) {
        // Có thể gửi đến Google Analytics hoặc Firebase
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                ...data,
                page_location: window.location.href,
                page_title: document.title
            });
        }
        
        // Gửi đến Firebase nếu có
        if (typeof database !== 'undefined' && database) {
            const eventRef = database.ref(`seo_events/${Date.now()}`);
            eventRef.set({
                event: eventName,
                ...data,
                user_agent: navigator.userAgent.substring(0, 200),
                referrer: document.referrer,
                screen_resolution: `${window.screen.width}x${window.screen.height}`,
                language: navigator.language
            }).catch(err => console.error('Firebase tracking error:', err));
        }
        
        console.log(`📊 SEO Event: ${eventName}`, data);
    }

    // Thêm meta tags động cho mạng xã hội
    updateSocialMetaTags(data) {
        const metaTags = {
            'og:title': data.title || document.title,
            'og:description': data.description || document.querySelector('meta[name="description"]')?.content || '',
            'og:image': data.image || document.querySelector('meta[property="og:image"]')?.content || '',
            'og:url': window.location.href,
            'twitter:title': data.title || document.title,
            'twitter:description': data.description || document.querySelector('meta[name="description"]')?.content || '',
            'twitter:image': data.image || document.querySelector('meta[property="og:image"]')?.content || ''
        };

        Object.entries(metaTags).forEach(([property, content]) => {
            if (content && content.trim()) {
                let tag = document.querySelector(`meta[property="${property}"]`) || 
                          document.querySelector(`meta[name="${property}"]`);
                
                if (!tag) {
                    tag = document.createElement('meta');
                    if (property.startsWith('og:')) {
                        tag.setAttribute('property', property);
                    } else {
                        tag.setAttribute('name', property);
                    }
                    document.head.appendChild(tag);
                }
                tag.setAttribute('content', content);
            }
        });
        
        console.log('✅ Updated social meta tags:', metaTags);
    }

    // Kiểm tra Core Web Vitals
    checkCoreWebVitals() {
        // First Contentful Paint (FCP)
        const fcpObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                console.log('🎨 FCP:', entry.startTime);
                this.trackEvent('web_vital_fcp', {
                    value: entry.startTime,
                    url: window.location.href
                });
            }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('📊 LCP:', lastEntry.startTime);
            this.trackEvent('web_vital_lcp', {
                value: lastEntry.startTime,
                url: window.location.href,
                element: lastEntry.element?.tagName || 'unknown'
            });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        let clsEntries = [];
        
        const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    clsEntries.push(entry);
                }
            }
            
            if (clsEntries.length > 0) {
                console.log('📐 CLS:', clsValue);
                this.trackEvent('web_vital_cls', {
                    value: clsValue,
                    url: window.location.href,
                    entries_count: clsEntries.length
                });
            }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        console.log('✅ Core Web Vitals monitoring initialized');
    }

    // Thêm canonical URL động
    addCanonicalUrl(url) {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = url;
        
        console.log('✅ Added canonical URL:', url);
    }

    // Kiểm tra và sửa broken links
    checkBrokenLinks() {
        const links = document.querySelectorAll('a[href]');
        let brokenCount = 0;
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Kiểm tra internal links
            if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }
            
            // Kiểm tra external links có target="_blank"
            if (href.includes('://') && !href.includes(window.location.hostname)) {
                if (!link.hasAttribute('rel')) {
                    link.setAttribute('rel', 'noopener noreferrer');
                }
                if (!link.hasAttribute('target')) {
                    link.setAttribute('target', '_blank');
                }
            }
            
            // Kiểm tra internal links missing .html
            if (href.startsWith('/') || (!href.includes('://') && !href.includes('.html') && !href.includes('#'))) {
                console.warn('⚠️ Potential broken link:', href, 'in', link);
                brokenCount++;
            }
        });
        
        if (brokenCount > 0) {
            console.warn(`⚠️ Found ${brokenCount} potential broken links`);
        } else {
            console.log('✅ No broken links found');
        }
    }
}

// Khởi tạo SEO Helper
let seoHelper = new SEOHelper();

// Export
window.SEOHelper = seoHelper;

// Auto-initialize khi DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Chờ 1 giây để các scripts khác load
    setTimeout(() => {
        if (window.SEOHelper) {
            // Chỉ chạy trên các trang chính
            if (!window.location.pathname.includes('admin') && 
                !window.location.pathname.includes('test')) {
                
                window.SEOHelper.optimizeImages();
                window.SEOHelper.setupSEOTracking();
                window.SEOHelper.checkCoreWebVitals();
                window.SEOHelper.checkBrokenLinks();
                
                // Kiểm tra các trang đặc biệt
                if (window.location.pathname.includes('blog.html')) {
                    const urlParams = new URLSearchParams(window.location.search);
                    const postId = urlParams.get('post');
                    if (postId) {
                        // Đảm bảo canonical URL đúng
                        window.SEOHelper.addCanonicalUrl(window.location.href.split('?')[0] + `?post=${postId}`);
                    }
                }
            }
        }
    }, 1000);
});