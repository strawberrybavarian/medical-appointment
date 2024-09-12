const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ImmunizationController = require('./immunization_controller');
console.log('Immunization routes connected');

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

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('File type not supported'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = app => {
    // Create Immunization Route
    app.post('/api/immunization', ImmunizationController.createImmunization);

    // Delete Immunization Route
    app.delete('/api/immunization/delete/:id', ImmunizationController.deleteImmunization);
    app.put('/api/immunization/update/:id', ImmunizationController.updateImmunization);
};
