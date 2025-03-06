import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { PencilSquare, Trash, CheckCircle, XCircle, CloudCheck } from 'react-bootstrap-icons';
import { ip } from '../../../../ContentExport';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    const [saveStatus, setSaveStatus] = useState("idle"); // idle, saving, saved, error
    console.log(immunizations)
    useEffect(() => {
        const fetchImmunizations = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${ip.address}/api/patient/api/onepatient/${patientId}`);
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

    // Handle form changes - no auto-save
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Manual save for when user completes the form
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        
        // Validate essential fields
        if (!formData.vaccineName) {
            setError('Vaccine name is required');
            return;
        }
        
        try {
            setSaveStatus("saving");
            
            if (editingIndex !== null) {
                const immunizationId = immunizations[editingIndex]._id;
                const response = await axios.put(`${ip.address}/api/immunization/update/${immunizationId}`, {
                    ...formData,
                    patientId,
                    administeredBy: doctorId,
                    appointments: [appointmentId]
                });
        
                setImmunizations(immunizations.map((immunization, index) =>
                    index === editingIndex ? response.data : immunization
                ));
            } else {
                const response = await axios.post(`${ip.address}/api/immunization`, {
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
            setSaveStatus("saved");
            
            toast.success(editingIndex !== null ? 
                "Immunization updated successfully!" : 
                "Immunization created successfully!");
                
            // Reset to idle after 3 seconds
            setTimeout(() => {
                setSaveStatus("idle");
            }, 3000);
        } catch (err) {
            console.error("Error saving immunization:", err);
            setSaveStatus("error");
            toast.error("Failed to save immunization");
            setError('Failed to save immunization');
        }
    };

    // Edit an existing immunization
    const handleEdit = (index) => {
        setFormData(immunizations[index]);
        setEditingIndex(index);
    };

    // Delete an immunization
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${ip.address}/api/immunization/delete/${id}`);
            setImmunizations(immunizations.filter(immunization => immunization._id !== id));
            toast.success("Immunization deleted successfully!");
        } catch (err) {
            console.error('Failed to delete immunization', err);
            toast.error("Failed to delete immunization");
            setError('Failed to delete immunization');
        }
    };
    
    // Reset form to create new immunization
    const handleNewImmunization = () => {
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
    };
    
    // Render save status indicator
    const renderSaveStatus = () => {
        switch (saveStatus) {
            case "saving":
                return (
                    <div className="save-indicator saving">
                        <Spinner animation="border" size="sm" className="me-2" />
                        <span>Saving...</span>
                    </div>
                );
            case "saved":
                return (
                    <div className="save-indicator saved">
                        <CloudCheck size={18} className="me-2" />
                        <span>All changes saved</span>
                    </div>
                );
            case "error":
                return (
                    <div className="save-indicator error">
                        <XCircle size={18} className="me-2" />
                        <span>Error saving changes</span>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) return (
        <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading immunization records...</p>
        </div>
    );

    return (
        <Container fluid>
            <ToastContainer position="top-right" autoClose={3000} />
            <Row className="mt-4">
                <Col md={4}>
                    {/* Immunization Creation/Update Form */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="d-flex justify-content-between align-items-center bg-white py-3">
                            <h5 className="mb-0">
                                {editingIndex !== null ? 'Edit Immunization' : 'Create Immunization'}
                            </h5>
                            {renderSaveStatus()}
                        </Card.Header>
                        <Card.Body className="p-4">
                            {error && <div className="alert alert-danger">{error}</div>}
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Vaccine Name*</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="vaccineName"
                                        value={formData.vaccineName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter vaccine name"
                                    />
                                </Form.Group>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="dateAdministered"
                                                value={formData.dateAdministered}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Lot Number</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="lotNumber"
                                                value={formData.lotNumber}
                                                onChange={handleChange}
                                                placeholder="Optional"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Dose Number</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="doseNumber"
                                                value={formData.doseNumber}
                                                onChange={handleChange}
                                                min="1"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Total Doses</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="totalDoses"
                                                value={formData.totalDoses}
                                                onChange={handleChange}
                                                min="1"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Site of Administration</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="siteOfAdministration"
                                                value={formData.siteOfAdministration}
                                                onChange={handleChange}
                                                placeholder="e.g. Left arm"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
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
                                                <option value="Intradermal">Intradermal</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Notes</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Additional details (optional)"
                                    />
                                </Form.Group>
                                
                                <div className="d-flex gap-2 mt-4">
                                    {editingIndex !== null && (
                                        <Button 
                                            variant="outline-secondary" 
                                            onClick={handleNewImmunization}
                                            className="me-auto"
                                        >
                                            Cancel Edit
                                        </Button>
                                    )}
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        className={editingIndex !== null ? '' : 'ms-auto'}
                                    >
                                        {editingIndex !== null ? 'Update Immunization' : 'Add Immunization'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    {/* Immunization List */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0">Immunization History</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">Vaccine</th>
                                        <th>Date Administered</th>
                                        <th>Dose</th>
                                        <th>Total Doses</th>
                                        <th>Route</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {immunizations && immunizations.length > 0 ? (
                                        immunizations.map((immunization, index) => (
                                            <tr key={immunization._id || index} className={editingIndex === index ? 'table-active' : ''}>
                                                <td className="ps-4">{immunization.vaccineName || 'N/A'}</td>
                                                <td>
                                                    {immunization.dateAdministered 
                                                        ? new Date(immunization.dateAdministered).toLocaleDateString() 
                                                        : 'N/A'}
                                                </td>
                                                <td>{immunization.doseNumber || 'N/A'}</td>
                                                <td>{immunization.totalDoses || 'N/A'}</td>
                                                <td>{immunization.routeOfAdministration || 'N/A'}</td>
                                                <td className="text-center">
                                                    {immunization.administeredBy._id === doctorId ? (
                                                        <div className="d-flex justify-content-center gap-3">
                                                            <Button 
                                                                variant="outline-primary" 
                                                                size="sm" 
                                                                className="p-1" 
                                                                onClick={() => handleEdit(index)}
                                                                title="Edit"
                                                            >
                                                                <PencilSquare />
                                                            </Button>
                                                            <Button 
                                                                variant="outline-danger" 
                                                                size="sm" 
                                                                className="p-1"
                                                                onClick={() => handleDelete(immunization._id)}
                                                                title="Delete"
                                                            >
                                                                <Trash />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted small">Not Editable</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4">
                                                <div className="d-flex flex-column align-items-center">
                                                    <div className="text-muted mb-2">
                                                        <i className="bi bi-clipboard-x" style={{fontSize: "2rem"}}></i>
                                                    </div>
                                                    <p className="mb-0">No immunizations available</p>
                                                    <p className="text-muted small">Add a new immunization using the form</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            <style jsx>{`
                .save-indicator {
                    display: flex;
                    align-items: center;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-size: 14px;
                    animation: fadeIn 0.3s ease;
                    transition: opacity 0.5s ease;
                }
                
                .save-indicator.saving {
                    background-color: #f8f9fa;
                    color: #212529;
                }
                
                .save-indicator.saved {
                    background-color: #d4edda;
                    color: #155724;
                    animation: fadeInOut 3s ease;
                }
                
                .save-indicator.error {
                    background-color: #f8d7da;
                    color: #721c24;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeInOut {
                    0% { opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
                
                .table-active {
                    background-color: rgba(0,123,255,0.1) !important;
                }
            `}</style>
        </Container>
    );
}

export default Immunization;