import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from 'react-bootstrap';
import axios from "axios";
import CancelModal from "../scheduledappointment/Modal/CancelModal";
import './Appointment.css';

function PendingAppointments({ appointments, setAppointments }) {
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

        axios.put(`http://localhost:8000/patient/api/${selectedAppointment._id}/updateappointment`, { cancelReason: cancelReason })
            .then((response) => {
                console.log(response.data);
                setAppointments(prevAppointments => 
                    prevAppointments.map(appointment => 
                        appointment._id === selectedAppointment._id ? { ...appointment, status: 'Cancelled', cancelReason: cancelReason } : appointment
                    )
                );
                handleCloseModal();
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <>
            <div className='mainContainer'>
                <div>
                    {appointments
                        .filter(appointment =>  appointment.status === 'Pending')
                        .map((appointment, index) => {
                            const doctorImage = appointment.doctor.dr_image || defaultImage;

                            return (
                                <div className='subContainer' key={index}>
                                    <div className="aContainer">
                                        <div>
                                            <img src={`http://localhost:8000/${doctorImage}`} alt="Doctor" className='app-image' />
                                        </div>
                                        <div>
                                            <p style={{ marginLeft: '10px' }}>Dr. {appointment.doctor.dr_firstName} {appointment.doctor.dr_middleInitial}. {appointment.doctor.dr_lastName}</p>
                                            <p style={{ marginLeft: '10px' }}>Status: {appointment.status}</p>
                                            <p style={{ marginLeft: '10px' }}>Payment: {appointment.payment?.paymentStatus}</p>
                                            <p style={{ marginLeft: '10px' }}>Method: {appointment.payment?.paymentMethod}</p>
                                            <p style={{ marginLeft: '10px' }}>Date/Time: {appointment.date}/{appointment.time}</p>
                                        </div>
                                    </div>
                                    <div className="bContainer">
                                        <Button onClick={() => handleCancelClick(appointment)}>Cancel the Appointment</Button>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <CancelModal 
                show={showModal} 
                handleClose={handleCloseModal} 
                handleConfirm={handleConfirmCancellation} 
            />
        </>
    );
}

export default PendingAppointments;
