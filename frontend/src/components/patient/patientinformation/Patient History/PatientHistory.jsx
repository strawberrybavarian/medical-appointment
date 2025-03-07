import React, { useState } from "react";
import { Card, Collapse, Button, Container, Pagination, Row, Col, Badge, Accordion } from "react-bootstrap";
import moment from "moment";
import { 
  FaStethoscope, FaHeartbeat, FaTemperatureHigh, FaWeight, FaRulerVertical, 
  FaLungs, FaAllergies, FaSyringe, FaUserMd, FaCalendarAlt, FaNotesMedical,
  FaBrain, FaFileMedical, FaFilePdf, FaChevronDown, FaChevronUp, FaDna
} from 'react-icons/fa';
import GeneratePDF from './GeneratePDF';

const PatientHistory = ({ patientHistory }) => {
  const [openRecords, setOpenRecords] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const sortedHistory = [...patientHistory].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = sortedHistory.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(sortedHistory.length / recordsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Scroll to top when changing page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleCollapse = (id) => {
    setOpenRecords((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  // Helper function to get badge variant based on interpretation
  const getInterpretationBadge = (interpretation) => {
    if (!interpretation) return "secondary";
    const text = interpretation.toLowerCase();
    if (text.includes("normal") || text.includes("good")) return "success";
    if (text.includes("monitor") || text.includes("observe")) return "warning";
    if (text.includes("concern") || text.includes("attention")) return "danger";
    return "info";
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaNotesMedical className="text-primary me-2" />
          Medical History
        </h2>
        <Badge bg="primary" pill className="fs-6">
          {sortedHistory.length} Records
        </Badge>
      </div>

      {currentRecords.length > 0 ? (
        currentRecords.map((record) => {
          const doctorFullName = `Dr. ${record.doctor.dr_firstName} ${record.doctor.dr_middleInitial ? record.doctor.dr_middleInitial + '. ' : ''}${record.doctor.dr_lastName}`;
          const recordDate = moment(record.createdAt).format("MMMM DD, YYYY");
          const recordTime = moment(record.createdAt).format("h:mm A");
          const isOpen = openRecords[record._id] || false;
          const interpretationBadge = getInterpretationBadge(record.interpretation);

          return (
            <Card key={record._id} className="mb-4 shadow-sm border-0 record-card">
              <Card.Header className="bg-white py-3">
                <Row className="align-items-center">
                  <Col xs={12} md={6}>
                    <div className="d-flex align-items-center mb-2 mb-md-0">
                      <div className="date-badge me-3 text-center">
                        <div className="date-month">{moment(record.createdAt).format("MMM")}</div>
                        <div className="date-day">{moment(record.createdAt).format("DD")}</div>
                        <div className="date-year">{moment(record.createdAt).format("YYYY")}</div>
                      </div>
                      <div>
                        <h5 className="mb-1 fw-bold text-primary">
                          <FaUserMd className="me-2" />
                          {doctorFullName}
                        </h5>
                        <div className="text-muted small">
                          <FaCalendarAlt className="me-1" /> {recordDate} at {recordTime}
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="d-flex justify-content-md-end align-items-center mt-3 mt-md-0">
                      <Badge 
                        bg={interpretationBadge} 
                        className="me-3 py-2 px-3">
                        {record.interpretation || "No Interpretation"}
                      </Badge>
                      <Button
                        variant="outline-primary"
                        className="me-2 d-flex align-items-center"
                        onClick={() => toggleCollapse(record._id)}
                      >
                        {isOpen ? (
                          <>
                            <FaChevronUp className="me-1" /> Hide Details
                          </>
                        ) : (
                          <>
                            <FaChevronDown className="me-1" /> View Details
                          </>
                        )}
                      </Button>
                      <GeneratePDF record={record} doctorFullName={doctorFullName} />
                    </div>
                  </Col>
                </Row>
              </Card.Header>

              <Collapse in={isOpen}>
                <div>
                  <Card.Body className="bg-light pt-4">
                    <Row>
                      <Col xs={12} lg={6} className="mb-4">
                        <Card className="h-100 border-0 shadow-sm">
                          <Card.Header className="bg-primary text-white">
                            <h5 className="mb-0">
                              <FaStethoscope className="me-2" />
                              Medical Assessment
                            </h5>
                          </Card.Header>
                          <Card.Body>
                            <div className="medical-info-item">
                              <h6 className="text-primary">Symptoms</h6>
                              <p>
                                {record.historyOfPresentIllness?.currentSymptoms?.length > 0 
                                  ? record.historyOfPresentIllness.currentSymptoms.join(", ") 
                                  : "No symptoms recorded"}
                              </p>
                            </div>
                            <div className="medical-info-item">
                              <h6 className="text-primary">Assessment</h6>
                              <p>{record.assessment || "No assessment recorded"}</p>
                            </div>
                            <div className="medical-info-item">
                              <h6 className="text-primary">Recommendations</h6>
                              <p>{record.recommendations || "No recommendations recorded"}</p>
                            </div>
                            <div className="medical-info-item">
                              <h6 className="text-primary">Remarks</h6>
                              <p>{record.remarks || "No remarks recorded"}</p>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col xs={12} lg={6}>
                        <Card className="mb-4 border-0 shadow-sm">
                          <Card.Header className="bg-info text-white">
                            <h5 className="mb-0">
                              <FaHeartbeat className="me-2" />
                              Vitals
                            </h5>
                          </Card.Header>
                          <Card.Body>
                            <Row>
                              <Col xs={6} md={4} className="mb-3">
                                <div className="vital-stat">
                                  <div className="vital-icon">
                                    <FaHeartbeat />
                                  </div>
                                  <div>
                                    <div className="vital-label">Blood Pressure</div>
                                    <div className="vital-value">
                                      {record.bloodPressure?.systole || "N/A"}/{record.bloodPressure?.diastole || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </Col>
                              <Col xs={6} md={4} className="mb-3">
                                <div className="vital-stat">
                                  <div className="vital-icon">
                                    <FaHeartbeat />
                                  </div>
                                  <div>
                                    <div className="vital-label">Pulse Rate</div>
                                    <div className="vital-value">{record.pulseRate || "N/A"}</div>
                                  </div>
                                </div>
                              </Col>
                              <Col xs={6} md={4} className="mb-3">
                                <div className="vital-stat">
                                  <div className="vital-icon">
                                    <FaTemperatureHigh />
                                  </div>
                                  <div>
                                    <div className="vital-label">Temperature</div>
                                    <div className="vital-value">{record.temperature || "N/A"} °C</div>
                                  </div>
                                </div>
                              </Col>
                              <Col xs={6} md={4} className="mb-3">
                                <div className="vital-stat">
                                  <div className="vital-icon">
                                    <FaLungs />
                                  </div>
                                  <div>
                                    <div className="vital-label">Respiratory Rate</div>
                                    <div className="vital-value">{record.respiratoryRate || "N/A"}</div>
                                  </div>
                                </div>
                              </Col>
                              <Col xs={6} md={4} className="mb-3">
                                <div className="vital-stat">
                                  <div className="vital-icon">
                                    <FaWeight />
                                  </div>
                                  <div>
                                    <div className="vital-label">Weight</div>
                                    <div className="vital-value">{record.weight || "N/A"} kg</div>
                                  </div>
                                </div>
                              </Col>
                              <Col xs={6} md={4} className="mb-3">
                                <div className="vital-stat">
                                  <div className="vital-icon">
                                    <FaRulerVertical />
                                  </div>
                                  <div>
                                    <div className="vital-label">Height</div>
                                    <div className="vital-value">{record.height || "N/A"} cm</div>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>

                        <Accordion defaultActiveKey="0">
                          <Accordion.Item eventKey="0" className="border-0 shadow-sm mb-3">
                            <Accordion.Header>
                              <FaAllergies className="me-2 text-danger" />
                              <span className="fw-bold">Allergies & Skin Conditions</span>
                            </Accordion.Header>
                            <Accordion.Body>
                              <Row>
                                <Col xs={12} md={6} className="mb-3 mb-md-0">
                                  <h6 className="text-danger mb-2">
                                    <FaAllergies className="me-2" />
                                    Allergies
                                  </h6>
                                  {record.allergy?.length > 0 
                                    ? record.allergy.map((item, idx) => (
                                        <Badge bg="danger" className="me-2 mb-2 py-2 px-3" key={idx}>
                                          {item}
                                        </Badge>
                                      ))
                                    : <p className="text-muted">No allergies recorded</p>
                                  }
                                </Col>
                                <Col xs={12} md={6}>
                                  <h6 className="text-warning mb-2">
                                    <FaSyringe className="me-2" />
                                    Skin Conditions
                                  </h6>
                                  {record.skinCondition?.length > 0 
                                    ? record.skinCondition.map((item, idx) => (
                                        <Badge bg="warning" text="dark" className="me-2 mb-2 py-2 px-3" key={idx}>
                                          {item}
                                        </Badge>
                                      ))
                                    : <p className="text-muted">No skin conditions recorded</p>
                                  }
                                </Col>
                              </Row>
                            </Accordion.Body>
                          </Accordion.Item>
                          
                          <Accordion.Item eventKey="1" className="border-0 shadow-sm">
                            <Accordion.Header>
                              <FaDna className="me-2 text-success" />
                              <span className="fw-bold">Family Medical History</span>
                            </Accordion.Header>
                            <Accordion.Body>
                              {record.familyHistory?.length > 0 ? (
                                <div className="family-history">
                                  {record.familyHistory.map((item, idx) => (
                                    <div key={idx} className="family-history-item mb-2">
                                      <Badge bg="success" className="me-2 py-2 px-3">
                                        {item.relation}
                                      </Badge>
                                      <span>{item.condition}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted">No family history recorded</p>
                              )}
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Col>
                    </Row>
                  </Card.Body>
                </div>
              </Collapse>
            </Card>
          );
        })
      ) : (
        <Card className="text-center p-5">
          <Card.Body>
            <FaFileMedical size={50} className="text-muted mb-3" />
            <h4>No Medical Records Found</h4>
            <p className="text-muted">
              There are no medical records available for this patient at this time.
            </p>
          </Card.Body>
        </Card>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination size="lg">
            <Pagination.First 
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            
            {/* Dynamic page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                // Show all pages if there are 5 or fewer
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                // Near the start
                pageNum = i + 1;
                if (i === 4) pageNum = totalPages;
                if (i === 3) pageNum = 5;
              } else if (currentPage >= totalPages - 2) {
                // Near the end
                pageNum = totalPages - 4 + i;
              } else {
                // In the middle
                pageNum = currentPage - 2 + i;
              }
              
              // Only show ellipsis for jumps
              if ((i === 3 && pageNum !== 5) || (i === 1 && pageNum !== 2)) {
                return <Pagination.Ellipsis key={`ellipsis-${i}`} disabled />;
              }
              
              return (
                <Pagination.Item
                  key={pageNum}
                  active={pageNum === currentPage}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              );
            })}
            
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      <style jsx>{`
        .record-card {
          transition: all 0.3s ease;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .record-card:hover {
          box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
        }
        
        .date-badge {
          min-width: 60px;
          padding: 4px;
          border-radius: 8px;
          background-color: #f8f9fa;
          border-left: 4px solid #4e73df;
        }
        
        .date-month {
          font-size: 14px;
          font-weight: 600;
          color: #4e73df;
        }
        
        .date-day {
          font-size: 20px;
          font-weight: 700;
          line-height: 1.1;
        }
        
        .date-year {
          font-size: 12px;
          color: #6c757d;
        }
        
        .medical-info-item {
          margin-bottom: 16px;
        }
        
        .medical-info-item:last-child {
          margin-bottom: 0;
        }
        
        .vital-stat {
          display: flex;
          align-items: center;
        }
        
        .vital-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #e9ecef;
          color: #4e73df;
          margin-right: 10px;
          font-size: 18px;
        }
        
        .vital-label {
          font-size: 12px;
          color: #6c757d;
        }
        
        .vital-value {
          font-weight: 600;
          font-size: 16px;
        }
        
        .family-history-item {
          display: flex;
          align-items: center;
        }
        
        /* Custom styling for the accordion */
        .accordion-button:not(.collapsed) {
          color: #4e73df;
          background-color: rgba(78, 115, 223, 0.1);
          box-shadow: none;
        }
        
        .accordion-button:focus {
          border-color: #bac8f3;
          box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.25);
        }
      `}</style>
    </Container>
  );
};

export default PatientHistory;