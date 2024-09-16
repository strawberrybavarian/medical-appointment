const mongoose = require('mongoose');


mongoose.connect('mongodb://127.0.0.1:27017/PIMSdb', {

});


mongoose.connection.once('open', async () => {
  try {
    const collection = mongoose.connection.db.collection('patients');

    // Get the list of indexes
    const indexes = await collection.indexes();
    const indexExists = indexes.some(index => index.name === 'patient_email_1');

    if (indexExists) {
      console.log('Index found. Dropping the existing index...');
      await collection.dropIndex('patient_email_1');  // Drop the existing index
      console.log('Index dropped.');
    } else {
      console.log('Index not found. Skipping drop index.');
    }

    // Create the new index
    await collection.createIndex({ patient_email: 1 }, { unique: true, sparse: true });
    console.log('New index created.');
  } catch (error) {
    console.error('Error handling indexes:', error);
  }
});

//For Appointment_ID
mongoose.connection.once('open', async () => {
  try {
    const collection = mongoose.connection.db.collection('appointments');

    // Get the list of indexes
    const indexes = await collection.indexes();
    const indexExists = indexes.some(index => index.name === 'appointment_ID_1');

    if (indexExists) {
      console.log('Index "appointment_ID_1" found. Dropping the existing index...');
      await collection.dropIndex('appointment_ID_1');
      console.log('Index "appointment_ID_1" dropped.');
    } else {
      console.log('Index "appointment_ID_1" not found. Skipping drop index.');
    }

  } catch (error) {
    console.error('Error handling indexes:', error);
  }
});
