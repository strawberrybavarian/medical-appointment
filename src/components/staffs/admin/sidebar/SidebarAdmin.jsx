import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CDBSidebar, CDBSidebarContent, CDBSidebarHeader, CDBSidebarMenu, CDBSidebarMenuItem, CDBSidebarFooter } from 'cdbreact';
import { Modal, Button } from 'react-bootstrap';

import './SidebarAdmin.css';

const SidebarAdmin = (props) => {
  const [isLeftIcon, setIsLeftIcon] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isDashboardSubMenuOpen, setIsDashboardSubMenuOpen] = useState(false);
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

  const toggleDashboardSubMenu = () => {
    setIsDashboardSubMenuOpen(!isDashboardSubMenuOpen);
  };

  return (
    <>
      <div style={{ height: '100vh' }}>
        <CDBSidebar className="sa-sidebar">
          <CDBSidebarHeader prefix={<i className={`fa ${isLeftIcon ? "fa-angle-left" : "fa-angle-right"}`} onClick={toggleIcon} />}>
            Admin Panel
          </CDBSidebarHeader>

          <CDBSidebarContent className="p-0">
            <CDBSidebarMenu>

              <CDBSidebarMenuItem icon="th-large" onClick={toggleDashboardSubMenu} className="font-style-poppins ">
                <div  className="d-flex  align-items-center justify-content-between " style={{ marginTop: '0.1rem' }}>
                  Dashboards <i className={`p-3 fa ${isDashboardSubMenuOpen ? "fa-angle-up" : "fa-angle-down"}`}></i>
                </div>
              </CDBSidebarMenuItem>

              <div style={{ display: isDashboardSubMenuOpen ? 'block' : 'none' }}>
                <Link to={`/admin/dashboard/patient/${props.aid}`}>
                  <CDBSidebarMenuItem className="font-style-poppins">
                    <div style={{ marginTop: '0.1rem', marginLeft: '30px' }}>Patient Dashboard</div>
                  </CDBSidebarMenuItem>
                </Link>
                <Link to={`/admin/dashboard/doctor/${props.aid}`}>
                  <CDBSidebarMenuItem className="font-style-poppins">
                    <div style={{ marginTop: '0.1rem', marginLeft: '30px' }}>Doctor Dashboard</div>
                  </CDBSidebarMenuItem>
                </Link>
              </div>

              <Link to={`/admin/appointments/${props.aid}`}>
                <CDBSidebarMenuItem icon="calendar-alt" className="font-style-poppins"> Appointments </CDBSidebarMenuItem>
              </Link>

              <CDBSidebarMenuItem icon="th" onClick={toggleSubMenu} className="font-style-poppins">
                <div className="d-flex  align-items-center justify-content-between " style={{ marginTop: '0.1rem' }}>
                  Account Management <i  className={`p-3 fa ${isSubMenuOpen ? "fa-angle-up" : "fa-angle-down"}`}></i>
                </div>
              </CDBSidebarMenuItem>

              <div style={{ display: isSubMenuOpen ? 'block' : 'none' }}>
                <Link to={`/admin/account/patient/${props.aid}`}>
                  <CDBSidebarMenuItem className="font-style-poppins">
                    <div style={{ marginTop: '0.1rem', marginLeft: '30px' }}>Patient</div>
                  </CDBSidebarMenuItem>
                </Link>
                <Link to={`/admin/account/doctor/${props.aid}`}>
                  <CDBSidebarMenuItem className="font-style-poppins">
                    <div style={{ marginTop: '0.1rem', marginLeft: '30px' }}>Doctor</div>
                  </CDBSidebarMenuItem>
                </Link>
              </div>

              <Link to={`/medicalrecord/${props.did}`}>
                <CDBSidebarMenuItem icon="book" className="font-style-poppins"> Medical Records </CDBSidebarMenuItem>
              </Link>

              <Link to={`/account/${props.did}`}>
                <CDBSidebarMenuItem icon="user" className="font-style-poppins"> Account Management </CDBSidebarMenuItem>
              </Link>

              <CDBSidebarMenuItem icon="arrow-left" onClick={handleLogout} className="font-style-poppins"> Log Out </CDBSidebarMenuItem>
            </CDBSidebarMenu>
          </CDBSidebarContent>

          <CDBSidebarFooter className="d-flex msn-footer justify-content-center">
            {/* Footer Content */}
          </CDBSidebarFooter>
        </CDBSidebar>
      </div>

      <Modal show={showLogoutModal} onHide={cancelLogout}>
        <Modal.Header closeButton>
          <Modal.Title className="font-style-poppins">Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body className="font-style-poppins">
          Are you sure you want to log out?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelLogout} className="font-style-poppins">
            No
          </Button>
          <Button variant="primary" onClick={confirmLogout} className="font-style-poppins">
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SidebarAdmin;
