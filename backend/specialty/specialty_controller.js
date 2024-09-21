const mongoose = require('mongoose');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Appointment = require('../appointments/appointment_model');
const Doctors = require('../doctor/doctor_model');
const Patient = require('../patient/patient_model');
const Notification = require('../notifications/notifications_model')
const Admin = require('../admin/admin_model')
const Services = require('../services/service_model')
const Specialty = require('../specialty/specialty_model')

const addSpecialty = async (req, res) => {
    try {
      const { adminId, name, description } = req.body;

      // Check if the user is an admin
      const admin = await Admin.findById(adminId);
      if (!admin || admin.role !== 'Admin') {
        return res.status(403).json({ message: 'Unauthorized: Only admins can add specialties' });
      }

      // Create a new specialty
      const newSpecialty = new Specialty({
        name,
        description
      });

      // Save the specialty
      await newSpecialty.save();

      return res.status(201).json({ message: 'Specialty added successfully', specialty: newSpecialty });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


 const getSpecialties = async(req, res) => {
    try {
      const specialties = await Specialty.find();
      return res.status(200).json(specialties);
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Update a specialty
   const updateSpecialty = async(req, res) => {
    try {
      const { specialtyId, name, description } = req.body;

      const updatedSpecialty = await Specialty.findByIdAndUpdate(specialtyId, { name, description }, { new: true });
      return res.status(200).json({ message: 'Specialty updated successfully', specialty: updatedSpecialty });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Delete a specialty
  const deleteSpecialty = async(req, res) => {
    try {
      const { specialtyId } = req.params;
      await Specialty.findByIdAndDelete(specialtyId);
      return res.status(200).json({ message: 'Specialty deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }

  }


module.exports = {
  
    addSpecialty,
    getSpecialties,
    updateSpecialty,
    deleteSpecialty,

};
