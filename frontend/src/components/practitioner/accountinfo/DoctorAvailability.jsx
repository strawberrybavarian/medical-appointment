import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Row, Col } from 'react-bootstrap';
import DeactivationModal from './modal/DeactivationModal';
import { ip } from '../../../ContentExport';
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

function DoctorAvailability({ doctorId }) {
    const [availability, setAvailability] = useState(initialAvailability);
    const [activeAppointmentStatus, setActiveAppointmentStatus] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formErrors, setFormErrors] = useState({});

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
                        title: 'Oops...',
                        text: 'Please fill in all the fields for morning availability',
                    });
                    hasError = true;
                    break;
                }
            }
            if (afternoon.available) {
                if (!afternoon.startTime || !afternoon.endTime || afternoon.maxPatients <= 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Please fill in all the fields for afternoon availability',
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
                    text: 'Availability updated successfully',
                    icon: 'success',
                    confirmButtonText: 'Confirm'
                });
            })
            .catch(err => console.log(err));
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
                })
                .catch((err) => console.log(err));
        }
    };

    const handleModalConfirm = (reason) => {
        axios
            .post(`${ip.address}/api/doctor/${doctorId}/request-deactivation`, { reason })
            .then(() => {
                setShowModal(false);
                alert('Deactivation request sent. Awaiting confirmation.');
            })
            .catch((err) => console.log(err));
    };

    return (
        <div style={{ display: "flex", flex: "1 0 auto", height: "100vh", overflowY: "hidden" }}>
            <div style={{ padding: "20px", paddingBottom: "100px", overflowY: "auto", overflowX: "hidden" }} className="container1 container-fluid ">
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
                                            {formErrors[`${day}-morning`] && (
                                                <Form.Text className="text-danger">{formErrors[`${day}-morning`]}</Form.Text>
                                            )}
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
                                        <Form.Group controlId={`${day}MorningMaxPatients`}>
                                            <Form.Label>Max Patients (Morning)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={availability[day]?.morning?.maxPatients}
                                                onChange={(e) => handleMaxPatientsChange(day, 'morning', e.target.value)}
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
                                            {formErrors[`${day}-afternoon`] && (
                                                <Form.Text className="text-danger">{formErrors[`${day}-afternoon`]}</Form.Text>
                                            )}
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
                                        <Form.Group controlId={`${day}AfternoonMaxPatients`}>
                                            <Form.Label>Max Patients (Afternoon)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={availability[day]?.afternoon?.maxPatients}
                                                onChange={(e) => handleMaxPatientsChange(day, 'afternoon', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            )}
                            <hr />
                        </div>
                    ))}
                    <Button onClick={handleSubmit}>Save Availability</Button>
                </Form>

                <hr />
                <Button onClick={handleStatusChange}>
                    {activeAppointmentStatus ? 'Deactivate Appointments' : 'Activate Appointments'}
                </Button>

                <DeactivationModal
                    show={showModal}
                    handleClose={() => setShowModal(false)}
                    handleConfirm={handleModalConfirm}
                />
            </div>
        </div>
    );
}

export default DoctorAvailability;