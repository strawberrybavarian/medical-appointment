import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Row, Col } from 'react-bootstrap';

const initialTimeSlot = { startTime: '', endTime: '', interval: 30, available: false };

const initialAvailability = {
    monday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    tuesday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    wednesday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    thursday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    friday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    saturday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    sunday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
};

function DoctorAvailability({ doctorId }) {
    
    
    const [availability, setAvailability] = useState(initialAvailability);
    const [activeAppointmentStatus, setActiveAppointmentStatus] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:8000/doctor/${doctorId}/available`)
            .then(res => {
                const { availability, activeAppointmentStatus } = res.data;
                setAvailability(availability || initialAvailability); // Set default if undefined
                setActiveAppointmentStatus(activeAppointmentStatus);
            })
            .catch(err => console.log(err));
    }, [doctorId]);

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
                    ...prev[day][period],
                    available: value
                }
            }
        }));
    };

    const handleSubmit = () => {
        axios.put(`http://localhost:8000/doctor/${doctorId}/availability`, { availability })
            .then(res => {
                alert('Availability updated successfully');
            })
            .catch(err => console.log(err));
    };

    const handleStatusChange = () => {
        axios
            .put(`http://localhost:8000/doctor/${doctorId}/appointmentstatus`, {
                activeAppointmentStatus: !activeAppointmentStatus
            })
            .then((res) => {
                setActiveAppointmentStatus(res.data.activeAppointmentStatus); // Ensure you're setting the updated status
            })
            .catch((err) => console.log(err));
    };
    

    return (
        <div style={{display: "flex", flex: "1 0 auto", height: "100vh", overflowY: "hidden"}}>
            <div style={{ padding: "20px", paddingBottom:"100px", overflowY: "auto", overflowX: "hidden" }} className="container1 container-fluid ">
            <h3>Manage Availability</h3>
            <Form>
                {Object.keys(availability).map(day => (
                    <div key={day}>
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
                                            value={availability[day]?.morning?.interval || 30} 
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
                <Button onClick={handleSubmit}>Save Availability</Button>
            </Form>
            <hr />
            <Button onClick={handleStatusChange}>
                {activeAppointmentStatus ? 'Deactivate Appointments' : 'Activate Appointments'}
            </Button>
            </div>
        </div>
    );
}

export default DoctorAvailability;