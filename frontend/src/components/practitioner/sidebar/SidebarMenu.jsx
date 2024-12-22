import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './SidebarMenu.css';
import { CDBSidebar, CDBSidebarContent, CDBSidebarHeader, CDBSidebarMenu, CDBSidebarMenuItem, CDBSidebarFooter, CDBBadge } from 'cdbreact';
import { ip } from '../../../ContentExport';
import LogoutModal from './LogoutModal'; // Import the LogoutModal component

import { useUser } from '../../UserContext';
const SidebarMenu = (props) => {
    const {user, setUser} = useUser();
    const [isLeftIcon, setIsLeftIcon] = React.useState(true);
    const [showLogoutModal, setShowLogoutModal] = React.useState(false);
    const navigate = useNavigate();

    const toggleIcon = () => {
        setIsLeftIcon(!isLeftIcon);
    };

    const handleLogout = () => {
        setShowLogoutModal(true); // Show the logout confirmation modal
    };

    const confirmLogout = async () => {
        try {
          await axios.post(`${ip.address}/api/logout`, {}, { withCredentials: true });
          setUser(null); // Clear patient context
          navigate('/medapp/login'); // Redirect to login page
        } catch (error) {
          console.error('Error logging out:', error);
          alert('Failed to log out. Please try again.');
        }
      };



    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    useEffect(() => {
        const handleBeforeUnload = () => {
            // Attempt to set the doctor offline when the tab is closed or refreshed
            navigator.sendBeacon(`${ip.address}/api/doctor/api/${props.did}/logout`);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [props.did]);

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
                            <CDBSidebarMenuItem className="font-style-poppins sbm-item" icon="user" onClick={() => navigate(`/account`, { state: { did: props.did } })}> Account Information </CDBSidebarMenuItem>
                            <CDBSidebarMenuItem className="font-style-poppins sbm-item" icon="arrow-left" onClick={handleLogout}> Log Out </CDBSidebarMenuItem> 
                        </CDBSidebarMenu>
                    </CDBSidebarContent>
                    <CDBSidebarFooter className="d-flex msn-footer justify-content-center" />
                </CDBSidebar>
            </div>

            <LogoutModal 
                show={showLogoutModal} 
                onCancel={cancelLogout} 
                onConfirm={confirmLogout} 
            />
        </>
    );
};

export default SidebarMenu;
