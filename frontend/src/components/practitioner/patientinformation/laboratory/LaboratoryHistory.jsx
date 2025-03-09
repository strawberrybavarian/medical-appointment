import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Card, Collapse, Container, Row, Col, Spinner, Badge } from 'react-bootstrap';
import moment from 'moment';
import { ip } from "../../../../ContentExport";
import { FileEarmarkMedical, ChevronDown, ChevronUp, Calendar2Check, FilePdf, Download, Eye, CloudArrowDown, FileEarmark } from 'react-bootstrap-icons';

const LaboratoryHistory = ({ pid }) => {
    const [theLaboratory, setLaboratory] = useState([]);
    const [error, setError] = useState(null);
    const [openRecords, setOpenRecords] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(`${ip.address}/api/patient/api/onepatient/${pid}`)
            .then((res) => {
                if (res.data && res.data.thePatient && Array.isArray(res.data.thePatient.laboratoryResults)) {
                    setLaboratory(res.data.thePatient.laboratoryResults);
                } else {
                    setLaboratory([]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setError('Failed to fetch laboratory results');
                setLaboratory([]);
                setLoading(false);
            });
    }, [pid]);

    const sortedLabResults = [...theLaboratory].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const toggleCollapse = (id) => {
        setOpenRecords((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const handleViewPDF = (filePath) => {
        const fullUrl = `${ip.address}/${filePath}`;
        window.open(fullUrl, '_blank');
    };
    
    const handleDownload = async (filePath, fileName) => {
        try {
            const fullUrl = `${ip.address}/${filePath}`;
            const response = await axios.get(fullUrl, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(
                new Blob([response.data], { type: "application/pdf" })
            );
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading the file:", error);
        }
    };

    if (loading) {
        return (
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Loading laboratory results...</p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-white py-3 d-flex align-items-center">
                <FileEarmarkMedical className="text-primary me-2" size={24} />
                <h4 className="m-0 fw-bold">Laboratory Results</h4>
            </Card.Header>
            <Card.Body className="p-0">
                {error && (
                    <div className="alert alert-danger m-3">{error}</div>
                )}
                
                {sortedLabResults.length === 0 ? (
                    <div className="text-center py-5">
                        <FilePdf size={48} className="text-muted mb-3" />
                        <p className="text-muted mb-0">No laboratory results found</p>
                    </div>
                ) : (
                    sortedLabResults.map((result) => (
                        <Card key={result._id} className="border-0 border-bottom rounded-0">
                            <Card.Header 
                                className={`d-flex justify-content-between align-items-center bg-white py-3 px-4 ${openRecords[result._id] ? 'border-bottom' : ''}`}
                                onClick={() => toggleCollapse(result._id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex align-items-center">
                                    <Calendar2Check size={18} className="text-primary me-2" />
                                    <div>
                                        <div className="fw-medium">{moment(result.createdAt).format('MMMM D, YYYY')}</div>
                                        <div className="text-muted small">{moment(result.createdAt).format('h:mm A')}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    {result.file?.filename && (
                                        <Badge bg="light" text="dark" className="me-2">
                                            <FileEarmark size={12} className="me-1" />
                                            {result.file.filename.length > 20 
                                                ? result.file.filename.substring(0, 20) + '...' 
                                                : result.file.filename}
                                        </Badge>
                                    )}
                                    <Button
                                        variant="link"
                                        className="p-0 text-muted"
                                        aria-expanded={openRecords[result._id]}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCollapse(result._id);
                                        }}
                                    >
                                        {openRecords[result._id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </Button>
                                </div>
                            </Card.Header>
                            <Collapse in={openRecords[result._id]}>
                                <div>
                                    <Card.Body className="px-4 py-3">
                                        <Row>
                                            <Col md={12}>
                                                <div className="mb-3">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <FilePdf size={18} className="text-danger me-2" />
                                                        <h6 className="fw-bold mb-0">Laboratory Document</h6>
                                                    </div>
                                                    <div className="ms-4">
                                                        <p className="mb-3">
                                                            <span className="text-muted">Filename:</span>{' '}
                                                            <span className="fw-medium">{result.file?.filename || "No file uploaded"}</span>
                                                        </p>
                                                        
                                                        {result.file && (
                                                            <div className="d-flex gap-2 flex-wrap">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    className="d-inline-flex align-items-center"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleViewPDF(result.file.path);
                                                                    }}
                                                                >
                                                                    <Eye size={14} className="me-2" /> 
                                                                    View Document
                                                                </Button>
                                                                
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    className="d-inline-flex align-items-center"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDownload(result.file.path, result.file.filename);
                                                                    }}
                                                                >
                                                                    <CloudArrowDown size={14} className="me-2" /> 
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Col>
                                            
                                            {result.notes && (
                                                <Col md={12}>
                                                    <div className="mb-2">
                                                        <div className="d-flex align-items-center mb-2">
                                                            <h6 className="fw-bold mb-0">Notes</h6>
                                                        </div>
                                                        <div className="ms-4 p-3 bg-light rounded">
                                                            {result.notes}
                                                        </div>
                                                    </div>
                                                </Col>
                                            )}
                                        </Row>
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

export default LaboratoryHistory;