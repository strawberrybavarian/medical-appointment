import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import './DoctorSpecialty.css';
import OBGYNE from './images/ObstetricsAndGynecology.png';
import PEDIATRICS from './images/Pedia.png';
import { Container, Button } from "react-bootstrap";
import AppointmentModal from './AppointmentModal'; // Import the new component
import { ip } from "../../../ContentExport";
function DoctorServices({ pid, did }) {
    const [services, setServices] = useState([]);
    const [showModal, setShowModal] = useState(false); // State for modal visibility
    const [selectedService, setSelectedService] = useState(null); // State for the selected service

    useEffect(() => {
        // Fetch the list of services from the backend
        axios.get(`${ip.address}/api/admin/getall/services`)
            .then((res) => {

                setServices(res.data || []); // Ensure services is always an array
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const serviceImages = {
        "Obstetrics": OBGYNE,
        "Pediatrics": PEDIATRICS,
        "Gynecology": OBGYNE,
    };

    const getImage = (serviceName) => {
        return serviceImages[serviceName] || null;
    };

    const handleShowModal = (service) => {
        setSelectedService(service); // Store the selected service
        setShowModal(true); // Show the modal
    };

    const handleCloseModal = () => setShowModal(false);

    return (
        <>
            <Container>
                <h4 style={{ marginLeft: '15px', marginTop: '2rem' }}>List of Services</h4>
            </Container>
            <Container className="ds-container">
                {services.length > 0 ? (
                    services.map((service, index) => (
                        <div
                            key={index}
                            className="specialtyButtonStyle"
                            onClick={() => handleShowModal(service)} // Open modal on service click
                        >
                            <div className="ds-imgcontainer">
                                <img src={`${ip.address}/${service.imageUrl}`} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                                <p style={{ fontWeight: '600', textAlign: 'center' }}>{service.name}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div>No services available</div>
                )}
            </Container>

            {/* Appointment Modal */}
            {selectedService && (
                <AppointmentModal
                    show={showModal}
                    handleClose={handleCloseModal}
                    serviceId={selectedService._id || selectedService.id} // Pass the service ID to the modal
                    pid={pid} // Pass patient ID if needed
                />
            )}
        </>
    );
}

export default DoctorServices;
