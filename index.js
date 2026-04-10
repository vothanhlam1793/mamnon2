/**
 * ============================================
 * MAMNON2 - Camera Mầm Non Platform
 * Entry point - Khởi tạo KeystoneJS
 * ============================================
 * Cấu hình theo từng trường qua:
 * - .env → config kỹ thuật (db, port, secret)
 * - School DB → config hiển thị (tên, logo, màu)
 */

const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');

// Init data first start server
const initialiseData = require('./initial-data');

// Load config
const config = require('./config');

// Cookie, Session
const { Session, Cookie } = require("./setting/session");

// Khởi tạo Keystone
const keystone = new Keystone({
  adapter: new MongooseAdapter(config.mongoConfig),
  onConnect: process.env.CREATE_TABLES !== 'true' && initialiseData,
  sessionStore: Session.sessionStore,
  cookie: Cookie.cookie,
  cookieSecret: config.COOKIE_SECRET,
});

// =============================================
// SCHEMAS (Database Models)
// =============================================
const User = require("./lists/User");
const Camera = require("./lists/Camera");
const LopHoc = require("./lists/LopHoc");
const School = require("./lists/School");
const Meta = require("./lists/Meta");
const Notify = require("./lists/Notify");
const Setting = require("./lists/Setting");

keystone.createList('User', User);
keystone.createList('Camera', Camera);
keystone.createList('LopHoc', LopHoc);
keystone.createList('School', School);
keystone.createList('Meta', Meta);
keystone.createList('Notify', Notify);
keystone.createList('Setting', Setting);

// =============================================
// AUTHENTICATION
// =============================================
const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  config: {
    identityField: 'username',
    secretField: 'password',
  },
});

// =============================================
// CUSTOM EXPRESS MIDDLEWARE
// =============================================
class CreateApp {
  prepareMiddleware({ keystone, dev, distDir }) {
    return require("./app/main").middle(keystone, dev, distDir);
  }
}

// =============================================
// EXPORT
// =============================================
module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      name: 'Mầm Non Admin',
      enableDefaultRoute: false,
      authStrategy,
    }),
    new CreateApp()
  ],
};
