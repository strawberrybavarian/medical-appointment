const Findings = require('./findings_model');
const Patient = require('../patient/patient_model');
const Appointment = require('../appointments/appointment_model')
//Creation of FIndings
const createFindings = async (req, res) => {
    try {
        const findingsData = req.body;

        console.log('Received findingsData:', findingsData);

        // Ensure all required fields are present
        if (!findingsData.patient || !findingsData.appointment || !findingsData.doctor) {
            console.error('Missing required fields:', findingsData);
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if a findings document already exists for the appointment
        let findings = await Findings.findOne({ patient: findingsData.patient, appointment: findingsData.appointment });

        if (findings) {
            // Update the existing findings document
            findings = await Findings.findByIdAndUpdate(
                findings._id,
                findingsData,
                { new: true, runValidators: true }
            );

            if (!findings) {
                console.error('Failed to update findings:', findingsData);
                return res.status(404).json({ message: 'Findings not found for update' });
            }

            return res.status(200).json(findings);
        } else {
            // Create a new findings document
            const newFindings = new Findings(findingsData);
            await newFindings.save();

            // Update related entities
            const patientUpdate = await Patient.findByIdAndUpdate(findingsData.patient, {
                $push: { patient_findings: newFindings._id }
            });

            const appointmentUpdate = await Appointment.findByIdAndUpdate(findingsData.appointment, {
                findings: newFindings._id
            });

            if (!patientUpdate || !appointmentUpdate) {
                console.error('Failed to update related entities:', {
                    patientUpdate,
                    appointmentUpdate
                });
                return res.status(500).json({ message: 'Failed to update related entities' });
            }

            return res.status(200).json(newFindings);
        }
    } catch (error) {
        console.error('Error in createFindings controller:', error);
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
            .populate('prescription')
            .populate('immunization');
        
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
