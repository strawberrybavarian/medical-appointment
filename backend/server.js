const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const { ensurePatientSession, ensureDoctorSession } = require('./SessionMiddleware');
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});
require('dotenv').config();

app.use(session({
    secret: 'your_secret_key', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));
// Database and environment setup
require("./config/mongoose");
require('dotenv').config();

// CORS Configuration
const cors = require('cors');
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
    // Remove credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

 // Adjust the path as needed


// Static file serving for images
app.use('/images', express.static(path.join(__dirname, 'doctor', 'images')));
app.use('/images', express.static(path.join(__dirname, 'patient', 'images')));
app.use('/images', express.static(path.join(__dirname, 'prescription', 'images')));
app.use('/images', express.static(path.join(__dirname, 'appointments', 'images')));
app.use('/images', express.static(path.join(__dirname, 'payment', 'images')));

// Static file serving for uploaded PDFs
app.use('/uploads', cors({
    
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}), express.static(path.join(__dirname, 'public/uploads')));

// Generic route for serving files from /uploads, including PDFs
app.get('/uploads/:filename', (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, 'public/uploads', fileName);

    // Check if the file exists
    if (fs.existsSync(filePath)) {
        // Set Content-Type for PDF and inline disposition for in-browser viewing
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

        // Stream the file to the response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } else {
        res.status(404).send('File not found.');
    }
});
app.use(express.static(path.join(__dirname, '../frontend/public')));
// app.use(express.static(path.join(__dirname, '../frontend/build')));
// Routes for your other resources (appointments, etc.)
const DoctorRoutes = require("./doctor/doctor_routes");
DoctorRoutes(app);
const PatientRoutes = require("./patient/patient_routes");
PatientRoutes(app);
const MedicalSecretaryRoutes = require("./medicalsecretary/medicalsecretary_routes");
MedicalSecretaryRoutes(app);
const CashierRoutes = require("./cashier/cashier_routes");
CashierRoutes(app);
const AdminRoutes = require('./admin/admin_routes');
AdminRoutes(app);

const FindingsRoutes = require("./findings/findings_routes");
FindingsRoutes(app);
const PrescriptionRoutes = require("./prescription/prescription_routes");
PrescriptionRoutes(app);
const AppointmentRoutes = require('./appointments/appointment_routes');
AppointmentRoutes(app);
const AnnouncementRoutes = require('./announcement/announcement.routes');
AnnouncementRoutes(app);
const ImmunizationRoutes = require('./immunization/immunization_routes');
ImmunizationRoutes(app);
const NewsRoutes = require('./news/news_routes');
NewsRoutes(app);
const LaboratoryRoutes = require('./laboratory/laboratory_routes');
LaboratoryRoutes(app);
const SpecialtyRoutes = require('./specialty/specialty_routes');
SpecialtyRoutes(app);
const ServiceRoutes = require('./services/service_routes');
ServiceRoutes(app);
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
});
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
// });

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
  });
