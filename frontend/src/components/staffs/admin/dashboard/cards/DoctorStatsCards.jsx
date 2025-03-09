// DoctorStatsCards.js
import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { People } from 'react-bootstrap-icons';
import axios from 'axios';
import { ip } from '../../../../../ContentExport';
const DoctorStatsCards = ({ totalDoctors, registeredDoctors, reviewedDoctors, onlineDoctors, inSessionDoctors }) => {


 
    return (
        <Row className="g-4">
            <Col xl={3} md={6}>
                <Card className="border-left-blue p-3 shadow-sm">
                    <Card.Body>
                        <Row className="no-gutters align-items-center">
                            <Col className="mr-2">
                                <div className="text-xs font-weight-bold text-blue text-uppercase mb-1">
                                    Total Doctors
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{totalDoctors}</div>
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
                                    Registered Doctors
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{registeredDoctors}</div>
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
                                    In Session Doctors
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{inSessionDoctors}</div>
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
                                    Online Doctors
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{onlineDoctors}</div>
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

export default DoctorStatsCards;
