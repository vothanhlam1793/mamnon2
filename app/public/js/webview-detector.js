(function() {
    function isSocialAppWebview() {
        const ua = navigator.userAgent.toLowerCase();
        
        // Detect Zalo
        if (ua.includes('zalo') && ua.includes('android')) return 'zalo';
        
        // Detect Messenger
        if (ua.includes('messenger') || (ua.includes('fban') && ua.includes('fbav'))) return 'messenger';
        
        // Detect Facebook app
        if (ua.includes('fbav')) return 'facebook';
        
        // Detect Viber
        if (ua.includes('viber')) return 'viber';
        
        // Detect Telegram
        if (ua.includes('telegram')) return 'telegram';
        
        // Detect Zalo iOS
        if (ua.includes('zalo') && ua.includes('iphone')) return 'zalo';
        
        return null;
    }

    function showBanner(appName) {
        // Remove existing banner if any
        const existing = document.getElementById('webview-banner');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.id = 'webview-banner';
        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
            color: white;
            padding: 15px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.2);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            flex-wrap: wrap;
            gap: 10px;
        `;

        const iconMap = {
            zalo: '💬',
            messenger: '💭',
            facebook: '📘',
            viber: '💜',
            telegram: '✈️'
        };

        const appLabel = {
            zalo: 'Zalo',
            messenger: 'Messenger',
            facebook: 'Facebook',
            viber: 'Viber',
            telegram: 'Telegram'
        };

        banner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 200px;">
                <span style="font-size: 24px;">${iconMap[appName] || '📱'}</span>
                <div>
                    <div style="font-weight: 600; font-size: 15px;">Đang mở trong ${appLabel[appName]} App</div>
                    <div style="font-size: 13px; opacity: 0.9;">Có thể xem camera bị lỗi. Nên mở bằng trình duyệt.</div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <button id="open-browser-btn" style="
                    background: white;
                    color: #d32f2f;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 14px;
                    white-space: nowrap;
                ">🌐 Mở bằng trình duyệt</button>
                <button id="close-banner-btn" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid white;
                    padding: 8px 15px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 14px;
                ">Đóng</button>
            </div>
        `;

        document.body.appendChild(banner);

        // Event: Open in browser
        document.getElementById('open-browser-btn').addEventListener('click', function() {
            const currentUrl = window.location.href;
            
            // Check if Android
            if (/android/i.test(navigator.userAgent)) {
                // Use intent to open in default browser
                window.location.href = 'intent://' + currentUrl.replace(/^https?:\/\//, '') + '#Intent;scheme=https;end';
            } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                // iOS - try to open in Safari
                window.location.href = currentUrl;
            } else {
                // Desktop or other - just open new tab
                window.open(currentUrl, '_system');
            }
        });

        // Event: Close banner
        document.getElementById('close-banner-btn').addEventListener('click', function() {
            banner.remove();
            // Save to localStorage to not show again for this session
            localStorage.setItem('webview-banner-dismissed', 'true');
        });
    }

    // Check on page load
    function init() {
        // Don't show if already dismissed
        if (localStorage.getItem('webview-banner-dismissed') === 'true') return;
        
        const app = isSocialAppWebview();
        if (app) {
            showBanner(app);
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();