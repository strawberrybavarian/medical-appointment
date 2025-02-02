import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CDBSidebar, 
  CDBSidebarContent, 
  CDBSidebarHeader, 
  CDBSidebarMenu, 
  CDBSidebarMenuItem, 
  CDBSidebarFooter 
} from 'cdbreact';
import { Modal, Button } from 'react-bootstrap';
import './SidebarAdmin.css';

const SidebarAdmin = ({ userId, userName, role }) => {
  const [isLeftIcon, setIsLeftIcon] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isDashboardSubMenuOpen, setIsDashboardSubMenuOpen] = useState(false);

  const navigate = useNavigate();

  const toggleIcon = () => setIsLeftIcon(!isLeftIcon);

  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    navigate('/', { state: { message: 'Logged out successfully' } });
  };

  const cancelLogout = () => setShowLogoutModal(false);

  const toggleSubMenu = () => setIsSubMenuOpen(!isSubMenuOpen);

  const toggleDashboardSubMenu = () => setIsDashboardSubMenuOpen(!isDashboardSubMenuOpen);

  const navigateWithState = (path) => {
    navigate(path, { state: { userId, userName, role } });
  };

  return (
    <>
      <div style={{ height: '100vh' }}>
        <CDBSidebar className="sa-sidebar">
          <CDBSidebarHeader 
            prefix={<i className={`fa ${isLeftIcon ? "fa-angle-left" : "fa-angle-right"}`} onClick={toggleIcon} />}
          >
            Admin Panel
          </CDBSidebarHeader>

          <CDBSidebarContent className="p-0">
            <CDBSidebarMenu>
              <CDBSidebarMenuItem 
                icon="th-large" 
                onClick={toggleDashboardSubMenu} 
                className="font-style-poppins"
              >
                <div className="d-flex align-items-center justify-content-between" style={{ marginTop: '0.1rem' }}>
                  Dashboards <i className={`p-3 fa ${isDashboardSubMenuOpen ? "fa-angle-up" : "fa-angle-down"}`}></i>
                </div>
              </CDBSidebarMenuItem>

              <div style={{ display: isDashboardSubMenuOpen ? 'block' : 'none' }}>
                <div
                  onClick={() => navigateWithState('/admin/dashboard/patient')}
                  style={{ cursor: 'pointer' }}
                >
                  <CDBSidebarMenuItem className="font-style-poppins">
                    <div style={{ marginTop: '0.1rem', marginLeft: '30px' }}>Patient Dashboard</div>
                  </CDBSidebarMenuItem>
                </div>

                

                <div
                  onClick={() => navigateWithState('/admin/dashboard/doctor')}
                  style={{ cursor: 'pointer' }}
                >
                  <CDBSidebarMenuItem className="font-style-poppins">
                    <div style={{ marginTop: '0.1rem', marginLeft: '30px' }}>Doctor Dashboard</div>
                  </CDBSidebarMenuItem>
                </div>
              </div>

              <div
                  onClick={() => navigateWithState('/admin/news-management')}
                  style={{ cursor: 'pointer' }}
                >
                    <CDBSidebarMenuItem icon="newspaper" className="font-style-poppins">
                      News Management
                    </CDBSidebarMenuItem>
              </div>

              <div
                onClick={() => navigateWithState('/admin/appointments')}
                style={{ cursor: 'pointer' }}
              >
                <CDBSidebarMenuItem icon="calendar-alt" className="font-style-poppins">
                  Appointments
                </CDBSidebarMenuItem>
              </div>

              

              <CDBSidebarMenuItem 
                icon="th" 
                onClick={toggleSubMenu} 
                className="font-style-poppins"
              >
                <div className="d-flex align-items-center justify-content-between" style={{ marginTop: '0.1rem' }}>
                  Account Management <i className={`p-3 fa ${isSubMenuOpen ? "fa-angle-up" : "fa-angle-down"}`}></i>
                </div>
              </CDBSidebarMenuItem>

              <div style={{ display: isSubMenuOpen ? 'block' : 'none' }}>
                <div
                  onClick={() => navigateWithState('/admin/account/patient')}
                  style={{ cursor: 'pointer' }}
                >
                  <CDBSidebarMenuItem className="font-style-poppins">
                    <div style={{ marginTop: '0.1rem', marginLeft: '30px' }}>Patient</div>
                  </CDBSidebarMenuItem>
                </div>

                <div
                  onClick={() => navigateWithState('/admin/account/doctor')}
                  style={{ cursor: 'pointer' }}
                >
                  <CDBSidebarMenuItem className="font-style-poppins">
                    <div style={{ marginTop: '0.1rem', marginLeft: '30px' }}>Doctor</div>
                  </CDBSidebarMenuItem>
                </div>

                <div
                  onClick={() => navigateWithState('/admin/account/staffs')}
                  style={{ cursor: 'pointer' }}
                >
                  <CDBSidebarMenuItem className="font-style-poppins">
                    <div style={{ marginTop: '0.1rem', marginLeft: '30px' }}>Staffs</div>
                  </CDBSidebarMenuItem>
                </div>
              </div>

              <div
                onClick={() => navigateWithState('/admin/sas')}
                style={{ cursor: 'pointer' }}
              >
                <CDBSidebarMenuItem icon="book" className="font-style-poppins">
                  Specialty and Services
                </CDBSidebarMenuItem>
              </div>

              
              <div
                onClick={() => navigateWithState('/admin/account')}
                style={{ cursor: 'pointer' }}
              >
                <CDBSidebarMenuItem icon="user" className="font-style-poppins">
                  Account
                </CDBSidebarMenuItem>
              </div>

              {/* <CDBSidebarMenu>
  {/* Existing menu items */}
  
  {/* Add News Management Menu Item */}
               
                
                {/* Existing menu items */}
              {/* </CDBSidebarMenu> */} 

              <CDBSidebarMenuItem 
                icon="arrow-left" 
                onClick={handleLogout} 
                className="font-style-poppins"
              >
                Log Out
              </CDBSidebarMenuItem>
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
