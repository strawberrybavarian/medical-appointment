import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Container, Row, Col, Card } from 'react-bootstrap';
import { ip } from '../../../../ContentExport';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus, FaBuilding, FaSearch } from 'react-icons/fa';
import './ManageHMO.css';

function ManageHMO({ aid }) {
  const [hmos, setHmos] = useState([]);
  const [newHmo, setNewHmo] = useState({ name: '' });
  const [editHmoId, setEditHmoId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch all HMOs on component mount
    fetchHmos();
  }, []);

  // Fetch all HMOs from the server
  const fetchHmos = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${ip.address}/api/admin/getall/hmo`);
      setHmos(res.data);
    } catch (err) {
      console.error('Error fetching HMOs:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load HMO data'
      });
    } finally {
      setIsLoading(false);
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
      Swal.fire({
        title: 'Processing...',
        text: editHmoId ? 'Updating HMO' : 'Adding new HMO',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      if (editHmoId) {
        await axios.put(`${ip.address}/api/admin/update/hmo/${editHmoId}`, { ...newHmo });
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'HMO updated successfully'
        });
        
        setHmos(hmos.map(hmo => (hmo._id === editHmoId ? { ...hmo, ...newHmo } : hmo)));
      } else {
        const res = await axios.post(`${ip.address}/api/admin/add/hmo`, { ...newHmo, adminId: aid });
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'HMO added successfully'
        });
        
        setHmos([...hmos, res.data]);
      }
      
      setNewHmo({ name: '' });
      setEditHmoId(null);
      setShowModal(false);
    } catch (err) {
      console.error('Error saving HMO:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save HMO'
      });
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
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'HMO has been deleted.'
        });
      }
    } catch (err) {
      console.error('Error deleting HMO:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to delete HMO.'
      });
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

  // Filter HMOs based on search term
  const filteredHmos = hmos.filter(hmo => 
    hmo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="hmo-container">
      <Row className="mb-4">
        <Col>
          <h3 className="hmo-title">Manage HMOs</h3>
          <p className="hmo-subtitle">Add, edit or remove Health Maintenance Organizations</p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <Button 
            variant="primary" 
            className="add-hmo-btn"
            onClick={() => setShowModal(true)}
          >
            <FaPlus className="icon-margin" /> Add New HMO
          </Button>
        </Col>
      </Row>
      
      <Card className="hmo-card">
        <Card.Header className="hmo-card-header">
          <div className="hmo-header-content">
            <div className="hmo-header-title">
              <FaBuilding className="icon-margin" />
              <h4>HMO List</h4>
            </div>
            <div className="hmo-search">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search HMOs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="hmo-table mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="2" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredHmos.length > 0 ? (
                  filteredHmos.map((hmo) => (
                    <tr key={hmo._id}>
                      <td className="hmo-name">
                        <FaBuilding className="hmo-icon" /> {hmo.name}
                      </td>
                      <td className="text-end">
                        <div className="hmo-actions">
                          <Button
                            variant="outline-primary"
                            className="btn-action"
                            onClick={() => handleEditClick(hmo)}
                            title="Edit"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            className="btn-action"
                            onClick={() => handleDeleteHmo(hmo._id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center py-4">
                      {searchTerm ? (
                        <p className="mb-0">No HMOs match your search.</p>
                      ) : (
                        <div className="empty-state">
                          <FaBuilding size={32} />
                          <p>No HMOs found. Add your first HMO!</p>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => setShowModal(true)}
                            className="mt-2"
                          >
                            <FaPlus className="icon-margin" /> Add HMO
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal for adding/editing an HMO */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        centered
        className="hmo-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="hmo-modal-title">
            {editHmoId ? (
              <><FaEdit className="icon-margin" /> Edit HMO</>
            ) : (
              <><FaPlus className="icon-margin" /> Add New HMO</>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveHmo}>
            <Form.Group controlId="hmoName" className="mb-3">
              <Form.Label>HMO Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newHmo.name}
                onChange={handleInputChange}
                placeholder="Enter HMO name"
                required
                autoFocus
              />
            </Form.Group>
            
            <div className="modal-footer-buttons">
              <Button 
                variant="secondary" 
                onClick={handleCloseModal}
                className="cancel-btn"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                className="save-btn"
              >
                {editHmoId ? 'Update HMO' : 'Add HMO'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ManageHMO;