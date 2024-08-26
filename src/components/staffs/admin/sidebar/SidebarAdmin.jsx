import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CDBSidebar, CDBSidebarContent, CDBSidebarHeader, CDBSidebarMenu, CDBSidebarMenuItem, CDBSidebarFooter, CDBBadge } from 'cdbreact';
import { Modal, Button } from 'react-bootstrap';

import './SidebarAdmin.css';

const SidebarAdmin = (props) => {
  const [isLeftIcon, setIsLeftIcon] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleIcon = () => {
    setIsLeftIcon(!isLeftIcon);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  return (
    <>
      <div style={{ height: '100vh' }}>
        <CDBSidebar className="">
          <CDBSidebarHeader prefix={<i className={`fa ${isLeftIcon ? "fa-angle-left" : "fa-angle-right"}`} onClick={toggleIcon} />}>
            Admin Panel
          </CDBSidebarHeader>

          <CDBSidebarContent className="p-0">
            <CDBSidebarMenu>
              <Link to={`/admin/dashboard/${props.aid}`}>
                <CDBSidebarMenuItem icon="th-large"> Dashboard </CDBSidebarMenuItem>
              </Link>

              <Link to={`/mainappointment/${props.did}`}>
                <CDBSidebarMenuItem icon="calendar-alt"> Appointments </CDBSidebarMenuItem>
              </Link>

              {/* Conditionally Render Children */}
          
            <CDBSidebarMenuItem 
                icon="th" 
                onClick={toggleSubMenu}
            >

                <div style={{marginTop: '0.1rem'}}>
                    Management <i style={{paddingLeft:'65px'}}className={`fa ${isSubMenuOpen ? "fa-angle-up" : "fa-angle-down"}`} ></i>
                </div>
  
                </CDBSidebarMenuItem>
           
                

                <div style={{ display: isSubMenuOpen ? 'block' : 'none' }}>
                    <Link to="#">
                        <CDBSidebarMenuItem > 
                            <div style={{marginTop: '0.1rem', marginLeft: '30px'}}>
                                    Account 
                            </div> 
                        </CDBSidebarMenuItem>
                    </Link>
                    <Link to="#">
                        <CDBSidebarMenuItem > 
                            <div style={{marginTop: '0.1rem', marginLeft: '30px'}}>
                                    Account 
                            </div> 
                        </CDBSidebarMenuItem>
                    </Link>
                    <Link to="#">
                        <CDBSidebarMenuItem > 
                            <div style={{marginTop: '0.1rem', marginLeft: '30px'}}>
                                    Account 
                            </div> 
                        </CDBSidebarMenuItem>
                    </Link>
                </div>


              <Link to={`/medicalrecord/${props.did}`}>
                <CDBSidebarMenuItem icon="book"> Medical Records </CDBSidebarMenuItem>
              </Link>

              <Link to={`/account/${props.did}`}>
                <CDBSidebarMenuItem icon="user"> Account Management </CDBSidebarMenuItem>
              </Link>

              <CDBSidebarMenuItem icon="arrow-left" onClick={handleLogout}> Log Out </CDBSidebarMenuItem>
            </CDBSidebarMenu>
          </CDBSidebarContent>

          <CDBSidebarFooter className="d-flex msn-footer justify-content-center">
            {/* Footer Content */}
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

export default SidebarAdmin;
