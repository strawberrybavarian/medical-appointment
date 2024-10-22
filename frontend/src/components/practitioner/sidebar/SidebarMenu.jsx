import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './SidebarMenu.css';
import { CDBSidebar, CDBSidebarContent, CDBSidebarHeader, CDBSidebarMenu, CDBSidebarMenuItem, CDBSidebarFooter, CDBBadge } from 'cdbreact';
import { ip } from '../../../ContentExport';
import LogoutModal from './LogoutModal'; // Import the LogoutModal component

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
        axios.put(`${ip.address}/api/doctor/api/${props.did}/logout`)
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

    return (
        <>
            <div style={{ height: '100vh' }}>
                <CDBSidebar className='sbm-doctor'>
                    <CDBSidebarHeader prefix={<i className={`fa ${isLeftIcon ? "fa-angle-left" : "fa-angle-right"}`} onClick={toggleIcon} />} />
                    <CDBSidebarContent>
                        <CDBSidebarMenu>
                            <CDBSidebarMenuItem
                                className="font-style-poppins sbm-item"
                                suffix={<CDBBadge size="small" borderType="pill">10+</CDBBadge>}
                                icon="th-large"
                                onClick={() => navigate("/dashboard", { state: { did: props.did } })}
                            >
                                Dashboard
                            </CDBSidebarMenuItem>
                            <CDBSidebarMenuItem 
                                className="font-style-poppins sbm-item" 
                                onClick={() => navigate(`/mainappointment?outerTab=${props.outerTab || 'mypatients'}`, { state: { did: props.did } })}
                                icon="calendar-alt"> 
                                My Patient 
                            </CDBSidebarMenuItem>
                            <CDBSidebarMenuItem className="font-style-poppins sbm-item" icon="bell"> Notification </CDBSidebarMenuItem>
                            <CDBSidebarMenuItem className="font-style-poppins sbm-item" icon="user" onClick={() => navigate(`/account`, { state: { did: props.did } })}> Account Information </CDBSidebarMenuItem>
                            <CDBSidebarMenuItem className="font-style-poppins sbm-item" icon="arrow-left" onClick={handleLogout}> Log Out </CDBSidebarMenuItem> 
                        </CDBSidebarMenu>
                    </CDBSidebarContent>
                    <CDBSidebarFooter className="d-flex msn-footer justify-content-center" />
                </CDBSidebar>
            </div>

            {/* Use the LogoutModal component */}
            <LogoutModal 
                show={showLogoutModal} 
                onCancel={cancelLogout} 
                onConfirm={confirmLogout} 
            />
        </>
    );
};

export default SidebarMenu;
