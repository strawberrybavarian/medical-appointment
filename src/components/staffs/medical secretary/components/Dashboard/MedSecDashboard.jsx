import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { People } from 'react-bootstrap-icons';
import { ip } from '../../../../../ContentExport';

function MedSecDashboard() {
  const [stats, setStats] = useState({
    pendingPatients: 0,
    todaysPatients: 0,
    ongoingPatients: 0,
  });

  useEffect(() => {
    // Fetch statistics data from the backend
    axios
      .get(`${ip.address}/medicalsecretary/api/patient-stats`)
      .then((response) => {
        const data = response.data;
        console.log('Patient Stats:', data);

        // Directly use the stats data from the backend response
        setStats({
          pendingPatients: data.pendingPatients || 0,
          todaysPatients: data.todaysPatients || 0,
          ongoingPatients: data.ongoingPatients || 0,
        });
      })
      .catch((error) => console.error('Error fetching patient stats:', error));
  }, []);

  return (
    <div className="mt-4">
      <Row className="g-3 flex-column">
        <Col >
          <Card className="shadow-sm border-left-blue" style={{ minHeight: '100px', padding: '10px' }}>
            <Card.Header className="msd-cardtitle">Total Pending Patients</Card.Header>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div className="h5 text-gray-800 mb-0">{stats.pendingPatients}</div>
              <People size="30px" className="text-gray-300" />
            </Card.Body>
          </Card>
        </Col>

        <Col >
          <Card className="shadow-sm border-left-green" style={{ minHeight: '100px', padding: '10px' }}>
            <Card.Header className="msd-cardtitle">Total Today's Patients</Card.Header>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div className="h5 text-gray-800 mb-0">{stats.todaysPatients}</div>
              <People size="30px" className="text-gray-300" />
            </Card.Body>
          </Card>
        </Col>

        <Col >
          <Card className="shadow-sm border-left-yellow" style={{ minHeight: '100px', padding: '10px' }}>
            <Card.Header className="msd-cardtitle">Total Ongoing Patients</Card.Header>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div className="h5 text-gray-800 mb-0">{stats.ongoingPatients}</div>
              <People size="30px" className="text-gray-300" />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default MedSecDashboard;
