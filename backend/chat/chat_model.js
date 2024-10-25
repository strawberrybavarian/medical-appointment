// chat/Chat_Model.js

const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ChatMessageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    refPath: 'senderModel',
    required: true,
  },
  senderModel: {
    type: String,
    required: true,
  },
  receiver: [
    {
      type: Schema.Types.ObjectId,
      refPath: 'receiverModel',
      required: true,
    },
  ],
  receiverModel: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Add TTL index to automatically delete messages after 3 days
ChatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 259200 });

const ChatMessage = model('ChatMessage', ChatMessageSchema);

module.exports = ChatMessage;
