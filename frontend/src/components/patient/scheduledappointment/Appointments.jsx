import React, { useState } from 'react';
import { Button, Container, Row, Col, Card, Badge } from 'react-bootstrap';
import axios from "axios";
import CancelModal from "../scheduledappointment/Modal/CancelModal";
import './Appointment.css';
import { PeopleFill, ClockFill, PersonFill, PencilFill, CalendarEvent, CheckCircleFill, XCircle } from 'react-bootstrap-icons';
import { ip } from '../../../ContentExport';

function Appointments({ appointments, setAppointments }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

    const handleCancelClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAppointment(null);
    };

    const handleConfirmCancellation = (cancelReason) => {
        if (!selectedAppointment) return;

        setShowModal(false);

        axios.put(`${ip.address}/api/patient/${selectedAppointment._id}/updateappointment`, { cancelReason })
            .then((response) => {
                console.log(response.data);
                setAppointments(prevAppointments =>
                    prevAppointments.map(appointment =>
                        appointment._id === selectedAppointment._id
                            ? { ...appointment, status: 'Cancelled', cancelReason }
                            : appointment
                    )
                );
                handleCloseModal();
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'long' });
        const dayOfWeek = date.toLocaleString('default', { weekday: 'short' });
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        return { day, month, dayOfWeek, monthIndex, year, fullDate: date };
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Sort by today's appointments first, then by approaching dates in ascending order
    const sortedAppointments = appointments
        .filter(appointment => appointment.status === 'Scheduled')
        .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            const isTodayA = isToday(dateA);
            const isTodayB = isToday(dateB);

            // Prioritize today's appointments
            if (isTodayA && !isTodayB) return -1;
            if (!isTodayA && isTodayB) return 1;

            // If both are not today or both are today, sort by approaching dates (ascending order)
            return dateA - dateB;
        });

    // Group and sort appointments by month (sorted in ascending order)
    const groupedAppointments = sortedAppointments.reduce((groups, appointment) => {
        const { month, year } = formatDate(appointment.date);
        const groupKey = `${month}-${year}`; // Use month and year as a group key
        if (!groups[groupKey]) {
            groups[groupKey] = {
                month,
                year,
                appointments: []
            };
        }
        groups[groupKey].appointments.push(appointment);
        return groups;
    }, {});

    const convertTimeRangeTo12HourFormat = (timeRange) => {
        // Check if the timeRange is missing or empty
        if (!timeRange) return 'Not Assigned';

        const convertTo12Hour = (time) => {
            // Handle single time values like "10:00"
            if (!time) return '';

            let [hours, minutes] = time.split(':').map(Number);
            const period = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12; // Convert 0 or 12 to 12 in 12-hour format

            return `${hours}:${String(minutes).padStart(2, '0')} ${period}`;
        };

        // Handle both single times and ranges
        if (timeRange.includes(' - ')) {
            const [startTime, endTime] = timeRange.split(' - ');
            return `${convertTo12Hour(startTime)} - ${convertTo12Hour(endTime)}`;
        } else {
            return convertTo12Hour(timeRange); // Single time case
        }
    };

    return (
        <>
            <Container className="py-4">
                {Object.keys(groupedAppointments).length > 0 ? (
                    Object.keys(groupedAppointments).map((groupKey, index) => (
                        <div key={index} className="mb-4">
                            <h5 className="month-heading mb-3">
                                {groupedAppointments[groupKey].month} {groupedAppointments[groupKey].year}
                            </h5>

                            {groupedAppointments[groupKey].appointments.map((appointment, i) => {
                                const { day, month, dayOfWeek, fullDate } = formatDate(appointment.date);
                                const isAppointmentToday = isToday(fullDate);
                                const appointmentType = appointment.appointment_type[0]?.appointment_type || "N/A";
                                const category = appointment.appointment_type[0]?.category || "N/A";

                                return (
                                    <Card key={i} className="appointment-card mb-3 border-0 shadow-sm">
                                        <Card.Body className="p-0">
                                            <Row className="g-0 align-items-center">
                                                <Col xs={3} md={2} className="date-column text-center py-3">
                                                    <div className={`date-display ${isAppointmentToday ? 'today' : ''}`}>
                                                        <span className="day-of-week">{dayOfWeek}</span>
                                                        <span className="day-number">{day}</span>
                                                    </div>
                                                </Col>

                                                <Col xs={9} md={10}>
                                                    <Row className="g-0 h-100 appointment-details">
                                                        <Col xs={12} md={5} className="p-3">
                                                            <div className="appointment-id mb-2">
                                                                <Badge bg="light" text="dark">ID: {appointment.appointment_ID}</Badge>
                                                            </div>

                                                            {appointment.doctor ? (
                                                                <>
                                                                    <div className="mb-2 d-flex align-items-center">
                                                                        <PersonFill className="icon-primary me-2" />
                                                                        <span className="font-weight-medium">
                                                                            Dr. {appointment.doctor.dr_firstName} {appointment.doctor.dr_middleInitial}. {appointment.doctor.dr_lastName}
                                                                        </span>
                                                                    </div>
                                                                    <div className="d-flex align-items-center">
                                                                        <ClockFill className="icon-primary me-2" />
                                                                        <span>
                                                                            {appointment.time ? convertTimeRangeTo12HourFormat(appointment.time) : 'Time not assigned'}
                                                                        </span>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="unassigned-notice">
                                                                    <span className="text-muted">Doctor not yet assigned</span>
                                                                </div>
                                                            )}
                                                        </Col>

                                                        <Col xs={12} md={3} className="p-3 border-start-md">
                                                            <div className="mb-2 d-flex align-items-center">
                                                                <PencilFill className="icon-primary me-2" />
                                                                <span>{appointmentType}</span>
                                                            </div>

                                                            <div className="d-flex align-items-center">
                                                                <CalendarEvent className="icon-primary me-2" />
                                                                <span>Follow-up: {appointment.followUp ?
                                                                    <Badge bg="success" className="ms-1">Yes</Badge> :
                                                                    <Badge bg="secondary" className="ms-1">No</Badge>}
                                                                </span>
                                                            </div>
                                                        </Col>

                                                        <Col xs={12} md={4} className="actions-column text-center d-flex justify-content-center align-items-center p-3">
                                                            <div className="mb-2 d-flex justify-content-end align-items-center">

                                                                <Button
                                                                    variant="outline-danger"
                                                                    onClick={() => handleCancelClick(appointment)}
                                                                    className="cancel-btn d-flex align-items-center justify-content-center mx-auto"
                                                                >
                                                                    <XCircle className="me-2" />
                                                                    Cancel
                                                                </Button>
                                                            </div>

                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                );
                            })}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-5">
                        <div className="empty-state mb-3">
                            <CalendarEvent size={48} className="text-muted" />
                        </div>
                        <h5>No scheduled appointments</h5>
                        <p className="text-muted">When you have confirmed appointments, they will appear here.</p>
                    </div>
                )}
            </Container>

            <CancelModal
                show={showModal}
                handleClose={handleCloseModal}
                handleConfirm={handleConfirmCancellation}
            />


        </>
    );
}

export default Appointments;