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
            bottom: 25px;
            left: 20px;
            right: 20px;
            background: #fff;
            color: #333;
            padding: 12px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            z-index: 999999;
            font-family: 'Nunito', sans-serif;
            border-radius: 18px;
            border-left: 5px solid #ff6b6b;
        `;

        const appLabel = {
            zalo: 'Zalo',
            messenger: 'Messenger',
            facebook: 'Facebook',
            viber: 'Viber',
            telegram: 'Telegram'
        };

        banner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <div style="font-size: 24px;">📱</div>
                <div style="display: flex; flex-direction: column;">
                    <div style="font-weight: 800; font-size: 14px; color: #ff6b6b;">Đang mở trong ${appLabel[appName]}</div>
                    <div style="font-size: 12px; color: #666; line-height: 1.2;">Mở bằng trình duyệt để xem mượt hơn bạn nhé!</div>
                </div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <button id="open-browser-btn" style="
                    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 20px;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 13px;
                    white-space: nowrap;
                    box-shadow: 0 4px 10px rgba(255,107,107,0.3);
                ">Mở ngay</button>
                <button id="close-banner-btn" style="
                    background: #f5f5f5;
                    color: #bbb;
                    border: none;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 16px;
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
                window.location.href = 'intent://' + currentUrl.replace(/^https?:\/\//, '') + '#Intent;scheme=https;end';
            } else {
                // For iOS, instead of alert, we show a nice hint with a pointing arrow
                banner.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                        <div style="font-size: 24px;">💡</div>
                        <div style="font-size: 13px; color: #444; font-weight: 600;">
                            Bấm vào dấu <span style="color:#ff6b6b; font-weight:800;">...</span> ở góc trên rồi chọn <span style="color:#ff6b6b; font-weight:800;">"Mở bằng Safari"</span> bạn nhé! ❤️
                        </div>
                    </div>
                    <button id="close-banner-btn-2" style="background: #f5f5f5; color: #bbb; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer;">×</button>
                `;
                
                // Add a floating pointer to the top right
                const pointer = document.createElement('div');
                pointer.id = 'webview-pointer';
                pointer.style.cssText = `
                    position: fixed;
                    top: 10px;
                    right: 15px;
                    font-size: 40px;
                    z-index: 1000000;
                    animation: bounce-point 1s infinite;
                    pointer-events: none;
                    text-shadow: 0 0 15px rgba(255,107,107,0.5);
                `;
                pointer.innerHTML = '👆';
                
                // Add animation style
                const style = document.createElement('style');
                style.innerHTML = `
                    @keyframes bounce-point {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-15px); }
                    }
                `;
                document.head.appendChild(style);
                document.body.appendChild(pointer);

                const closeHint = () => {
                    banner.remove();
                    pointer.remove();
                };

                document.getElementById('close-banner-btn-2').addEventListener('click', closeHint);
                setTimeout(closeHint, 10000); // Auto close after 10s
            }
        });

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
            bottom: 25px;
            left: 20px;
            right: 20px;
            background: #fff;
            padding: 12px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            z-index: 999998;
            font-family: 'Nunito', sans-serif;
            border-radius: 18px;
            border-left: 5px solid #4ecdc4;
        `;

        const content = isIOS ? `
            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <img src="images/student.png" style="width: 40px; height: 40px; border-radius: 10px;">
                <div style="display: flex; flex-direction: column;">
                    <div style="font-weight: 800; font-size: 14px; color: #4ecdc4;">Camera Mầm Non</div>
                    <div style="font-size: 11px; color: #666; line-height: 1.2;">Bấm <b>Chia sẻ 📤</b> rồi chọn <b>'Thêm vào MH chính'</b> để xem nhanh nhé! 🌸</div>
                </div>
            </div>
        ` : `
            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <img src="images/student.png" style="width: 40px; height: 40px; border-radius: 10px;">
                <div style="display: flex; flex-direction: column;">
                    <div style="font-weight: 800; font-size: 14px; color: #4ecdc4;">Camera Mầm Non</div>
                    <div style="font-size: 11px; color: #666; line-height: 1.2;">Cài đặt để xem camera tiện lợi và nhận thông báo nhé! 🍓</div>
                </div>
            </div>
            <button id="install-pwa-btn" style="
                background: linear-gradient(135deg, #4ecdc4 0%, #45b7af 100%);
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 20px;
                font-weight: 700;
                cursor: pointer;
                font-size: 13px;
                white-space: nowrap;
                box-shadow: 0 4px 10px rgba(78,205,196,0.3);
            ">Cài đặt</button>
        `;

        prompt.innerHTML = content + `
            <button id="close-pwa-prompt" style="
                background: #f5f5f5;
                color: #bbb;
                border: none;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                margin-left: 8px;
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
