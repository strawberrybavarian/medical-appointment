import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { ip } from '../../../../ContentExport';
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
  const [showModal, setShowModal] = useState(false);

  // Fetch services when the component loads
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${ip.address}/api/admin/getall/services`);
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

  // Handle form submission for adding or updating a service
  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await axios.put(`${ip.address}/api/admin/update/services/${editingService._id}`, newService);
      } else {
        await axios.post(`${ip.address}/api/admin/add/services`, newService);
      }
      setNewService({ name: '', description: '', category: '', availability: 'Available', requirements: '', doctors: [] });
      setEditingService(null);
      setShowModal(false);
      fetchServices(); // Refresh the list
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  // Handle delete service
  const handleDeleteService = async (id) => {
    try {
      await axios.delete(`${ip.address}/api/admin/delete/services/${id}`);
      fetchServices(); // Refresh the list
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  // Edit button clicked
  const handleEditClick = (service) => {
    setEditingService(service);
    setNewService(service);
    setShowModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setNewService({ name: '', description: '', category: '', availability: 'Available', requirements: '', doctors: [] });
  };

  return (
    <div>
      <h2>Manage Services</h2>

      {/* Display list of services in a table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Availability</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service._id}>
              <td>{service.name}</td>
              <td>{service.description}</td>
              <td>{service.category}</td>
              <td>{service.availability}</td>
              <td>
                <Button variant="warning" onClick={() => handleEditClick(service)} style={{ marginRight: '10px' }}>Edit</Button>
                <Button variant="danger" onClick={() => handleDeleteService(service._id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Button to open modal for adding a new service */}
      <Button variant="primary" onClick={() => setShowModal(true)}>Add New Service</Button>

      {/* Modal for adding/editing a service */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingService ? 'Edit Service' : 'Add New Service'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveService}>
            <Form.Group controlId="serviceName">
              <Form.Label>Service Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newService.name}
                onChange={handleInputChange}
                placeholder="Service Name"
                required
              />
            </Form.Group>
            <Form.Group controlId="serviceDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={newService.description}
                onChange={handleInputChange}
                placeholder="Description"
              />
            </Form.Group>
            <Form.Group controlId="serviceCategory">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={newService.category}
                onChange={handleInputChange}
                placeholder="Category"
                required
              />
            </Form.Group>
            <Form.Group controlId="serviceAvailability">
              <Form.Label>Availability</Form.Label>
              <Form.Control
                as="select"
                name="availability"
                value={newService.availability}
                onChange={handleInputChange}
              >
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
                <option value="Coming Soon">Coming Soon</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="serviceRequirements">
              <Form.Label>Requirements</Form.Label>
              <Form.Control
                as="textarea"
                name="requirements"
                value={newService.requirements}
                onChange={handleInputChange}
                placeholder="Requirements"
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {editingService ? 'Update' : 'Add'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ManageServices;