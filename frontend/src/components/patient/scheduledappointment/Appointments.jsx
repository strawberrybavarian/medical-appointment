import React, { useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import axios from "axios";
import CancelModal from "../scheduledappointment/Modal/CancelModal";
import './Appointment.css';
import { PeopleFill, ClockFill, PersonFill, PencilFill } from 'react-bootstrap-icons';
import { ip } from '../../../ContentExport';

function Appointments({ appointments, setAppointments }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
    console.log(appointments);

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

        console.log("Selected Appointment:", selectedAppointment);

        setShowModal(false);

        axios.put(`${ip.address}/api/patient/${selectedAppointment._id}/updateappointment`, { cancelReason: cancelReason })
            .then((response) => {
                console.log(response.data);
                setAppointments(prevAppointments => 
                    prevAppointments.map(appointment => 
                        appointment._id === selectedAppointment._id 
                        ? { ...appointment, status: 'Cancelled', cancelReason: cancelReason } 
                        : appointment
                    )
                );
                handleCloseModal();
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

        return { day, month, dayOfWeek, fullDate: date };
    };

    // Helper function to check if the date is today
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
            <div className='d-flex justify-content-center mainContainer'>
                <Container>
                    {Object.keys(groupedAppointments).map((groupKey, index) => (
                        <React.Fragment key={index}>
                            <div className='mt-5'>
                                <h4 className='font-gray'>{groupedAppointments[groupKey].month} {groupedAppointments[groupKey].year}</h4>
                            </div>
                            {groupedAppointments[groupKey].appointments.map((appointment, i) => {
                                // Format date and check if appointment is today
                                const { day, month, dayOfWeek, fullDate } = formatDate(appointment.date); 
                                const isAppointmentToday = isToday(fullDate);

                                // Define styles based on whether the appointment is today
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

                                const doctor = appointment.doctor || {};  // Safeguard doctor data
                                const appointmentType = appointment.appointment_type[0]?.appointment_type || "N/A";
                                const category = appointment.appointment_type[0]?.category || "N/A";
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
                                                {appointment.doctor ? (
                                                    <>
                                                        <p style={{ fontSize: '0.8rem',  }} className='font-gray'>
                                                           ID : {appointment.appointment_ID}
                                                        </p>
                                                        <p style={{ fontSize: '1rem' }}>
                                                            <PersonFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} />
                                                            Dr. {appointment.doctor.dr_firstName} {appointment.doctor.dr_middleInitial}. {appointment.doctor.dr_lastName}
                                                        </p>
                                                        <p style={{ fontSize: '1rem' }}>
                                                            <ClockFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} />
                                                            {appointment.time ? convertTimeRangeTo12HourFormat(appointment.time) : 'Not Assigned'}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p style={{ fontSize: '1rem', color: '#999' }}>No assigned doctor</p>
                                                )}
                                            </div>
                                            <div className='pa-cont1'>
                                                <p style={{ fontSize: '1rem' }}>
                                                    <PencilFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} />
                                                    {appointmentType}
                                                </p>
                                                <p style={{ fontSize: '1rem' }}>
                                                    <PeopleFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} />
                                                    {category}
                                                </p>
                                                <p style={{ fontSize: '1rem' }}>
                                                    Follow-up: {appointment.followUp ? 'Yes' : 'No'}
                                                </p>
                                            </div>
                                        </Container>
                                        <div className="bContainer">
                                            <Button onClick={() => handleCancelClick(appointment)}>Cancel</Button>
                                        </div>
                                    </Container>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </Container>
            </div>
            <CancelModal 
                show={showModal} 
                handleClose={handleCloseModal} 
                handleConfirm={handleConfirmCancellation} 
            />
        </>
    );
}

export default Appointments;
