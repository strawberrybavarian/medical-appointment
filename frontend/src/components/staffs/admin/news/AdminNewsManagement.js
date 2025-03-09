// File: AdminNewsManagement.js

import React from 'react';
import { useLocation } from 'react-router-dom';

import NewsAnnouncement from '../../news/NewsAnnouncement';
import AdminNavbar from '../navbar/AdminNavbar';
import SidebarAdmin from '../sidebar/SidebarAdmin';
import { Row, Col, Container } from 'react-bootstrap';
import NewsList from './NewsList';

function AdminNewsManagement() {
  const location = useLocation();
  const { userId, userName, role } = location.state || {};

  const containerStyle = {
    display: 'flex',
    height: '100vh', // Full height of the viewport
    // overflow: 'hidden', // Prevents scrolling issues for the main layout
  };

  const sidebarWrapperStyle = {
    flex: '0 0 250px', // Sidebar fixed width
    height: '100vh',
   
  };

  const contentWrapperStyle = {
    width: '100%',
    height: '100vh',
    overflow: 'auto', // Enable scrolling inside the content area
    display: 'flex',
    flexDirection: 'column', // Navbar on top, content below
  };



  return (
    <div style={containerStyle}>
      <div >
        <SidebarAdmin userId={userId} userName={userName} role={role} />
      </div>
      <div style={contentWrapperStyle}>
       
        <div>
        <AdminNavbar userId={userId} userName={userName} role={role} />
          <Container
            fluid
            className="d-flex justify-content-center"
            style={{width:'100%'}}

          >

            
            <Row>
              <Col>
                <NewsAnnouncement
                  user_image=""
                  user_name={userName}
                  user_id={userId}
                  role={role}
                />
              </Col>
              <Col>
                <NewsList user_id={userId} role={role} />
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  );
}

export default AdminNewsManagement;
