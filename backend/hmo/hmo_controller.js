// controllers/hmoController.js
const Hmo = require('./hmo_model'); // Adjust the path to your actual Hmo model
const Doctor = require('../doctor/doctor_model'); // Adjust the path to your actual Doctor model

// Create a new HMO
const createHmo = async (req, res) => {
    try {
        const hmo = new Hmo(req.body);
        await hmo.save();
        res.status(201).json(hmo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all HMOs
const getAllHmo = async (req, res) => {
    try {
        const hmos = await Hmo.find().populate('doctors');
        res.status(200).json(hmos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a specific HMO by ID
const getHmoById = async (req, res) => {
    try {
        const hmo = await Hmo.findById(req.params.id).populate('doctors');
        if (!hmo) return res.status(404).json({ message: 'HMO not found' });
        res.status(200).json(hmo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update HMO details
const updateHmo = async (req, res) => {
    try {
        const updatedHmo = await Hmo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedHmo) return res.status(404).json({ message: 'HMO not found' });
        res.status(200).json(updatedHmo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an HMO
const deleteHmo = async (req, res) => {
    try {
        const deletedHmo = await Hmo.findByIdAndDelete(req.params.id);
        if (!deletedHmo) return res.status(404).json({ message: 'HMO not found' });
        res.status(200).json({ message: 'HMO deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a Doctor to an HMO
const addDoctorToHmo = async (req, res) => {
  try {
    const { hmoId, doctorId } = req.params;

    // Find both doctor and HMO
    const doctor = await Doctor.findById(doctorId);
    const hmo = await Hmo.findById(hmoId);

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (!hmo) return res.status(404).json({ message: 'HMO not found' });

    // Add doctor to HMO if not already in the list
    if (!hmo.doctors.includes(doctor._id)) {
      hmo.doctors.push(doctor._id);
      await hmo.save();
    }

    // Add HMO to doctor's dr_hmo list if not already present
    if (!doctor.dr_hmo.includes(hmo._id)) {
      doctor.dr_hmo.push(hmo._id);
      await doctor.save();
    }

    res.status(200).json({ message: 'Doctor added to HMO', hmo, doctor });
  } catch (error) {
    console.error('Error adding doctor to HMO:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove a Doctor from an HMO (and update dr_hmo field in Doctor model)
const removeDoctorFromHmo = async (req, res) => {
  try {
    const { hmoId, doctorId } = req.params;

    // Find both doctor and HMO
    const doctor = await Doctor.findById(doctorId);
    const hmo = await Hmo.findById(hmoId);

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (!hmo) return res.status(404).json({ message: 'HMO not found' });

    // Remove doctor from HMO's list
    hmo.doctors = hmo.doctors.filter(docId => docId.toString() !== doctorId);
    await hmo.save();

    // Remove HMO from doctor's dr_hmo list
    doctor.dr_hmo = doctor.dr_hmo.filter(hmoDocId => hmoDocId.toString() !== hmoId);
    await doctor.save();

    res.status(200).json({ message: 'Doctor removed from HMO', hmo, doctor });
  } catch (error) {
    console.error('Error removing doctor from HMO:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Fetch all Doctors in an HMO network
const fetchHmoDoctors = async (req, res) => {
    try {
        const hmo = await Hmo.findById(req.params.hmoId).populate('doctors');
        if (!hmo) return res.status(404).json({ message: 'HMO not found' });
        res.status(200).json(hmo.doctors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch all Doctors' Status in an HMO network (you can adjust this based on your logic)
const fetchHmoDoctorsStatus = async (req, res) => {
    const doctorId = req.params.doctorId;

    try {
        const doctor = await Doctor.findById(doctorId).populate('dr_hmo');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
  
        res.status(200).json({ dr_hmo: doctor.dr_hmo });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Error fetching services', error: error.message });
    }
};

// Export all the controller functions
module.exports = {
    createHmo,
    getAllHmo,
    getHmoById,
    updateHmo,
    deleteHmo,
    addDoctorToHmo,
    removeDoctorFromHmo,
    fetchHmoDoctors,
    fetchHmoDoctorsStatus
};
