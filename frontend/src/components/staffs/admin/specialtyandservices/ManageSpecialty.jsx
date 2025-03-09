import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Container, Row, Col, Card } from 'react-bootstrap';
import { ip } from '../../../../ContentExport';
import { FaEdit, FaTrash, FaPlus, FaImage, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './ManageSpecialty.css';

function ManageSpecialty({ aid }) {
    const [specialties, setSpecialties] = useState([]);
    const [newSpecialty, setNewSpecialty] = useState({
        name: '',
        description: '',
        image: null,
    });
    const [editSpecialtyId, setEditSpecialtyId] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchSpecialties();
    }, []);

    const fetchSpecialties = async () => {
        try {
            const res = await axios.get(`${ip.address}/api/find/admin/specialties`);
            setSpecialties(res.data);
        } catch (err) {
            console.error('Error fetching specialties:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load specialties'
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'image' && files && files[0]) {
            setNewSpecialty({
                ...newSpecialty,
                image: files[0],
            });
            
            // Create a preview for the image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(files[0]);
        } else {
            setNewSpecialty({
                ...newSpecialty,
                [name]: value,
            });
        }
    };

    const handleSaveSpecialty = async (e) => {
        e.preventDefault();
        
        try {
            const formData = new FormData();
            formData.append('name', newSpecialty.name);
            formData.append('description', newSpecialty.description);
            if (newSpecialty.image) {
                formData.append('image', newSpecialty.image);
            }

            Swal.fire({
                title: 'Processing...',
                text: editSpecialtyId ? 'Updating specialty' : 'Adding new specialty',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            if (editSpecialtyId) {
                formData.append('specialtyId', editSpecialtyId);
                await axios.put(`${ip.address}/api/admin/specialty/update`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Specialty updated successfully',
                });
                
                fetchSpecialties();
            } else {
                formData.append('adminId', aid);
                const res = await axios.post(`${ip.address}/api/admin/specialty/add`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                
                setSpecialties([...specialties, res.data.specialty]);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'New specialty added successfully',
                });
            }

            resetForm();
        } catch (err) {
            console.error('Error saving specialty:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to save specialty'
            });
        }
    };

    const resetForm = () => {
        setNewSpecialty({ name: '', description: '', image: null });
        setEditSpecialtyId(null);
        setImagePreview(null);
    };

    const handleDeleteSpecialty = async (id) => {
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
                await axios.delete(`${ip.address}/api/admin/specialty/delete/${id}`);
                setSpecialties(specialties.filter(s => s._id !== id));
                
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Specialty has been deleted.'
                });
            }
        } catch (err) {
            console.error('Error deleting specialty:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to delete specialty.'
            });
        }
    };

    const handleEditClick = (specialty) => {
        setEditSpecialtyId(specialty._id);
        setNewSpecialty({
            name: specialty.name,
            description: specialty.description,
            image: null,
        });
        
        // Set image preview if available
        if (specialty.imageUrl) {
            setImagePreview(`${ip.address}/${specialty.imageUrl}`);
        } else {
            setImagePreview(null);
        }
    };

    return (
        <Container fluid className="specialty-container">
            <Row className="mb-4">
             <Col>
                       <h3 className="hmo-title">Manage Specialty</h3>
                       <p className="hmo-subtitle">Add, edit or remove Specialty</p>
                     </Col>
            </Row>
            
            <Row className="specialty-content d-flex">
                {/* Left Side Form */}
                <Col md={4} className="mb-4">
                    <Card className="specialty-form-card">
                        <Card.Header className="specialty-card-header">
                            <h4>
                                {editSpecialtyId ? (
                                    <>
                                        <FaEdit className="icon-margin" /> Edit Specialty
                                    </>
                                ) : (
                                    <>
                                        <FaPlus className="icon-margin" /> Add New Specialty
                                    </>
                                )}
                            </h4>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSaveSpecialty}>
                                <div className="image-preview-container mb-4">
                                    {imagePreview ? (
                                        <div className="image-preview">
                                            <img src={imagePreview} alt="Preview" />
                                            <Button 
                                                variant="light" 
                                                className="clear-image-btn"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setNewSpecialty({
                                                        ...newSpecialty,
                                                        image: null
                                                    });
                                                }}
                                            >
                                                <FaTimes />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="image-placeholder">
                                            <FaImage size={40} />
                                            <p>No Image Selected</p>
                                        </div>
                                    )}
                                </div>
                                
                                <Form.Group controlId="specialtyName" className="mb-3">
                                    <Form.Label>Specialty Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={newSpecialty.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter specialty name"
                                        required
                                    />
                                </Form.Group>
                                
                                <Form.Group controlId="specialtyDescription" className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="description"
                                        value={newSpecialty.description}
                                        onChange={handleInputChange}
                                        placeholder="Enter specialty description"
                                        required
                                    />
                                </Form.Group>
                                
                                <Form.Group controlId="specialtyImage" className="mb-3">
                                    <Form.Label>Upload Image</Form.Label>
                                    <div className="custom-file-input">
                                        <Button 
                                            variant="outline-secondary" 
                                            className="upload-btn"
                                            onClick={() => document.getElementById('imageInput').click()}
                                        >
                                            <FaImage className="icon-margin" /> 
                                            {newSpecialty.image ? 'Change Image' : 'Select Image'}
                                        </Button>
                                        <Form.Control
                                            type="file"
                                            name="image"
                                            id="imageInput"
                                            accept="image/*"
                                            onChange={handleInputChange}
                                            className="d-none"
                                        />
                                        <small className="text-muted">Recommended size: 400x400px</small>
                                    </div>
                                </Form.Group>
                                
                                <div className="button-group">
                                    {editSpecialtyId ? (
                                        <>
                                            <Button variant="primary" type="submit" className="w-100 mb-2">
                                                Update Specialty
                                            </Button>
                                            <Button 
                                                variant="outline-secondary" 
                                                className="w-100"
                                                onClick={resetForm}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <Button variant="primary" type="submit" className="w-100">
                                            Add Specialty
                                        </Button>
                                    )}
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Side Table */}
                <Col md={7} style={{width :'66%'}} >
                    <Card className="specialty-table-card">
                        <Card.Header className="specialty-card-header">
                            <h4>Specialty List</h4>
                            <span className="specialty-count">{specialties.length} specialties</span>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <Table hover className="specialty-table mb-0">
                                    <thead>
                                        <tr>
                                            <th width="80">Image</th>
                                            <th>Name</th>
                                            <th>Description</th>
                                            <th width="120">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {specialties.length > 0 ? (
                                            specialties.map((specialty) => (
                                                <tr key={specialty._id}>
                                                    <td>
                                                        {specialty.imageUrl ? (
                                                            <div className="table-img-container">
                                                                <img
                                                                    src={`${ip.address}/${specialty.imageUrl}`}
                                                                    alt={specialty.name}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="table-no-img">
                                                                <FaImage />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="specialty-name">{specialty.name}</td>
                                                    <td className="specialty-description">
                                                        {specialty.description.length > 100 
                                                            ? `${specialty.description.substring(0, 100)}...` 
                                                            : specialty.description}
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <Button
                                                                variant="outline-primary"
                                                                className="btn-action"
                                                                onClick={() => handleEditClick(specialty)}
                                                                title="Edit"
                                                            >
                                                                <FaEdit />
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                className="btn-action"
                                                                onClick={() => handleDeleteSpecialty(specialty._id)}
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
                                                <td colSpan="4" className="text-center py-5">
                                                    <p className="mb-0">No specialties found. Add your first specialty!</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default ManageSpecialty;