import React, { useEffect, useState } from "react";
import SidebarMenu from "../sidebar/SidebarMenu";
import { CDBCard, CDBBadge } from "cdbreact";
import "./Dashboard.css";

import * as Icon from "react-bootstrap-icons";
import { People } from 'react-bootstrap-icons';
import { Dropdown } from "react-bootstrap";
import { Container, Form, Button, Row, Col, Card } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function Dashboard({doctor_image, doctor_name}) {
  //to store the state
    const { did, role } = useParams();

    const [thePost, setThePost] = useState([]);

    const [postDropdowns, setPostDropdowns] = useState([]);
    const [thePosts, setThePosts] = useState([]);
    const [theImage, setTheImage] = useState ("");
    const [theId, setTheId] = useState("");
    const [theName, setTheName] = useState("");
    const [selectedPostIndex, setSelectedPostIndex] = useState(null);
    const navigate = useNavigate();
    const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
    const [pendingCount, setPendingCount] = useState(0);
    const [todaysCount, setTodaysCount] = useState(0);
    const [upcomingCount, setUpcomingCount] = useState(0);
    const [completedCount , setCompleteCount] = useState(0)
    const [allAppointments, setAllAppointments] = useState([]);
    const [error, setError] = useState("");

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
    
      const todayDate = getTodayDate();

      


    useEffect(() => {
        axios
        .get(`http://localhost:8000/doctor/appointments/${did}`)
        .then((res) => {
        const appointments = res.data;

        
        setPendingCount(appointments.filter(appointment=>appointment.status === 'Pending').length)
        setCompleteCount(appointments.filter(appointment=>appointment.status === 'Completed').length)
        setTodaysCount(appointments.filter(appointment => {
            if(appointment.status === 'Scheduled'){
                const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
                return appointmentDate === todayDate
            }
            else{
                return false;
            }
        }))

        setUpcomingCount(appointments.filter(appointment =>{
            if(appointment.status === 'Scheduled'){
                const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
                return appointmentDate > todayDate;
            }
            else{
                return false;
            }

        }))
        

        })
        .catch((err) => {
        setError("Error fetching appointments");
        console.log(err);
        });
    }, [did]);

  return (

 <>

      
     
          

<Container>

          <Row className="g-4">
            <Col xl={3} md={6}>
                <Card className="border-left-blue p-3 shadow-sm flex-shrink-0">
                    <Card.Body>
                        <Row className="no-gutters align-items-center flex-shrink-0">
                            <Col className="mr-2">
                                <div className="text-xs font-weight-bold text-blue text-uppercase mb-1">
                                    Today's Patients
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{todaysCount.length}</div>
                            </Col>
                            <Col className="col-auto">
                                <People size="40px" className="text-gray-300" />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col>

            <Col xl={3} md={6}>
                <Card className="border-left-green p-3 shadow-sm">
                    <Card.Body>
                        <Row className="no-gutters align-items-center">
                            <Col className="mr-2">
                                <div className="text-xs font-weight-bold text-green text-uppercase mb-1">
                                    Pending Patients
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{pendingCount}</div>
                            </Col>
                            <Col className="col-auto">
                                <People size="40px" className="text-gray-300" />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col>

            <Col xl={3} md={6}>
                <Card className="border-left-yellow p-3 shadow-sm flex-shrink-0">
                    <Card.Body>
                        <Row className="no-gutters align-items-center flex-shrink-0">
                            <Col className="mr-2 flex-shrink-0">
                                <div className="text-xs font-weight-bold text-yellow text-uppercase mb-1">
                                    Upcoming Patients
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{upcomingCount.length}</div>
                            </Col>
                            <Col className="col-auto">
                                <People size="40px" className="text-gray-300" />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col>

            <Col xl={3} md={6}>
                <Card className="border-left-teal p-3 shadow-sm flex-shrink-0" >
                    <Card.Body>
                        <Row className="no-gutters align-items-center flex-shrink-0">
                            <Col className="mr-2">
                                <div className="text-xs font-weight-bold text-teal text-uppercase mb-1 flex-shrink-0">
                                    Total Completed Patients
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{completedCount}</div>
                            </Col>
                            <Col className="col-auto flex-shrink-0">
                                <People size="40px" className="text-gray-300" />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
  
        </Container> 



     
          </>
    


  );
}

export default Dashboard;
