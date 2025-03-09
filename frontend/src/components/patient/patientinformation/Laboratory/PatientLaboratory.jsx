import React, { useState } from "react";
import { Card, Collapse, Button, Container, Row, Col, Badge, Pagination } from "react-bootstrap";
import moment from "moment";
import axios from "axios";
import { ip } from "../../../../ContentExport";
import { 
  FaDownload, 
  FaEye, 
  FaFilePdf, 
  FaCalendarAlt, 
  FaChevronDown, 
  FaChevronUp,
  FaFlask,
  FaUserMd,
  FaFileAlt,
  FaHospital
} from "react-icons/fa";

const PatientLaboratory = ({ laboratoryResults }) => {
  const [openRecords, setOpenRecords] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

  // Sort the history by date in descending order (most recent first)
  const sortedLabResults = [...laboratoryResults].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Pagination logic
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = sortedLabResults.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(sortedLabResults.length / resultsPerPage);

  // Toggle the collapse for each record
  const toggleCollapse = (id) => {
    setOpenRecords((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const handleViewPDF = (filePath) => {
    const fullUrl = `${ip.address}/${filePath}`;
    window.open(fullUrl, "_blank"); // Open PDF in new tab
  };

  // Handle file download
  const handleDownload = async (filePath, fileName) => {
    try {
      const fullUrl = `${ip.address}/${filePath}`;

      const response = await axios.get(fullUrl, {
        responseType: "blob",
      });

      // Create a new Blob object using the response data
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

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Reset open records when changing page
    setOpenRecords({});
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Helper to get test type badge
  const getLabTypeBadge = (filename) => {
    if (!filename) return <Badge bg="secondary">Unknown</Badge>;
    
    const lowerFileName = filename.toLowerCase();
    if (lowerFileName.includes('blood') || lowerFileName.includes('cbc')) {
      return <Badge bg="danger">Blood Test</Badge>;
    } else if (lowerFileName.includes('urine') || lowerFileName.includes('urinalysis')) {
      return <Badge bg="warning" text="dark">Urinalysis</Badge>;
    } else if (lowerFileName.includes('xray') || lowerFileName.includes('x-ray')) {
      return <Badge bg="info">X-Ray</Badge>;
    } else if (lowerFileName.includes('scan') || lowerFileName.includes('ct') || lowerFileName.includes('mri')) {
      return <Badge bg="primary">Imaging</Badge>;
    } else {
      return <Badge bg="success">Lab Result</Badge>;
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaFlask className="text-primary me-2" />
          Laboratory Results
        </h2>
        <Badge bg="primary" pill className="fs-6">
          {sortedLabResults.length} Records
        </Badge>
      </div>
      
      {sortedLabResults.length > 0 ? (
        <>
          {currentResults.map((result) => (
            <Card key={result._id} className="mb-4 shadow-sm border-0 lab-result-card">
              <Card.Header className="bg-white py-3">
                <Row className="align-items-center">
                  <Col xs={12} md={6} className="mb-2 mb-md-0">
                    <div className="d-flex align-items-center">
                      <div className="date-badge me-3 text-center">
                        <div className="date-month">{moment(result.createdAt).format("MMM")}</div>
                        <div className="date-day">{moment(result.createdAt).format("DD")}</div>
                        <div className="date-year">{moment(result.createdAt).format("YYYY")}</div>
                      </div>
                      <div>
                        <h5 className="mb-1 fw-bold text-primary">
                          <FaFileAlt className="me-2" />
                          {result.file?.filename || "Laboratory Result"}
                        </h5>
                        <div className="text-muted small">
                          <FaCalendarAlt className="me-1" /> 
                          {moment(result.createdAt).format("MMMM D, YYYY, h:mm a")}
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="d-flex justify-content-md-end align-items-center mt-3 mt-md-0">
                      <div className="me-3">
                        {result.file && getLabTypeBadge(result.file.filename)}
                      </div>
                      <Button
                        variant={openRecords[result._id] ? "outline-primary" : "outline-secondary"}
                        className="d-flex align-items-center"
                        onClick={() => toggleCollapse(result._id)}
                      >
                        {openRecords[result._id] ? (
                          <>
                            <FaChevronUp className="me-1" /> Hide Details
                          </>
                        ) : (
                          <>
                            <FaChevronDown className="me-1" /> View Details
                          </>
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Header>

              <Collapse in={openRecords[result._id]}>
                <div>
                  <Card.Body className="bg-light py-4">
                    <Row>
                      <Col lg={6} className="mb-4 mb-lg-0">
                        <Card className="h-100 border-0 shadow-sm">
                          <Card.Header className="bg-primary text-white py-3">
                            <h5 className="mb-0">
                              <FaFilePdf className="me-2" />
                              Document Information
                            </h5>
                          </Card.Header>
                          <Card.Body>
                            <div className="detail-item mb-3">
                              <div className="detail-icon">
                                <FaFileAlt />
                              </div>
                              <div className="detail-content">
                                <div className="detail-label">File Name</div>
                                <div className="detail-value">{result.file?.filename || "No file uploaded"}</div>
                              </div>
                            </div>
                            
                            {result.labType && (
                              <div className="detail-item mb-3">
                                <div className="detail-icon">
                                  <FaFlask />
                                </div>
                                <div className="detail-content">
                                  <div className="detail-label">Test Type</div>
                                  <div className="detail-value">{result.labType}</div>
                                </div>
                              </div>
                            )}
                            
                            {result.doctor && (
                              <div className="detail-item mb-3">
                                <div className="detail-icon">
                                  <FaUserMd />
                                </div>
                                <div className="detail-content">
                                  <div className="detail-label">Requested By</div>
                                  <div className="detail-value">
                                    Dr. {result.doctor.dr_firstName} {result.doctor.dr_lastName}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {result.facility && (
                              <div className="detail-item">
                                <div className="detail-icon">
                                  <FaHospital />
                                </div>
                                <div className="detail-content">
                                  <div className="detail-label">Facility</div>
                                  <div className="detail-value">{result.facility}</div>
                                </div>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                      
                      <Col lg={6}>
                        <Card className="border-0 shadow-sm h-100">
                          <Card.Header className="bg-info text-white py-3">
                            <h5 className="mb-0">
                              <FaEye className="me-2" />
                              Actions
                            </h5>
                          </Card.Header>
                          <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                            {result.file ? (
                              <div className="text-center">
                                <div className="document-preview mb-4">
                                  <FaFilePdf size={64} className="text-danger" />
                                </div>
                                <div className="d-grid gap-3 w-100">
                                  <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={() => handleViewPDF(result.file.path)}
                                    className="d-flex align-items-center justify-content-center"
                                  >
                                    <FaEye className="me-2" /> View Document
                                  </Button>
                                  <Button
                                    variant="outline-primary"
                                    size="lg"
                                    onClick={() => handleDownload(result.file.path, result.file.filename)}
                                    className="d-flex align-items-center justify-content-center"
                                  >
                                    <FaDownload className="me-2" /> Download Document
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center text-muted py-4">
                                <FaFilePdf size={48} className="mb-3 opacity-50" />
                                <h5>No Document Available</h5>
                                <p>There is no laboratory document attached to this record.</p>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </div>
              </Collapse>
            </Card>
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First 
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = idx + 1;
                  } else if (currentPage <= 3) {
                    pageNum = idx + 1;
                    if (idx === 4) pageNum = totalPages;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + idx;
                  } else {
                    pageNum = currentPage - 2 + idx;
                  }
                  
                  if ((idx === 3 && pageNum !== 4 && totalPages > 5) || 
                      (idx === 1 && pageNum !== 2 && currentPage > 3)) {
                    return <Pagination.Ellipsis key={`ellipsis-${idx}`} />;
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
        </>
      ) : (
        <Card className="text-center p-5 shadow-sm border-0">
          <Card.Body>
            <FaFlask size={50} className="text-muted mb-3" />
            <h4>No Laboratory Results Found</h4>
            <p className="text-muted">
              You don't have any laboratory results at this time.
            </p>
          </Card.Body>
        </Card>
      )}
      
      <style jsx>{`
        .lab-result-card {
          transition: all 0.3s ease;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .lab-result-card:hover {
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
        
        .detail-item {
          display: flex;
          align-items: flex-start;
        }
        
        .detail-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #f8f9fa;
          color: #4e73df;
          margin-right: 12px;
          flex-shrink: 0;
        }
        
        .detail-content {
          flex-grow: 1;
        }
        
        .detail-label {
          font-size: 12px;
          color: #6c757d;
          margin-bottom: 2px;
        }
        
        .detail-value {
          font-weight: 500;
        }
        
        .document-preview {
          padding: 20px;
          border-radius: 8px;
          background-color: #f8f9fa;
          display: inline-block;
        }
      `}</style>
    </Container>
  );
};

export default PatientLaboratory;