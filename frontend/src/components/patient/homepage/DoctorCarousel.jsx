import { useNavigate } from "react-router-dom";
import { Button, Container } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import axios from "axios";
import { ip } from "../../../ContentExport";
import { io } from "socket.io-client";
import "./DoctorCarousel.css";

const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

function DoctorCarousel({ pid }) {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch initial data and set up Socket.IO
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${ip.address}/api/doctor/api/alldoctor`);
        setDoctors(response.data.theDoctor);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();

    // Initialize Socket.IO connection
    socketRef.current = io(ip.address);

    socketRef.current.on("connect", () => {
      // Connection established
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
  }, []);

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

  // Get status text for visualization
  const getStatusDetails = (doctor) => {
    if (doctor.activityStatus === "Online") {
      return { text: "Online", className: "doctor-status-online" };
    } else if (doctor.activityStatus === "In Session") {
      return { text: "In Session", className: "doctor-status-session" };
    } else {
      return { text: timeSinceLastActive(doctor.lastActive), className: "doctor-status-offline" };
    }
  };

  // Scroll the carousel
  const scroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += offset;
    }
  };

  return (
    <Container className="doc-carousel-section">
      <div className="doc-carousel-header">
        <h4 className="doc-carousel-title">Our Medical Professionals</h4>
        <div className="doc-carousel-nav">
          <Button
            variant="light"
            onClick={() => scroll(-300)}
            className="doc-nav-button doc-nav-prev"
            aria-label="Previous"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="light"
            onClick={() => scroll(300)}
            className="doc-nav-button doc-nav-next"
            aria-label="Next"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="doc-carousel-wrapper">
        <div className="doc-carousel" ref={scrollRef}>
          {doctors.map((doctor) => {
            const doctorImage = doctor.dr_image || defaultImage;
            const status = getStatusDetails(doctor);
            
            return (
              <div 
                key={doctor._id}
                className="doc-card"
                onClick={() => handleDoctorClick(doctor._id)}
              >
                <div className="doc-card-image-wrapper">
                  <div className="doc-card-image">
                    <img src={`${ip.address}/${doctorImage}`} alt={`Dr. ${doctor.dr_lastName}`} />
                    <div className={`doc-status-indicator ${status.className}`}></div>
                  </div>
                </div>
                <div className="doc-card-content">
                  <h5 className="doc-card-name">
                    Dr. {doctor.dr_firstName} {doctor.dr_middleInitial && `${doctor.dr_middleInitial}.`} {doctor.dr_lastName}
                  </h5>
                  <p className="doc-card-specialty">{doctor.dr_specialty}</p>
                  <div className="doc-card-status">
                    <span className={`doc-status-text ${status.className}`}>
                      {status.text}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );
}

export default DoctorCarousel;