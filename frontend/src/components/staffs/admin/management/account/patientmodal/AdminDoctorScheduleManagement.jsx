import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../../ContentExport';
import Swal from 'sweetalert2';

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

function AdminDoctorScheduleManagement({ doctorId }) {
    const [availability, setAvailability] = useState(initialAvailability);
    const [activeAppointmentStatus, setActiveAppointmentStatus] = useState(true);
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!doctorId) return;
        
        setLoading(true);
        axios.get(`${ip.address}/api/doctor/${doctorId}/available`)
            .then(res => {
                const { availability, activeAppointmentStatus } = res.data;
                setAvailability(availability || initialAvailability);
                setActiveAppointmentStatus(activeAppointmentStatus);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching doctor availability:', err);
                setLoading(false);
            });
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
        setAvailability(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [period]: {
                    ...prev[day][period],
                    maxPatients: value
                }
            }
        }));
        setTimeout(() => validatePeriod(day, period), 0);
    };

    const handleSubmit = () => {
        let hasError = false;
        for (const day of Object.keys(availability)) {
            const morning = availability[day].morning;
            const afternoon = availability[day].afternoon;

            if (morning.available) {
                if (!morning.startTime || !morning.endTime || morning.maxPatients <= 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Validation Error',
                        text: `Please fill in all the fields for ${day}'s morning availability`,
                    });
                    hasError = true;
                    break;
                }
            }
            if (afternoon.available) {
                if (!afternoon.startTime || !afternoon.endTime || afternoon.maxPatients <= 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Validation Error',
                        text: `Please fill in all the fields for ${day}'s afternoon availability`,
                    });
                    hasError = true;
                    break;
                }
            }
        }

        if (hasError) return;

        axios.put(`${ip.address}/api/doctor/${doctorId}/availability`, { availability })
            .then(res => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Doctor schedule updated successfully',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            })
            .catch(err => {
                console.error('Error updating availability:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update doctor schedule',
                });
            });
    };

    const handleStatusChange = () => {
        Swal.fire({
            title: `${activeAppointmentStatus ? 'Deactivate' : 'Activate'} Doctor's Appointments?`,
            text: activeAppointmentStatus 
                ? "Patients won't be able to book appointments with this doctor."
                : "Patients will be able to book appointments with this doctor.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: activeAppointmentStatus ? '#d33' : '#3085d6',
            cancelButtonColor: '#6c757d',
            confirmButtonText: activeAppointmentStatus ? 'Deactivate' : 'Activate'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.put(`${ip.address}/api/doctor/${doctorId}/appointmentstatus`, {
                    activeAppointmentStatus: !activeAppointmentStatus
                })
                .then((res) => {
                    setActiveAppointmentStatus(res.data.activeAppointmentStatus);
                    Swal.fire(
                        'Updated!',
                        `Doctor's appointment status has been ${!activeAppointmentStatus ? 'activated' : 'deactivated'}.`,
                        'success'
                    );
                })
                .catch((err) => {
                    console.error('Error updating appointment status:', err);
                    Swal.fire(
                        'Error!',
                        'Failed to update appointment status.',
                        'error'
                    );
                });
            }
        });
    };

    if (loading) {
        return <div className="text-center p-3">Loading doctor schedule...</div>;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Schedule Management</h5>
                <Button 
                    variant={activeAppointmentStatus ? 'danger' : 'success'} 
                    onClick={handleStatusChange}
                >
                    {activeAppointmentStatus ? 'Deactivate Appointments' : 'Activate Appointments'}
                </Button>
            </div>

            {!activeAppointmentStatus && (
                <Alert variant="warning" className="mb-4">
                    <Alert.Heading className="h6">Appointments are currently disabled</Alert.Heading>
                    <p className="mb-0">Patients cannot book appointments with this doctor while appointments are deactivated.</p>
                </Alert>
            )}

            <Form>
                {Object.keys(availability).map(day => (
                    <Card key={day} className="mb-3 shadow-sm">
                        <Card.Header className="bg-light">
                            <h6 className="mb-0">{day.charAt(0).toUpperCase() + day.slice(1)}</h6>
                        </Card.Header>
                        <Card.Body>
                            {/* Morning section */}
                            <Row>
                                <Col>
                                    <Form.Group controlId={`${day}MorningAvailable`}>
                                        <Form.Check
                                            type="checkbox"
                                            label={<span className="fw-medium">Available in the morning</span>}
                                            checked={availability[day]?.morning?.available || false}
                                            onChange={(e) => handleAvailabilityChange(day, 'morning', e.target.checked)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {availability[day]?.morning?.available && (
                                <Row className="mt-2 g-3">
                                    <Col md={4}>
                                        <Form.Group controlId={`${day}MorningStartTime`}>
                                            <Form.Label>Start Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={availability[day]?.morning?.startTime || ''}
                                                onChange={(e) => handleTimeChange(day, 'morning', 'startTime', e.target.value)}
                                                isInvalid={formErrors[`${day}-morning`]}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId={`${day}MorningEndTime`}>
                                            <Form.Label>End Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={availability[day]?.morning?.endTime || ''}
                                                onChange={(e) => handleTimeChange(day, 'morning', 'endTime', e.target.value)}
                                                isInvalid={formErrors[`${day}-morning`]}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId={`${day}MorningMaxPatients`}>
                                            <Form.Label>Max Patients</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                value={availability[day]?.morning?.maxPatients || ''}
                                                onChange={(e) => handleMaxPatientsChange(day, 'morning', parseInt(e.target.value) || 0)}
                                                isInvalid={formErrors[`${day}-morning`]}
                                            />
                                        </Form.Group>
                                    </Col>
                                    {formErrors[`${day}-morning`] && (
                                        <Col xs={12}>
                                            <Form.Text className="text-danger">{formErrors[`${day}-morning`]}</Form.Text>
                                        </Col>
                                    )}
                                </Row>
                            )}

                            <hr className="my-3" />

                            {/* Afternoon section */}
                            <Row>
                                <Col>
                                    <Form.Group controlId={`${day}AfternoonAvailable`}>
                                        <Form.Check
                                            type="checkbox"
                                            label={<span className="fw-medium">Available in the afternoon</span>}
                                            checked={availability[day]?.afternoon?.available || false}
                                            onChange={(e) => handleAvailabilityChange(day, 'afternoon', e.target.checked)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {availability[day]?.afternoon?.available && (
                                <Row className="mt-2 g-3">
                                    <Col md={4}>
                                        <Form.Group controlId={`${day}AfternoonStartTime`}>
                                            <Form.Label>Start Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={availability[day]?.afternoon?.startTime || ''}
                                                onChange={(e) => handleTimeChange(day, 'afternoon', 'startTime', e.target.value)}
                                                isInvalid={formErrors[`${day}-afternoon`]}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId={`${day}AfternoonEndTime`}>
                                            <Form.Label>End Time</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={availability[day]?.afternoon?.endTime || ''}
                                                onChange={(e) => handleTimeChange(day, 'afternoon', 'endTime', e.target.value)}
                                                isInvalid={formErrors[`${day}-afternoon`]}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId={`${day}AfternoonMaxPatients`}>
                                            <Form.Label>Max Patients</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                value={availability[day]?.afternoon?.maxPatients || ''}
                                                onChange={(e) => handleMaxPatientsChange(day, 'afternoon', parseInt(e.target.value) || 0)}
                                                isInvalid={formErrors[`${day}-afternoon`]}
                                            />
                                        </Form.Group>
                                    </Col>
                                    {formErrors[`${day}-afternoon`] && (
                                        <Col xs={12}>
                                            <Form.Text className="text-danger">{formErrors[`${day}-afternoon`]}</Form.Text>
                                        </Col>
                                    )}
                                </Row>
                            )}
                        </Card.Body>
                    </Card>
                ))}

                <div className="text-center mt-4">
                    <Button onClick={handleSubmit} variant="primary" size="lg">
                        Save Doctor Schedule
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default AdminDoctorScheduleManagement;