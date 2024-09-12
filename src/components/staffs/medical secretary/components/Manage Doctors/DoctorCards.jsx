import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import './Styles.css'; // Import the CSS styles
import MedSecNavbar from "../../navbar/MedSecNavbar";
const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

function DoctorCards() {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const { msid } = useParams();

  useEffect(() => {
    axios.get("http://localhost:8000/doctor/api/alldoctor")
      .then(res => {
        setDoctors(res.data.theDoctor);
      })
      .catch(err => console.log(err));
  }, []);

  const handleDoctorClick = (did) => {
    navigate(`/medsec/${msid}/doctors/${did}/schedule`);
  };

  // Function to calculate how long ago the doctor was active
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

  // Categorize doctors based on their activity status
  const inSessionDoctors = doctors.filter(doctor => doctor.activityStatus === 'In Session');
  const onlineDoctors = doctors.filter(doctor => doctor.activityStatus === 'Online');
  const offlineDoctors = doctors.filter(doctor => doctor.activityStatus === 'Offline');

  return (
    <>
      <MedSecNavbar />
      <div className="msdc-container">

      <Container fluid className=" py-3  d-flex justify-content-center">
        <Row className="g-3">

          {/* In Session Doctors */}
          {inSessionDoctors.length > 0 && (
            <React.Fragment>
              <h2 className="section-title">In Session</h2>
              {inSessionDoctors.map(doctor => (
                <Col key={doctor._id} xs={12} sm={6} md={4} lg={3}>
                <Card onClick={() => handleDoctorClick(doctor._id)} className="doctor-card">
                  <Card.Img variant="top" src={`http://localhost:8000/${doctor.dr_image || defaultImage}`} />
                  <Card.Body>
                    <Card.Title className="text-center">
                      {doctor.dr_firstName} {doctor.dr_middleInitial}. {doctor.dr_lastName}
                    </Card.Title>
                    <p className="text-center text-muted">{doctor.dr_specialty}</p>
                    <p className="text-center text-muted" style={{ fontSize: "12px" }}>
                      <span className={`status-indicator ${doctor.activityStatus.toLowerCase().replace(" ", "-")}`}></span>
                      {doctor.activityStatus === "Offline" && timeSinceLastActive(doctor.lastActive)}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              
              ))}
            </React.Fragment>
          )}

          {/* Online Doctors */}
          {onlineDoctors.length > 0 && (
            <React.Fragment>
              <h2 className="section-title">Online</h2>
              {onlineDoctors.map(doctor => (
                <Col key={doctor._id} xs={12} sm={6} md={4} lg={3}>
                  <Card
                    onClick={() => handleDoctorClick(doctor._id)}
                    className="doctor-card"
                  >
                    <Card.Img
                      variant="top"
                      src={`http://localhost:8000/${doctor.dr_image || defaultImage}`}
                    />
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
            </React.Fragment>
          )}

          {/* Offline Doctors */}
          {offlineDoctors.length > 0 && (
            <React.Fragment>
              <h2 className="section-title">Offline</h2>
              {offlineDoctors.map(doctor => (
                <Col key={doctor._id} xs={12} sm={6} md={4} lg={3}>
                  <Card
                    onClick={() => handleDoctorClick(doctor._id)}
                    className="doctor-card"
                  >
                    <Card.Img
                      variant="top"
                      src={`http://localhost:8000/${doctor.dr_image || defaultImage}`}
                    />
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
            </React.Fragment>
          )}

        </Row>
      </Container>
              
      </div>
    </>
  );
}

export default DoctorCards;
