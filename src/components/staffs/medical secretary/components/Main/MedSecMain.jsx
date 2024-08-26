import { useParams } from 'react-router-dom';
import MedSecNavbar from '../../navbar/MedSecNavbar';
import MedSecTodaysApp from '../Appointments/MedSecTodaysApp';
import MedSecPending from '../Appointments/MedSecPending';
import MedSecDashboard from '../Dashboard/MedSecDashboard';
import MedSecOngoing from '../Appointments/MedSecOngoing';


import { Container, Nav, Row } from 'react-bootstrap';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

function MedSecMain() {
  const { msid } = useParams();
  const [allappointments, setallappointments] = useState([]);
  const [alldoctors, setalldoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    axios.get(`http://localhost:8000/medicalsecretary/api/allappointments`)
      .then((result) => {
        setallappointments(result.data.Appointments);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    axios.get(`http://localhost:8000/doctor/api/alldoctor`)
      .then((result) => {
        setalldoctors(result.data.theDoctor);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      <MedSecNavbar />
      <Container className='mt-3'>
      </Container>
        <Container className='pt-3' >
          <Row>
            <Nav fill variant="tabs" defaultActiveKey="todays">
              <Nav.Item>
                <Nav.Link onClick={() => setActiveTab("pending")}>Pending Appointments</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => setActiveTab("todays")}>Today's Appointments</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => setActiveTab("ongoing")}>Ongoing Appointments</Nav.Link>
              </Nav.Item>
            </Nav>
          </Row>
         
      


        </Container>
      
      <Container className='d-flex justify-content-center'>
      <MedSecDashboard />
        {activeTab === "todays" && (
          <MedSecTodaysApp
            allAppointments={allappointments}
            setAllAppointments={setallappointments}
            selectedDoctor={selectedDoctor}
          />
        )}
        {activeTab === "pending" && (
          <MedSecPending
            allAppointments={allappointments}
            setAllAppointments={setallappointments}
            selectedDoctor={selectedDoctor}
          />
        )}
        {activeTab === "ongoing" && (
          <MedSecOngoing
            allAppointments={allappointments}
            setAllAppointments={setallappointments}
            selectedDoctor={selectedDoctor}
          />
        )}
      </Container>
    </>
  );
}

export default MedSecMain;
