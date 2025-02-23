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

const countTodaysPatient = (req, res) => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());  // Start of today
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);  // Start of tomorrow

    // Filter appointments where the 'date' matches today's date
    Appointment.countDocuments({
        date: { $gte: start, $lt: end },  // Check if the appointment date is today
    })
        .then((todaysAppointments) => {
            res.json({ todaysAppointments });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong', error: err });
        });
};

const countOngoingPatient = (req, res) => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());  // Start of today
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);  // Start of tomorrow

    // Filter appointments where the 'date' matches today's date
    Appointment.countDocuments({
        date: { $gte: start, $lt: end },  // Check if the appointment date is today
        status: 'Ongoing'
    })
        .then((ongoingAppointments) => {
            res.json({ ongoingAppointments });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong', error: err });
        });
}


const countOnlineDoctors = (req, res) => {
    Doctors.countDocuments({ activityStatus: 'Online' })
        .then((onlineDoctors) => {
            res.json({ onlineDoctors });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong', error: err });
        });
}

const countInSessionDoctors = (req, res) => {
    Doctors.countDocuments({ activityStatus: 'In Session' })
        .then((insessionDoctors) => {
            res.json({ insessionDoctors });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong', error: err });
        });
}

const countPatientAgeGroup = async (req, res) => {
    try {
        const today = new Date();

        // Define age groups
        const ageGroups = [
            { label: 'Under 18', min: 0, max: 17 },
            { label: '18-24', min: 18, max: 24 },
            { label: '25-34', min: 25, max: 34 },
            { label: '35-44', min: 35, max: 44 },
            { label: '45-54', min: 45, max: 54 },
            { label: '55-64', min: 55, max: 64 },
            { label: 'Above 64', min: 65, max: 200 }
        ];

        // Query patients and group by age
        const patientCounts = await Promise.all(
            ageGroups.map(async (group) => {
                const count = await Patient.countDocuments({
                    patient_dob: { 
                        $gte: new Date(today.getFullYear() - group.max, today.getMonth(), today.getDate()),
                        $lt: new Date(today.getFullYear() - group.min, today.getMonth(), today.getDate())
                    }
                });
                return {
                    label: group.label,
                    count: count
                };
            })
        );

        res.json({ data: patientCounts });
    } catch (error) {
        console.error('Error counting patients by age group:', error);
        res.status(500).json({ message: 'Error counting patients by age group', error });
    }
};
    
    



module.exports = {
    countTotalPatients,
    countRegisteredPatients,
    countUnregisteredPatients,
    countTotalDoctors,
    countRegisteredDoctors,
    countReviewedDoctors,
    countTodaysPatient,
    countOngoingPatient,
    countOnlineDoctors,
    countInSessionDoctors,
    countPatientAgeGroup,

};
