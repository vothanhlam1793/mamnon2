/**
 * ============================================
 * CONFIG - Cấu hình cho từng trường
 * ============================================
 * Clone dự án này → sửa .env → xong!
 *
 * Quy tắc:
 * - .env → config kỹ thuật (db, port, secret)
 * - School DB → config hiển thị (tên, logo, màu)
 */

require('dotenv').config();

const PROJECT_NAME_DEFAULT = 'Mầm Non';
const PORT = process.env.PORT || 3000;
const COOKIE_SECRET = process.env.COOKIE_SECRET;

// MongoDB credentials
const MONGO_URL = process.env.MONGO_URL;
const MONGO_URL_SESSION = process.env.MONGO_URL_SESSION || MONGO_URL;
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASS = process.env.MONGO_PASS;
const MONGO_AUTH_SOURCE = process.env.MONGO_AUTH_SOURCE || 'admin';

// App info mặc định (sẽ bị override bởi School trong DB)
const APP_TITLE = process.env.APP_TITLE || 'Camera Mầm Non';
const APP_COLOR = process.env.APP_COLOR || '#ff6b6b';
const APP_LOGO = process.env.APP_LOGO || '/images/student.png';

// Validation
function validateConfig() {
  const errors = [];

  const required = {
    MONGO_URL,
    MONGO_USER,
    MONGO_PASS,
    MONGO_AUTH_SOURCE,
    COOKIE_SECRET,
  };
  Object.entries(required).forEach(([name, value]) => {
    if (!value) errors.push(`${name} chưa được set trong environment`);
  });

  if (errors.length > 0) {
    console.error('\n=== CONFIG ERROR ===');
    errors.forEach(e => console.error(e));
    console.error('===================\n');
    throw new Error('Config validation failed');
  }
}

module.exports = {
  // Server
  PORT,

  // Security
  COOKIE_SECRET,

  // Database
  mongoConfig: {
    mongoUri: MONGO_URL,
    user: MONGO_USER,
    pass: MONGO_PASS,
    authSource: MONGO_AUTH_SOURCE,
  },
  mongoSessionUri: MONGO_URL_SESSION,

  // App defaults (sẽ được override bởi School trong DB)
  app: {
    title: APP_TITLE,
    color: APP_COLOR,
    logo: APP_LOGO,
  },

  // Helper
  validate: validateConfig,
};
