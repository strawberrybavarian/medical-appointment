import React from 'react'
import './Styles.css'
import {  Container, Col, Row, Card  } from 'react-bootstrap';
function MedSecDashboard() {
  return (
    <>
    <div className='dash-container' >
    <Card className="dash-main">
                <Card.Header className="app-boxtitle">Total Pending Patient</Card.Header>
                <Card.Body  >
                <Row>
                    <Col>
                        <p>Hello</p>
                    </Col>
                </Row>
                </Card.Body>
    </Card>

    <Card className="dash-main">
                <Card.Header className="app-boxtitle">Total Today's Patient</Card.Header>
                <Card.Body  >
                <Row>
                    <Col>
                        <p>Hello</p>
                    </Col>
                </Row>
                </Card.Body>
    </Card>

    <Card className="dash-main">
                <Card.Header className="app-boxtitle">Total Ongoing Patient</Card.Header>
                <Card.Body  >
                <Row>
                    <Col>
                        <p>Hello</p>
                    </Col>
                </Row>
                </Card.Body>
    </Card>
    </div>
 

    
        
       
       

    </>
  )
}

export default MedSecDashboard