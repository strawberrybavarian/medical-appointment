// chat/Chat_Controller.js

const ChatMessage = require('./chat_model');
const mongoose = require('mongoose');
const MedicalSecretary = require('../medicalsecretary/medicalsecretary_model');
const Admin = require('../admin/admin_model');
const Patient = require('../patient/patient_model'); // Ensure Patient model is imported

// Function to send a message
const sendMessage = async (req, res) => {
  try {
    const { senderId, senderModel, receiverId, message } = req.body;

    let receivers = [];
    let receiverModel = '';

    if (senderModel === 'Patient') {
      // Patient is sending a message
      // Get all Medical Secretary and Admin IDs
      const medSecs = await MedicalSecretary.find({}, '_id');
      const admins = await Admin.find({}, '_id');
      receivers = [
        ...medSecs.map((medSec) => medSec._id.toString()),
        ...admins.map((admin) => admin._id.toString()),
      ];
      receiverModel = 'Staff';
    } else if (senderModel === 'Medical Secretary' || senderModel === 'Admin') {
      // Staff member is sending a message to a patient
      if (!receiverId) {
        return res.status(400).json({ success: false, message: 'Receiver ID is required' });
      }

      const isReceiverPatient = await Patient.exists({ _id: receiverId });
      if (!isReceiverPatient) {
        return res.status(400).json({ success: false, message: 'Invalid receiver ID' });
      }

      // Sending message to a patient
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
    res
      .status(500)
      .json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

// Function to get messages between staff and a patient
const getMessages = async (req, res) => {
  try {
    const { userId, otherUserId } = req.query;

    let query = {};

    if (otherUserId) {
      // Staff fetching messages with a patient
      query = {
        $or: [
          {
            // Messages sent by the patient to staff
            sender: otherUserId,
            senderModel: 'Patient',
          },
          {
            // Messages sent by any staff member to the patient
            receiver: { $in: [otherUserId] },
            senderModel: { $in: ['Medical Secretary', 'Admin'] },
          },
        ],
      };
    } else if (userId) {
      // Patient fetching messages
      query = {
        $or: [
          {
            sender: userId,
          },
          {
            receiver: { $in: [userId] },
          },
        ],
      };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid query parameters' });
    }

    const messages = await ChatMessage.find(query).sort({ createdAt: 1 });

    // Populate senderName if not already present
    for (let msg of messages) {
      if (!msg.senderName) {
        msg.senderName = await getSenderName(msg.sender, msg.senderModel);
        await msg.save();
      }
    }

    const messagesData = messages.map((msg) => ({
      _id: msg._id.toString(),
      sender: msg.sender.toString(),
      senderModel: msg.senderModel,
      senderName: msg.senderName || 'Unknown', // Include senderName
      receiver: msg.receiver.map((id) => id.toString()),
      receiverModel: msg.receiverModel,
      message: msg.message,
      createdAt: msg.createdAt,
    }));

    res.status(200).json({ success: true, data: messagesData });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
};

// Helper function to get sender's name
async function getSenderName(senderId, senderModel) {
  if (senderModel === 'Patient') {
    const patient = await Patient.findById(senderId);
    return `${patient.patient_firstName} ${patient.patient_lastName}`;
  } else if (senderModel === 'Medical Secretary') {
    const medSec = await MedicalSecretary.findById(senderId);
    return `${medSec.medSec_firstName} ${medSec.medSec_lastName}`;
  } else if (senderModel === 'Admin') {
    const admin = await Admin.findById(senderId);
    return `${admin.admin_firstName} ${admin.admin_lastName}`;
  } else {
    return 'Unknown Sender';
  }
}

// Function to get list of patients who have chatted
const getPatientsList = async (req, res) => {
  try {
    // Find distinct patient IDs who have sent messages
    const patients = await ChatMessage.aggregate([
      {
        $match: {
          senderModel: 'Patient',
        },
      },
      {
        $group: { _id: '$sender' },
      },
      {
        $lookup: {
          from: 'patients',
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
