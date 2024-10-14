import { useNavigate } from "react-router-dom";
import { Card, Button, Container } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import axios from "axios";
import { usePatient } from "../PatientContext";
import { ip } from "../../../ContentExport";
const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

function DoctorCarousel({ pid }) {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const { patient } = usePatient();
  const { setDoctorId } = usePatient();
  // Fetch all the doctors when the component loads
  useEffect(() => {
    axios
      .get(`${ip.address}/api/doctor/api/alldoctor`)
      .then((res) => {
        setDoctors(res.data.theDoctor);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleDoctorClick = (did) => {
    setDoctorId(did);
    navigate(`/doctorprofile`); // Navigate to doctor profile with the patient ID
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
    if (minutesAgo < 60)
      return `Active ${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`;
    if (hoursAgo < 24)
      return `Active ${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
    if (daysAgo < 7)
      return `Active ${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
    return `Active ${weeksAgo} week${weeksAgo > 1 ? "s" : ""} ago`;
  };

  // Handle scroll by a set number of pixels (adjust for card width + margin)
  const scroll = (scrollOffset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += scrollOffset;
    }
  };

  return (
    <>
      <Container>
        <Container className="ml-5">
          <h4>List of Doctors</h4>
        </Container>

        <div className="doctor-carousel-container">
          {/* Back Button */}
          <Button
            variant="secondary"
            onClick={() => scroll(-980)} // Scroll exactly 5 cards width
            className="scroll-button circle-button"
          >
            <ChevronLeft /> {/* Chevron Left Icon */}
          </Button>

          {/* Scrollable container */}
          <div className="doctor-carousel" ref={scrollRef}>
            {doctors.slice(0, doctors.length).map((doctor) => {
              const doctorImage = doctor.dr_image || defaultImage;
          
              // Define the status color based on the activity status
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
                  style={{
                    width: "180px", // Ensure 5 cards fit into the container
                    margin: "0 10px",
                  }}
                >
                  <Card.Img
                    variant="top"
                    src={`${ip.address}/${doctorImage}`}
                  />
                  <Card.Body>
                    <Card.Title
                      style={{ textAlign: "center", fontSize: "14px" }}
                    >
                      {doctor.dr_firstName} {doctor.dr_middleInitial}.{" "}
                      {doctor.dr_lastName}
                    </Card.Title>
                    <p
                      style={{
                        textAlign: "center",
                        fontSize: "12px",
                        fontStyle: "italic",
                      }}
                    >
                      {doctor.dr_specialty}
                    </p>

                    {/* Adding Activity Status below the card */}
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
                        : `Last Active: ${timeSinceLastActive(
                            doctor.lastActive
                          )}`}
                    </p>
                  </Card.Body>
                </Card>
              );
            })}
          </div>

          {/* Next Button */}
          <Button
            variant="secondary"
            onClick={() => scroll(980)} // Scroll exactly 5 cards width
            className="scroll-button circle-button"
          >
            <ChevronRight /> {/* Chevron Right Icon */}
          </Button>
        </div>
      </Container>
    </>
  );
}

export default DoctorCarousel;
