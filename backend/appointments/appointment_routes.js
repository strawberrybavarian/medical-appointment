const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppointmentController = require('./appointment_controller');
console.log("Appointment routes connected");

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
    app.post('/api/patient/api/:uid/createappointment', upload.single('proofOfPayment'), AppointmentController.createAppointment);
    app.put('/api/appointments/:id/status', AppointmentController.updateAppointmentStatus);
    app.get('/api/appointments/:id', AppointmentController.getAppointmentById);
    app.put('/api/appointments/:appointmentId/assign', AppointmentController.updateAppointmentDetails);
    // app.put('/appointments/:id/payment-status', AppointmentController.updatePaymentStatus);
    app.get('/api/appointments/doctor/:doctorId/count', AppointmentController.countBookedPatients);
    app.post('/api/patient/api/:uid/createserviceappointment', AppointmentController.createServiceAppointment);
    app.put('/api/appointments/:id/followup', AppointmentController.updateFollowUpStatus);
    app.post('/api/appointments/:appointmentId/schedulefollowup', AppointmentController.updatePatientAppointmentDetails);
};
