// Basic
const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');

// Auth - Methods
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');

// Init data first start server
const initialiseData = require('./initial-data');

// Data base
const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');

// Setting
const PROJECT_NAME = 'Mầm non';
const adapterConfig = { mongoUri: 'mongodb://localhost/mamnon' };

// Cookie, Session
const { Session, Cookie } = require("./setting/session");

// Khởi tạo keystone
const keystone = new Keystone({
  adapter: new Adapter(adapterConfig),
  onConnect: process.env.CREATE_TABLES !== 'true' && initialiseData,
  sessionStore: Session.sessionStore,
  cookie: Cookie.cookie,
  cookieSecret: "CHUNGTANGHIRANGNOLAMOTTHONGSOCANPHAICAITHIEN"
});

// List
const User = require("./lists/User");


// Tạo list user
keystone.createList('User', User);
// keystone.createList('User', User);
// keystone.createList('User', User);

// Khởi tạo bảo mật
const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  config: { protectIdentities: process.env.NODE_ENV === 'production' },
});

class CretaApp {
  prepareMiddleware({ keystone, dev, distDir }) {
    return require("./app/main").middle(keystone, dev, distDir);
  }
}


// Khởi tạo ứng dụng
module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      name: PROJECT_NAME,
      enableDefaultRoute: false,
      authStrategy,
    }),
    new CretaApp()
  ],
};
