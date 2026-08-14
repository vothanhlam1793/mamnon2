const MongoStore = require('connect-mongo');
const { MongoClient } = require('mongodb');

const mongoUrl = process.env.MONGO_URL_SESSION || process.env.MONGO_URL;

const db = new MongoClient(mongoUrl, {
  auth: {
    username: process.env.MONGO_USER,
    password: process.env.MONGO_PASS
  },
  authSource: process.env.MONGO_AUTH_SOURCE || "admin",
  useNewUrlParser: true,
  useUnifiedTopology: true
});

exports.Session = {
  sessionStore: MongoStore.create({
    clientPromise: db.connect()
  })
}

exports.Cookie = {
  cookie: {
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: 1000 * 60 * 60 * 24 * 30,
    sameSite: false,
  }
}
