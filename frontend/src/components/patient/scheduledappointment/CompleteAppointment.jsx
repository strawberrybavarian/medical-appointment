import React, { useState } from 'react';
import { Button, Container, Row, Col, Card, Badge } from 'react-bootstrap';
import './Appointment.css';
import PrescriptionPatientModal from "./Modal/PrescriptionPatientModal";
import { PeopleFill, ClockFill, PersonFill, PencilFill, CalendarEvent, CheckCircleFill, FileEarmarkText } from 'react-bootstrap-icons';
import { useParams } from 'react-router-dom';
import FollowUpModal from './Modal/FollowUpModal';

function CompleteAppointment({ appointments, setAppointments }) {
    const { pid } = useParams(); 
    const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
    const [showModal, setShowModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);

    const handleFollowUp = (appointment) => {
        setSelectedAppointment(appointment);
        setShowFollowUpModal(true);
    };

    const handleCloseFollowUpModal = () => {
        setShowFollowUpModal(false);
        setSelectedAppointment(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAppointment(null);
    };

    const handleNextModal = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
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

    const groupedAppointments = appointments
        .filter(appointment => appointment.status === 'Completed')
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .reduce((groups, appointment) => {
            const { month, year } = formatDate(appointment.date);
            const groupKey = `${month}-${year}`;
            if (!groups[groupKey]) {
                groups[groupKey] = { month, year, appointments: [] };
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
                                                    <div className="date-display">
                                                        <span className="day-of-week">{dayOfWeek}</span>
                                                        <span className="day-number">{day}</span>
                                                    </div>
                                                </Col>
                                                
                                                <Col xs={9} md={10}>
                                                    <Row className="g-0 h-100 appointment-details">
                                                        <Col xs={12} md={4} className="p-3">
                                                            <div className="appointment-id mb-2 d-flex align-items-center">
                                                                <Badge bg="light" text="dark" className="me-2">ID: {appointment.appointment_ID}</Badge>
                                                                <Badge bg="success">Completed</Badge>
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
                                                                    <span className="text-muted">Doctor not assigned</span>
                                                                </div>
                                                            )}
                                                        </Col>
                                                        
                                                        <Col xs={12} md={3} className="p-3 border-start-md">
                                                            <div className="mb-2 d-flex align-items-center">
                                                                <PencilFill className="icon-primary me-2" />
                                                                <span>{appointmentType}</span>
                                                            </div>
                                                            <div className="mb-2 d-flex align-items-center">
                                                                <PeopleFill className="icon-primary me-2" />
                                                                <span>{category}</span>
                                                            </div>
                                                            <div className="d-flex align-items-center">
                                                                <CalendarEvent className="icon-primary me-2" />
                                                                <span>Follow-up: {appointment.followUp ? 
                                                                    <Badge bg="success" className="ms-1">Yes</Badge> : 
                                                                    <Badge bg="secondary" className="ms-1">No</Badge>}
                                                                </span>
                                                            </div>
                                                        </Col>
                                                        
                                                        <Col xs={12} md={5} className="actions-column p-3 d-flex flex-column justify-content-center">
                                                            <Button 
                                                                variant="outline-primary"
                                                                className="mb-2 d-flex align-items-center justify-content-center"
                                                                onClick={() => handleNextModal(appointment)}
                                                            >
                                                                <FileEarmarkText className="me-2" />
                                                                View Prescription
                                                            </Button>
                                                            
                                                            {appointment.followUp && (
                                                                <Button 
                                                                    variant="outline-success"
                                                                    className="d-flex align-items-center justify-content-center"
                                                                    onClick={() => handleFollowUp(appointment)}
                                                                >
                                                                    <CheckCircleFill className="me-2" />
                                                                    Schedule Follow-Up
                                                                </Button>
                                                            )}
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
                            <CheckCircleFill size={48} className="text-muted" />
                        </div>
                        <h5>No completed appointments</h5>
                        <p className="text-muted">Completed appointments will appear here.</p>
                    </div>
                )}
            </Container>
            
            <PrescriptionPatientModal
                show={showModal}
                handleClose={handleCloseModal}
                appointment={selectedAppointment}
            />
            
            {selectedAppointment && (
                <FollowUpModal
                    show={showFollowUpModal}
                    handleClose={handleCloseFollowUpModal}
                    appointment={selectedAppointment}
                    pid={pid}
                    setAppointments={setAppointments}
                />
            )}
        </>
    );
}

export default CompleteAppointment;