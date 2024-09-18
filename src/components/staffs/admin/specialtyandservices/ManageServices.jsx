import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageServices() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    category: '',
    availability: 'Available',
    requirements: '',
    doctors: [],
  });
  
  const [editingService, setEditingService] = useState(null);

  // Fetch services when the component loads
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/admin/get/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService({
      ...newService,
      [name]: value,
    });
  };

  // Handle form submission for adding a new service
  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/admin/add/services', newService);
      setNewService({ name: '', description: '', category: '', availability: 'Available', requirements: '', doctors: [] });
      fetchServices(); // Refresh the list
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  // Handle delete service
  const handleDeleteService = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/admin/delete/services/${id}`);
      fetchServices(); // Refresh the list
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  // Handle updating service
  const handleUpdateService = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/admin/update/services/${editingService._id}`, editingService);
      setEditingService(null);
      fetchServices(); // Refresh the list
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  // Edit button clicked
  const handleEditClick = (service) => {
    setEditingService(service);
  };

  return (
    <div>
      <h2>Manage Services</h2>

      {/* Display list of services */}
      <ul>
        {services.map((service) => (
          <li key={service._id}>
            <strong>{service.name}</strong> - {service.description} - {service.category} - {service.availability}
            <button onClick={() => handleEditClick(service)}>Edit</button>
            <button onClick={() => handleDeleteService(service._id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* Add new service form */}
      <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
      <form onSubmit={editingService ? handleUpdateService : handleAddService}>
        <input
          type="text"
          name="name"
          value={editingService ? editingService.name : newService.name}
          onChange={editingService ? (e) => setEditingService({ ...editingService, name: e.target.value }) : handleInputChange}
          placeholder="Service Name"
          required
        />
        <input
          type="text"
          name="description"
          value={editingService ? editingService.description : newService.description}
          onChange={editingService ? (e) => setEditingService({ ...editingService, description: e.target.value }) : handleInputChange}
          placeholder="Description"
        />
        <input
          type="text"
          name="category"
          value={editingService ? editingService.category : newService.category}
          onChange={editingService ? (e) => setEditingService({ ...editingService, category: e.target.value }) : handleInputChange}
          placeholder="Category"
          required
        />
        <select
          name="availability"
          value={editingService ? editingService.availability : newService.availability}
          onChange={editingService ? (e) => setEditingService({ ...editingService, availability: e.target.value }) : handleInputChange}
        >
          <option value="Available">Available</option>
          <option value="Not Available">Not Available</option>
          <option value="Coming Soon">Coming Soon</option>
        </select>
        <textarea
          name="requirements"
          value={editingService ? editingService.requirements : newService.requirements}
          onChange={editingService ? (e) => setEditingService({ ...editingService, requirements: e.target.value }) : handleInputChange}
          placeholder="Requirements"
        />
        <button type="submit">{editingService ? 'Update' : 'Add'}</button>
      </form>
    </div>
  );
}

export default ManageServices;
