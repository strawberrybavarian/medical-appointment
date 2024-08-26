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
