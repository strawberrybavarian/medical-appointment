// File: specialty_controller.js

const mongoose = require('mongoose');
const Admin = require('../admin/admin_model');
const Specialty = require('./specialty_model');

const addSpecialty = async (req, res) => {
    try {
        const { adminId, name, description } = req.body;

        // Check if the user is an admin
        const admin = await Admin.findById(adminId);
        if (!admin || admin.role !== 'Admin') {
            return res.status(403).json({ message: 'Unauthorized: Only admins can add specialties' });
        }

        // Handle image upload
        let imageUrl = '';
        if (req.file) {
            const imagePath = `images/${req.file.filename}`; // Path to saved image
            imageUrl = imagePath;
        }

        // Create a new specialty
        const newSpecialty = new Specialty({
            name,
            description,
            imageUrl,
        });

        // Save the specialty
        await newSpecialty.save();

        return res.status(201).json({ message: 'Specialty added successfully', specialty: newSpecialty });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getSpecialties = async (req, res) => {
    try {
        const specialties = await Specialty.find();
        return res.status(200).json(specialties);
    } catch (error) {
        console.error('Error finding specialties:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateSpecialty = async (req, res) => {
    try {
        const { specialtyId, name, description } = req.body;

        if (!mongoose.Types.ObjectId.isValid(specialtyId)) {
            return res.status(400).json({ message: 'Invalid specialty ID' });
        }

        let updatedData = { name, description };

        // Handle image upload
        if (req.file) {
            const imagePath = `images/${req.file.filename}`; // Path to saved image
            updatedData.imageUrl = imagePath;
        }

        const updatedSpecialty = await Specialty.findByIdAndUpdate(specialtyId, updatedData, { new: true });
        return res.status(200).json(updatedSpecialty);
    } catch (error) {
        console.error('Error updating specialty:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteSpecialty = async (req, res) => {
    try {
        const { specialtyId } = req.params;
        await Specialty.findByIdAndDelete(specialtyId);
        return res.status(200).json({ message: 'Specialty deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    addSpecialty,
    getSpecialties,
    updateSpecialty,
    deleteSpecialty,
};
