const express = require("express");
const app = express();
const port = 8000;  
const path = require('path');
const fs = require('fs');

require("./config/mongoose")
require('dotenv').config();

const cors = require("cors");
//Images
app.use('/images', express.static(path.join(__dirname, 'doctor', 'images')));
app.use('/images', express.static(path.join(__dirname, 'prescription', 'images')));
app.use('/images', express.static(path.join(__dirname, 'appointments', 'images')));
app.use('/images', express.static(path.join(__dirname, 'payment', 'images')));

app.use(express.json(), express.urlencoded({ extended: true }),cors());
 
//routes
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
//
const FindingsRoutes = require("./findings/findings_routes")
FindingsRoutes(app);
const PrescriptionRoutes = require("./prescription/prescription_routes")
PrescriptionRoutes(app);
const AppointmentRoutes = require('./appointments/appointment_routes')
AppointmentRoutes(app);



app.listen(port, () => console.log("\nThe server is all fired up on port 8000"));

