// DoctorStatsCards.js
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { People } from 'react-bootstrap-icons';

const DoctorStatsCards = ({ totalDoctors, registeredDoctors, reviewedDoctors }) => {


    
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
                                    To Review Doctors
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">{reviewedDoctors}</div>
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
    );
};

export default DoctorStatsCards;
