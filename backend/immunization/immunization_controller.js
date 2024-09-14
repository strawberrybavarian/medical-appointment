const Prescription = require('../prescription/prescription_model');
const Appointment = require('../appointments/appointment_model')
const Patient = require('../patient/patient_model')
const Doctors = require('../doctor/doctor_model')
const Immunization = require('./immunization_model')


const createImmunization = async (req, res) => {
    try {
        console.log('Received data:', req.body); // Log the incoming data
        
        const { vaccineName, patientId, appointments, administeredBy, dateAdministered, doseNumber, totalDoses, lotNumber, siteOfAdministration, routeOfAdministration, notes } = req.body;

        // Validate required fields
        if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
            return res.status(400).json({ message: 'At least one appointment ID is required' });
        }
        if (!patientId || !administeredBy || !vaccineName) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newImmunization = new Immunization({
            vaccineName,
            patientId,
            administeredBy,
            dateAdministered,
            doseNumber,
            totalDoses,
            lotNumber,
            siteOfAdministration,
            routeOfAdministration,
            notes
        });

        await newImmunization.save();

        // Push the new immunization to the patient's immunizations array
        await Patient.findByIdAndUpdate(patientId, {
            $push: { immunizations: newImmunization._id }
        });

        // Update each appointment with the new immunization ID
        await Appointment.updateMany(
            { _id: { $in: appointments } },
            { $push: { immunizations: newImmunization._id } }
        );

        res.status(201).json(newImmunization);
    } catch (error) {
        console.error("Error creating immunization:", error); // Log the error details
        res.status(500).json({ message: 'Error creating immunization', error: error.message });
    }
};


const updateImmunization = async (req, res) => {
    try {
        const { id } = req.params; 
        const updateData = req.body; 
        
  
        if (!id) {
            return res.status(400).json({ message: 'Immunization ID is required' });
        }

        console.log('Updating Immunization ID:', id);
        console.log('Update Data:', updateData);

        // Find the immunization by ID and update it with the new data
        const updatedImmunization = await Immunization.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedImmunization) {
            return res.status(404).json({ message: 'Immunization not found' });
        }

        // Log success message for debugging
        console.log('Updated Immunization:', updatedImmunization);

        // Return the updated immunization
        res.status(200).json(updatedImmunization);
    } catch (error) {
        console.error("Error updating immunization:", error); // Log the error
        res.status(500).json({ message: 'Error updating immunization', error: error.message });
    }
};






// Delete Immunization
const deleteImmunization = async (req, res) => {
    try {
        const { id } = req.params;
        await Immunization.findByIdAndDelete(id);
        res.status(200).json({ message: 'Immunization deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting immunization', error });
    }
}
module.exports = {
    deleteImmunization,
    createImmunization,
    updateImmunization

};