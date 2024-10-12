import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import axios from 'axios';
import './PrescriptionStyle.css'
import { ip } from '../../../../ContentExport';
function PrescriptionModal({ show, handleClose, patientId, appointmentId, doctorId }) {
    
    
    const [medications, setMedications] = useState([{ name: '', type: '', instruction: '' }]);
    const [error, setError] = useState('');
    console.log(appointmentId);
    console.log(patientId);
    const handleMedicationChange = (index, field, value) => {
        const newMedications = [...medications];
        newMedications[index][field] = value;
        setMedications(newMedications);
    };

    const addMedication = () => {
        setMedications([...medications, { name: '', type: '', instruction: '' }]);
    };

    const removeMedication = (index) => {
        const newMedications = medications.filter((_, i) => i !== index);
        setMedications(newMedications);
    };

    const handleSubmit = async () => {
        try {
            const prescriptionData = {
                patient: patientId,
                appointment: appointmentId,
                doctor: doctorId,
                medications
            };

            await axios.post(`${ip.address}/doctor/api/createPrescription/${patientId}/${appointmentId}`, prescriptionData);
            window.alert("Prescription created successfully!");
            handleClose();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Create Prescription</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {medications.map((medication, index) => {
                        console.log(medication);
                        return(
                        <div key={index}>
                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Name of Drug</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={medication.name}
                                            onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Type of Drug</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={medication.type}
                                            onChange={(e) => handleMedicationChange(index, 'type', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                               
                                    <Form.Group className="mb-3">
                                        <Form.Label>Instructions</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={medication.instruction}
                                            onChange={(e) => handleMedicationChange(index, 'instruction', e.target.value)}
                                        />
                                    </Form.Group>
                                
                                <Col>
                                    <div className='pm-remove'>

                                    
                                        <Button variant="danger" onClick={() => removeMedication(index)}>Remove</Button>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )})}
                    <Button variant="secondary" onClick={addMedication}>Add Medication</Button>
                    {error && <p>{error}</p>}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary" onClick={handleSubmit}>Submit</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default PrescriptionModal;