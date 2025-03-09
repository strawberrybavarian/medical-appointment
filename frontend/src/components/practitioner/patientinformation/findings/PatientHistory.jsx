import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Collapse, Container, Card, Button, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { ip } from '../../../../ContentExport';
import { ClockHistory, ChevronDown, ChevronUp, PersonBadge, Calendar2Check, Heart, Lungs, Thermometer, Rulers, Speedometer2, Activity, Cloud, FileEarmarkMedical } from 'react-bootstrap-icons';

const PatientHistory = ({pid}) => {
    
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openRecords, setOpenRecords] = useState({});

    useEffect(() => {
        setLoading(true);
        axios.get(`${ip.address}/api/patient/api/onepatient/${pid}`)
            .then((res) => {
                if (res.data && res.data.thePatient && Array.isArray(res.data.thePatient.patient_findings)) {
                    setHistory(res.data.thePatient.patient_findings);
                } else {
                    setHistory([]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setError('Failed to fetch patient history');
                setHistory([]);
                setLoading(false);
            });
    }, [pid]);
    
    const sortedHistory = [...history].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const toggleCollapse = (id) => {
        setOpenRecords((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    if (loading) {
        return (
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Loading patient history...</p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-white py-3 d-flex align-items-center">
                <ClockHistory className="text-primary me-2" size={24} />
                <h4 className="m-0 fw-bold">Patient History</h4>
            </Card.Header>
            <Card.Body className="p-0">
                {error && (
                    <div className="alert alert-danger m-3">{error}</div>
                )}
                
                {sortedHistory.length === 0 ? (
                    <div className="text-center py-5">
                        <FileEarmarkMedical size={48} className="text-muted mb-3" />
                        <p className="text-muted mb-0">No previous medical records found</p>
                    </div>
                ) : (
                    sortedHistory.map((record, index) => (
                        <Card key={record._id} className="border-0 border-bottom rounded-0">
                            <Card.Header 
                                className={`d-flex justify-content-between align-items-center bg-white py-3 px-4 ${openRecords[record._id] ? 'border-bottom' : ''}`}
                                onClick={() => toggleCollapse(record._id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex align-items-center">
                                    <Calendar2Check size={18} className="text-primary me-2" />
                                    <div>
                                        <div className="fw-medium">{moment(record.createdAt).format('MMMM D, YYYY')}</div>
                                        <div className="text-muted small">{moment(record.createdAt).format('h:mm A')}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    {record.historyOfPresentIllness?.chiefComplaint && (
                                        <Badge bg="light" text="dark" className="me-2">
                                            {record.historyOfPresentIllness.chiefComplaint}
                                        </Badge>
                                    )}
                                    <Button
                                        variant="link"
                                        className="p-0 text-muted"
                                        aria-expanded={openRecords[record._id]}
                                    >
                                        {openRecords[record._id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </Button>
                                </div>
                            </Card.Header>
                            <Collapse in={openRecords[record._id]}>
                                <div>
                                    <Card.Body className="px-4 py-3">
                                        {record.doctor && (
                                            <div className="mb-3">
                                                <div className="d-flex align-items-center mb-2">
                                                    <PersonBadge size={18} className="text-primary me-2" />
                                                    <h6 className="fw-bold mb-0">Doctor Information</h6>
                                                </div>
                                                <Row className="ms-4">
                                                    <Col md={6}>
                                                        <div className="mb-2">
                                                            <span className="text-muted">Name:</span>{' '}
                                                            <span className="fw-medium">{`${record.doctor.dr_firstName} ${record.doctor.dr_lastName}`}</span>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="mb-2">
                                                            <span className="text-muted">Email:</span>{' '}
                                                            <span>{record.doctor.dr_email}</span>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        )}
                                        
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <Activity size={18} className="text-success me-2" />
                                                <h6 className="fw-bold mb-0">Vital Signs</h6>
                                            </div>
                                            <Row className="ms-4">
                                                <Col md={12} className="mb-2">
                                                    <div className="d-flex align-items-center">
                                                        <Heart size={16} className="text-danger me-2" />
                                                        <span className="text-muted">BP:</span>{' '}
                                                        <span className="ms-1 fw-medium">{`${record?.bloodPressure?.systole || '--'}/${record?.bloodPressure?.diastole || '--'} mmHg`}</span>
                                                    </div>
                                                </Col>
                                                <Col md={12} className="mb-2">
                                                    <div className="d-flex align-items-center">
                                                        <Activity size={16} className="text-warning me-2" />
                                                        <span className="text-muted">Pulse:</span>{' '}
                                                        <span className="ms-1 fw-medium">{record?.pulseRate || '--'} bpm</span>
                                                    </div>
                                                </Col>
                                                <Col md={12} className="mb-2">
                                                    <div className="d-flex align-items-center">
                                                        <Lungs size={16} className="text-info me-2" />
                                                        <span className="text-muted">Resp. rate:</span>{' '}
                                                        <span className="ms-1 fw-medium">{record?.respiratoryRate || '--'} /min</span>
                                                    </div>
                                                </Col>
                                                <Col md={12} className="mb-2">
                                                    <div className="d-flex align-items-center">
                                                        <Thermometer size={16} className="text-danger me-2" />
                                                        <span className="text-muted">Temp:</span>{' '}
                                                        <span className="ms-1 fw-medium">{record?.temperature || '--'} °C</span>
                                                    </div>
                                                </Col>
                                                <Col md={12} className="mb-2">
                                                    <div className="d-flex align-items-center">
                                                        <Rulers size={16} className="text-secondary me-2" />
                                                        <span className="text-muted">Height:</span>{' '}
                                                        <span className="ms-1 fw-medium">{record?.height || '--'} cm</span>
                                                    </div>
                                                </Col>
                                                <Col md={12} className="mb-2">
                                                    <div className="d-flex align-items-center">
                                                        <Speedometer2 size={16} className="text-secondary me-2" />
                                                        <span className="text-muted">Weight:</span>{' '}
                                                        <span className="ms-1 fw-medium">{record?.weight || '--'} kg</span>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                        
                                        {record.historyOfPresentIllness && (
                                            <div className="mb-3">
                                                <div className="d-flex align-items-center mb-2">
                                                    <FileEarmarkMedical size={18} className="text-primary me-2" />
                                                    <h6 className="fw-bold mb-0">Present Illness</h6>
                                                </div>
                                                <div className="ms-4">
                                                    <div className="mb-2">
                                                        <span className="text-muted">Chief Complaint:</span>{' '}
                                                        <span>{record.historyOfPresentIllness.chiefComplaint || 'None documented'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted">Symptoms:</span>{' '}
                                                        <div className="d-flex flex-wrap mt-1">
                                                            {record.historyOfPresentIllness.currentSymptoms && record.historyOfPresentIllness.currentSymptoms.length > 0 ? (
                                                                record.historyOfPresentIllness.currentSymptoms.map((symptom, idx) => (
                                                                    <Badge 
                                                                        key={idx} 
                                                                        bg="light" 
                                                                        text="dark" 
                                                                        className="me-2 mb-1 px-3 py-2"
                                                                    >
                                                                        {symptom}
                                                                    </Badge>
                                                                ))
                                                            ) : (
                                                                <span className="text-muted">None documented</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {record.lifestyle && (
                                            <div className="mb-3">
                                                <div className="d-flex align-items-center mb-2">
                                                    <Cloud size={18} className="text-info me-2" />
                                                    <h6 className="fw-bold mb-0">Lifestyle</h6>
                                                </div>
                                                <div className="ms-4">
                                                    <Badge 
                                                        bg={record.lifestyle.smoking ? "danger" : "light"} 
                                                        text={record.lifestyle.smoking ? "white" : "dark"}
                                                        className="me-2 mb-1"
                                                    >
                                                        Smoking: {record.lifestyle.smoking ? 'Yes' : 'No'}
                                                    </Badge>
                                                    <Badge 
                                                        bg={record.lifestyle.alcoholConsumption ? "warning" : "light"} 
                                                        text={record.lifestyle.alcoholConsumption ? "dark" : "dark"}
                                                        className="me-2 mb-1"
                                                    >
                                                        Alcohol: {record.lifestyle.alcoholConsumption ? 'Yes' : 'No'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {record.remarks && (
                                            <div className="mb-2">
                                                <div className="d-flex align-items-center mb-2">
                                                    <h6 className="fw-bold mb-0">Additional Remarks</h6>
                                                </div>
                                                <div className="ms-4 p-3 bg-light rounded">
                                                    {record.remarks}
                                                </div>
                                            </div>
                                        )}
                                    </Card.Body>
                                </div>
                            </Collapse>
                        </Card>
                    ))
                )}
            </Card.Body>
            <style jsx>{`
                .badge {
                    font-weight: 500;
                }
            `}</style>
        </Card>
    );
};

export default PatientHistory;