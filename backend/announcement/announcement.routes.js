const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AnnouncementController = require('./announcement_controller');
console.log("Announcement routes connected");

//For Images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'images');  // Changed from 'images' to 'uploads' for clarity
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('File type not supported'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = app => {
    app.post('/doctor/api/addpost/:id', AnnouncementController.addNewPostById);
  app.get('/doctor/api/finduser/:id', AnnouncementController.findDoctorById);
  app.get('/doctor/api/post/getallpost/:id', AnnouncementController.getAllPostbyId);
  app.delete('/doctor/api/post/deletepost/:id/:index', AnnouncementController.findPostByIdDelete);
  app.put('/doctor/api/post/updatepost/:id/:index', AnnouncementController.updatePostAtIndex);
};
