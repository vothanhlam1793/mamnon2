const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://camerangochoang.com';
const USERNAME = '0932032732';
const PASSWORD = '0932032732';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots-eval');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function screenshot(page, name) {
  const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`📸 Screenshot: ${name}.png`);
  return filePath;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  // ===== 1. Trang login =====
  console.log('\n=== 1. TRANG LOGIN ===');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await screenshot(page, '01-login-page');

  // In HTML của login form để phân tích
  const loginHTML = await page.content();
  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'login-page.html'), loginHTML);

  // ===== 2. Đăng nhập =====
  console.log('\n=== 2. ĐĂNG NHẬP ===');
  try {
    // Tìm input username/password
    await page.waitForSelector('input', { timeout: 5000 });
    const inputs = await page.$$('input');
    console.log(`Tìm thấy ${inputs.length} input fields`);

    // Điền thông tin đăng nhập
    await page.fill('input[type="text"], input[name="username"], input[name="phone"], input:first-of-type', USERNAME);
    await page.fill('input[type="password"]', PASSWORD);
    await screenshot(page, '02-login-filled');

    // Click đăng nhập
    await page.click('button[type="submit"], input[type="submit"], button:has-text("Đăng nhập")');
    await page.waitForTimeout(3000);
    await screenshot(page, '03-after-login');
    console.log('URL sau login:', page.url());
  } catch (e) {
    console.error('Lỗi login:', e.message);
    await screenshot(page, '02-login-error');
  }

  // ===== 3. Trang chủ sau login =====
  console.log('\n=== 3. TRANG CHỦ SAU LOGIN ===');
  const currentURL = page.url();
  console.log('Current URL:', currentURL);
  const afterLoginHTML = await page.content();
  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'after-login.html'), afterLoginHTML);

  // Phân tích layout
  const layoutInfo = await page.evaluate(() => {
    const body = document.body;
    const nav = document.querySelector('nav, header, .navbar, .header, .menu');
    const main = document.querySelector('main, .main, .content, #content');
    const footer = document.querySelector('footer, .footer');
    const videos = document.querySelectorAll('video');
    const cameras = document.querySelectorAll('.camera, [class*="camera"], [class*="cam"]');
    const colors = [];
    
    // Lấy màu nền chính
    const bgColor = window.getComputedStyle(body).backgroundColor;
    const fontColor = window.getComputedStyle(body).color;
    
    return {
      title: document.title,
      hasNav: !!nav,
      navText: nav ? nav.innerText.substring(0, 200) : null,
      hasMain: !!main,
      hasFooter: !!footer,
      videoCount: videos.length,
      cameraCount: cameras.length,
      bgColor,
      fontColor,
      bodyClasses: body.className,
      headings: Array.from(document.querySelectorAll('h1,h2,h3')).map(h => h.innerText).slice(0, 10),
      links: Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText.trim(), href: a.href })).slice(0, 20),
      allClasses: [...new Set(Array.from(document.querySelectorAll('*')).flatMap(el => [...el.classList]))].slice(0, 50),
    };
  });
  console.log('Layout info:', JSON.stringify(layoutInfo, null, 2));

  // ===== 4. Duyệt các trang =====
  console.log('\n=== 4. DUYỆT CÁC TRANG ===');
  const pagesToVisit = [
    { url: BASE_URL + '/', name: '04-homepage' },
    { url: BASE_URL + '/manage', name: '05-manage' },
    { url: BASE_URL + '/manage/notify', name: '06-manage-notify' },
    { url: BASE_URL + '/info', name: '07-info' },
  ];

  for (const p of pagesToVisit) {
    try {
      console.log(`Truy cập: ${p.url}`);
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(2000);
      await screenshot(page, p.name);
      
      const info = await page.evaluate(() => ({
        title: document.title,
        url: window.location.href,
        headings: Array.from(document.querySelectorAll('h1,h2,h3,h4')).map(h => h.innerText.trim()).filter(Boolean),
        videoCount: document.querySelectorAll('video').length,
        hasHLS: !!window.Hls || document.querySelector('script[src*="hls"]') !== null,
      }));
      console.log(`  -> Title: ${info.title}, Videos: ${info.videoCount}, HLS: ${info.hasHLS}`);
      console.log(`  -> Headings:`, info.headings);
    } catch (e) {
      console.log(`  -> Lỗi: ${e.message}`);
    }
  }

  // ===== 5. Kiểm tra trang camera =====
  console.log('\n=== 5. KIỂM TRA CAMERA ===');
  try {
    // Thử tìm link camera từ homepage
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const cameraLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.innerText.trim(),
        href: a.href
      })).filter(a => a.href && a.href.includes('camera') || a.text.toLowerCase().includes('camera') || a.text.includes('xem'));
    });
    console.log('Camera links:', cameraLinks);

    // Lấy tất cả links để phân tích
    const allLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.innerText.trim(),
        href: a.href
      })).filter(a => a.href && a.text);
    });
    console.log('All links:', allLinks);

    // Thử trang camera trực tiếp
    await page.goto(BASE_URL + '/camera', { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(3000);
    await screenshot(page, '08-camera-page');
    
    const cameraInfo = await page.evaluate(() => {
      const video = document.querySelector('video');
      return {
        hasVideo: !!video,
        videoSrc: video ? video.src : null,
        videoStyle: video ? window.getComputedStyle(video).cssText : null,
        hasHLS: typeof Hls !== 'undefined',
        scripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src),
        pageHTML: document.body.innerHTML.substring(0, 2000),
      };
    });
    console.log('Camera page info:', JSON.stringify(cameraInfo, null, 2));
  } catch (e) {
    console.log('Lỗi kiểm tra camera:', e.message);
  }

  // ===== 6. Viewport mobile =====
  console.log('\n=== 6. KIỂM TRA MOBILE ===');
  await context.close();
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-mobile-login.png'), fullPage: true });
  
  // Login mobile
  try {
    await mobilePage.fill('input[type="text"], input:first-of-type', USERNAME);
    await mobilePage.fill('input[type="password"]', PASSWORD);
    await mobilePage.click('button[type="submit"], button:has-text("Đăng nhập")');
    await mobilePage.waitForTimeout(3000);
    await mobilePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '10-mobile-home.png'), fullPage: true });
    console.log('Mobile home URL:', mobilePage.url());
  } catch (e) {
    console.log('Lỗi mobile login:', e.message);
  }

  await mobileContext.close();
  await browser.close();

  console.log('\n=== HOÀN THÀNH ===');
  console.log(`Screenshots lưu tại: ${SCREENSHOTS_DIR}`);
  
  // Liệt kê các file đã tạo
  const files = fs.readdirSync(SCREENSHOTS_DIR);
  console.log('Files tạo ra:', files);
})();
