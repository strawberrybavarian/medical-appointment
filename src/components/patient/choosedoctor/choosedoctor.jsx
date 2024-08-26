import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Navbar, Nav, Card } from 'react-bootstrap';
import axios from "axios";
import { useEffect, useState,  } from "react";
import './ChooseDoctor.css'
import PatientNavBar from "../PatientNavBar/PatientNavBar";

function ChooseDoctor() {
    const [theDoctors, setAllDoctors] = useState([]);
    const [theDocId, setAllDocId] = useState([]);
    const [allImage, setAllImage] = useState([])
    const { pid } = useParams(); 
    const navigate = useNavigate();
    const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
    // Display all the available doctors and able to direct to appointment form and pass it through the frontend.
    useEffect(() => {
        axios.get(`http://localhost:8000/doctor/api/alldoctor`)
            .then((res) => {
                console.log(res.data.theDoctor); // Log the response data
                setAllDoctors(res.data.theDoctor);
                setAllImage(res.data.theDoctor.dr_image || defaultImage)
                // Set state to the data property of the response
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const handleDoctorClick = (did) => {
        navigate(`/doctorprofile/${pid}/${did}`); // Navigate to appointment page with uid and doctorId
    };

    return (
        <>
            <PatientNavBar/>

           
            <div style={{paddingTop: '40px'}}>
           
            </div>
            <div className="cd-main">
                
                <div className="cd-containergrid">
                    {theDoctors.map((doctor, index) => {
                        console.log(doctor.dr_image);
                        const doctorImage = doctor.dr_image || defaultImage
                        return (
                            <>
                                <Card  className="cd-card" onClick={() => handleDoctorClick(doctor._id)}>
                                    <Card.Img variant="top" src={`http://localhost:8000/${doctorImage}`} />
                                        <Card.Body>
                                            <Card.Title style={{textAlign: "center"}}>{doctor.dr_firstName} {doctor.dr_middleInitial}. {doctor.dr_lastName}</Card.Title>
                                            <p style={{textAlign: 'center', fontSize:'14px', fontStyle:'italic'}}>{doctor.dr_specialty}</p>
                                            <Card.Text>
                                            "Lorem ipsum dolor sit "Lorem ipsum dolor sit amet, consectetur 
                                            </Card.Text>
                                        </Card.Body>
                                </Card>
                            </>
                        )
                    })}
                </div>
            </div>
        </>
    );
}

export default ChooseDoctor;
