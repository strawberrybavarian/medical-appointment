import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, Container, Row, Col, Modal, Button } from "react-bootstrap";
import axios from "axios";
import io from "socket.io-client";
import "./Styles.css";
import { ip } from "../../../../../ContentExport";
import ManageDoctorMain from "./ManageDoctorMain";

const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

function DoctorCards({ msid }) {
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const location = useLocation();
  
  // Socket.IO connection
  const socket = io(ip.address);

  useEffect(() => {
    // Fetch doctors data initially
    axios
      .get(`${ip.address}/api/doctor/api/alldoctor`)
      .then((res) => {
        setDoctors(res.data.theDoctor);
      })
      .catch((err) => console.log(err));

    // Listen for doctor status updates in real-time
    socket.on('doctorStatusUpdate', (updatedDoctor) => {
      setDoctors((prevDoctors) =>
        prevDoctors.map((doctor) =>
          doctor._id === updatedDoctor.doctorId
            ? { ...doctor, activityStatus: updatedDoctor.activityStatus }
            : doctor
        )
      );
    });

    // Clean up socket connection when component unmounts
    return () => {
      socket.off('doctorStatusUpdate');
    };
  }, []);

  const handleDoctorClick = (did) => {
    setSelectedDoctor(did);
    setShowModal(true);
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
    if (minutesAgo < 60) return `Active ${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`;
    if (hoursAgo < 24) return `Active ${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
    if (daysAgo < 7) return `Active ${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
    return `Active ${weeksAgo} week${weeksAgo > 1 ? "s" : ""} ago`;
  };

  const sortedDoctors = doctors.sort((a, b) => {
    const statusOrder = { "In Session": 1, "Online": 2, "Offline": 3 };
    return statusOrder[a.activityStatus] - statusOrder[b.activityStatus];
  });

  return (
    <>
      <div className="cd-main d-flex justify-content-center ">
        <Container className=" d-flex justify-content-center">
          <Row className="d-flex justify-content-center">
            <div>
              <h2 className="section-title">Doctors</h2>
              <div className="cd-containergrid p-0">
                {sortedDoctors.map((doctor) => (
                  <Card
                    className="cd-card"
                    key={doctor._id}
                    onClick={() => handleDoctorClick(doctor._id)}
                  >
                    <Card.Img
                      variant="top"
                      src={`${ip.address}/${doctor.dr_image || defaultImage}`}
                    />
                    <Card.Body>
                      <Card.Title style={{ textAlign: "center" }}>
                        {doctor.dr_firstName} {doctor.dr_middleInitial}. {doctor.dr_lastName}
                      </Card.Title>
                      <p className="text-center text-muted">{doctor.dr_specialty}</p>
                      <p className="text-center text-muted" style={{ fontSize: "12px" }}>
                        {doctor.activityStatus === "In Session" && (
                          <span className="status-indicator in-session"></span>
                        )}
                        {doctor.activityStatus === "Online" && (
                          <span className="status-indicator online"></span>
                        )}
                        {doctor.activityStatus === "Offline" && (
                          <span className="status-indicator offline"></span>
                        )}
                        {doctor.activityStatus === "Offline"
                          ? timeSinceLastActive(doctor.lastActive)
                          : doctor.activityStatus}
                      </p>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>
          </Row>
        </Container>
      </div>

      {/* Modal for ManageDoctorMain */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="xl"
        backdrop="static"
        className="am-overlay custom-wide-modal"
      >
        <Modal.Header className="am-header" closeButton>
          <Modal.Title>Manage Doctor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDoctor && (
            <ManageDoctorMain
              did={selectedDoctor}
              msid={msid}
              showModal={true}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DoctorCards;
