import React, { useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import './Appointment.css';
import PrescriptionPatientModal from "./Modal/PrescriptionPatientModal";
import { PeopleFill, ClockFill, PersonFill, PencilFill } from 'react-bootstrap-icons';
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
        const year = date.getFullYear();
        return { day, month, dayOfWeek, year, fullDate: date };
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
            <div className='mainContainer'>
                <Container>
                    {Object.keys(groupedAppointments).map((groupKey, index) => (
                        <React.Fragment key={index}>
                            <div className='mt-5'>
                                <h4 className='font-gray'>{groupedAppointments[groupKey].month} {groupedAppointments[groupKey].year}</h4>
                            </div>
                            {groupedAppointments[groupKey].appointments.map((appointment, i) => {
                                const { day, month, dayOfWeek, fullDate } = formatDate(appointment.date);
                                const isAppointmentToday = isToday(fullDate);

                                const dayStyle = {
                                    display: 'block',
                                    fontSize: '3rem',
                                    color: isAppointmentToday ? '#E03900' : '#575859'
                                };
                                const dayOfWeekStyle = {
                                    display: 'block',
                                    fontSize: '1rem',
                                    color: isAppointmentToday ? '#E03900' : '#575859'
                                };

                                const doctor = appointment?.doctor;
                                const doctorImage = doctor?.dr_image || defaultImage;

                                // Safely access the appointment_type array
                                const appointmentType = appointment?.appointment_type?.[0]?.appointment_type || "N/A";
                                const category = appointment?.appointment_type?.[0]?.category || "N/A";

                                return (
                                    <Container className='d-flex justify-content-start subContainer shadow-sm' key={i}>
                                        <div className='aaContainer'>
                                            <p style={{ textAlign: 'center' }}>
                                                <span style={dayOfWeekStyle}>{dayOfWeek}</span>
                                                <span style={dayStyle} className='font-weight-bold'>{day}</span>
                                            </p>
                                        </div>
                                        <Container className="d-flex justify-content-start">
                                            <div className='pa-cont1'>
                                                {doctor ? (
                                                    <>
                                                        <p style={{ fontSize: '1rem' }}>
                                                            <PersonFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} />
                                                            Dr. {doctor.dr_firstName} {doctor.dr_middleInitial}. {doctor.dr_lastName}
                                                        </p>
                                                        <p style={{ fontSize: '1rem' }}>
                                                            <ClockFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} />
                                                            {appointment.time ? convertTimeRangeTo12HourFormat(appointment.time) : 'Not Assigned'}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p style={{ fontSize: '1rem', color: '#999' }}>No doctor assigned</p>
                                                )}
                                            </div>
                                            <div className='pa-cont1'>
                                                <p style={{ fontSize: '1rem' }}>
                                                    <PencilFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} />
                                                    Appointment Type: {appointmentType}
                                                </p>
                                                <p style={{ fontSize: '1rem' }}>
                                                    Category: {category}
                                                </p>
                                            </div>
                                        </Container>
                                        <div className="bContainer">
                                            {/* <Button onClick={() => handleNextModal(appointment)} className="me-2">
                                                View Prescription
                                            </Button> */}
                                            {appointment.followUp && (
                                                <Button variant="success" onClick={() => handleFollowUp(appointment)}>
                                                    Schedule Follow-Up
                                                </Button>
                                            )}
                                        </div>
                                    </Container>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </Container>
            </div>
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
