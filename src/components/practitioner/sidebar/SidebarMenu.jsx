import axios from 'axios';
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import './SidebarMenu.css';
import { CDBSidebar, CDBSidebarContent, CDBSidebarHeader, CDBSidebarMenu, CDBSidebarMenuItem, CDBSidebarFooter, CDBBadge } from 'cdbreact';
import { Modal, Button } from 'react-bootstrap';

const SidebarMenu = (props) => {
    const [isLeftIcon, setIsLeftIcon] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation(); // Get the current location to check query params

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

    // Navigate to the dashboard without outerTab
    const navigateToDashboard = () => {
        navigate("/dashboard", { state: { did: props.did } });
    };

    // Navigate to appointments and preserve the outerTab
    const navigateToAppointment = () => {
        const outerTab = props.outerTab || 'pending'; // Default to 'pending' if outerTab is missing
        navigate(`/mainappointment?outerTab=${outerTab}`, { state: { did: props.did } });
    };

    const navigateToMedicalRecord = () => {
        navigate("/dashboard", { state: { did: props.did } });
    };

    

    return (
        <>
            <div style={{ height: '100vh' }}>
                <CDBSidebar>
                    <CDBSidebarHeader prefix={<i className={`fa ${isLeftIcon ? "fa-angle-left" : "fa-angle-right"}`} onClick={toggleIcon} />}>
                    </CDBSidebarHeader>

                    <CDBSidebarContent>
                        <CDBSidebarMenu>
                            {/* Dashboard link without outerTab */}
                            <CDBSidebarMenuItem
                                className="font-style-poppins"
                                suffix={<CDBBadge size="small" borderType="pill">10+</CDBBadge>}
                                icon="th-large"
                                onClick={navigateToDashboard}
                            >
                                Dashboard
                            </CDBSidebarMenuItem>

                            {/* Navigate to Appointments and preserve the outerTab param */}
                            <CDBSidebarMenuItem 
                                className="font-style-poppins" 
                                onClick={navigateToAppointment}
                                icon="calendar-alt"> 
                                Appointment 
                            </CDBSidebarMenuItem>

                            <CDBSidebarMenuItem className="font-style-poppins" icon="bell"> Notification </CDBSidebarMenuItem>
                            <CDBSidebarMenuItem className="font-style-poppins" icon="book" iconType="solid" onClick={() => navigate(`/medicalrecord`, { state: { did: props.did } })}> Medical Records </CDBSidebarMenuItem>
                            <CDBSidebarMenuItem className="font-style-poppins" icon="user" iconType="solid" onClick={() => navigate(`/account`, { state: { did: props.did } })}> Account Information </CDBSidebarMenuItem>
                            <CDBSidebarMenuItem className="font-style-poppins" icon="arrow-left" iconType="solid" onClick={handleLogout}> Log Out </CDBSidebarMenuItem>
                        </CDBSidebarMenu>
                    </CDBSidebarContent>

                    <CDBSidebarFooter className="d-flex msn-footer justify-content-center">
                        {/*  */}
                    </CDBSidebarFooter>
                </CDBSidebar>
            </div>

            {/* Logout Confirmation Modal */}
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
