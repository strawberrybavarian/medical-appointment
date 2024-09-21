const mongoose = require('mongoose');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Appointment = require('../appointments/appointment_model');
const Doctors = require('../doctor/doctor_model');
const Patient = require('../patient/patient_model');
const Notification = require('../notifications/notifications_model')
const Admin = require('./admin_model')
const Services = require('../services/service_model')
const Specialty = require('../specialty/specialty_model')


const confirmDeactivation = async (req, res) => {
    try {
        const { confirm } = req.body; // true for approval, false for rejection

        // Find and update the doctor's deactivation request status
        const doctor = await Doctors.findByIdAndUpdate(
            req.params.doctorId,
            { 
                deactivationRequest: { 
                    confirmed: confirm,
                    requested: false
                },
                activeAppointmentStatus: !confirm // If confirmed, set activeAppointmentStatus to false
            },
            { new: true }
        );

        // Notify the doctor of the result (this can be through an email, notification, etc.)
        console.log(`Deactivation ${confirm ? 'approved' : 'rejected'} for Doctor ${doctor.dr_firstName} ${doctor.dr_lastName}`);

        res.status(200).json({ message: `Deactivation ${confirm ? 'approved' : 'rejected'}`, doctor });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getDeactivationRequests = async (req, res) => {
    try {
        const requests = await Doctors.find({ 'deactivationRequest.requested': true });
        res.status(200).json(requests);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



const NewAdminSignUp = (req, res) => {
    Admin.create(req.body)
        .then((newAdmin) => {
             res.json({ newAdmin: newAdmin, status: "Successfully registered Admin." });
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong. Please try again.', error: err });
        });
};

const updateDoctorAccountStatus = (req, res) => {
    const { doctorId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Review', 'Registered', 'Deactivated', 'Deleted'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    Doctors.findByIdAndUpdate(
        doctorId,
        { accountStatus: status },
        { new: true }
    )
    .then((updatedDoctor) => {
        if (!updatedDoctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json({ updatedDoctor, status: `Doctor status has been successfully updated to ${status}.` });
    })
    .catch((err) => {
        res.status(500).json({ message: 'Something went wrong. Please try again.', error: err });
    });
};

const findAllAdmin = (req,res) => {
    Admin.find()
        .then((allAdmin)=>{
            res.json({theAdmin: allAdmin});
        })
        .catch((err) => {
            res.json({message: 'Something went wrong', error: err})
        })
}
//Doctors 
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

const getCompletedAppointmentsByMonth = (req, res) => {
    Appointment.aggregate([
        {
            $match: {
                status: 'Completed'
            }
        },
        {
            $group: {
                _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                month: "$_id.month",
                year: "$_id.year",
                count: 1
            }
        },
        {
            $sort: { year: 1, month: 1 }
        }
    ])
    .then(stats => {
        res.json(stats);
    })
    .catch(err => {
        res.status(500).json({ message: 'Something went wrong', error: err });
    });
};


const getDoctorSpecialtyStats = (req, res) => {
    Doctors.aggregate([
        {
            $group: {
                _id: "$dr_specialty",
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                specialty: "$_id",
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

const updatePatientAccountStatus = (req, res) => {
    const { patientId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Registered', 'Unregistered', 'Deactivated', 'Deleted'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    Patient.findByIdAndUpdate(
        patientId,
        { accountStatus: status },
        { new: true }
    )
    .then((updatedPatient) => {
        if (!updatedPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json({ updatedPatient, status: `Patient status has been successfully updated to ${status}.` });
    })
    .catch((err) => {
        res.status(500).json({ message: 'Something went wrong. Please try again.', error: err });
    });
};




module.exports = {
    NewAdminSignUp,
    findAllAdmin,
    getAppointmentStats,
    getDoctorSpecialtyStats,
    getCompletedAppointmentsByMonth,
    updateDoctorAccountStatus,
    updatePatientAccountStatus,
    confirmDeactivation,
    getDeactivationRequests


};
