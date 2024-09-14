const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Admin = require('../admin/admin_model');
const News = require('./news_model');
const fs = require('fs');
const path = require('path');

// Find news by Medical Secretary or Admin


const getGeneralNews = async (req, res) => {
    try {
      // Find all news posts and populate the `posted_by` field
      const newsPosts = await News.find().populate('posted_by', 'name'); // Populate 'posted_by' with the name of the user
      res.json({ news: newsPosts });
    } catch (error) {
      console.error('Error fetching general news posts:', error);
      res.status(500).json({ message: 'Error fetching general news posts', error });
    }
  };
  
const findNewsByUserId = (req, res) => {
    const { id, role } = req.params;
    
    const UserModel = role === 'MedicalSecretary' ? MedicalSecretary : Admin;
    
    UserModel.findOne({ _id: id })
        .populate('news')
        .then((user) => {
            res.json({ user });
        })
        .catch((err) => {
            res.json({ message: 'Something went wrong', error: err });
        });
};

// Add new news by Medical Secretary or Admin
const addNewNewsByUserId = async (req, res) => {
    try {
        let imagePaths = [];

        // Handle file uploads and convert them to base64
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => {
                const imageBuffer = fs.readFileSync(file.path);
                const base64Image = `data:${file.mimetype};base64,${imageBuffer.toString('base64')}`;
                
                // Optionally delete the file after encoding
                fs.unlinkSync(file.path);
                return base64Image;
            });
        }

        // Set headline automatically (you can define the logic for headline generation)
        const headline = req.body.headline || "Default Headline"; // or any other logic to set headline

        const newNews = new News({
            content: req.body.content,
            headline: headline,  // Include the headline
            posted_by: req.params.id,
            role: req.body.role,  // Either 'MedicalSecretary' or 'Admin'
            images: imagePaths,  // Store image paths
        });

        // Save the new news entry
        const savedNews = await newNews.save();
        const UserModel = req.body.role === 'MedicalSecretary' ? MedicalSecretary : Admin;

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.params.id,
            { $push: { news: savedNews._id } },
            { new: true }
        ).populate('news');

        res.json({ updatedUser, message: 'New news added successfully' });
    } catch (error) {
        console.error('Error adding news:', error);
        res.status(500).json({ message: 'Error adding news', error });
    }
};

// Retrieve all news
const getAllNewsByUserId = (req, res) => {
    const { id, role } = req.params;
    const UserModel = role === 'MedicalSecretary' ? MedicalSecretary : Admin;

    UserModel.findOne({ _id: id })
        .populate('news')
        .then((user) => {
            if (!user) {
                res.json({ message: `${role} not found` });
            }
            res.json({ news: user.news });
        })
        .catch((err) => {
            res.json({ message: 'Error retrieving news', error: err });
        });
};

// Delete news by index
const deleteNewsByIndex = async (req, res) => {
    const newsIndex = req.params.index;
    const userId = req.params.id;
    const role = req.body.role;

    try {
        const UserModel = role === 'MedicalSecretary' ? MedicalSecretary : Admin;
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: `${role} not found` });
        }

        if (newsIndex < 0 || newsIndex >= user.news.length) {
            return res.status(400).json({ message: 'Invalid news index' });
        }

        const newsIdToDelete = user.news[newsIndex];

        const deletedNews = await News.findByIdAndDelete(newsIdToDelete);
        if (!deletedNews) {
            return res.status(404).json({ message: 'News not found' });
        }

        user.news.splice(newsIndex, 1);
        const updatedUser = await user.save();

        res.json({ updatedUser, message: 'News deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error deleting news', error });
    }
};

// Update news at specific index
const updateNewsAtIndex = async (req, res) => {
    const { userId, newsId } = req.params;
    const role = req.body.role;
    
    // Log values to see if they are correctly passed
    console.log("userId:", userId);
    console.log("newsId:", newsId);
    console.log("role:", role);
  

    try {
        const UserModel = role === 'MedicalSecretary' ? MedicalSecretary : Admin;
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: `${role} not found` });
        }

        // Find the news by its newsId directly
        const news = await News.findById(newsId);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }

        // Handle new image uploads
        let imagePaths = [];
        if (req.files && req.files.length > 0) {
            imagePaths = req.files.map(file => {
                const imageBuffer = fs.readFileSync(file.path);
                const base64Image = `data:${file.mimetype};base64,${imageBuffer.toString('base64')}`;
                
                fs.unlinkSync(file.path); // Optionally delete the file after processing
                return base64Image;
            });
        }

        // Handle deleted images
        let deletedImages = [];
        if (req.body.deletedImages) {
            deletedImages = JSON.parse(req.body.deletedImages);
            news.images = news.images.filter(image => !deletedImages.includes(image));
        }

        // Add new images to the news (if any)
        if (imagePaths.length > 0) {
            news.images.push(...imagePaths);
        }

        // Update the content
        news.content = req.body.content || news.content;

        const updatedNews = await news.save();

        res.json({ updatedNews, message: 'News updated successfully' });
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ message: 'Error updating news', error });
    }
};

const getNewsById = async (req, res) => {
    try {
      const news = await News.findById(req.params.id);
      if (!news) {
        return res.status(404).json({ message: "News not found" });
      }
      res.json({ news });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  


module.exports = {
  addNewNewsByUserId,
  getAllNewsByUserId,
  deleteNewsByIndex,
  updateNewsAtIndex,
  findNewsByUserId,
  getGeneralNews,
  getNewsById
};
