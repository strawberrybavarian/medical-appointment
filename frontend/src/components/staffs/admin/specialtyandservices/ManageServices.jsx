import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Container, Row, Col, Card } from 'react-bootstrap';
import { ip } from '../../../../ContentExport';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus, FaImage, FaTimes } from 'react-icons/fa';
import './ManageServices.css';

function ManageServices() {
    const [services, setServices] = useState([]);
    const [newService, setNewService] = useState({
        name: '',
        description: '',
        category: '',
        availability: 'Available',
        requirements: '',
        doctors: [],
        image: null,
    });
    const [editingService, setEditingService] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

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
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load services'
            });
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'image' && files && files[0]) {
            setNewService({
                ...newService,
                image: files[0],
            });
            
            // Create a preview for the image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(files[0]);
        } else {
            setNewService({
                ...newService,
                [name]: value,
            });
        }
    };

    // Handle form submission for adding or updating a service
    const handleSaveService = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newService.name);
            formData.append('description', newService.description);
            formData.append('category', newService.category);
            formData.append('availability', newService.availability);
            formData.append('requirements', newService.requirements);
            // Append image file if it exists
            if (newService.image) {
                formData.append('image', newService.image);
            }

            Swal.fire({
                title: 'Processing...',
                text: editingService ? 'Updating service' : 'Adding new service',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            if (editingService) {
                await axios.put(`${ip.address}/api/admin/update/services/${editingService._id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Service updated successfully',
                });
            } else {
                await axios.post(`${ip.address}/api/admin/add/services`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'New service added successfully',
                });
            }
            
            resetForm();
            fetchServices(); // Refresh the list
        } catch (error) {
            console.error('Error saving service:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to save service'
            });
        }
    };

    const resetForm = () => {
        setNewService({ 
            name: '', 
            description: '', 
            category: '', 
            availability: 'Available', 
            requirements: '', 
            doctors: [], 
            image: null 
        });
        setEditingService(null);
        setImagePreview(null);
        setShowModal(false);
    };

    // Handle delete service
    const handleDeleteService = async (id) => {
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
                await axios.delete(`${ip.address}/api/admin/delete/services/${id}`);
                fetchServices(); // Refresh the list
                
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Service has been deleted.'
                });
            }
        } catch (error) {
            console.error('Error deleting service:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to delete service.'
            });
        }
    };

    // Edit button clicked
    const handleEditClick = (service) => {
        setEditingService(service);
        setNewService({
            ...service,
            image: null, // Set to null to allow for a new image upload
        });
        
        // Set image preview if available
        if (service.imageUrl) {
            setImagePreview(`${ip.address}/${service.imageUrl}`);
        } else {
            setImagePreview(null);
        }
        
        setShowModal(true);
    };

    // Get status badge class based on availability
    const getAvailabilityBadgeClass = (availability) => {
        switch(availability) {
            case 'Available':
                return 'badge-available';
            case 'Not Available':
                return 'badge-not-available';
            case 'Coming Soon':
                return 'badge-coming-soon';
            default:
                return 'badge-available';
        }
    };

    return (
        <Container fluid className="services-container">
            <Row className="mb-4">
                <Col>
                    <h3 className="services-title">Manage Services</h3>
                    <p className="services-subtitle">Add, edit or remove medical services</p>
                </Col>
                <Col xs="auto">
                    <Button 
                        variant="primary" 
                        className="add-service-btn" 
                        onClick={() => setShowModal(true)}
                    >
                        <FaPlus className="icon-margin" /> Add New Service
                    </Button>
                </Col>
            </Row>
            
            <div className="services-grid">
                {services.length > 0 ? (
                    services.map((service) => (
                        <Card key={service._id} className="service-card">
                            <div className="service-card-img-wrapper">
                                {service.imageUrl ? (
                                    <div className="service-card-img">
                                        <img 
                                            src={`${ip.address}/${service.imageUrl}`} 
                                            alt={service.name}
                                        />
                                    </div>
                                ) : (
                                    <div className="service-card-no-img">
                                        <FaImage />
                                    </div>
                                )}
                                <div className={`service-badge ${getAvailabilityBadgeClass(service.availability)}`}>
                                    {service.availability}
                                </div>
                            </div>
                            <Card.Body>
                                <h5 className="service-name">{service.name}</h5>
                                <p className="service-category">{service.category}</p>
                                <p className="service-description">{service.description}</p>
                                {service.requirements && (
                                    <div className="service-requirements">
                                        <h6>Requirements:</h6>
                                        <p>{service.requirements}</p>
                                    </div>
                                )}
                                <div className="service-actions">
                                    <Button 
                                        variant="outline-primary" 
                                        className="service-action-btn edit-btn"
                                        onClick={() => handleEditClick(service)}
                                    >
                                        <FaEdit /> Edit
                                    </Button>
                                    <Button 
                                        variant="outline-danger" 
                                        className="service-action-btn delete-btn"
                                        onClick={() => handleDeleteService(service._id)}
                                    >
                                        <FaTrash /> Delete
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    ))
                ) : (
                    <div className="services-empty">
                        <FaImage size={40} />
                        <h4>No Services Found</h4>
                        <p>Add your first service to get started</p>
                        <Button 
                            variant="primary" 
                            className="mt-3"
                            onClick={() => setShowModal(true)}
                        >
                            <FaPlus className="icon-margin" /> Add Service
                        </Button>
                    </div>
                )}
            </div>

            {/* Modal for adding/editing a service */}
            <Modal 
                show={showModal} 
                onHide={resetForm}
                size="lg"
                centered
                className="service-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title className="service-modal-title">
                        {editingService ? (
                            <>
                                <FaEdit className="icon-margin" /> Edit Service
                            </>
                        ) : (
                            <>
                                <FaPlus className="icon-margin" /> Add New Service
                            </>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className=''>
                    <Form onSubmit={handleSaveService}>
                        <Row>
                            <Col md={12}>
                                <div className="service-image-upload">
                                    {imagePreview ? (
                                        <div className="service-image-preview">
                                            <img src={imagePreview} alt="Preview" />
                                            <Button 
                                                variant="light" 
                                                className="clear-image-btn"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setNewService({
                                                        ...newService,
                                                        image: null
                                                    });
                                                }}
                                            >
                                                <FaTimes />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="service-image-placeholder">
                                            <FaImage size={40} />
                                            <p>No Image Selected</p>
                                        </div>
                                    )}
                                    <div className="service-image-upload-btn">
                                        <Button
                                            variant="outline-secondary"
                                            className="upload-btn w-100"
                                            onClick={() => document.getElementById('serviceImageInput').click()}
                                        >
                                            <FaImage className="icon-margin" />
                                            {newService.image ? 'Change Image' : 'Select Image'}
                                        </Button>
                                        <Form.Control
                                            type="file"
                                            name="image"
                                            id="serviceImageInput"
                                            accept="image/*"
                                            onChange={handleInputChange}
                                            className="d-none"
                                        />
                                        <small className="text-muted">Recommended size: 400x300px</small>
                                    </div>
                                </div>
                            </Col>
                            
                            <Col md={12}>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group controlId="serviceName" className="mb-3">
                                            <Form.Label>Service Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={newService.name}
                                                onChange={handleInputChange}
                                                placeholder="Enter service name"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group controlId="serviceCategory" className="mb-3">
                                            <Form.Label>Category</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="category"
                                                value={newService.category}
                                                onChange={handleInputChange}
                                                placeholder="Enter category"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group controlId="serviceDescription" className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={newService.description}
                                        onChange={handleInputChange}
                                        placeholder="Enter a description of the service"
                                    />
                                </Form.Group>

                                <Form.Group controlId="serviceAvailability" className="mb-3">
                                    <Form.Label>Availability</Form.Label>
                                    <Form.Select
                                        name="availability"
                                        value={newService.availability}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Not Available">Not Available</option>
                                        <option value="Coming Soon">Coming Soon</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group controlId="serviceRequirements" className="mb-3">
                                    <Form.Label>Requirements</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="requirements"
                                        value={newService.requirements}
                                        onChange={handleInputChange}
                                        placeholder="Enter any requirements for this service"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="modal-footer-buttons">
                            <Button 
                                variant="secondary" 
                                onClick={resetForm}
                                className="cancel-btn"
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="primary" 
                                type="submit"
                                className="save-btn"
                            >
                                {editingService ? 'Update Service' : 'Add Service'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default ManageServices;