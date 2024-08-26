import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from 'react-bootstrap';
import './Appointment.css';
import RescheduledModal from "./Modal/RescheduledModal";

function RescheduledAppointment() {
    const [rescheduledAppointments, setRescheduledAppointments] = useState([]);
    const { pid, did } = useParams(); 
    const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
    const [error, setError] = useState("");
    const [allAppointments, setAllAppointments] = useState([]);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    useEffect(() => {
        axios
          .get(`http://localhost:8000/doctor/appointments/${did}`)
          .then((res) => {
            setAllAppointments(res.data);
          })
          .catch((err) => {
            setError("Error fetching appointments");
            console.log(err);
          });
      }, [did]);

    useEffect(() => {
        axios.get(`http://localhost:8000/patient/api/onepatient/${pid}`)
            .then((res) => {
                const rescheduledAppointments = res.data.thePatient.patient_appointments.filter(appointment => appointment.status === 'Rescheduled');
                setRescheduledAppointments(rescheduledAppointments);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [pid]);

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
            setAllAppointments(prevAppointments =>
              prevAppointments.map(appointment =>
                appointment._id === selectedAppointment._id ? response.data : appointment
              )
            );
            alert("Rescheduled!")
            handleCloseRescheduleModal();
       
          })
          .catch((err) => {
            console.log(err);
          });

          window.location.reload()
      };

    return (
        <div className='mainContainer'>
            <div>
                {rescheduledAppointments.map((appointment, index) => {
                    const doctor = appointment?.doctor;
                    const doctorImage = doctor?.dr_image || defaultImage;
                    return (
                        <div className="subContainer" key={index}>
                            <div className="aContainer">
                                <div> 
                                    <img src={`http://localhost:8000/${doctorImage}`} alt="Doctor" className='app-image' />
                                </div>
                                <div>
                                    <p style={{ marginLeft: '10px' }}>Dr. {doctor?.dr_firstName} {doctor?.dr_middleInitial ? `${doctor.dr_middleInitial}.` : ''} {doctor?.dr_lastName}</p>
                                    <p style={{ marginLeft: '10px' }}>Status: {appointment.status}</p>
                                    <p style={{ marginLeft: '10px' }}>Date/Time: {new Date(appointment.date).toLocaleDateString()}/{appointment.time}</p>
                                    <p style={{ marginLeft: '10px' }}>Reason for Rescheduling: {appointment.rescheduledReason}</p>
                                    <Button 
                                        variant="warning" 
                                        onClick={() => handleReschedule(appointment)}
                                        style={{ marginLeft: '10px' }}
                                    >
                                        Reschedule
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedAppointment && (
                <RescheduledModal 
                    show={showRescheduleModal} 
                    handleClose={handleCloseRescheduleModal} 
                    appointment={selectedAppointment} 
                    onSubmit={handleRescheduleSubmit}
                />
            )}
        </div>
    );
}

export default RescheduledAppointment;
