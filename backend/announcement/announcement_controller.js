const Prescription = require('../prescription/prescription_model');
const Appointment = require('../appointments/appointment_model');
const Patient = require('../patient/patient_model');
const Doctors = require('../doctor/doctor_model');
const Post = require('./announcement_model');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Notification = require('../notifications/notifications_model');
const mongoose = require('mongoose');
const Payment = require('../payments/payment_model');
const fs = require('fs');
const path = require('path');
const findDoctorById = (req, res) => {
    Doctors.findOne({ _id: req.params.id })
        .populate('dr_posts')
        .then((theDoctor) => {
            res.json({ theDoctor });
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err });
        });
};

const addNewPostById = async (req, res) => {
    try {
        let imagePaths = [];

        console.log('Files received:', req.files);  // Debug: Log the files information

        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => {
                const imageBuffer = fs.readFileSync(file.path);
                const base64Image = `data:${file.mimetype};base64,${imageBuffer.toString('base64')}`;
                
                // Optionally delete the file after encoding
                fs.unlinkSync(file.path);
                
                return base64Image;
            });
        }

        const newPost = new Post({
            content: req.body.content,
            doctor_id: req.params.id,
            images: imagePaths,  // Store array of images
        });

        console.log('New Post Object:', newPost);  // Debug: Check the post object before saving

        const savedPost = await newPost.save();
        const updatedDoctor = await Doctors.findByIdAndUpdate(
            req.params.id,
            { $push: { dr_posts: savedPost._id } },
            { new: true }
        ).populate('dr_posts');

        res.json({ updatedDoctor, message: 'New post added successfully' });
    } catch (error) {
        console.error('Error adding post:', error);
        res.status(500).json({ message: 'Error adding post', error });
    }
};


// Retrieve all posts 
const getAllPostbyId = (req, res) => {
    Doctors.findOne({ _id: req.params.id })
        .populate('dr_posts')
        .then((Doctor) => {
            if (!Doctor) {
                res.json({ message: 'Doctor not found' });
            }
            res.json({ posts: Doctor.dr_posts });
        })
        .catch((err) => {
            res.json({ message: 'Error retrieving posts', error: err });
        });
};

const findPostByIdDelete = async (req, res) => {
    const postIndex = parseInt(req.params.index, 10);  // Parse the index as an integer
    const doctorId = req.params.id;

    console.log("Received Doctor ID:", doctorId);   // Log doctor ID
    console.log("Received Post Index:", postIndex); // Log post index

    try {
        // Find the doctor document
        const doctor = await Doctors.findById(doctorId);

        if (!doctor) {
            console.log("Doctor not found for ID:", doctorId); // Log if doctor not found
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Log the entire posts array to debug it
        console.log("Doctor's posts array:", doctor.dr_posts);

        // Ensure that the postIndex is a valid index in the dr_posts array
        if (postIndex < 0 || postIndex >= doctor.dr_posts.length) {
            console.log("Invalid Post Index:", postIndex); // Log invalid index
            return res.status(400).json({ message: 'Invalid post index' });
        }

        // Extract the post ID to be deleted
        const postIdToDelete = doctor.dr_posts[postIndex];
        console.log("Post ID to delete:", postIdToDelete);  // Log the ID at index 0

        if (!postIdToDelete) {
            console.log("Post ID is undefined at index:", postIndex); // Log undefined post ID
            return res.status(404).json({ message: 'Post not found' });
        }

        // Delete the post from the Post collection
        const deletedPost = await Post.findByIdAndDelete(postIdToDelete);

        if (!deletedPost) {
            console.log("Post not found for ID:", postIdToDelete); // Log post not found
            return res.status(404).json({ message: 'Post not found' });
        }

        // Remove the post reference from the doctor's dr_posts array
        doctor.dr_posts.splice(postIndex, 1);  // This will correctly handle index 0

        // Save the updated doctor document
        const updatedDoctor = await doctor.save();

        res.json({ updatedDoctor, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);  // Log the error
        res.status(500).json({ message: 'Error deleting post', error });
    }
};

  


const updatePostAtIndex = async (req, res) => {
    const { doctorId, postId } = req.params;
    
    console.log("Doctor ID:", doctorId);
    console.log("Post ID:", postId);
    console.log("Request Body Content:", req.body.content);
    console.log("Request Files:", req.files); // Log uploaded files

    // Validate doctorId and postId
    if (!mongoose.Types.ObjectId.isValid(doctorId) || !mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: 'Invalid doctor or post ID' });
    }

    try {
        const doctor = await Doctors.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Process and convert new images if they are uploaded
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => {
                const imageBuffer = fs.readFileSync(file.path);
                const base64Image = `data:${file.mimetype};base64,${imageBuffer.toString('base64')}`;

                // Optionally delete the file after converting to base64
                fs.unlinkSync(file.path);

                return base64Image;
            });
        }

        // Parse deleted images from the request
        let deletedImages = [];
        if (req.body.deletedImages) {
            deletedImages = JSON.parse(req.body.deletedImages);
        }

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Remove images from the post if requested
        if (deletedImages.length > 0) {
            post.images = post.images.filter(image => !deletedImages.includes(image));
        }

        // Add new images to the post (if any)
        if (imagePaths.length > 0) {
            post.images.push(...imagePaths);
        }

        // Update the post content
        post.content = req.body.content;

        const updatedPost = await post.save();

        res.json({ updatedPost, message: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Error updating post', error });
    }
};

  
  




  

module.exports = {
  addNewPostById,
  getAllPostbyId,
  findPostByIdDelete,
  updatePostAtIndex,
  findDoctorById
};
