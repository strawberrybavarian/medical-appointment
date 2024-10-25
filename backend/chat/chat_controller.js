// chat/Chat_Controller.js

const ChatMessage = require('./chat_model');
const mongoose = require('mongoose');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Admin = require('../admin/admin_model');

// Function to send a message
const sendMessage = async (req, res) => {
  try {
    const { senderId, senderModel, receiverId, receiverModel, message } = req.body;

    let receivers = [];

    if (senderModel === 'Patient') {
      // Patient is sending a message
      // Get all Medical Secretary and Admin IDs
      const medSecs = await MedicalSecretary.find({}, '_id');
      const admins = await Admin.find({}, '_id');
      receivers = [...medSecs.map((medSec) => medSec._id), ...admins.map((admin) => admin._id)];
      receiverModel = 'Staff';
    } else if (senderModel === 'Medical Secretary' || senderModel === 'Admin') {
      // Medical Secretary or Admin is sending a message to a specific patient
      if (!receiverId) {
        return res.status(400).json({ success: false, message: 'Receiver ID is required' });
      }
      receivers = [receiverId];
      receiverModel = 'Patient';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid sender model' });
    }

    const newMessage = new ChatMessage({
      sender: senderId,
      senderModel: senderModel,
      receiver: receivers,
      receiverModel: receiverModel,
      message: message,
    });

    await newMessage.save();

    res.status(200).json({ success: true, message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

// Function to get messages between two users or for a patient
const getMessages = async (req, res) => {
  try {
    const { userId, otherUserId, receiverModel } = req.query;

    let query = {};

    if (otherUserId) {
      // Fetch all messages between userId and otherUserId
      query = {
        $or: [
          {
            sender: userId,
            receiver: { $in: [otherUserId] },
          },
          {
            sender: otherUserId,
            receiver: { $in: [userId] },
          },
        ],
      };
    } else if (receiverModel) {
      // For patients, fetch messages sent and received involving Staff
      query = {
        $or: [
          {
            sender: userId,
            receiverModel: 'Staff',
          },
          {
            receiver: { $in: [userId] },
            senderModel: 'Staff',
          },
        ],
      };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid query parameters' });
    }

    const messages = await ChatMessage.find(query).sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
};

// Function to get list of patients who have chatted
const getPatientsList = async (req, res) => {
  try {
    // Find distinct patient IDs who have sent messages to any Staff
    const patients = await ChatMessage.aggregate([
      {
        $match: {
          receiverModel: 'Staff',
          senderModel: 'Patient',
        },
      },
      {
        $group: { _id: '$sender' },
      },
      {
        $lookup: {
          from: 'patients', // The collection name for patients
          localField: '_id',
          foreignField: '_id',
          as: 'patientInfo',
        },
      },
      {
        $unwind: '$patientInfo',
      },
      {
        $project: {
          _id: 0,
          _id: '$patientInfo._id',
          name: {
            $concat: [
              '$patientInfo.patient_firstName',
              ' ',
              '$patientInfo.patient_lastName',
            ],
          },
        },
      },
    ]);

    res.status(200).json({ success: true, data: patients });
  } catch (error) {
    console.error('Error fetching patients list:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch patients list', error: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getPatientsList,
};
