import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import './Appointment.css';

function CancelledAppointments() {
    const [cancelledAppointments, setCancelledAppointments] = useState([]);
    const { pid } = useParams(); 
    const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
    
    useEffect(() => {
        axios.get(`http://localhost:8000/patient/api/onepatient/${pid}`)
            .then((res) => {
                const cancelledAppointments = res.data.thePatient.patient_appointments.filter(appointment => appointment.status === 'Cancelled');
                setCancelledAppointments(cancelledAppointments);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [pid]);

    return (
        <div className='mainContainer'>
            <div>

           
            {cancelledAppointments.map((appointment, index) => {
                const doctor = appointment?.doctor;
                const doctorImage = doctor?.dr_image || defaultImage;
                return (
                    <div className="subContainer" key={index}>
                        <div className="aContainer">
                            <div> 
                                <img src={`http://localhost:8000/${doctorImage}`} alt="Doctor" className='app-image' />
                            </div>
                            <div>
                                <p style={{marginLeft: '10px'}}>Dr. {doctor?.dr_firstName} {doctor?.dr_middleInitial ? `${doctor.dr_middleInitial}.` : ''} {doctor?.dr_lastName}</p>
                                <p style={{marginLeft: '10px'}}>Status: {appointment.status}</p>
                                <p style={{marginLeft: '10px'}}>Date/Time: {appointment.date}/{appointment.time}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
             </div>
        </div>
    );
}

export default CancelledAppointments;
