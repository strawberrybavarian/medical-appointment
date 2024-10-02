import React, { useEffect, useState } from "react";
import SidebarMenu from "../sidebar/SidebarMenu";
import { People } from 'react-bootstrap-icons';
import { Container, Row, Col, Card } from "react-bootstrap";
import axios from "axios";

function Dashboard({ doctor_image, doctor_name, did }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [todaysCount, setTodaysCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [completedCount, setCompleteCount] = useState(0);
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

        setPendingCount(appointments.filter(appointment => appointment.status === 'Pending').length);
        setCompleteCount(appointments.filter(appointment => appointment.status === 'Completed').length);
        setTodaysCount(appointments.filter(appointment => {
          if (appointment.status === 'Scheduled') {
            const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
            return appointmentDate === todayDate;
          } else {
            return false;
          }
        }).length);

        setUpcomingCount(appointments.filter(appointment => {
          if (appointment.status === 'Scheduled') {
            const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
            return appointmentDate > todayDate;
          } else {
            return false;
          }
        }).length);
      })
      .catch((err) => {
        setError("Error fetching appointments");
        console.log(err);
      });
  }, [did]);

  return (
    <>
    <Container className="d-flex justify-content-center">
      <Row className="g-4">
        {/* Row 1: Today's Patients and Pending Patients */}
        <Col md={6} className="col-12">
          <Card className="border-left-blue p-3 shadow-sm">
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="text-xs font-weight-bold text-blue text-uppercase mb-1">
                    Today's Patients
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{todaysCount}</div>
                </Col>
                <Col className="col-auto">
                  <People size="40px" className="text-gray-300" />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="col-12">
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

        {/* Row 2: Upcoming Patients and Completed Patients */}
        <Col md={6} className="col-12">
          <Card className="border-left-yellow p-3 shadow-sm">
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="text-xs font-weight-bold text-yellow text-uppercase mb-1">
                    Upcoming Patients
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{upcomingCount}</div>
                </Col>
                <Col className="col-auto">
                  <People size="40px" className="text-gray-300" />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="col-12">
          <Card className="border-left-teal p-3 shadow-sm">
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="text-xs font-weight-bold text-teal text-uppercase mb-1">
                    Completed Patients
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{completedCount}</div>
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
