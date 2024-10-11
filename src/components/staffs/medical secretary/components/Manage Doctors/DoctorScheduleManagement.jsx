import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Row, Col, Card, Toast, ToastContainer } from 'react-bootstrap';
import { useLocation, useParams } from 'react-router-dom';
import './Styles.css';
import { ip } from '../../../../../ContentExport';
const initialTimeSlot = { startTime: '', endTime: '', available: false };

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
    const location = useLocation();
    const { did } = location.state; // Get the doctor ID from the route parameters
    
    const [availability, setAvailability] = useState(initialAvailability);
    const [activeAppointmentStatus, setActiveAppointmentStatus] = useState(true);
    const [docInfo, setDocInfo] = useState(null);  // Initialize with null
    const [error, setError] = useState(''); // To handle validation errors
    const [showToast, setShowToast] = useState(false); // Toast visibility state

    // Fetch doctor information and availability
    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const res = await axios.get(`${ip.address}/doctor/one/${did}`);
                setDocInfo(res.data.doctor);  // Set the doctor info state
                
                const availabilityRes = await axios.get(`${ip.address}/doctor/${did}/available`);
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

    // Validate start and end times for all available slots
    const validateAvailability = () => {
        for (const day of Object.keys(availability)) {
            const periods = ['morning', 'afternoon'];
            for (const period of periods) {
                const slot = availability[day][period];
                if (slot.available) {
                    // Check if both start and end times are set
                    if (!slot.startTime || !slot.endTime) {
                        return `${day.charAt(0).toUpperCase() + day.slice(1)}: Start and End times must be set for ${period}`;
                    }
                    // Check if start time is before end time
                    if (slot.startTime >= slot.endTime) {
                        return `${day.charAt(0).toUpperCase() + day.slice(1)}: Start time must be earlier than End time for ${period}`;
                    }
                }
            }
        }
        return '';
    };

    const handleSubmit = async () => {
        const validationError = validateAvailability();
        if (validationError) {
            setError(validationError);
            setShowToast(true); // Show toast on error
            return;
        }
        setError(''); // Clear error if no validation issues
        setShowToast(false); // Hide toast if no error

        try {
            await axios.put(`${ip.address}/doctor/${did}/availability`, { availability });
            alert('Availability updated successfully');
        } catch (err) {
            console.error('Error updating availability:', err);
        }
    };

    const handleStatusChange = async () => {
        try {
            await axios.put(`${ip.address}/doctor/${did}/appointmentstatus`, { activeAppointmentStatus: !activeAppointmentStatus });
            setActiveAppointmentStatus(!activeAppointmentStatus);
        } catch (err) {
            console.error('Error updating appointment status:', err);
        }
    };

    return (
        <>
            {/* Toast Notification for errors */}
            <ToastContainer position="bottom-end" className="p-3 margin-right">
                <Toast onClose={() => setShowToast(false)} show={showToast} bg="danger" delay={5000} autohide>
                    <Toast.Header>
                        <strong className="me-auto">Error</strong>
                    </Toast.Header>
                    <Toast.Body>{error}</Toast.Body>
                </Toast>
            </ToastContainer>

            <Card className="shadow-sm mt-4">
                <Card.Header as="h5">Appointments</Card.Header>
                <Card.Body className='dsm-card'>
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
        </>
    );
}

export default DoctorScheduleManagement;
