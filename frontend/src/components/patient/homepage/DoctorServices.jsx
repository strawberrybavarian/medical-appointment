import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { CalendarCheckFill, ArrowRight } from "react-bootstrap-icons";
import AppointmentModal from './AppointmentModal';
import { ip } from "../../../ContentExport";
import "./DoctorServices.css";

function DoctorServices({ pid, did }) {
    const [services, setServices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Fetch the list of services from the backend
        axios.get(`${ip.address}/api/admin/getall/services`)
            .then((res) => {
                setServices(res.data || []);
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleShowModal = (service) => {
        setSelectedService(service);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    return (
        <div className="dsrv-section">
            <Container>
                <div className="dsrv-header">
                    <h2 className="dsrv-title">Our Medical Services</h2>
                    <p className="dsrv-subtitle">Choose from our wide variety of healthcare services</p>
                </div>

                {loading ? (
                    <div className="dsrv-loading">
                        <div className="dsrv-loading-pulse"></div>
                        <p>Loading available services...</p>
                    </div>
                ) : (
                    <Row className="dsrv-grid">
                        {services.length > 0 ? (
                            services.map((service, index) => (
                                <Col key={index} lg={3} md={4} sm={6} xs={12} className="mb-4">
                                    <div 
                                        className="dsrv-card"
                                        onClick={() => handleShowModal(service)}
                                    >
                                        <div className="dsrv-card-inner">
                                            <div className="dsrv-image-container">
                                                <img
                                                    src={`${ip.address}/${service.imageUrl}`}
                                                    alt={service.name}
                                                    className="dsrv-image"
                                                />
                                                <div className="dsrv-overlay">
                                                    <CalendarCheckFill className="dsrv-icon" />
                                                    <span className="dsrv-action">Schedule Now</span>
                                                </div>
                                            </div>
                                            <div className="dsrv-content">
                                                <h3 className="dsrv-name">{service.name}</h3>
                                                {service.description && (
                                                    <p className="dsrv-description">
                                                        {service.description.length > 90 
                                                            ? `${service.description.substring(0, 90)}...` 
                                                            : service.description
                                                        }
                                                    </p>
                                                )}
                                                <div className="dsrv-button">
                                                    Book Appointment <ArrowRight className="dsrv-arrow" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            ))
                        ) : (
                            <Col xs={12}>
                                <div className="dsrv-empty">
                                    <p>No services available at the moment</p>
                                    <span>Please check back later</span>
                                </div>
                            </Col>
                        )}
                    </Row>
                )}
            </Container>

            {/* Appointment Modal */}
            {selectedService && (
                <AppointmentModal
                    show={showModal}
                    handleClose={handleCloseModal}
                    serviceId={selectedService._id || selectedService.id}
                    pid={pid}
                />
            )}
        </div>
    );
}

export default DoctorServices;