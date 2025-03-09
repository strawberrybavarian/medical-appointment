import React, { useState } from 'react';
import {
  Card,
  Collapse,
  Button,
  Container,
  Table,
  Image,
  Row,
  Col,
  Modal,
  Badge,
  Pagination
} from 'react-bootstrap';
import moment from 'moment';
import { ip } from '../../../../ContentExport';
import { 
  FaCalendarAlt, 
  FaUserMd, 
  FaPills, 
  FaClock,
  FaFileImage,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaTimes
} from 'react-icons/fa';

const Prescription = ({ prescriptions }) => {
  const [openRecords, setOpenRecords] = useState({}); 
  const [showModal, setShowModal] = useState(false); 
  const [selectedImage, setSelectedImage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const prescriptionsPerPage = 5;
  
  // Filter prescriptions that have medications or images and sort by date descending
  const sortedPrescriptions = [...prescriptions]
    .filter(
      (prescription) =>
        prescription.prescription &&
        (prescription.prescription.medications.length > 0 ||
          (prescription.prescription.prescriptionImages &&
            prescription.prescription.prescriptionImages.length > 0))
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const indexOfLastPrescription = currentPage * prescriptionsPerPage;
  const indexOfFirstPrescription = indexOfLastPrescription - prescriptionsPerPage;
  const currentPrescriptions = sortedPrescriptions.slice(indexOfFirstPrescription, indexOfLastPrescription);
  const totalPages = Math.ceil(sortedPrescriptions.length / prescriptionsPerPage);

  // Toggle collapse for each record
  const toggleCollapse = (id) => {
    setOpenRecords((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  // Handle image click to show modal
  const handleImageClick = (imagePath) => {
    setSelectedImage(`${ip.address}/${imagePath}`);
    setShowModal(true);
  };

  // Close the modal
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedImage('');
  };
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Get medication type badge
  const getMedicationTypeBadge = (type) => {
    switch(type?.toLowerCase()) {
      case 'tablet':
        return <Badge bg="primary">Tablet</Badge>;
      case 'capsule':
        return <Badge bg="info">Capsule</Badge>;
      case 'syrup':
        return <Badge bg="success">Syrup</Badge>;
      case 'injection':
        return <Badge bg="warning" text="dark">Injection</Badge>;
      case 'ointment':
        return <Badge bg="secondary">Ointment</Badge>;
      default:
        return <Badge bg="light" text="dark">{type}</Badge>;
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <FaPills className="text-primary me-2" />
          Prescriptions
        </h2>
        <Badge bg="primary" pill className="fs-6">
          {sortedPrescriptions.length} Records
        </Badge>
      </div>
      
      {currentPrescriptions.map((prescription) => {
        const isOpen = openRecords[prescription._id] || false;
        const doctor = `Dr. ${prescription.doctor.dr_firstName} ${prescription.doctor.dr_lastName}`;
        const prescriptionDate = moment(prescription.date || prescription.createdAt).format('MMMM DD, YYYY');
        
        return (
          <Card key={prescription._id} className="mb-4 shadow-sm border-0 prescription-card">
            <Card.Header className="bg-white py-3">
              <Row className="align-items-center">
                <Col xs={12} md={6} className="mb-2 mb-md-0">
                  <div className="d-flex align-items-center">
                    <div className="date-badge me-3 text-center">
                      <div className="date-month">{moment(prescription.createdAt).format("MMM")}</div>
                      <div className="date-day">{moment(prescription.createdAt).format("DD")}</div>
                      <div className="date-year">{moment(prescription.createdAt).format("YYYY")}</div>
                    </div>
                    <div>
                      <h5 className="mb-1 fw-bold text-primary">
                        <FaUserMd className="me-2" />
                        {doctor}
                      </h5>
                      <div className="text-muted small">
                        <FaCalendarAlt className="me-1" /> {prescriptionDate}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="d-flex justify-content-md-end align-items-center mt-3 mt-md-0">
                    <div className="me-3">
                      {prescription.prescription && prescription.prescription.medications && (
                        <Badge bg="success" className="py-2 px-3 me-2">
                          <FaPills className="me-1" /> 
                          {prescription.prescription.medications.length} Medications
                        </Badge>
                      )}
                      {prescription.prescription && prescription.prescription.prescriptionImages && (
                        <Badge bg="info" className="py-2 px-3">
                          <FaFileImage className="me-1" />
                          {prescription.prescription.prescriptionImages.length} Images
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant={isOpen ? "outline-primary" : "outline-secondary"}
                      className="d-flex align-items-center"
                      onClick={() => toggleCollapse(prescription._id)}
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
                  </div>
                </Col>
              </Row>
            </Card.Header>

            <Collapse in={isOpen}>
              <div>
                <Card.Body className="bg-light pt-4">
                  {/* Medications Section */}
                  {prescription.prescription && 
                    prescription.prescription.medications.length > 0 && (
                    <div className="mb-4">
                      <h5 className="mb-3 border-bottom pb-2 d-flex align-items-center">
                        <FaPills className="text-primary me-2" /> Medications
                      </h5>
                      <div className="table-responsive medication-table">
                        <table className="table table-hover bg-white rounded">
                          <thead className="table-light">
                            <tr>
                              <th>Medication</th>
                              <th>Type</th>
                              <th>Dosage</th>
                              <th>Frequency</th>
                              <th>Duration</th>
                              <th>Instructions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prescription.prescription.medications.map((medication, idx) => (
                              <tr key={idx}>
                                <td className="fw-bold">{medication.name}</td>
                                <td>{getMedicationTypeBadge(medication.type)}</td>
                                <td>{medication.dosage}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <FaClock className="text-muted me-2" />
                                    {medication.frequency}
                                  </div>
                                </td>
                                <td>{medication.duration}</td>
                                <td className="text-wrap">{medication.instruction}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Prescription Images Section */}
                  {prescription.prescription && 
                    prescription.prescription.prescriptionImages && 
                    prescription.prescription.prescriptionImages.length > 0 && (
                    <div className="mt-4">
                      <h5 className="mb-3 border-bottom pb-2 d-flex align-items-center">
                        <FaFileImage className="text-info me-2" /> Prescription Images
                      </h5>
                      <Row className="g-3">
                        {prescription.prescription.prescriptionImages.map((imagePath, idx) => (
                          <Col key={idx} xs={6} md={4} lg={3}>
                            <div 
                              className="prescription-image-card" 
                              onClick={() => handleImageClick(imagePath)}
                            >
                              <div className="prescription-image-wrapper">
                                <Image 
                                  src={`${ip.address}/${imagePath}`} 
                                  alt={`Prescription ${idx + 1}`}
                                  className="prescription-image"
                                />
                                <div className="prescription-image-overlay">
                                  <div className="prescription-image-overlay-content">
                                    <FaFileImage size={24} />
                                    <span>View</span>
                                  </div>
                                </div>
                              </div>
                              <div className="prescription-image-caption">
                                Image {idx + 1}
                              </div>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </Card.Body>
              </div>
            </Collapse>
          </Card>
        );
      })}
      
      {/* Empty state */}
      {sortedPrescriptions.length === 0 && (
        <Card className="text-center p-5 shadow-sm">
          <Card.Body>
            <FaPills size={50} className="text-muted mb-3" />
            <h4>No Prescriptions Found</h4>
            <p className="text-muted">
              You don't have any prescriptions with medications or images at this time.
            </p>
          </Card.Body>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
            <Pagination.Prev 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1} 
            />
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
                if (i === 4) pageNum = totalPages;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              if ((i === 3 && pageNum !== 4 && totalPages > 5) || 
                  (i === 1 && pageNum !== 2 && currentPage > 3)) {
                return <Pagination.Ellipsis key={`ellipsis-${i}`} />;
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

      {/* Image Modal */}
      <Modal
        show={showModal}
        onHide={handleModalClose}
        centered
        size="lg"
        className="prescription-image-modal"
      >
        <Modal.Header className="border-0 pb-0">
          <Button 
            variant="link" 
            onClick={handleModalClose} 
            className="btn-close-custom"
            aria-label="Close"
          >
            <FaTimes />
          </Button>
        </Modal.Header>
        <Modal.Body className="text-center p-0">
          <Image src={selectedImage} alt="Prescription" fluid className="prescription-modal-image" />
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 justify-content-center">
          <Button 
            variant="primary" 
            href={selectedImage} 
            download 
            className="d-flex align-items-center"
          >
            <FaDownload className="me-2" /> Download Image
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .prescription-card {
          transition: all 0.3s ease;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .prescription-card:hover {
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
        
        .medication-table {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .prescription-image-card {
          cursor: pointer;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          background: white;
        }
        
        .prescription-image-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        }
        
        .prescription-image-wrapper {
          position: relative;
          overflow: hidden;
          padding-bottom: 75%; /* 4:3 aspect ratio */
          height: 0;
        }
        
        .prescription-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .prescription-image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s ease;
        }
        
        .prescription-image-card:hover .prescription-image-overlay {
          opacity: 1;
        }
        
        .prescription-image-card:hover .prescription-image {
          transform: scale(1.05);
        }
        
        .prescription-image-overlay-content {
          text-align: center;
        }
        
        .prescription-image-overlay-content span {
          display: block;
          margin-top: 8px;
        }
        
        .prescription-image-caption {
          padding: 8px;
          text-align: center;
          font-size: 14px;
          color: #495057;
        }
        
        .prescription-modal-image {
          max-height: 80vh;
          object-fit: contain;
        }
        
        .btn-close-custom {
          position: absolute;
          right: 15px;
          top: 15px;
          color: #495057;
          font-size: 20px;
          z-index: 1;
          padding: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          width: 36px;
          height: 36px;
        }
        
        .btn-close-custom:hover {
          background-color: rgba(255, 255, 255, 0.8);
          color: #dc3545;
        }
      `}</style>
    </Container>
  );
};

export default Prescription;