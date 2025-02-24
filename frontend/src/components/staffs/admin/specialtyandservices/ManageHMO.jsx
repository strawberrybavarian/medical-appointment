import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { ip } from '../../../../ContentExport';
import Swal from 'sweetalert2';
function ManageHMO({ aid }) {
  const [hmos, setHmos] = useState([]);
  const [newHmo, setNewHmo] = useState({ name: '' });
  const [editHmoId, setEditHmoId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetch all HMOs on component mount
    fetchHmos();
  }, []);

  // Fetch all HMOs from the server
  const fetchHmos = async () => {
    try {
      const res = await axios.get(`${ip.address}/api/admin/getall/hmo`);
      setHmos(res.data);
    } catch (err) {
      console.error('Error fetching HMOs:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHmo({
      ...newHmo,
      [name]: value,
    });
  };

  // Handle form submission for adding or updating an HMO
  const handleSaveHmo = async (e) => {
    e.preventDefault();
    try {
      if (editHmoId) {
        await axios.put(`${ip.address}/api/admin/update/hmo/${editHmoId}`, { ...newHmo });
        setHmos(hmos.map(hmo => (hmo._id === editHmoId ? { ...hmo, ...newHmo } : hmo)));
      } else {
        const res = await axios.post(`${ip.address}/api/admin/add/hmo`, { ...newHmo, adminId: aid });
        setHmos([...hmos, res.data]);
      }
      setNewHmo({ name: '' });
      setEditHmoId(null);
      setShowModal(false);
    } catch (err) {
      console.error('Error saving HMO:', err);
    }
  };

  // Handle delete HMO
  const handleDeleteHmo = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });
  
      if (result.isConfirmed) {
        await axios.delete(`${ip.address}/api/admin/delete/hmo/${id}`);
        setHmos(hmos.filter(hmo => hmo._id !== id));
        
        Swal.fire(
          'Deleted!',
          'HMO has been deleted.',
          'success'
        );
      }
    } catch (err) {
      console.error('Error deleting HMO:', err);
      Swal.fire(
        'Error!',
        'Failed to delete HMO.',
        'error'
      );
    }
  };

  // Edit button clicked
  const handleEditClick = (hmo) => {
    setEditHmoId(hmo._id);
    setNewHmo({ name: hmo.name });
    setShowModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setEditHmoId(null);
    setNewHmo({ name: '' });
  };

  return (
    <div>
      <h2>Manage HMOs</h2>

      {/* Display list of HMOs in a table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hmos.map((hmo) => (
            <tr key={hmo._id}>
              <td>{hmo.name}</td>
              <td>
                <Button variant="warning" onClick={() => handleEditClick(hmo)} style={{ marginRight: '10px' }}>Edit</Button>
                <Button variant="danger" onClick={() => handleDeleteHmo(hmo._id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Button to open modal for adding a new HMO */}
      <Button variant="primary" onClick={() => setShowModal(true)}>Add New HMO</Button>

      {/* Modal for adding/editing an HMO */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editHmoId ? 'Edit HMO' : 'Add New HMO'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveHmo}>
            <Form.Group controlId="hmoName">
              <Form.Label>HMO Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newHmo.name}
                onChange={handleInputChange}
                placeholder="HMO Name"
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {editHmoId ? 'Update' : 'Add'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ManageHMO;
