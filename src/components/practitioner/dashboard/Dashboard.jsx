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

function Dashboard() {
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

  const [allAppointments, setAllAppointments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
    .get(`http://localhost:8000/doctor/appointments/${did}`)
    .then((res) => {
      const appointments = res.data;

      
      setPendingCount(appointments.filter(appointment=>appointment.status === 'Pending').length)


    })
    .catch((err) => {
      setError("Error fetching appointments");
      console.log(err);
    });
  }, [did]);

  return (

 <>

      
     
            <h1 className="dashboard-title">Dashboard</h1>
            <p>Overview</p>
    

          <Container>

          <Row className="g-4">
            <Col xl={3} md={6}>
                <Card className="border-left-blue p-3 shadow-sm">
                    <Card.Body>
                        <Row className="no-gutters align-items-center">
                            <Col className="mr-2">
                                <div className="text-xs font-weight-bold text-blue text-uppercase mb-1">
                                    Total Patients
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800"></div>
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
                <Card className="border-left-yellow p-3 shadow-sm">
                    <Card.Body>
                        <Row className="no-gutters align-items-center">
                            <Col className="mr-2">
                                <div className="text-xs font-weight-bold text-yellow text-uppercase mb-1">
                                    Unregistered Patients
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800"></div>
                            </Col>
                            <Col className="col-auto">
                                <People size="40px" className="text-gray-300" />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col>

            <Col xl={3} md={6}>
                <Card className="border-left-teal p-3 shadow-sm">
                    <Card.Body>
                        <Row className="no-gutters align-items-center">
                            <Col className="mr-2">
                                <div className="text-xs font-weight-bold text-teal text-uppercase mb-1">
                                    Some Other Metric
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800"></div>
                            </Col>
                            <Col className="col-auto">
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
