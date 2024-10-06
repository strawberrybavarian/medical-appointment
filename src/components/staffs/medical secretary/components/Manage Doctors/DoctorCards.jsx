import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import './Styles.css'; // Import the CSS styles
const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

function DoctorCards({msid}) {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();


  
  // Extract msid from location state (or URL params, if available)


  useEffect(() => {
    axios.get("http://localhost:8000/doctor/api/alldoctor")
      .then(res => {
        setDoctors(res.data.theDoctor);
      })
      .catch(err => console.log(err));
  }, []);

  const handleDoctorClick = (did) => {
    // Navigate to the doctor schedule page with msid and did in state
    navigate(`/medsec/doctors/schedule`, {
      state: { msid, did }
    });
  };

  const timeSinceLastActive = (lastActive) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const secondsAgo = Math.floor((now - lastActiveDate) / 1000);
    const minutesAgo = Math.floor(secondsAgo / 60);
    const hoursAgo = Math.floor(minutesAgo / 60);
    const daysAgo = Math.floor(hoursAgo / 24);
    const weeksAgo = Math.floor(daysAgo / 7);

    if (minutesAgo < 1) return "Active just now";
    if (minutesAgo < 60) return `Active ${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
    if (hoursAgo < 24) return `Active ${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
    if (daysAgo < 7) return `Active ${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
    return `Active ${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
  };

  const inSessionDoctors = doctors.filter(doctor => doctor.activityStatus === 'In Session');
  const onlineDoctors = doctors.filter(doctor => doctor.activityStatus === 'Online');
  const offlineDoctors = doctors.filter(doctor => doctor.activityStatus === 'Offline');

  return (
    <>
      <div className="cd-main d-flex justify-content-center ">
        <Container className=" d-flex justify-content-center">
          <Row className="d-flex justify-content-center">

            {/* In Session Doctors */}
            {inSessionDoctors.length > 0 && (
              <React.Fragment>
                <h2 className="section-title">In Session</h2>
                <div className="cd-containergrid p-0">
                  {inSessionDoctors.map(doctor => (
                    <Card className="cd-card" key={doctor._id} onClick={() => handleDoctorClick(doctor._id)}>
                      <Card.Img variant="top" src={`http://localhost:8000/${doctor.dr_image || defaultImage}`} />
                      <Card.Body>
                        <Card.Title style={{ textAlign: "center" }}>
                          {doctor.dr_firstName} {doctor.dr_middleInitial}. {doctor.dr_lastName}
                        </Card.Title>
                        <p className="text-center text-muted">{doctor.dr_specialty}</p>
                        <p className="text-center text-muted" style={{ fontSize: "12px" }}>
                          <span className="status-indicator in-session"></span> In Session
                        </p>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </React.Fragment>
            )}

            {/* Online Doctors */}
            {onlineDoctors.length > 0 && (
              <React.Fragment>
                <h2 className="section-title">Online</h2>
                <div className="cd-containergrid p-0">
                  {onlineDoctors.map(doctor => (
                    <Col key={doctor._id}>
                      <Card className="doctor-card" onClick={() => handleDoctorClick(doctor._id)}>
                        <Card.Img variant="top" src={`http://localhost:8000/${doctor.dr_image || defaultImage}`} />
                        <Card.Body>
                          <Card.Title className="text-center">
                            {doctor.dr_firstName} {doctor.dr_middleInitial}. {doctor.dr_lastName}
                          </Card.Title>
                          <p className="text-center text-muted">{doctor.dr_specialty}</p>
                          <p className="text-center text-muted" style={{ fontSize: '12px' }}>
                            <span className="status-indicator online"></span> Online
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </div>
              </React.Fragment>
            )}

            {/* Offline Doctors */}
            {offlineDoctors.length > 0 && (
              <React.Fragment>
                <h2 className="section-title">Offline</h2>
                <div className="cd-containergrid p-0">
                  {offlineDoctors.map(doctor => (
                    <Col key={doctor._id}>
                      <Card className="doctor-card" onClick={() => handleDoctorClick(doctor._id)}>
                        <Card.Img variant="top" src={`http://localhost:8000/${doctor.dr_image || defaultImage}`} />
                        <Card.Body>
                          <Card.Title className="text-center">
                            {doctor.dr_firstName} {doctor.dr_middleInitial}. {doctor.dr_lastName}
                          </Card.Title>
                          <p className="text-center text-muted">{doctor.dr_specialty}</p>
                          <p className="text-center text-muted" style={{ fontSize: '12px' }}>
                            <span className="status-indicator offline"></span> {timeSinceLastActive(doctor.lastActive)}
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </div>
              </React.Fragment>
            )}

          </Row>
        </Container>
      </div>
    </>
  );
}

export default DoctorCards;
