const express = require("express");
var logger = require('morgan')
const app = express();
const fileUpload = require('express-fileupload');
const path = require('path')

function middle(keystone, dev, distDir){
    // Log
    app.use(logger('dev'));

    // File upload
    app.use(fileUpload({
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
        abortOnLimit: true,
        useTempFiles: true,
        tempFileDir: '/tmp/'
    }));

    // View engine
    app.set('views', __dirname + "/views");
    app.set('view engine', 'ejs')

    // Setup path static public
    app.use(express.static(path.join(__dirname,'public')));

    // Another
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Upload route (public - no auth required, admin will use this)
    app.post('/upload', (req, res) => {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.files.file;
        const ext = path.extname(file.name).toLowerCase();
        const allowedExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

        if (!allowedExts.includes(ext)) {
            return res.status(400).json({ error: 'Only images allowed (png, jpg, gif, webp, svg)' });
        }

        const filename = `logo_${Date.now()}${ext}`;
        const uploadPath = path.join(__dirname, 'public', 'uploads', filename);

        file.mv(uploadPath, (err) => {
            if (err) {
                console.error('Upload error:', err);
                return res.status(500).json({ error: 'Upload failed' });
            }
            res.json({ url: `/uploads/${filename}` });
        });
    });

    // Route
    app.use("/", require("./route/index")(keystone));

    // Trả về giá trị app
    return app;
}

module.exports.middle = middle;
