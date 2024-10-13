import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { ip } from '../../../../ContentExport';

function ManageSpecialty({ aid }) {
  const [specialties, setSpecialties] = useState([]);
  const [newSpecialty, setNewSpecialty] = useState({
    name: '',
    description: '',
  });
  const [editSpecialtyId, setEditSpecialtyId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetch all specialties on component mount
    fetchSpecialties();
  }, []);

  // Fetch all specialties from the server
  const fetchSpecialties = async () => {
    try {
      const res = await axios.get(`${ip.address}/api/admin/specialties`);
      setSpecialties(res.data);
    } catch (err) {
      console.error('Error fetching specialties:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSpecialty({
      ...newSpecialty,
      [name]: value,
    });
  };

  // Handle form submission for adding or updating a specialty
  const handleSaveSpecialty = async (e) => {
    e.preventDefault();
    try {
      if (editSpecialtyId) {
        await axios.put(`${ip.address}/api/admin/specialty/update`, { specialtyId: editSpecialtyId, ...newSpecialty });
        setSpecialties(specialties.map(specialty => (specialty._id === editSpecialtyId ? { ...specialty, ...newSpecialty } : specialty)));
      } else {
        const res = await axios.post(`${ip.address}/api/admin/specialty/add`, { ...newSpecialty, adminId: aid });
        setSpecialties([...specialties, res.data.specialty]);
      }
      setNewSpecialty({ name: '', description: '' });
      setEditSpecialtyId(null);
      setShowModal(false);
    } catch (err) {
      console.error('Error saving specialty:', err);
    }
  };

  // Handle delete specialty
  const handleDeleteSpecialty = async (id) => {
    try {
      await axios.delete(`${ip.address}/api/admin/specialty/delete/${id}`);
      setSpecialties(specialties.filter(specialty => specialty._id !== id));
    } catch (err) {
      console.error('Error deleting specialty:', err);
    }
  };

  // Edit button clicked
  const handleEditClick = (specialty) => {
    setEditSpecialtyId(specialty._id);
    setNewSpecialty({ name: specialty.name, description: specialty.description });
    setShowModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditSpecialtyId(null);
    setNewSpecialty({ name: '', description: '' });
  };

  return (
    <div>
      <h2>Manage Specialties</h2>

      {/* Display list of specialties in a table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {specialties.map((specialty) => (
            <tr key={specialty._id}>
              <td>{specialty.name}</td>
              <td>{specialty.description}</td>
              <td>
                <Button variant="warning" onClick={() => handleEditClick(specialty)} style={{ marginRight: '10px' }}>Edit</Button>
                <Button variant="danger" onClick={() => handleDeleteSpecialty(specialty._id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Button to open modal for adding a new specialty */}
      <Button variant="primary" onClick={() => setShowModal(true)}>Add New Specialty</Button>

      {/* Modal for adding/editing a specialty */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editSpecialtyId ? 'Edit Specialty' : 'Add New Specialty'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveSpecialty}>
            <Form.Group controlId="specialtyName">
              <Form.Label>Specialty Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newSpecialty.name}
                onChange={handleInputChange}
                placeholder="Specialty Name"
                required
              />
            </Form.Group>
            <Form.Group controlId="specialtyDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={newSpecialty.description}
                onChange={handleInputChange}
                placeholder="Description"
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {editSpecialtyId ? 'Update' : 'Add'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ManageSpecialty;