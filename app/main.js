const express = require("express"); 
var logger = require('morgan')
const app = express();
// const fileUpload = require('express-fileupload');
const path = require('path')

function middle(keystone, dev, distDir){
    // Log
    app.use(logger('dev'));
    
    // View enjine
    app.set('views', __dirname + "/views");
    app.set('view engine', 'ejs')

    // Setup path static public
    app.use(express.static(path.join(__dirname,'public')));

    // Another
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Route
    app.use("/", require("./route/index")(keystone));

    // Trả về giá trị app
    return app;
}

module.exports.middle = middle;