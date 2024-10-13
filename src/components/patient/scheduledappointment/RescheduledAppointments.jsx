import React, { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import axios from "axios";
import './Appointment.css';
import PrescriptionPatientModal from "./Modal/PrescriptionPatientModal";
import RescheduledModal from "./Modal/RescheduledModal";
import { PeopleFill, ClockFill, PersonFill, PencilFill } from 'react-bootstrap-icons';
import { useParams } from 'react-router-dom';
function RescheduledAppointment({appointments, setAppointments}) {
   
    const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
    const [showModal, setShowModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [error, setError] = useState("");



    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAppointment(null);
    };

    const handleNextModal = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const handleReschedule = (appointment) => {
        setSelectedAppointment(appointment);
        setShowRescheduleModal(true);
    };

    const handleCloseRescheduleModal = () => {
        setShowRescheduleModal(false);
        setSelectedAppointment(null);
    };

    const handleRescheduleSubmit = (newDate, newTime) => {
        if (!selectedAppointment) return;
    
        const rescheduleData = { newDate, newTime };
        axios.put(`http://localhost:8000/doctor/${selectedAppointment._id}/rescheduleappointment`, rescheduleData)
          .then((response) => {
            setAppointments(prevAppointments =>
              prevAppointments.map(appointment =>
                appointment._id === selectedAppointment._id ? response.data : appointment
              )
            );
            alert("Rescheduled!");
            handleCloseRescheduleModal();
            window.location.reload();
          })
          .catch((err) => {
            console.log(err);
          });
      };

    // Helper function to format the date
    const formatDate = (dateString) => {
        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, '0');  // Get day
        const month = date.toLocaleString('default', { month: 'long' });  // Get month abbreviation
        const dayOfWeek = date.toLocaleString('default', { weekday: 'short' });  // Get weekday abbreviation
        const year = date.getFullYear(); // Get year

        return { day, month, dayOfWeek, year, fullDate: date };
    };

    // Helper function to check if the date is today
    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    // Group and sort appointments by month
    const groupedAppointments = appointments
        .filter(appointment => appointment.status ===  'Rescheduled')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .reduce((groups, appointment) => {
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

    return (
        <>
           
                    {Object.keys(groupedAppointments).map((groupKey, index) => (
                        <React.Fragment key={index}>
                            <div className='mt-5'>
                                <h4 className='font-gray'>{groupedAppointments[groupKey].month} {groupedAppointments[groupKey].year}</h4>
                            </div>
                            {groupedAppointments[groupKey].appointments.map((appointment, i) => {
                                const { day, month, dayOfWeek, fullDate } = formatDate(appointment.date); // Format date
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
                                const doctorImage = appointment?.doctor.dr_image || defaultImage;
                                return (
                                    <Container className='d-flex justify-content-start subContainer shadow-sm' key={i}>
                                        <div className='aaContainer'>
                                            <p style={{ textAlign: 'center' }}>
                                                <span style={dayOfWeekStyle}>{dayOfWeek}</span>
                                                <span style={dayStyle}>{day}</span>
                                            </p>
                                        </div>
                                        <Container className="d-flex justify-content-start">
                                            
                                            <div className='pa-cont1'>
                                                <p style={{ fontSize: '1rem' }}> <PersonFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} /> Dr. {appointment.doctor.dr_firstName} {appointment.doctor.dr_middleInitial ? `${appointment.doctor.dr_middleInitial}.` : ''} {appointment.doctor.dr_lastName}</p>
                                                <p style={{ fontSize: '1rem' }}> <ClockFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} /> {appointment.time}</p>
                                            </div>
                                            <div className='pa-cont2'>
                                                <p style={{ fontSize: '1rem' }}> <PeopleFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} /> {appointment.medium}</p>
                                            </div>
                                            <div className='pa-cont3'>
                                                {/* <p><PencilFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} /> Primary Concern :  </p>
                                                <p style={{ fontSize: '1rem' }}> • {appointment.reason}</p> */}
                                                {appointment.status === 'Rescheduled' && (
                                                    <p style={{ fontSize: '1rem', color: 'red' }}>Reason for Rescheduling: {appointment.rescheduledReason}</p>
                                                )}
                                            </div>
                                        </Container>
                                       
                                        {appointment.status === 'Rescheduled' && (
                                            <div className="bContainer">
                                                <Button variant="warning" onClick={() => handleReschedule(appointment)}>Reschedule</Button>
                                            </div>
                                        )}
                                    </Container>
                                )
                            })}
                        </React.Fragment>
                    ))}
             
            <PrescriptionPatientModal 
                show={showModal} 
                handleClose={handleCloseModal} 
                appointment={selectedAppointment}
            />
            {selectedAppointment && (
                <RescheduledModal 
                    show={showRescheduleModal} 
                    handleClose={handleCloseRescheduleModal} 
                    appointment={selectedAppointment} 
                    onSubmit={handleRescheduleSubmit}
                />
            )}
        </>
    );
}

export default RescheduledAppointment;
