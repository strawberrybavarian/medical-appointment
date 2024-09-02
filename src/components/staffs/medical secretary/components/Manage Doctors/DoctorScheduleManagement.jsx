import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Row, Col, Container, Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import './Styles.css';
import MSDoctorProfile from './MSDoctorProfile';

const initialTimeSlot = { startTime: '', endTime: '', interval: 0, available: false };

const initialAvailability = {
    monday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    tuesday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    wednesday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    thursday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    friday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    saturday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    sunday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
};

function DoctorScheduleManagement() {
    const { did, msid } = useParams(); // Get the doctor ID from the route parameters
    
    const [availability, setAvailability] = useState(initialAvailability);
    const [activeAppointmentStatus, setActiveAppointmentStatus] = useState(true);
    const [docInfo, setDocInfo] = useState(null);  // Initialize with null

    // Fetch doctor information and availability
    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/doctor/one/${did}`);
                console.log(res.data);
                setDocInfo(res.data.doctor);  // Set the doctor info state
                
                const availabilityRes = await axios.get(`http://localhost:8000/doctor/${did}/available`);
                const { availability, activeAppointmentStatus } = availabilityRes.data;
                setAvailability(availability || initialAvailability);
                setActiveAppointmentStatus(activeAppointmentStatus);
            } catch (err) {
                console.error('Error fetching doctor data:', err);
            }
        };

        fetchDoctorData();
    }, [did]);

    const handleTimeChange = (day, period, field, value) => {
        setAvailability(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [period]: {
                    ...prev[day][period],
                    [field]: value
                }
            }
        }));
    };

    const handleAvailabilityChange = (day, period, value) => {
        setAvailability(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [period]: {
                    available: value
                }
            }
        }));
    };

    const handleSubmit = async () => {
        try {
            await axios.put(`http://localhost:8000/doctor/${did}/availability`, { availability });
            alert('Availability updated successfully');
        } catch (err) {
            console.error('Error updating availability:', err);
        }
    };

    const handleStatusChange = async () => {
        try {
            await axios.put(`http://localhost:8000/doctor/${did}/status`, { activeAppointmentStatus: !activeAppointmentStatus });
            setActiveAppointmentStatus(!activeAppointmentStatus);
        } catch (err) {
            console.error('Error updating appointment status:', err);
        }
    };

    return (
        <>
            <MedSecNavbar did={did}/>
            <Container fluid className=' dsm-container d-flex'>
        
                <MSDoctorProfile/>
         
  
                <Card className="dsm-card shadow-sm mt-4">
                    <Card.Header as="h5">
                       Appointment Schedule
                    </Card.Header>
                    <Card.Body>
                        <Form>
                            {Object.keys(availability).map(day => (
                                <div key={day} className="mb-4">
                                    <h4>{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                                    <Row>
                                        <Col>
                                            <Form.Group controlId={`${day}MorningAvailable`}>
                                                <Form.Check 
                                                    type="checkbox"
                                                    label="Available in the morning"
                                                    checked={availability[day]?.morning?.available || false}
                                                    onChange={(e) => handleAvailabilityChange(day, 'morning', e.target.checked)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    {availability[day]?.morning?.available && (
                                        <Row>
                                            <Col>
                                                <Form.Group controlId={`${day}MorningStartTime`}>
                                                    <Form.Label>Morning Start Time</Form.Label>
                                                    <Form.Control 
                                                        type="time" 
                                                        value={availability[day]?.morning?.startTime || ''} 
                                                        onChange={(e) => handleTimeChange(day, 'morning', 'startTime', e.target.value)} 
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group controlId={`${day}MorningEndTime`}>
                                                    <Form.Label>Morning End Time</Form.Label>
                                                    <Form.Control 
                                                        type="time" 
                                                        value={availability[day]?.morning?.endTime || ''} 
                                                        onChange={(e) => handleTimeChange(day, 'morning', 'endTime', e.target.value)} 
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group controlId={`${day}MorningInterval`}>
                                                    <Form.Label>Morning Interval (minutes)</Form.Label>
                                                    <Form.Control 
                                                        type="number" 
                                                        value={availability[day]?.morning?.interval} 
                                                        onChange={(e) => handleTimeChange(day, 'morning', 'interval', e.target.value)} 
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    )}
                                    <Row>
                                        <Col>
                                            <Form.Group controlId={`${day}AfternoonAvailable`}>
                                                <Form.Check 
                                                    type="checkbox"
                                                    label="Available in the afternoon"
                                                    checked={availability[day]?.afternoon?.available || false}
                                                    onChange={(e) => handleAvailabilityChange(day, 'afternoon', e.target.checked)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    {availability[day]?.afternoon?.available && (
                                        <Row>
                                            <Col>
                                                <Form.Group controlId={`${day}AfternoonStartTime`}>
                                                    <Form.Label>Afternoon Start Time</Form.Label>
                                                    <Form.Control 
                                                        type="time" 
                                                        value={availability[day]?.afternoon?.startTime || ''} 
                                                        onChange={(e) => handleTimeChange(day, 'afternoon', 'startTime', e.target.value)} 
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group controlId={`${day}AfternoonEndTime`}>
                                                    <Form.Label>Afternoon End Time</Form.Label>
                                                    <Form.Control 
                                                        type="time" 
                                                        value={availability[day]?.afternoon?.endTime || ''} 
                                                        onChange={(e) => handleTimeChange(day, 'afternoon', 'endTime', e.target.value)} 
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group controlId={`${day}AfternoonInterval`}>
                                                    <Form.Label>Afternoon Interval (minutes)</Form.Label>
                                                    <Form.Control 
                                                        type="number" 
                                                        value={availability[day]?.afternoon?.interval || 30} 
                                                        onChange={(e) => handleTimeChange(day, 'afternoon', 'interval', e.target.value)} 
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    )}
                                </div>
                            ))}
                            <Button variant="primary" onClick={handleSubmit} className="me-2">Save Availability</Button>
                            <Button variant={activeAppointmentStatus ? "danger" : "success"} onClick={handleStatusChange}>
                                {activeAppointmentStatus ? 'Deactivate Appointments' : 'Activate Appointments'}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
}

export default DoctorScheduleManagement;
