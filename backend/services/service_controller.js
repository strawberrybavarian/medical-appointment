const mongoose = require('mongoose');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Appointment = require('../appointments/appointment_model');
const Doctors = require('../doctor/doctor_model');
const Patient = require('../patient/patient_model');
const Notification = require('../notifications/notifications_model')
const Admin = require('../admin/admin_model')
const Service = require('../services/service_model')
const Specialty = require('../specialty/specialty_model')

// Create a new service
const createService = async (req, res) => {
    try {
      const { name, description, category, availability, requirements, doctors } = req.body;
  
      // Create a new service
      const newService = new Service({
        name,
        description,
        category,
        availability,
        requirements,
        doctors,
      });
  
      // Save the service to the database
      await newService.save();
  
      res.status(201).json({ message: 'Service created successfully', service: newService });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Get all services
  const getAllServices = async (req, res) => {
    try {
      const services = await Service.find().populate('doctors'); // Optionally, populate doctors
      res.status(200).json(services);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Get a single service by ID
  const getServiceById = async (req, res) => {
    try {
      const { id } = req.params;
      const service = await Service.findById(id).populate('doctors'); // Optionally, populate doctors
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.status(200).json(service);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Update a service
  const updateService = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, category, availability, requirements, doctors } = req.body;
  
      // Find and update the service
      const updatedService = await Service.findByIdAndUpdate(
        id,
        { name, description, category, availability, requirements, doctors },
        { new: true } // Return the updated document
      );
  
      if (!updatedService) {
        return res.status(404).json({ message: 'Service not found' });
      }
  
      res.status(200).json({ message: 'Service updated successfully', service: updatedService });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Delete a service
  const deleteService = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find and delete the service
      const deletedService = await Service.findByIdAndDelete(id);
  
      if (!deletedService) {
        return res.status(404).json({ message: 'Service not found' });
      }
  
      res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // Export all the functions
  module.exports = {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
  };
