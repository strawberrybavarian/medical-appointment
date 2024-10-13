import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Table } from 'react-bootstrap';
import axios from 'axios';
import { PencilSquare, Trash } from 'react-bootstrap-icons'; // Import the icons
import { Link } from 'react-router-dom';

function Immunization({ patientId, doctorId, appointmentId }) {
    const [immunizations, setImmunizations] = useState([]);
    const [formData, setFormData] = useState({
        vaccineName: '',
        dateAdministered: '',
        doseNumber: '',
        totalDoses: '',
        lotNumber: '',
        siteOfAdministration: '',
        routeOfAdministration: 'Intramuscular',
        notes: ''
    });
    const [editingIndex, setEditingIndex] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImmunizations = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:8000/patient/api/onepatient/${patientId}`);
                if (response.data && response.data.thePatient && response.data.thePatient.immunizations) {
                    setImmunizations(response.data.thePatient.immunizations);
                } else {
                    setError('No immunizations found');
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to load immunizations');
                setLoading(false);
            }
        };
        fetchImmunizations();
    }, [patientId]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            if (editingIndex !== null) {
                const immunizationId = immunizations[editingIndex]._id;
                const response = await axios.put(`http://localhost:8000/api/immunization/update/${immunizationId}`, {
                    ...formData,
                    patientId,
                    administeredBy: doctorId,
                    appointments: [appointmentId]
                });
    
                setImmunizations(immunizations.map((immunization, index) =>
                    index === editingIndex ? response.data : immunization
                ));
            } else {
                const response = await axios.post('http://localhost:8000/api/immunization', {
                    ...formData,
                    patientId,
                    administeredBy: doctorId,
                    appointments: [appointmentId]
                });
                setImmunizations([...immunizations, response.data]);
            }
          
            setFormData({
                vaccineName: '',
                dateAdministered: '',
                doseNumber: '',
                totalDoses: '',
                lotNumber: '',
                siteOfAdministration: '',
                routeOfAdministration: 'Intramuscular',
                notes: ''
            });
            setEditingIndex(null);  
    
        } catch (err) {
            console.error("Error saving immunization:", err);
            setError('Failed to save immunization');
        }
    };

  
    const handleEdit = (index) => {
        setFormData(immunizations[index]);
        setEditingIndex(index);
    };

  
    const handleDelete = async (id) => {
        console.log('Deleting immunization:', id);
        console.log('patientId:', patientId);
        console.log('doctorId:', doctorId);
        console.log('appointmentId:', appointmentId);
    
        try {
            await axios.delete(`http://localhost:8000/api/immunization/delete/${id}`);
            setImmunizations(immunizations.filter(immunization => immunization._id !== id));
        } catch (err) {
            console.error('Failed to delete immunization', err);
            setError('Failed to delete immunization');
        }
    };
    

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <Container fluid>
            <Row className="mt-4">
                <Col md={4}>
                    {/* Immunization Creation/Update Form */}
                    <Card className="mb-4">
                        <Card.Header>{editingIndex !== null ? 'Edit Immunization' : 'Create Immunization'}</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Vaccine Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="vaccineName"
                                        value={formData.vaccineName}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Date Administered</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="dateAdministered"
                                        value={formData.dateAdministered}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Dose Number</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="doseNumber"
                                        value={formData.doseNumber}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Total Doses</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="totalDoses"
                                        value={formData.totalDoses}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Lot Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="lotNumber"
                                        value={formData.lotNumber}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Site of Administration</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="siteOfAdministration"
                                        value={formData.siteOfAdministration}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Route of Administration</Form.Label>
                                    <Form.Select
                                        name="routeOfAdministration"
                                        value={formData.routeOfAdministration}
                                        onChange={handleChange}
                                    >
                                        <option value="Intramuscular">Intramuscular</option>
                                        <option value="Subcutaneous">Subcutaneous</option>
                                        <option value="Oral">Oral</option>
                                        <option value="Intranasal">Intranasal</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Notes</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Button type="submit" variant="primary">
                                    {editingIndex !== null ? 'Update Immunization' : 'Create Immunization'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    {/* Immunization List */}
                    <Card className="mb-4">
                        <Card.Header>Immunization History</Card.Header>
                        <Card.Body>
                            <Table responsive striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Vaccine</th>
                                        <th>Date Administered</th>
                                        <th>Dose Number</th>
                                        <th>Total Doses</th>
                                        <th>Route</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {immunizations && immunizations.length > 0 ? (
                                        immunizations.map((immunization, index) => (
                                            <tr key={immunization._id || index}>
                                                <td>{immunization.vaccineName || 'N/A'}</td>
                                                <td>{immunization.dateAdministered ? new Date(immunization.dateAdministered).toLocaleDateString() : 'N/A'}</td>
                                                <td>{immunization.doseNumber || 'N/A'}</td>
                                                <td>{immunization.totalDoses || 'N/A'}</td>
                                                <td>{immunization.routeOfAdministration || 'N/A'}</td>
                                                <td>
    <div className="d-flex justify-content-around flex-wrap">
        {immunization.administeredBy === doctorId ? (
            <>
                <a
                    href="#"
                    className="warning-color"
                    onClick={(e) => {
                        e.preventDefault(); // Prevent default anchor behavior
                        handleEdit(index);
                    }}
                    title="Edit"
                >
                    <PencilSquare />
                </a>{" "}
                <a
                    href="#"
                    className="danger-color"
                    onClick={(e) => {
                        e.preventDefault(); // Prevent default anchor behavior
                        handleDelete(immunization._id);
                    }}
                    title="Remove"
                >
                    <Trash />
                </a>
            </>
        ) : (
            <span>Not Editable</span>
        )}
    </div>
</td>

                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6">No immunizations available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Immunization;
