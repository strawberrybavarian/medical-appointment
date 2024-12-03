const Prescription = require('../prescription/prescription_model');
const Appointment = require('../appointments/appointment_model')
const Patient = require('../patient/patient_model')
const Doctors = require('../doctor/doctor_model')

const createPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;
    const { doctorId, medications } = req.body; // Medications are passed as stringified JSON

    // Handle multiple images
    const imagePaths = req.files ? req.files.map(file => `images/${file.filename}`) : [];

    // Log received data for debugging
    console.log('Received data:', { patientId, appointmentId, doctorId, medications, imagePaths });

    // Validate input
    if (!patientId || !doctorId || !appointmentId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Parse the medications if passed as JSON string
    let parsedMedications = [];
    if (medications) {
      try {
        parsedMedications = JSON.parse(medications);
        console.log('Parsed Medications:', parsedMedications); // Log the parsed medications
      } catch (err) {
        console.error('Error parsing medications:', err);
        return res.status(400).json({ message: 'Invalid medications format' });
      }
    }

    // Check if the prescription already exists
    let prescription = await Prescription.findOne({ patient: patientId, doctor: doctorId, appointment: appointmentId });

    if (prescription) {
      // Update the existing prescription
      prescription.medications = parsedMedications;
      if (imagePaths.length > 0) prescription.prescriptionImages = imagePaths; // Update images if present
      await prescription.save();
    } else {
      // Create a new prescription
      prescription = new Prescription({
        patient: patientId,
        appointment: appointmentId,
        doctor: doctorId,
        medications: parsedMedications,
        prescriptionImages: imagePaths,
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