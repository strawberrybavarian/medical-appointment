const Patient = require('../models/patient_model');

const newPatient = (req, res) => {
    Patient.create(req.body)
        .then((newPatient) => {
            res.json({ newPatient: newPatient,status:"Patient successfully inserted" })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err })
        });
}
 
const findAllPatient = (req, res) => {
    Patient.find()
        .then((allDaPatient) => {
            res.json({ thePatient: allDaPatient })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err })
        });
}
 
const findPatientByName = (req, res) => {
    Patient.findOne({p_name:req.params.pname})
        .then((thePatient) => {
            res.json({ thePatient })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err })
        });
}

const findPatientBySchedule = (req, res) => {
    Patient.find({p_schedule:req.params.schedule})
        .then((thePatient) => {
            res.json({ thePatient })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err })
        });
}

const findPatientByEmail = (req, res) => {
    Patient.findOne({p_email:req.params.pemail})
        .then((thePatient) => {
            res.json({ thePatient })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err })
        });
}

 
const findPatientByTemperature = (req, res) => {
    Patient.find({p_temp:req.params.ptemp})
        .then((thePatient) => {
            res.json({ thePatient})
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err })
        });
}
 
const findPatientByBloodType = (req, res) => {
    Patient.find({p_bloodtype:req.params.bloodtype})
        .then((thePatient) => {
            res.json({ thePatient })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err })
        });
}

const findPatientByHealthStatus = (req, res) => {
    Patient.find({p_healthstatus:req.params.healthstatus})
        .then((thePatient) => {
            res.json({ thePatient })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err })
        });
}

const findPatientByAccept = (req, res) => {
    Patient.find({p_action:req.params.action})
        .then((thePatient) => {
            res.json({ thePatient })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err })
        });
}

const findPatientByDecline = (req, res) => {
    Patient.find({p_action:req.params.action})
        .then((thePatient) => {
            res.json({ thePatient })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err })
        });
}

const findPatientByIdDelete = (req, res) => {
    Patient.findByIdAndDelete({_id:req.params.id})
        .then((deletedPatient) => {
            res.json({ thePatient: deletedPatient, message:"Successfully deleted the entry" })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err })
        });
}
 
const acceptPatient = (req, res) => {
    Patient.findById({_id:req.params.id},req.body,
        { new: true, runValidators: true })
        .then((acceptPatient) => {
            res.json({ acceptPatient: acceptPatient,status:"successfully accepted the patient" })
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err })
        });
}

module.exports = {
    newPatient,
    findAllPatient,
    findPatientByName,
    findPatientBySchedule,
    findPatientByEmail,
    findPatientByTemperature,
    findPatientByBloodType,
    findPatientByHealthStatus,
    findPatientByAccept,
    findPatientByDecline,
    acceptPatient,
    findPatientByIdDelete
}