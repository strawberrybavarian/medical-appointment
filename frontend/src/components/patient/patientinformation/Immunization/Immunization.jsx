import React, { useState } from 'react';
import { 
  Container, 
  Card, 
  Row, 
  Col, 
  Badge, 
  Pagination,
  Accordion,
  Button
} from 'react-bootstrap';
import moment from 'moment';
import { 
  FaSyringe, 
  FaCalendarAlt, 
  FaUserMd, 
  FaVial, 
  FaMapMarkerAlt,
  FaRoute,
  FaListOl,
  FaExclamationTriangle,
  FaClipboardCheck,
  FaChevronDown
} from 'react-icons/fa';

const Immunization = ({ immunizations }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  
  // Sort immunizations by date in descending order (recent first)
  const sortedImmunizations = [...immunizations].sort(
    (a, b) => new Date(b.dateAdministered || b.createdAt) - new Date(a.dateAdministered || a.createdAt)
  );
  
  // Group immunizations by year for better organization
  const groupedByYear = sortedImmunizations.reduce((groups, immunization) => {
    const year = moment(immunization.dateAdministered || immunization.createdAt).format('YYYY');
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(immunization);
    return groups;
  }, {});
  
  // Get years in descending order
  const years = Object.keys(groupedByYear).sort((a, b) => b - a);
  
  // Pagination logic
  const indexOfLastYear = currentPage * recordsPerPage;
  const indexOfFirstYear = indexOfLastYear - recordsPerPage;
  const currentYears = years.slice(indexOfFirstYear, indexOfLastYear);
  const totalPages = Math.ceil(years.length / recordsPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper function to get badge color based on vaccine type
  const getVaccineBadgeColor = (name) => {
    const vaccineName = name?.toLowerCase() || '';
    if (vaccineName.includes('covid') || vaccineName.includes('coronavirus')) return 'danger';
    if (vaccineName.includes('flu') || vaccineName.includes('influenza')) return 'warning';
    if (vaccineName.includes('hep') || vaccineName.includes('hepatitis')) return 'info';
    if (vaccineName.includes('tetanus') || vaccineName.includes('tdap')) return 'secondary';
    if (vaccineName.includes('mmr') || vaccineName.includes('measles')) return 'success';
    return 'primary';
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaSyringe className="text-primary me-2" />
          Immunization Records
        </h2>
        <Badge bg="primary" pill className="fs-6">
          {sortedImmunizations.length} Records
        </Badge>
      </div>

      {sortedImmunizations.length > 0 ? (
        <>
          {currentYears.map(year => (
            <Card key={year} className="mb-4 shadow-sm border-0 immunization-year-card">
              <Card.Header className="bg-gradient-light py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="m-0 fw-bold">
                    <FaCalendarAlt className="me-2 text-primary" />
                    {year}
                  </h4>
                  <Badge bg="primary" pill>
                    {groupedByYear[year].length} Records
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <Accordion defaultActiveKey="0" className="immunization-accordion">
                  {groupedByYear[year].map((immunization, index) => {
                    const doctorFullname = immunization.administeredBy
                      ? `Dr. ${immunization.administeredBy.dr_firstName} ${immunization.administeredBy.dr_lastName}`
                      : 'Doctor not available';
                      
                    const vaccineType = getVaccineBadgeColor(immunization.vaccineName);
                    
                    return (
                      <Accordion.Item 
                        key={immunization._id} 
                        eventKey={index.toString()}
                        className="border-0 border-bottom"
                      >
                        <Accordion.Header className="immunization-header">
                          <div className="d-flex align-items-center flex-grow-1">
                            <div className="immunization-icon-container me-3">
                              <FaSyringe className="immunization-icon" />
                            </div>
                            <div className="flex-grow-1">
                              <h5 className="mb-0 fw-bold text-primary">{immunization.vaccineName}</h5>
                              <div className="text-muted small">
                                {moment(immunization.dateAdministered || immunization.createdAt).format('MMMM DD, YYYY')}
                              </div>
                            </div>
                            <Badge bg={vaccineType} className="ms-2 me-3 py-2 px-3 d-none d-md-block">
                              Dose {immunization.dose || immunization.doseNumber || '1'}
                            </Badge>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body className="bg-light py-4">
                          <Row>
                            <Col md={6} className="mb-4 mb-md-0">
                              <Card className="h-100 border-0 shadow-sm">
                                <Card.Header className="bg-primary text-white">
                                  <h5 className="mb-0">Vaccine Details</h5>
                                </Card.Header>
                                <Card.Body>
                                  <Row className="mb-3">
                                    <Col xs={12} className="mb-3">
                                      <div className="detail-item">
                                        <div className="detail-icon">
                                          <FaVial />
                                        </div>
                                        <div className="detail-content">
                                          <div className="detail-label">Vaccine Name</div>
                                          <div className="detail-value">{immunization.vaccineName}</div>
                                        </div>
                                      </div>
                                    </Col>
                                    <Col xs={6} className="mb-3">
                                      <div className="detail-item">
                                        <div className="detail-icon">
                                          <FaListOl />
                                        </div>
                                        <div className="detail-content">
                                          <div className="detail-label">Dose</div>
                                          <div className="detail-value">{immunization.dose || immunization.doseNumber || 'N/A'}</div>
                                        </div>
                                      </div>
                                    </Col>
                                    <Col xs={6} className="mb-3">
                                      <div className="detail-item">
                                        <div className="detail-icon">
                                          <FaExclamationTriangle />
                                        </div>
                                        <div className="detail-content">
                                          <div className="detail-label">Lot Number</div>
                                          <div className="detail-value">{immunization.lotNumber || 'N/A'}</div>
                                        </div>
                                      </div>
                                    </Col>
                                    <Col xs={6}>
                                      <div className="detail-item">
                                        <div className="detail-icon">
                                          <FaRoute />
                                        </div>
                                        <div className="detail-content">
                                          <div className="detail-label">Route</div>
                                          <div className="detail-value">
                                            {immunization.route || immunization.routeOfAdministration || 'N/A'}
                                          </div>
                                        </div>
                                      </div>
                                    </Col>
                                    <Col xs={6}>
                                      <div className="detail-item">
                                        <div className="detail-icon">
                                          <FaMapMarkerAlt />
                                        </div>
                                        <div className="detail-content">
                                          <div className="detail-label">Site</div>
                                          <div className="detail-value">
                                            {immunization.site || immunization.siteOfAdministration || 'N/A'}
                                          </div>
                                        </div>
                                      </div>
                                    </Col>
                                  </Row>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col md={6}>
                              <Card className="h-100 border-0 shadow-sm">
                                <Card.Header className="bg-info text-white">
                                  <h5 className="mb-0">Administration Details</h5>
                                </Card.Header>
                                <Card.Body>
                                  <Row className="mb-3">
                                    <Col xs={12} className="mb-3">
                                      <div className="detail-item">
                                        <div className="detail-icon">
                                          <FaUserMd />
                                        </div>
                                        <div className="detail-content">
                                          <div className="detail-label">Administered By</div>
                                          <div className="detail-value">{doctorFullname}</div>
                                        </div>
                                      </div>
                                    </Col>
                                    <Col xs={12} className="mb-3">
                                      <div className="detail-item">
                                        <div className="detail-icon">
                                          <FaCalendarAlt />
                                        </div>
                                        <div className="detail-content">
                                          <div className="detail-label">Date Administered</div>
                                          <div className="detail-value">
                                            {moment(immunization.dateAdministered || immunization.createdAt).format('MMMM DD, YYYY')}
                                          </div>
                                        </div>
                                      </div>
                                    </Col>
                                    <Col xs={12}>
                                      <div className="detail-item">
                                        <div className="detail-icon">
                                          <FaClipboardCheck />
                                        </div>
                                        <div className="detail-content">
                                          <div className="detail-label">Remarks</div>
                                          <div className="detail-value">
                                            {immunization.remarks || immunization.notes || 'No remarks available'}
                                          </div>
                                        </div>
                                      </div>
                                    </Col>
                                    {immunization.expirationDate && (
                                      <Col xs={12} className="mt-3">
                                        <div className="detail-item">
                                          <div className="detail-icon">
                                            <FaCalendarAlt />
                                          </div>
                                          <div className="detail-content">
                                            <div className="detail-label">Expiration Date</div>
                                            <div className="detail-value">
                                              {moment(immunization.expirationDate).format('MMMM DD, YYYY')}
                                            </div>
                                          </div>
                                        </div>
                                      </Col>
                                    )}
                                  </Row>
                                </Card.Body>
                              </Card>
                            </Col>
                          </Row>
                        </Accordion.Body>
                      </Accordion.Item>
                    );
                  })}
                </Accordion>
              </Card.Body>
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
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = idx + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = idx + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + idx;
                  } else {
                    pageNumber = currentPage - 2 + idx;
                  }
                  
                  return (
                    <Pagination.Item 
                      key={pageNumber}
                      active={pageNumber === currentPage}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
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
            <FaSyringe size={50} className="text-muted mb-3" />
            <h4>No Immunization Records Found</h4>
            <p className="text-muted">
              You don't have any immunization records at this time.
            </p>
          </Card.Body>
        </Card>
      )}
      
      <style jsx>{`
        .immunization-year-card {
          border-radius: 10px;
          overflow: hidden;
        }
        
        .bg-gradient-light {
          background: linear-gradient(to right, #f8f9fa, #e9ecef);
        }
        
        .immunization-accordion .accordion-button {
          padding: 1rem;
          background-color: white;
          box-shadow: none;
        }
        
        .immunization-accordion .accordion-button:not(.collapsed) {
          color: #4e73df;
          background-color: rgba(78, 115, 223, 0.1);
          font-weight: bold;
        }
        
        .immunization-accordion .accordion-button:focus {
          border-color: #bac8f3;
          box-shadow: 0 0 0 0.25rem rgba(78, 115, 223, 0.25);
        }
        
        .immunization-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background-color: rgba(78, 115, 223, 0.1);
        }
        
        .immunization-icon {
          color: #4e73df;
          font-size: 1.2rem;
        }
        
        .detail-item {
          display: flex;
          margin-bottom: 8px;
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
        
        /* For extra small screens */
        @media (max-width: 576px) {
          .immunization-header h5 {
            font-size: 1rem;
          }
          
          .detail-icon {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </Container>
  );
};

export default Immunization;