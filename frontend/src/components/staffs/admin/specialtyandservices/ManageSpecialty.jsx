// File: ManageSpecialty.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { ip } from '../../../../ContentExport'; // Ensure this points to your server address

function ManageSpecialty({ aid }) {
    const [specialties, setSpecialties] = useState([]);
    const [newSpecialty, setNewSpecialty] = useState({
        name: '',
        description: '',
        image: null,
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

        if (name === 'image') {
            setNewSpecialty({
                ...newSpecialty,
                image: e.target.files[0],
            });
        } else {
            setNewSpecialty({
                ...newSpecialty,
                [name]: value,
            });
        }
    };

    // Handle form submission for adding or updating a specialty
    const handleSaveSpecialty = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newSpecialty.name);
            formData.append('description', newSpecialty.description);
            if (newSpecialty.image) {
                formData.append('image', newSpecialty.image);
            }
            if (editSpecialtyId) {
                formData.append('specialtyId', editSpecialtyId);
                await axios.put(`${ip.address}/api/admin/specialty/update`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                fetchSpecialties(); // Refresh the list
            } else {
                formData.append('adminId', aid);
                const res = await axios.post(`${ip.address}/api/admin/specialty/add`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setSpecialties([...specialties, res.data.specialty]);
            }
            setNewSpecialty({ name: '', description: '', image: null });
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
        setNewSpecialty({
            name: specialty.name,
            description: specialty.description,
            image: null, // Set to null to allow for a new image upload
        });
        setShowModal(true);
    };

    // Handle modal close
    const handleCloseModal = () => {
        setShowModal(false);
        setEditSpecialtyId(null);
        setNewSpecialty({ name: '', description: '', image: null });
    };

    return (
        <div>
            <h2>Manage Specialties</h2>

            {/* Display list of specialties in a table */}
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {specialties.map((specialty) => (
                        <tr key={specialty._id}>
                            <td>
                                {specialty.imageUrl ? (
                                    <img
                                        src={`${ip.address}/${specialty.imageUrl}`} // Prepend server address
                                        alt={specialty.name}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                    />
                                ) : 'No Image'}
                            </td>
                            <td>{specialty.name}</td>
                            <td>{specialty.description}</td>
                            <td>
                                <Button
                                    variant="warning"
                                    onClick={() => handleEditClick(specialty)}
                                    style={{ marginRight: '10px' }}
                                >
                                    Edit
                                </Button>
                                <Button variant="danger" onClick={() => handleDeleteSpecialty(specialty._id)}>
                                    Delete
                                </Button>
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
                    {editSpecialtyId && specialties.find(s => s._id === editSpecialtyId).imageUrl && (
                        <div style={{ marginBottom: '15px' }}>
                            <p>Current Image:</p>
                            <img
                                src={`${ip.address}/${specialties.find(s => s._id === editSpecialtyId).imageUrl}`} // Prepend server address
                                alt={newSpecialty.name}
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                        </div>
                    )}
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
                        <Form.Group controlId="specialtyImage">
                            <Form.Label>Image</Form.Label>
                            <Form.Control
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" style={{ marginTop: '10px' }}>
                            {editSpecialtyId ? 'Update' : 'Add'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default ManageSpecialty;
