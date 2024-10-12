import { useNavigate } from "react-router-dom";
import { Card, Container } from "react-bootstrap";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { ip } from "../../../ContentExport";
const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

function VerticalDoctorList({ pid }) {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Fetch all the doctors when the component loads
  useEffect(() => {
    axios
      .get(`${ip.address}/doctor/api/alldoctor`)
      .then((res) => {
        setDoctors(res.data.theDoctor);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleDoctorClick = (did) => {
    navigate(`/doctorprofile/${pid}/${did}`); // Navigate to doctor profile with the patient ID
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

  return (
    <Container>
      <div
        className="vertical-doctor-list d-flex justify-content-center flex-column align-items-center"
        ref={scrollRef}
        style={{
          maxHeight: "800px", // Limit the height to show 3-4 cards
          overflowY: "auto",
          scrollbarWidth: "thin", // For Firefox
          scrollbarColor: "transparent transparent", // Hidden by default
          padding: "10px 0",
          width: "100%",
          paddingTop: '1100px' // Ensure the container takes up the full width
        }}
      >
        {doctors.slice(0, 10).map((doctor) => {
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
                width: "14rem",
                marginTop: "20px", // Vertical margin between cards
                textAlign: "center", // Center-align card content
              }}
            >
              <Card.Img
                variant="top"
                src={`${ip.address}/${doctorImage}`}
              />
              <Card.Body>
                <Card.Title style={{ fontSize: "14px" }}>
                  {doctor.dr_firstName} {doctor.dr_middleInitial}.{" "}
                  {doctor.dr_lastName}
                </Card.Title>
                <p style={{ fontSize: "12px", fontStyle: "italic" }}>
                  {doctor.dr_specialty}
                </p>

                {/* Adding Activity Status below the card */}
                <p style={{ fontSize: "10px" }}>
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
    </Container>
  );
}

export default VerticalDoctorList;
