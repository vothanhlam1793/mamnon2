const MongoStore = require('connect-mongo');
const { MongoClient } = require('mongodb');


// Lưu trữ để phiên hoạt động chạy
// console.log(process.env);
if(process.env.WINDOWS){
    var db = new MongoClient(process.env.MONGO_URL_SESSION,{
        auth: {
            "username": "black",
            "password": "asrkpvg7"
        },
        authSource: "admin",
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
} else {
    var db = new MongoClient(process.env.MONGO_URL_SESSION,{
        auth: {
            "user": "black",
            "password": "asrkpvg7"
        },
        authSource: "admin",
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}


// Nơi lúu trữ
exports.Session = {
    sessionStore: MongoStore.create({ 
        clientPromise: db.connect()
    })
}


exports.Cookie = {
    cookie: {
        secure: false,
        // secure: process.env.NODE_ENV === 'production', // Default to true in production
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        sameSite: false,
    }    
}

