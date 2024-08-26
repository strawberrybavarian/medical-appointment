const Findings = require('./findings_model');
const Patient = require('../patient/patient_model');
const Appointment = require('../appointments/appointment_model')
//Creation of FIndings
const createFindings = async (req, res) => {

        const newFindings = new Findings(req.body);
        newFindings.save();
        res.status(200).json(newFindings);

        //Pushing to patient_findings ID
        await Patient.findByIdAndUpdate(req.body.patient, {
            $push: { patient_findings: newFindings._id }
        });

        await Appointment.findByIdAndUpdate(req.body.appointment, {
            findings: newFindings._id 
        });
    
};

// Get a specific Finding by ID
const getOneFindings = async (req, res) => {
    try {
        const findings = await Findings.findById(req.params.id)
            .populate('patient')
            .populate('appointment')
            .populate('doctor');
        
        if (!findings) {
            return res.status(404).json({ message: 'Findings not found' });
        }

        res.status(200).json(findings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a specific Finding by ID
const updateFindings = async (req, res) => {
    try {
        const updatedFindings = await Findings.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedFindings) {
            return res.status(404).json({ message: 'Findings not found' });
        }

        res.status(200).json(updatedFindings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a specific Finding by ID
const deleteFindings = async (req, res) => {
    try {
        const deletedFindings = await Findings.findByIdAndDelete(req.params.id);

        if (!deletedFindings) {
            return res.status(404).json({ message: 'Findings not found' });
        }

        // Remove the deleted finding from the patient's findings array
        await Patient.findByIdAndUpdate(deletedFindings.patient, {
            $pull: { patient_findings: deletedFindings._id }
        });

        res.status(200).json({ message: 'Findings deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createFindings,
    getOneFindings,
    updateFindings,
    deleteFindings
};
