import { useNavigate } from "react-router-dom";
import { Card, Button, Container } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import axios from "axios";
import { ip } from "../../../ContentExport";
import { io } from "socket.io-client"; // Ensure proper import of Socket.IO client

const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

function DoctorCarousel({ pid }) {
  const [doctors, setDoctors] = useState([]); // Doctors state
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch initial data and set up Socket.IO
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${ip.address}/api/doctor/api/alldoctor`);
        setDoctors(response.data.theDoctor);
        // console.log("Fetched doctors:", response.data.theDoctor); // Debug log
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors(); // Initial fetch

    // Initialize Socket.IO connection
    socketRef.current = io(ip.address);

    // Log socket connection
    socketRef.current.on("connect", () => {
      // console.log("Socket connected:", socketRef.current.id);
    });

    // Listen for doctor activity status updates
    socketRef.current.on('doctorStatusUpdate', (updatedDoctor) => {
      setDoctors((prevDoctors) =>
        prevDoctors.map((doctor) =>
          doctor._id === updatedDoctor.doctorId
            ? { ...doctor, activityStatus: updatedDoctor.activityStatus, lastActive: updatedDoctor.lastActive }
            : doctor
        )
      );
    });
    

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off("doctorStatusUpdate");
        socketRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array

  // Handle doctor card click
  const handleDoctorClick = (did) => {
    navigate(`/doctorprofile`, { state: { did } });
  };

  // Helper function to calculate time since last active
  const timeSinceLastActive = (lastActive) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const secondsAgo = Math.floor((now - lastActiveDate) / 1000);
    const minutesAgo = Math.floor(secondsAgo / 60);
    const hoursAgo = Math.floor(minutesAgo / 60);
    const daysAgo = Math.floor(hoursAgo / 24);

    if (minutesAgo < 1) return "Active just now";
    if (minutesAgo < 60) return `Active ${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`;
    if (hoursAgo < 24) return `Active ${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
    if (daysAgo < 7) return `Active ${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
    return `Inactive for a while`;
  };

  // Scroll the carousel
  const scroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += offset;
    }
  };

  return (
    <Container>
      <Container className="ml-5 d-flex w-100">
        <div className="w-100">
          <h4>List of Doctors</h4>
        </div>
      </Container>

      <div className="doctor-carousel-container">
        <Button
          variant="secondary"
          onClick={() => scroll(-980)}
          className="scroll-button circle-button"
        >
          <ChevronLeft />
        </Button>

        <div className="doctor-carousel" ref={scrollRef}>
          {doctors.map((doctor) => {
            const doctorImage = doctor.dr_image || defaultImage;
            const statusColor =
              doctor.activityStatus === "Online"
                ? "green"
                : doctor.activityStatus === "In Session"
                ? "orange"
                : "gray";

            return (
              <Card
                key={doctor._id}
                className="cd-card"
                onClick={() => handleDoctorClick(doctor._id)}
                style={{ width: "180px", margin: "0 10px" }}
              >
                <Card.Img variant="top" src={`${ip.address}/${doctorImage}`} />
                <Card.Body>
                  <Card.Title style={{ textAlign: "center", fontSize: "14px" }}>
                    {doctor.dr_firstName} {doctor.dr_middleInitial}. {doctor.dr_lastName}
                  </Card.Title>
                  <p style={{ textAlign: "center", fontSize: "12px", fontStyle: "italic" }}>
                    {doctor.dr_specialty}
                  </p>
                  <p style={{ textAlign: "center", fontSize: "10px" }}>
                    <span
                      className="status-indicator"
                      style={{
                        backgroundColor: statusColor,
                        borderRadius: "50%",
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        marginRight: "8px",
                      }}
                    ></span>
                    {doctor.activityStatus === "Online"
                      ? "Online"
                      : doctor.activityStatus === "In Session"
                      ? "In Session"
                      : `Last Active: ${timeSinceLastActive(doctor.lastActive)}`}
                  </p>
                </Card.Body>
              </Card>
            );
          })}
        </div>

        <Button
          variant="secondary"
          onClick={() => scroll(980)}
          className="scroll-button circle-button"
        >
          <ChevronRight />
        </Button>
      </div>
    </Container>
  );
}

export default DoctorCarousel;
