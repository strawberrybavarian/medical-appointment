import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarAdmin from '../sidebar/SidebarAdmin';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { People } from 'react-bootstrap-icons';
import '../../admin/AdminStyles.css';
import { ip } from '../../../../ContentExport';
import BarAppointment from './Charts/BarAppointment';

function AdminDashboard() {
    const [totalPatients, setTotalPatients] = useState(0);
    const [registeredPatients, setRegisteredPatients] = useState(0);
    const [unregisteredPatients, setUnregisteredPatients] = useState(0);

    const { aid } = useParams();

    useEffect(() => {
        axios.get(`${ip.address}/admin/api/patients/count`)
            .then(response => {
                setTotalPatients(response.data.totalPatients);
            })
            .catch(error => {
                console.error('Error fetching total patients:', error);
            });

        axios.get(`${ip.address}/admin/api/patients/registered/count`)
            .then(response => {
                setRegisteredPatients(response.data.registeredPatients);
            })
            .catch(error => {
                console.error('Error fetching registered patients:', error);
            });

        axios.get(`${ip.address}/admin/api/patients/unregistered/count`)
            .then(response => {
                setUnregisteredPatients(response.data.unregisteredPatients);
            })
            .catch(error => {
                console.error('Error fetching unregistered patients:', error);
            });
    }, []);

    return (
        <>
            <div className='d-flex justify-content-center'>
                <SidebarAdmin aid={aid} />
                <Container className='ad-container'>
                    <Row className="g-4">
                        <Col xl={3} md={6} >
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

                        <Col xl={3} md={6} >
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
                        <Col xl={3} md={6} >
                            <Card className="border-left-yellow p-3 shadow-sm">
                                <Card.Body>
                                    <Row className="no-gutters align-items-center">
                                        <Col className="mr-2">
                                            <div className="text-xs font-weight-bold text-yellow text-uppercase mb-1">
                                                Unregistered Patients
                                            </div>
                                            <div className="h5 mb-0 font-weight-bold text-gray-800">{unregisteredPatients}</div>
                                        </Col>
                                        <Col className="col-auto">
                                            <People size="40px" className="text-gray-300" />
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xl={3} md={6} >
                            <Card className="border-left-teal p-3 shadow-sm">
                                <Card.Body>
                                    <Row className="no-gutters align-items-center">
                                        <Col className="mr-2">
                                            <div className="text-xs font-weight-bold text-teal text-uppercase mb-1">
                                                Some Other Metric
                                            </div>
                                            <div className="h5 mb-0 font-weight-bold text-gray-800">Some Value</div>
                                        </Col>
                                        <Col className="col-auto">
                                            <People size="40px" className="text-gray-300" />
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <BarAppointment/>
                </Container>
            </div>
        </>
    );
}

export default AdminDashboard;
