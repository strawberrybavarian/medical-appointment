const express = require('express');
const axios = require('axios');
const app = express();

module.exports = app => {
  app.get('/api/regions', async (req, res) => {
    try {
      const response = await axios.get('https://psgc.gitlab.io/api/regions/');
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching regions' });
    }
  });
  
  // Proxy for Provinces
  app.get('/api/regions/:regionCode/provinces', async (req, res) => {
    const { regionCode } = req.params;
    try {
      const response = await axios.get(`https://psgc.gitlab.io/api/regions/${regionCode}/provinces/`);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching provinces' });
    }
  });
  
  // Proxy for Cities/Municipalities
  app.get('/api/regions/:regionCode/cities-municipalities', async (req, res) => {
    const { regionCode } = req.params;
    try {
      const response = await axios.get(`https://psgc.gitlab.io/api/regions/${regionCode}/cities-municipalities/`);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching cities/municipalities' });
    }
  });
  
  // Proxy for Barangays
  app.get('/api/cities-municipalities/:cityCode/barangays', async (req, res) => {
    const { cityCode } = req.params;
    try {
      const response = await axios.get(`https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays/`);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching barangays' });
    }
  });
}



