//News Routes
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const NewsController = require('./news_controller');

// Use the same storage setup from announcements
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'images');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// File filter (JPEG/PNG)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('File type not supported'), false);
    }
};

// Multer middleware for handling images
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 25 * 1024 * 1024,
        fileSize: 10 * 1024 * 1024,
        files: 5,
    },
    fileFilter: fileFilter,
});

// News routes with file uploads and CRUD operations
module.exports = app => {
    app.get('/api/news/api/getnews/:id', NewsController.getNewsById);

    app.get('/api/news/api/getgeneralnews', NewsController.getGeneralNews);
    app.post('/api/news/api/addnews/:id', upload.array('images', 10), NewsController.addNewNewsByUserId);
    app.get('/api/news/api/finduser/:id/:role', NewsController.findNewsByUserId);
    app.get('/api/news/api/getallnews/:id/:role', NewsController.getAllNewsByUserId);
    app.delete('/api/news/api/deletenews/:id/:index', NewsController.deleteNewsByIndex);
    app.put('/api/news/api/updatenews/:userId/:newsId', upload.array('images'), NewsController.updateNewsAtIndex);
}