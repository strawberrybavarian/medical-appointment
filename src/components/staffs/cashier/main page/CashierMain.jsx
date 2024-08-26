import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Nav, Row } from "react-bootstrap";
import CashierNavbar from '../navbar/CashierNavbar';
import UnpaidPatient from '../Queries/UnpaidPatient';
import InexactPatient from '../Queries/InexactPatient';
import './Styles.css';

function CashierMain() {
  const [allappointments, setallappointments] = useState([]);
  const [activeTab, setActiveTab] = useState("unpaid");

  
  useEffect(() => {
    axios.get(`http://localhost:8000/medicalsecretary/api/allappointments`)
      .then((result) => {
        console.log(result.data.Appointments); // Log the data to inspect it
        setallappointments(result.data.Appointments);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      <CashierNavbar />

      <Container className='mt-3'>
        <Row>
          <Nav fill variant="tabs" activeKey={activeTab} onSelect={(selectedKey) => setActiveTab(selectedKey)}>
            <Nav.Item>
              <Nav.Link eventKey="unpaid">Unpaid Patients</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="inexact">Inexact Payments</Nav.Link>
            </Nav.Item>
          </Nav>
        </Row>
      </Container>

      <Container className='d-flex justify-content-center mt-3'>
        {activeTab === "unpaid" && (
          <UnpaidPatient
            allAppointments={allappointments}
            setAllAppointments={setallappointments}
          />
        )}
        {activeTab === "inexact" && (
          <InexactPatient
            allAppointments={allappointments}
            setAllAppointments={setallappointments}
          />
        )}
      </Container>
    </>
  );
}

export default CashierMain;
