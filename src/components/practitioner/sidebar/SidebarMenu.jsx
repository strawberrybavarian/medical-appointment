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
        <div style={{ height: '100vh' }}>
            <CDBSidebar>
                <CDBSidebarHeader prefix={<i className={`fa ${isLeftIcon ? "fa-angle-left" : "fa-angle-right"}`} onClick={toggleIcon} />}>
                    
                </CDBSidebarHeader>

                <CDBSidebarContent>
                    <CDBSidebarMenu>
                        <Link to={`/dashboard/${props.did}`}>
                            <CDBSidebarMenuItem className="font-style-poppins" suffix={<CDBBadge size="small" borderType="pill">10+</CDBBadge>} icon="th-large"> Dashboard </CDBSidebarMenuItem>
                        </Link>
                        <Link to={`/mainappointment/${props.did}`}>
                            <CDBSidebarMenuItem className="font-style-poppins" icon="calendar-alt"> Appointment </CDBSidebarMenuItem>
                        </Link>
                        <CDBSidebarMenuItem className="font-style-poppins" icon="bell"> Notification </CDBSidebarMenuItem>
                        <Link to={`/medicalrecord/${props.did}`}>
                            <CDBSidebarMenuItem className="font-style-poppins" icon="book" iconType="solid"> Medical Records </CDBSidebarMenuItem>
                        </Link>
                        <Link to={`/account/${props.did}`}>
                            <CDBSidebarMenuItem className="font-style-poppins" icon="user" iconType="solid"> Account Information </CDBSidebarMenuItem>
                        </Link>
                        <CDBSidebarMenuItem className="font-style-poppins" icon="arrow-left" iconType="solid" onClick={handleLogout}> Log Out </CDBSidebarMenuItem>
                    </CDBSidebarMenu>
                </CDBSidebarContent>

                <CDBSidebarFooter className="d-flex msn-footer justify-content-center">
                    {/*  */}
                </CDBSidebarFooter>
            </CDBSidebar>
        </div>
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
