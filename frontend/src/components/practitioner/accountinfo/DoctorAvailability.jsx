import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Row, Col, Alert, Card, Container, Collapse } from 'react-bootstrap';
import DeactivationModal from './modal/DeactivationModal';
import { ip } from '../../../ContentExport';
import Swal from 'sweetalert2';
import { useUser } from '../../UserContext';
import { Calendar2Week, Clock, People, ChevronDown, ChevronUp, CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';

const initialTimeSlot = { startTime: '', endTime: '', available: false, maxPatients: 0 };

const initialAvailability = {
    monday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    tuesday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    wednesday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    thursday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    friday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    saturday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
    sunday: { morning: { ...initialTimeSlot }, afternoon: { ...initialTimeSlot } },
};

function DoctorAvailability() {
    const { user } = useUser();
    const doctorId = user._id;
    const [availability, setAvailability] = useState(initialAvailability);
    const [activeAppointmentStatus, setActiveAppointmentStatus] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [expandedDays, setExpandedDays] = useState({
        monday: true,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axios.get(`${ip.address}/api/doctor/${doctorId}/available`)
            .then(res => {
                const { availability, activeAppointmentStatus } = res.data;
                setAvailability(availability || initialAvailability);
                setActiveAppointmentStatus(activeAppointmentStatus);
            })
            .catch(err => console.log(err));
    }, [doctorId]);

    const validatePeriod = (day, period) => {
        const slot = availability[day][period];
        const errorsCopy = { ...formErrors };
        if (slot.available) {
            if (!slot.startTime || !slot.endTime || slot.maxPatients <= 0) {
                errorsCopy[`${day}-${period}`] = 'Please fill out valid Start/End Time and Max Patients.';
            } else {
                delete errorsCopy[`${day}-${period}`];
            }
        } else {
            delete errorsCopy[`${day}-${period}`];
        }
        setFormErrors(errorsCopy);
    };

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
        // Real-time validation
        setTimeout(() => validatePeriod(day, period), 0);
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
        setTimeout(() => validatePeriod(day, period), 0);
    };

    const handleMaxPatientsChange = (day, period, value) => {
        const numValue = parseInt(value, 10) || 0;
        setAvailability(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [period]: {
                    ...prev[day][period],
                    maxPatients: numValue
                }
            }
        }));
        setTimeout(() => validatePeriod(day, period), 0);
    };

    const toggleDayExpansion = (day) => {
        setExpandedDays(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
    };

    const handleSubmit = () => {
        // Validate all fields
        let hasError = false;
        const errors = {};
        
        for (const day of Object.keys(availability)) {
            const morning = availability[day].morning;
            const afternoon = availability[day].afternoon;

            if (morning.available) {
                if (!morning.startTime || !morning.endTime || morning.maxPatients <= 0) {
                    errors[`${day}-morning`] = 'Please fill out valid Start/End Time and Max Patients.';
                    hasError = true;
                    
                    // Auto-expand the day with error
                    setExpandedDays(prev => ({
                        ...prev,
                        [day]: true
                    }));
                }
            }
            
            if (afternoon.available) {
                if (!afternoon.startTime || !afternoon.endTime || afternoon.maxPatients <= 0) {
                    errors[`${day}-afternoon`] = 'Please fill out valid Start/End Time and Max Patients.';
                    hasError = true;
                    
                    // Auto-expand the day with error
                    setExpandedDays(prev => ({
                        ...prev,
                        [day]: true
                    }));
                }
            }
        }

        setFormErrors(errors);
        
        if (hasError) {
            Swal.fire({
                icon: 'error',
                title: 'Incomplete Information',
                text: 'Please fill in all required fields for your available time slots.',
            });
            return;
        }

        setSaving(true);
        axios.put(`${ip.address}/api/doctor/${doctorId}/availability`, { availability })
            .then(res => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Availability updated successfully',
                    icon: 'success',
                    confirmButtonText: 'Confirm'
                });
                setSaving(false);
            })
            .catch(err => {
                console.log(err);
                setSaving(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update availability. Please try again.',
                });
            });
    };

    const handleStatusChange = () => {
        if (activeAppointmentStatus) {
            setShowModal(true);
        } else {
            axios
                .put(`${ip.address}/api/doctor/${doctorId}/appointmentstatus`, {
                    activeAppointmentStatus: !activeAppointmentStatus
                })
                .then((res) => {
                    setActiveAppointmentStatus(res.data.activeAppointmentStatus);
                    Swal.fire({
                        title: 'Success!',
                        text: 'Appointment status updated successfully',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                })
                .catch((err) => console.log(err));
        }
    };

    const handleModalConfirm = (reason) => {
        axios
            .post(`${ip.address}/api/doctor/${doctorId}/request-deactivation`, { reason })
            .then(() => {
                setShowModal(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Request Sent',
                    text: 'Deactivation request sent. Awaiting confirmation.',
                });
            })
            .catch((err) => console.log(err));
    };

    const isAnyAvailabilitySet = () => {
        for (const day in availability) {
            if ((availability[day].morning.available) || 
                (availability[day].afternoon.available)) {
                return true;
            }
        }
        return false;
    };

    return (
        <Container className="availability-container py-4">
            <Card className="availability-status-card mb-4">
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <h4 className="availability-title mb-0">
                                <Calendar2Week className="me-2" />
                                Appointment Schedule
                            </h4>
                            <p className="text-muted mt-1 mb-0">Set your weekly availability for patient appointments</p>
                        </Col>
                        <Col md={6} className="text-md-end mt-3 mt-md-0">
                            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-end">
                                <div className="d-flex align-items-center mb-2 mb-md-0 me-md-3">
                                    <span className="me-2">Status:</span>
                                    <span className={`availability-status-badge ${activeAppointmentStatus ? 'active' : 'inactive'}`}>
                                        {activeAppointmentStatus ? (
                                            <><CheckCircleFill size={14} className="me-1" /> Active</>
                                        ) : (
                                            <><XCircleFill size={14} className="me-1" /> Inactive</>
                                        )}
                                    </span>
                                </div>
                                <Button 
                                    variant={activeAppointmentStatus ? 'outline-danger' : 'outline-success'} 
                                    onClick={handleStatusChange}
                                    className="availability-toggle-btn"
                                >
                                    {activeAppointmentStatus ? 'Deactivate Appointments' : 'Activate Appointments'}
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {!activeAppointmentStatus && (
                <Alert variant="warning" className="mb-4">
                    <Alert.Heading>Appointments are currently disabled</Alert.Heading>
                    <p>Patients cannot book appointments with you while this setting is inactive.</p>
                </Alert>
            )}

            {(!isAnyAvailabilitySet() && activeAppointmentStatus) && (
                <Alert variant="info" className="mb-4">
                    <Alert.Heading>No Availability Set</Alert.Heading>
                    <p>You haven't set any available time slots yet. Patients won't be able to book appointments until you set your availability.</p>
                </Alert>
            )}

            <Form className="availability-form">
                {Object.keys(availability).map(day => (
                    <Card key={day} className="availability-day-card mb-3">
                        <Card.Header 
                            className={`d-flex justify-content-between align-items-center cursor-pointer ${expandedDays[day] ? 'active' : ''}`}
                            onClick={() => toggleDayExpansion(day)}
                        >
                            <div className="d-flex align-items-center">
                                <h5 className="mb-0 text-capitalize">{day}</h5>
                                {(availability[day].morning.available || availability[day].afternoon.available) && (
                                    <span className="availability-indicator ms-3">Available</span>
                                )}
                            </div>
                            <div>
                                {expandedDays[day] ? (
                                    <ChevronUp size={18} />
                                ) : (
                                    <ChevronDown size={18} />
                                )}
                            </div>
                        </Card.Header>
                        <Collapse in={expandedDays[day]}>
                            <div>
                                <Card.Body>
                                    {/* Morning section */}
                                    <div className="availability-period-section">
                                        <h6 className="availability-period-title">
                                            Morning Availability
                                        </h6>
                                        <Row>
                                            <Col lg={3} md={6}>
                                                <Form.Group controlId={`${day}MorningAvailable`} className="mb-3">
                                                    <Form.Check
                                                        type="switch"
                                                        label="Available in the morning"
                                                        checked={availability[day]?.morning?.available || false}
                                                        onChange={(e) => handleAvailabilityChange(day, 'morning', e.target.checked)}
                                                        className="availability-toggle"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {availability[day]?.morning?.available && (
                                            <Row className="availability-time-slots">
                                                <Col lg={4} md={6}>
                                                    <Form.Group controlId={`${day}MorningStartTime`} className="mb-3">
                                                        <Form.Label className="availability-form-label">
                                                            <Clock size={14} className="me-1" /> Start Time
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="time"
                                                            value={availability[day]?.morning?.startTime || ''}
                                                            onChange={(e) => handleTimeChange(day, 'morning', 'startTime', e.target.value)}
                                                            className="availability-form-control"
                                                            isInvalid={!!formErrors[`${day}-morning`]}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col lg={4} md={6}>
                                                    <Form.Group controlId={`${day}MorningEndTime`} className="mb-3">
                                                        <Form.Label className="availability-form-label">
                                                            <Clock size={14} className="me-1" /> End Time
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="time"
                                                            value={availability[day]?.morning?.endTime || ''}
                                                            onChange={(e) => handleTimeChange(day, 'morning', 'endTime', e.target.value)}
                                                            className="availability-form-control"
                                                            isInvalid={!!formErrors[`${day}-morning`]}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col lg={4} md={6}>
                                                    <Form.Group controlId={`${day}MorningMaxPatients`} className="mb-3">
                                                        <Form.Label className="availability-form-label">
                                                            <People size={14} className="me-1" /> Max Patients
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min="1"
                                                            value={availability[day]?.morning?.maxPatients}
                                                            onChange={(e) => handleMaxPatientsChange(day, 'morning', e.target.value)}
                                                            className="availability-form-control"
                                                            isInvalid={!!formErrors[`${day}-morning`]}
                                                        />
                                                        {formErrors[`${day}-morning`] && (
                                                            <Form.Control.Feedback type="invalid">{formErrors[`${day}-morning`]}</Form.Control.Feedback>
                                                        )}
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        )}
                                    </div>

                                    <hr className="availability-divider" />

                                    {/* Afternoon section */}
                                    <div className="availability-period-section">
                                        <h6 className="availability-period-title">
                                            Afternoon Availability
                                        </h6>
                                        <Row>
                                            <Col lg={3} md={6}>
                                                <Form.Group controlId={`${day}AfternoonAvailable`} className="mb-3">
                                                    <Form.Check
                                                        type="switch"
                                                        label="Available in the afternoon"
                                                        checked={availability[day]?.afternoon?.available || false}
                                                        onChange={(e) => handleAvailabilityChange(day, 'afternoon', e.target.checked)}
                                                        className="availability-toggle"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {availability[day]?.afternoon?.available && (
                                            <Row className="availability-time-slots">
                                                <Col lg={4} md={6}>
                                                    <Form.Group controlId={`${day}AfternoonStartTime`} className="mb-3">
                                                        <Form.Label className="availability-form-label">
                                                            <Clock size={14} className="me-1" /> Start Time
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="time"
                                                            value={availability[day]?.afternoon?.startTime || ''}
                                                            onChange={(e) => handleTimeChange(day, 'afternoon', 'startTime', e.target.value)}
                                                            className="availability-form-control"
                                                            isInvalid={!!formErrors[`${day}-afternoon`]}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col lg={4} md={6}>
                                                    <Form.Group controlId={`${day}AfternoonEndTime`} className="mb-3">
                                                        <Form.Label className="availability-form-label">
                                                            <Clock size={14} className="me-1" /> End Time
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="time"
                                                            value={availability[day]?.afternoon?.endTime || ''}
                                                            onChange={(e) => handleTimeChange(day, 'afternoon', 'endTime', e.target.value)}
                                                            className="availability-form-control"
                                                            isInvalid={!!formErrors[`${day}-afternoon`]}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col lg={4} md={6}>
                                                    <Form.Group controlId={`${day}AfternoonMaxPatients`} className="mb-3">
                                                        <Form.Label className="availability-form-label">
                                                            <People size={14} className="me-1" /> Max Patients
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min="1"
                                                            value={availability[day]?.afternoon?.maxPatients}
                                                            onChange={(e) => handleMaxPatientsChange(day, 'afternoon', e.target.value)}
                                                            className="availability-form-control"
                                                            isInvalid={!!formErrors[`${day}-afternoon`]}
                                                        />
                                                        {formErrors[`${day}-afternoon`] && (
                                                            <Form.Control.Feedback type="invalid">{formErrors[`${day}-afternoon`]}</Form.Control.Feedback>
                                                        )}
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        )}
                                    </div>
                                </Card.Body>
                            </div>
                        </Collapse>
                    </Card>
                ))}

                <div className="text-center mt-4 mb-5">
                    <Button 
                        size="lg" 
                        onClick={handleSubmit} 
                        variant="primary"
                        className="availability-save-btn"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Availability'}
                    </Button>
                </div>
            </Form>

            <DeactivationModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                handleConfirm={handleModalConfirm}
            />

            <style jsx>{`
                .availability-container {
                    max-width: 1200px;
                }
                
                .availability-title {
                    color: #2c3e50;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                }
                
                .availability-status-card {
                    border: none;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.07);
                    background: linear-gradient(to right, #f8f9fa, #ffffff);
                }
                
                .availability-status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.35rem 0.85rem;
                    border-radius: 20px;
                    font-weight: 500;
                    font-size: 0.85rem;
                }
                
                .availability-status-badge.active {
                    background-color: #e8f5e9;
                    color: #2e7d32;
                }
                
                .availability-status-badge.inactive {
                    background-color: #ffebee;
                    color: #c62828;
                }
                
                .availability-toggle-btn {
                    padding: 0.5rem 1rem;
                    font-weight: 500;
                    border-radius: 6px;
                }
                
                .availability-day-card {
                    border: none;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                
                .availability-day-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    transform: translateY(-2px);
                }
                
                .availability-day-card .card-header {
                    background-color: #f8f9fa;
                    border-bottom: 1px solid #e9ecef;
                    padding: 0.75rem 1.25rem;
                    transition: background-color 0.2s ease;
                }
                
                .availability-day-card .card-header:hover {
                    background-color: #f1f3f5;
                }
                
                .availability-day-card .card-header.active {
                    background-color: #e8f4f8;
                    border-left: 4px solid #4a90e2;
                }
                
                .cursor-pointer {
                    cursor: pointer;
                }
                
                .availability-indicator {
                    background-color: #e8f5e9;
                    color: #2e7d32;
                    padding: 0.1rem 0.75rem;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }
                
                .availability-period-section {
                    padding: 0.5rem 0;
                }
                
                .availability-period-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #495057;
                    margin-bottom: 1rem;
                }
                
                .availability-divider {
                    margin: 1.5rem 0;
                    border-top: 1px dashed #e9ecef;
                }
                
                .availability-time-slots {
                    padding: 0.5rem;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    margin: 0.5rem 0;
                }
                
                .availability-form-label {
                    display: flex;
                    align-items: center;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #495057;
                    margin-bottom: 0.5rem;
                }
                
                .availability-form-control {
                    border-radius: 6px;
                    font-size: 0.95rem;
                    height: calc(1.5em + 0.75rem + 6px);
                }
                
                .availability-toggle {
                    font-weight: 500;
                }
                
                .availability-save-btn {
                    padding: 0.75rem 2rem;
                    font-weight: 600;
                    border-radius: 8px;
                    background: #4a90e2;
                    border-color: #4a90e2;
                    box-shadow: 0 4px 10px rgba(74, 144, 226, 0.3);
                    transition: all 0.3s ease;
                }
                
                .availability-save-btn:hover:not(:disabled) {
                    background: #3a7bc8;
                    border-color: #3a7bc8;
                    box-shadow: 0 6px 14px rgba(74, 144, 226, 0.4);
                    transform: translateY(-2px);
                }
                
                @media (max-width: 768px) {
                    .availability-time-slots {
                        padding: 0.5rem 0;
                    }
                    
                    .availability-period-section {
                        padding: 0.25rem 0;
                    }
                    
                    .availability-day-card .card-header {
                        padding: 0.6rem 1rem;
                    }
                }
            `}</style>
        </Container>
    );
}

export default DoctorAvailability;