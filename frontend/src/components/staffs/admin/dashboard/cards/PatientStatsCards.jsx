// PatientStatsCards.js
import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { People } from 'react-bootstrap-icons';
import { ip } from '../../../../../ContentExport';
import axios from 'axios';


const PatientStatsCards = ({ totalPatients, registeredPatients, unregisteredPatients }) => {
    const [todayPatients, setTodaysPatients] = useState(0); 
    const [ongoingPatients, setOngoingPatients] = useState(0);
    


            
        useEffect (() => {
            axios.get(`${ip.address}/api/admin/api/patients/todays-patient/count`)
            .then((response) => {
              setTodaysPatients(response.data.todaysAppointments);
             
        
          })
            .catch(error => console.error('Error fetching today\'s patients:', error));
        
            axios.get(`${ip.address}/api/admin/api/patients/ongoing-appointment/count`)
            .then ((response) => {
                setOngoingPatients(response.data.ongoingAppointments);
            }
            ) 
            .catch (error => console.error('Error fetching ongoing patients:', error));
        
        }, []);

        console.log(todayPatients);




    return (
        <Row className="g-4">
            <Col xl={3} md={6}>
                <Card className="border-left-blue p-3 shadow-sm">
                    <Card.Body>
                        <Row className="no-gutters align-items-center">
                            <Col className="mr-2">
                                <div className="text-xs font-weight-bold text-blue text-uppercase mb-1">
                                    Total Patients
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{totalPatients}</div>
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
                                    Registered Patients
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{registeredPatients}</div>
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
                                    Todays Patients
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{todayPatients}</div>
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
                                    Ongoing Patients 
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{ongoingPatients}</div>
                            </Col>
                            <Col className="col-auto">
                                <People size="40px" className="text-gray-300" />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default PatientStatsCards;
