import { useNavigate } from "react-router-dom";
import { Card } from 'react-bootstrap';
import axios from "axios";
import { useEffect, useState } from "react";
import './ChooseDoctor.css';
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import { usePatient } from "../PatientContext";
const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
function ChooseDoctor() {
    const [doctors, setDoctors] = useState([]);
    const { patient } = usePatient(); // Get patient from context

    const { setDoctorId } = usePatient(); // Get the function to set doctorId in context
    const navigate = useNavigate();
    
    console.log('choose doctor',setDoctorId);

    const handleDoctorClick = (did) => {
      setDoctorId(did); // Store the selected doctor ID in context
      navigate('/doctorprofile'); // Navigate without exposing doctor ID in URL
    };
    // Fetch all the doctors when the component loads
    useEffect(() => {
        axios.get(`http://localhost:8000/doctor/api/alldoctor`)
            .then((res) => {
                setDoctors(res.data.theDoctor);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

  

    const timeSinceLastActive = (lastActive) => {
        const now = new Date();
        const lastActiveDate = new Date(lastActive);
        const secondsAgo = Math.floor((now - lastActiveDate) / 1000);
        const minutesAgo = Math.floor(secondsAgo / 60);
        const hoursAgo = Math.floor(minutesAgo / 60);
        const daysAgo = Math.floor(hoursAgo / 24);
        const weeksAgo = Math.floor(daysAgo / 7);

        if (minutesAgo < 1) return "Active just now";
        if (minutesAgo < 60) return `Active ${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
        if (hoursAgo < 24) return `Active ${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
        if (daysAgo < 7) return `Active ${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
        return `Active ${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
    };

    return (
        <>
            <PatientNavBar pid={patient._id} /> {/* No need to pass pid in location.state anymore */}
            <div style={{ paddingTop: '40px' }}></div>
            <div className="cd-main">
                <div className="cd-containergrid">
                    {doctors.map((doctor) => {
                        const doctorImage = doctor.dr_image || defaultImage;

                        // Define the status color based on the activity status
                        const statusColor = doctor.activityStatus === 'Online' ? 'green' 
                                            : doctor.activityStatus === 'In Session' ? 'orange' 
                                            : 'gray';

                        return (
                            <Card key={doctor._id} className="cd-card" onClick={() => handleDoctorClick(doctor._id)}>
                                <Card.Img variant="top" src={`http://localhost:8000/${doctorImage}`} />
                                <Card.Body>
                                    <Card.Title style={{ textAlign: "center" }}>
                                        {doctor.dr_firstName} {doctor.dr_middleInitial}. {doctor.dr_lastName}
                                    </Card.Title>
                                    <p style={{ textAlign: 'center', fontSize: '14px', fontStyle: 'italic' }}>
                                        {doctor.dr_specialty}
                                    </p>

                                    {/* Adding Activity Status below the card */}
                                    <p style={{ textAlign: 'center',  fontSize: '12px' }}>
                                        <span className="status-indicator" style={{ backgroundColor: statusColor, borderRadius: '50%', display: 'inline-block', width: '10px', height: '10px', marginRight: '8px' }}></span>
                                        {doctor.activityStatus === 'Online' ? 'Online' 
                                            : doctor.activityStatus === 'In Session' ? 'In Session' 
                                            : `Last Active: ${timeSinceLastActive(doctor.lastActive)}`}
                                    </p>
                                </Card.Body>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export default ChooseDoctor;
