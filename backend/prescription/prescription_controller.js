const Prescription = require('../prescription/prescription_model');
const Appointment = require('../appointments/appointment_model')
const Patient = require('../patient/patient_model')
const Doctors = require('../doctor/doctor_model')

const createPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;
    const { gender, dateOfConsultation, doctorId, medications } = req.body;
    const imagePath = req.file ? `images/${req.file.filename}` : '';

    console.log('Received data:', { patientId, appointmentId, doctorId, medications, imagePath }); // Add logging here

    if (!patientId || !doctorId || !appointmentId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let parsedMedications = [];
    if (medications) {
      try {
        parsedMedications = JSON.parse(medications);
      } catch (err) {
        console.error('Error parsing medications:', err);
        return res.status(400).json({ message: 'Invalid medications format' });
      }
    }

    // Create or update the prescription
    let prescription = await Prescription.findOne({ patient: patientId, doctor: doctorId, appointment: appointmentId });

    if (prescription) {
      // Update existing prescription
      prescription.medications = parsedMedications;
      if (imagePath) prescription.prescriptionImage = imagePath;
      await prescription.save();
    } else {
      // Create new prescription
      prescription = new Prescription({
        patient: patientId,
        appointment: appointmentId,
        doctor: doctorId,
        medications: parsedMedications,
        prescriptionImage: imagePath,
      });
      await prescription.save();
    }

    // Update the appointment with the prescription ID
    const appointment = await Appointment.findById(appointmentId);
    if (appointment) {
      appointment.prescription = prescription._id;
      await appointment.save();
    }

    res.status(201).json({ message: 'Prescription saved successfully', prescription });
  } catch (error) {
    console.error('Error saving prescription:', error); // Log the error
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};





const updatePrescriptionImage = async (req, res) => {
  try {
    const prescriptionId = req.params.id;
    const imagePath = `images/${req.file.filename}`; 

    const updatedPrescription = await Prescription.findByIdAndUpdate(prescriptionId, { prescriptionImage: imagePath }, { new: true });
    res.json({ updatedPrescription, message: 'Prescription image updated successfully' });
  } catch (error) {
    console.error('Error updating prescription image:', error);
    res.status(500).json({ message: 'Error updating prescription image', error });
  }
};


module.exports = {
  createPrescription,
  updatePrescriptionImage
};