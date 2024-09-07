const Findings = require('./findings_model');
const Patient = require('../patient/patient_model');
const Appointment = require('../appointments/appointment_model')
//Creation of FIndings
const createFindings = async (req, res) => {
    try {
        // Check if a findings document already exists for the appointment
        let findings = await Findings.findOne({ patient: req.body.patient, appointment: req.body.appointment });

        if (findings) {
            // If findings exist, update the existing document
            findings = await Findings.findByIdAndUpdate(
                findings._id,
                req.body,
                { new: true }
            );

            res.status(200).json(findings);
        } else {
            // If no findings exist, create a new document
            const newFindings = new Findings(req.body);
            await newFindings.save();

            // Push the new findings to the patient_findings array
            await Patient.findByIdAndUpdate(req.body.patient, {
                $push: { patient_findings: newFindings._id }
            });

            // Update the appointment with the new findings ID
            await Appointment.findByIdAndUpdate(req.body.appointment, {
                findings: newFindings._id
            });

            res.status(200).json(newFindings);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving findings' });
    }
};


// Get a specific Finding by ID
const getOneFindings = async (req, res) => {
    try {
        const findings = await Appointment.findById(req.params.id)
            .populate('patient')
            .populate('doctor')
            .populate('findings')
            .populate('prescription');
        
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
