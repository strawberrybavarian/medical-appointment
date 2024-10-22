const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AnnouncementController = require('./announcement_controller');
console.log("Announcement routes connected");

//For Images


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

// Set up a file filter to allow only certain file types
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('File type not supported'), false);
    }
};

// Create the upload middleware with multer to handle multiple file uploads
const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 25 * 1024 * 1024,  // 25MB for text fields (content)
        fileSize: 10 * 1024 * 1024,   // 10MB per file
        files: 5,                     // Max number of files
    }
});



module.exports = app => {
    app.post('/api/doctor/api/addpost/:id', upload.array('images', 10), AnnouncementController.addNewPostById);

  app.get('/api/doctor/api/finduser/:id', AnnouncementController.findDoctorById);
  app.get('/api/doctor/api/post/getallpost/:id', AnnouncementController.getAllPostbyId);
  app.delete('/api/doctor/api/post/deletepost/:id/:postId', AnnouncementController.findPostByIdDelete);


  app.put('/api/doctor/api/post/updatepost/:doctorId/:postId', upload.array('images'), AnnouncementController.updatePostAtIndex);

};
