import React, { useEffect, useState } from 'react';
import './Styles.css';
import { Container, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';
import { People } from 'react-bootstrap-icons';

function MedSecDashboard() {
  const [stats, setStats] = useState({
    pendingPatients: 0,
    todaysPatients: 0,
    ongoingPatients: 0
  });

  useEffect(() => {
    // Fetch statistics data from the backend
    axios.get(`${ip.address}/medicalsecretary/api/patient-stats`)
      .then(response => {
        const data = response.data;

        setStats({
          pendingPatients: data.pendingPatients || 0,
          todaysPatients: data.todaysPatients || 0,
          ongoingPatients: data.ongoingPatients || 0
        });
      })
      .catch(error => console.error('Error fetching patient stats:', error));
  }, []);

  return (
    <Container className="mt-4">
      <Row className="gy-3">
        <Col xs={12} md={6} lg={4}>
          <Card className="border-left-blue p-3 shadow-sm">
            <Card.Header className="msd-cardtitle">Total Pending Patients</Card.Header>
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.pendingPatients}</div>
                </Col>
                <Col className="col-auto">
                  <People size="40px" className="text-gray-300" />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={4}>
          <Card className="border-left-green p-3 shadow-sm">
            <Card.Header className="msd-cardtitle">Total Today's Patients</Card.Header>
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.todaysPatients}</div>
                </Col>
                <Col className="col-auto">
                  <People size="40px" className="text-gray-300" />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={4}>
          <Card className="border-left-yellow p-3 shadow-sm">
            <Card.Header className="msd-cardtitle">Total Ongoing Patients</Card.Header>
            <Card.Body>
              <Row className="no-gutters align-items-center">
                <Col className="mr-2">
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.ongoingPatients}</div>
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
  );
}

export default MedSecDashboard;
