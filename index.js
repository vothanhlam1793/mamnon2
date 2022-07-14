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
// const adapterConfig = { mongoUri: 'mongodb://localhost/mamnon' };

// File enviroment
const dotenv = require('dotenv')
dotenv.config()

const adapterConfig = { 
  mongoUri: process.env.MONGO_URL,
  "user": process.env.MONGO_USER,
  "pass": process.env.MONGO_PASS,
  authSource: process.env.MONGO_AUTH_SOURCE,
  useNewUrlParser: true,
  useUnifiedTopology: true
};

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
const Camera = require("./lists/Camera");
const LopHoc = require("./lists/LopHoc");
const School = require("./lists/School");
const Meta = require("./lists/Meta");


// Tạo list user
keystone.createList('User', User);
keystone.createList('Camera', Camera);
keystone.createList('LopHoc', LopHoc);
keystone.createList('School', School);
keystone.createList('Meta', Meta);

// Khởi tạo bảo mật
const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  config: {
    identityField: 'username',
    secretField: 'password',
  },
  // config: { protectIdentities: process.env.NODE_ENV === 'production' },
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
