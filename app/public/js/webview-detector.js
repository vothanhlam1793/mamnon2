(function() {
    let deferredPrompt;

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
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: #fff;
            color: #333;
            padding: 15px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            z-index: 999999;
            font-family: 'Nunito', sans-serif;
            border-radius: 20px;
            border: 2px solid #ff6b6b;
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
                <span style="font-size: 28px;">${iconMap[appName] || '📱'}</span>
                <div>
                    <div style="font-weight: 700; font-size: 16px; color: #ff6b6b;">Đang mở trong ${appLabel[appName]}</div>
                    <div style="font-size: 13px; color: #666;">Mở bằng trình duyệt để xem camera mượt hơn nhé! ✨</div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <button id="open-browser-btn" style="
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 14px;
                    white-space: nowrap;
                    box-shadow: 0 4px 10px rgba(255,107,107,0.3);
                ">🌐 Mở trình duyệt</button>
                <button id="close-banner-btn" style="
                    background: #f0f0f0;
                    color: #999;
                    border: none;
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">×</button>
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
                // iOS - Instruction for Safari
                alert('Vui lòng copy link này và mở bằng trình duyệt Safari nhé! ❤️\n\n' + currentUrl);
            } else {
                window.open(currentUrl, '_blank');
            }
        });

        // Event: Close banner
        document.getElementById('close-banner-btn').addEventListener('click', function() {
            banner.remove();
            localStorage.setItem('webview-banner-dismissed', 'true');
        });
    }

    function showInstallPrompt() {
        if (localStorage.getItem('pwa-prompt-dismissed') === 'true') return;
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) return;

        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const prompt = document.createElement('div');
        prompt.id = 'pwa-install-prompt';
        prompt.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: #fff;
            color: #333;
            padding: 15px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            z-index: 999998;
            font-family: 'Nunito', sans-serif;
            border-radius: 20px;
            border: 2px solid #4ecdc4;
            flex-wrap: wrap;
            gap: 10px;
        `;

        const content = isIOS ? `
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                <img src="images/student.png" style="width: 45px; height: 45px; border-radius: 10px;">
                <div>
                    <div style="font-weight: 700; font-size: 15px; color: #4ecdc4;">Thêm vào màn hình chính</div>
                    <div style="font-size: 12px; color: #666;">Bấm <span style="font-weight: bold;">Chia sẻ 📤</span> rồi chọn <span style="font-weight: bold;">'Thêm vào MH chính'</span> để xem camera nhanh hơn nhé! 🌸</div>
                </div>
            </div>
        ` : `
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                <img src="images/student.png" style="width: 45px; height: 45px; border-radius: 10px;">
                <div>
                    <div style="font-weight: 700; font-size: 15px; color: #4ecdc4;">Cài đặt ứng dụng Mầm Non</div>
                    <div style="font-size: 12px; color: #666;">Cài đặt để nhận thông báo và xem camera tiện lợi hơn! 🍓</div>
                </div>
            </div>
            <button id="install-pwa-btn" style="
                background: #4ecdc4;
                color: white;
                border: none;
                padding: 10px 18px;
                border-radius: 25px;
                font-weight: 700;
                cursor: pointer;
                font-size: 14px;
                white-space: nowrap;
                box-shadow: 0 4px 10px rgba(78,205,196,0.3);
            ">Cài đặt ngay</button>
        `;

        prompt.innerHTML = content + `
            <button id="close-pwa-prompt" style="
                background: #f0f0f0;
                color: #999;
                border: none;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">×</button>
        `;

        document.body.appendChild(prompt);

        const installBtn = document.getElementById('install-pwa-btn');
        if (installBtn && deferredPrompt) {
            installBtn.addEventListener('click', async () => {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    prompt.remove();
                }
                deferredPrompt = null;
            });
        }

        document.getElementById('close-pwa-prompt').addEventListener('click', () => {
            prompt.remove();
            localStorage.setItem('pwa-prompt-dismissed', 'true');
        });
    }

    // Event listener for PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        // Show the custom prompt
        showInstallPrompt();
    });

    // Check on page load
    function init() {
        const socialApp = isSocialAppWebview();
        if (socialApp) {
            showBanner(socialApp);
        } else {
            // If not in social app, check for PWA install (iOS case or previously triggered Android)
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isIOS) {
                setTimeout(showInstallPrompt, 2000); // Delay for iOS to not be intrusive
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();