const mongoose = require('mongoose');
const MedicalSecretary = require('../../medicalsecretary/medicalsecretary_model');
const Appointment = require('../../appointments/appointment_model');
const Doctors = require('../../doctor/doctor_model');
const Patient = require('../../patient/patient_model');
const Notification = require('../../notifications/notifications_model')
const Admin = require('../admin_model')

//Patients
const countTotalPatients = (req, res) => {
    Patient.countDocuments()
        .then((totalPatients) => {
            res.json({ totalPatients });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong', error: err });
        });
};

const countRegisteredPatients = (req, res) => {
    Patient.countDocuments({ accountStatus: 'Registered' })
        .then((registeredPatients) => {
            res.json({ registeredPatients });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong', error: err });
        });
};

const countUnregisteredPatients = (req, res) => {
    Patient.countDocuments({ accountStatus: 'Unregistered' })
        .then((unregisteredPatients) => {
            res.json({ unregisteredPatients });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong', error: err });
        });
};

//Doctors
const countTotalDoctors = (req, res) => {
    Doctors.countDocuments()
        .then((totalDoctors) => {
            res.json({ totalDoctors});
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong', error: err });
        });
}

const countReviewedDoctors = (req, res) => {
    Doctors.countDocuments({ accountStatus: 'Review' })
        .then((reviewedDoctors) => {
            res.json({ reviewedDoctors });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong', error: err });
        });
};


const countRegisteredDoctors = (req, res) => {
    Doctors.countDocuments({ accountStatus: 'Registered' })
        .then((registeredDoctors) => {
            res.json({ registeredDoctors });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong', error: err });
        });
};



module.exports = {
    countTotalPatients,
    countRegisteredPatients,
    countUnregisteredPatients,
    countTotalDoctors,
    countRegisteredDoctors,
    countReviewedDoctors,

};
