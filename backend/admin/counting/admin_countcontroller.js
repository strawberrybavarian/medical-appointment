const mongoose = require('mongoose');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Appointment = require('../appointments/appointment_model');
const Doctors = require('../doctor/doctor_model');
const Patient = require('../../patient/patient_model');
const Notification = require('../notifications/notifications_model')
const Admin = require('../admin_model')
hehe
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

const getAppointmentStats = (req, res) => {
    Appointment.aggregate([
        {
            $match: {
                status: { $in: ['Completed', 'Scheduled', 'Pending', 'Cancelled'] }
            }
        },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                status: "$_id",
                count: 1
            }
        }
    ])
    .then(stats => {
        res.json(stats);
    })
    .catch(err => {
        res.status(500).json({ message: 'Something went wrong', error: err });
    });
};


module.exports = {
    countTotalPatients,
    countRegisteredPatients,
    countUnregisteredPatients,
    getAppointmentStats
};
