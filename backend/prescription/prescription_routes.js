const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PrescriptionController = require('./prescription_controller')
console.log("Prescription routes connected");


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
    app.post('/api/doctor/api/createPrescription/:patientId/:appointmentId', upload.single('image'), PrescriptionController.createPrescription);
};