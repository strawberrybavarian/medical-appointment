import React, { useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import axios from "axios";
import CancelModal from "../scheduledappointment/Modal/CancelModal";
import './Appointment.css';
import { PeopleFill, ClockFill, PersonFill, PencilFill } from 'react-bootstrap-icons';
import { ip } from '../../../ContentExport';

function CancelledAppointments({ appointments, setAppointments }) {
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

        axios.put(`${ip.address}/api/patient/api/${selectedAppointment._id}/updateappointment`, { cancelReason })
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
        const year = date.getFullYear();
        return { day, month, dayOfWeek, fullDate: date };
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const groupedAppointments = appointments
        .filter(appointment => appointment.status === 'Cancelled')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
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
            <div className='d-flex justify-content-center mainContainer'>
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
                                            <div className='pa-cont2'>
                                                <p style={{ fontSize: '1rem' }}>
                                                    <PeopleFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} />
                                                    {appointmentType}
                                                </p>
                                                <p style={{ fontSize: '1rem' }}>Category: {category}</p>
                                            </div>
                                            <div className='pa-cont3'>
                                                <p>
                                                    <PencilFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} />
                                                    Primary Concern:
                                                </p>
                                                <p style={{ fontSize: '1rem' }}>• {appointment.reason}</p>
                                            </div>
                                        </Container>
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

export default CancelledAppointments;
