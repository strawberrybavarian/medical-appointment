import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Container, Row, Col } from 'react-bootstrap';
import { ip } from '../../../../ContentExport';
import { FaEdit, FaTrash } from 'react-icons/fa';

function ManageSpecialty({ aid }) {
    const [specialties, setSpecialties] = useState([]);
    const [newSpecialty, setNewSpecialty] = useState({
        name: '',
        description: '',
        image: null,
    });
    const [editSpecialtyId, setEditSpecialtyId] = useState(null);

    useEffect(() => {
        fetchSpecialties();
    }, []);

    const fetchSpecialties = async () => {
        try {
            const res = await axios.get(`${ip.address}/api/find/admin/specialties`);
            setSpecialties(res.data);
        } catch (err) {
            console.error('Error fetching specialties:', err);
        }
    };

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
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                fetchSpecialties();
            } else {
                formData.append('adminId', aid);
                const res = await axios.post(`${ip.address}/api/admin/specialty/add`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setSpecialties([...specialties, res.data.specialty]);
            }

            setNewSpecialty({ name: '', description: '', image: null });
            setEditSpecialtyId(null);
        } catch (err) {
            console.error('Error saving specialty:', err);
        }
    };

    const handleDeleteSpecialty = async (id) => {
        try {
            await axios.delete(`${ip.address}/api/admin/specialty/delete/${id}`);
            setSpecialties(specialties.filter(s => s._id !== id));
        } catch (err) {
            console.error('Error deleting specialty:', err);
        }
    };

    const handleEditClick = (specialty) => {
        setEditSpecialtyId(specialty._id);
        setNewSpecialty({
            name: specialty.name,
            description: specialty.description,
            image: null,
        });
    };

    return (
        <>
           
            <Row>
                {/* Left Side Form */}
                <Col>
                    <div className="card p-3 shadow-sm">
                        <h4>{editSpecialtyId ? 'Edit Specialty' : 'Add New Specialty'}</h4>
                        {editSpecialtyId && specialties.find(s => s._id === editSpecialtyId)?.imageUrl && (
                            <div className="mb-3">
                                <p>Current Image:</p>
                                <img
                                    src={`${ip.address}/${specialties.find(s => s._id === editSpecialtyId).imageUrl}`}
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
                                     as="textarea"
                                     rows={3}
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
                            <Button variant="primary" type="submit" className="mt-3">
                                {editSpecialtyId ? 'Update' : 'Add'}
                            </Button>
                            {editSpecialtyId && (
                                <Button variant="secondary" className="mt-3 ms-2" onClick={() => {
                                    setEditSpecialtyId(null);
                                    setNewSpecialty({ name: '', description: '', image: null });
                                }}>
                                    Cancel
                                </Button>
                            )}
                        </Form>
                    </div>
                </Col>

                {/* Right Side Table */}
                <div className="col-md-8">
                    <Table striped bordered hover className="shadow-sm">
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
                                                src={`${ip.address}/${specialty.imageUrl}`}
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
                                            className="me-2"
                                            onClick={() => handleEditClick(specialty)}
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDeleteSpecialty(specialty._id)}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Row>
        </>
    );
}

export default ManageSpecialty;
