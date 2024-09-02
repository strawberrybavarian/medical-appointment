import axios from 'axios';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './SidebarMenu.css';
import { CDBSidebar, CDBSidebarContent, CDBSidebarHeader, CDBSidebarMenu, CDBSidebarMenuItem, CDBSidebarFooter, CDBIcon, CDBBadge } from 'cdbreact';
import { Modal, Button, Container } from 'react-bootstrap';
import { image } from '../../../ContentExport'; // Ensure you have an appropriate image path or logo

const SidebarMenu = (props) => {
    const [isLeftIcon, setIsLeftIcon] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    const toggleIcon = () => {
        setIsLeftIcon(!isLeftIcon);
    };

    const handleLogout = () => {
        setShowLogoutModal(true); // Show the logout confirmation modal
    };

    const confirmLogout = () => {
        // Call the backend to set the doctor to offline and then navigate
        axios.put(`http://localhost:8000/doctor/api/${props.did}/logout`)
            .then(res => {
                console.log('Doctor status updated to Offline');
                setShowLogoutModal(false);
                navigate('/'); // Navigate to the home page after updating the status
            })
            .catch(err => {
                console.error('Error updating doctor status', err);
                setShowLogoutModal(false);
                navigate('/'); // Navigate even if there was an error, but you might want to handle this differently
            });
    };

    const cancelLogout = () => {
        setShowLogoutModal(false); // Close the modal without logging out
    };

    const defaultImage = "images/NoProfile.jpg";

    return (
        <>
            <CDBSidebar>
                <CDBSidebarHeader prefix={<i className={`fa ${isLeftIcon ? "fa-angle-left" : "fa-angle-right"}`} onClick={toggleIcon} />}>
                    <div className={`sidebar-btn-wrapper ${isLeftIcon ? 'logo-expanded' : 'logo-collapsed'} d-flex justify-content-start`}>
                        <img className="pnb-logoimage" src={image.logo} alt="Logo" />
                        <Container className="msn-container pt-3">
                            <p>Molino <br /> Polyclinic</p>
                        </Container>
                    </div>
                </CDBSidebarHeader>

                <CDBSidebarContent>
                    <CDBSidebarMenu>
                        <Link to={`/dashboard/${props.did}`}>
                            <CDBSidebarMenuItem suffix={<CDBBadge size="small" borderType="pill">10+</CDBBadge>} icon="th-large"> Dashboard </CDBSidebarMenuItem>
                        </Link>
                        <Link to={`/mainappointment/${props.did}`}>
                            <CDBSidebarMenuItem icon="calendar-alt"> Appointment </CDBSidebarMenuItem>
                        </Link>
                        <CDBSidebarMenuItem icon="bell"> Notification </CDBSidebarMenuItem>
                        <Link to={`/medicalrecord/${props.did}`}>
                            <CDBSidebarMenuItem icon="book" iconType="solid"> Medical Records </CDBSidebarMenuItem>
                        </Link>
                        <Link to={`/account/${props.did}`}>
                            <CDBSidebarMenuItem icon="user" iconType="solid"> Account Information </CDBSidebarMenuItem>
                        </Link>
                        <CDBSidebarMenuItem icon="arrow-left" iconType="solid" onClick={handleLogout}> Log Out </CDBSidebarMenuItem>
                    </CDBSidebarMenu>
                </CDBSidebarContent>

                <CDBSidebarFooter className="d-flex msn-footer justify-content-center">
                    <div className={`sidebar-btn-wrapper ${isLeftIcon ? 'logo-collapsed' : 'logo-expanded'} d-flex`}>
                        <img
                            src={props.doctor_image ? `http://localhost:8000/${props.doctor_image}` : defaultImage}
                            alt="Doctor"
                            style={{ width: "40px", height: "40px", borderRadius: "100%", objectFit: 'cover', textAlign: 'center' }}
                        />

                        {isLeftIcon && (
                            <Container className="msn-container pt-3">
                                <span className="headercustom">Hello! Dr. {props.doctor_name}</span>
                            </Container>
                        )}
                    </div>
                </CDBSidebarFooter>
            </CDBSidebar>

            <Modal show={showLogoutModal} onHide={cancelLogout}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Logout</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to log out?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelLogout}>
                        No
                    </Button>
                    <Button variant="primary" onClick={confirmLogout}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SidebarMenu;
