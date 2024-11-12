import React, { useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import './Appointment.css';
import RescheduledModal from "./Modal/RescheduledModal";
import { PeopleFill, ClockFill, PersonFill } from 'react-bootstrap-icons';
import { ip } from '../../../ContentExport';
import axios from 'axios';

function RescheduledAppointment({ appointments, setAppointments }) {
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    console.log('Selected Appointment:', selectedAppointment);
    const handleReschedule = (appointment) => {
        setSelectedAppointment(appointment);
        setShowRescheduleModal(true);
    };

    const handleCloseRescheduleModal = () => {
        setShowRescheduleModal(false);
        setSelectedAppointment(null);
    };

    const handleRescheduleSubmit = (rescheduleData) => {
        if (!selectedAppointment) return;
    
        axios.put(`${ip.address}/api/appointments/${selectedAppointment._id}/assign`, rescheduleData)
          .then((response) => {
            setAppointments(prevAppointments =>
              prevAppointments.map(appointment =>
                appointment._id === selectedAppointment._id ? response.data : appointment
              )
            );
            alert("Appointment successfully rescheduled!");
            handleCloseRescheduleModal();
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
        .filter(appointment => appointment.status === 'Rescheduled')
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by latest date first
        .reduce((groups, appointment) => {
            const { month, year } = formatDate(appointment.date);
            const groupKey = `${month}-${year}`;
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
                                        <p style={{ fontSize: '1rem' }}> 
                                            <PersonFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} /> 
                                            Dr. {appointment?.doctor?.dr_firstName} {appointment?.doctor?.dr_middleInitial}. {appointment?.doctor?.dr_lastName}
                                        </p>
                                        <p style={{ fontSize: '1rem' }}>
                                                            <ClockFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} />
                                                            {appointment.time ? convertTimeRangeTo12HourFormat(appointment.time) : 'Not Assigned'}
                                                        </p>
                                    </div>
                                    <div className='pa-cont2'>
                                        <p style={{ fontSize: '1rem' }}> 
                                            <PeopleFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} /> 
                                            {appointment.medium}
                                        </p>
                                    </div>
                                    <div className='pa-cont3'>
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
            {selectedAppointment && (
                <RescheduledModal 
                    show={showRescheduleModal} 
                    handleClose={handleCloseRescheduleModal} 
                    appointment={selectedAppointment} 
                    
                />
            )}
        </>
    );
}

export default RescheduledAppointment;
