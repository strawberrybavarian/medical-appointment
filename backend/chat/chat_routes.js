// chat/Chat_Routes.js

const chatController = require('./chat_controller');
console.log('Chat Routes connected \n');

module.exports = (app) => {
  // Send a message
  app.post('/api/chat/send', chatController.sendMessage);

  // Get messages between the current user and another user
  app.get('/api/chat/messages', chatController.getMessages);

  // Get list of patients who have chatted
  app.get('/api/chat/patients', chatController.getPatientsList);
};
