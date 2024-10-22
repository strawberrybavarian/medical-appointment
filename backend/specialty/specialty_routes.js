// File: specialty_routes.js

const SpecialtyController = require('./specialty_controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

console.log('Specialty Routes Connected');

// Configure storage for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'images'); // Adjust the path to your 'images' directory
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/gif' ||
        file.mimetype === 'image/webp'
    ) {
        cb(null, true);
    } else {
        cb(new Error('File type not supported'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

module.exports = app => {
    app.post('/api/admin/specialty/add', upload.single('image'), SpecialtyController.addSpecialty);
    app.get('/api/admin/specialties', SpecialtyController.getSpecialties);
    app.put('/api/admin/specialty/update', upload.single('image'), SpecialtyController.updateSpecialty);
    app.delete('/api/admin/specialty/delete/:specialtyId', SpecialtyController.deleteSpecialty);
};
