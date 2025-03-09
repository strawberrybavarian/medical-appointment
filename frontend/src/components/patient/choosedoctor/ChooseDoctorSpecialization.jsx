// ChooseDoctorSpecialization.jsx
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Alert } from 'react-bootstrap';
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import { ip } from "../../../ContentExport";
import { io } from "socket.io-client";
import { ArrowLeftCircleFill, PersonSquare, GeoAltFill, CalendarCheckFill } from "react-bootstrap-icons";
import { useUser } from "../../UserContext"; 
import "../homepage/DoctorCarousel.css"; // Reuse the DoctorCarousel CSS

function ChooseDoctorSpecialization() {
  const navigate = useNavigate();
  const { specialty } = useParams();
  const { user, role } = useUser(); 
  const [theDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

  // Authentication check
  useEffect(() => {
    if (!user) {
      navigate('/medapp/login');
    } else if (user && role !== 'Patient') {
      navigate('/medapp/login');
    }
  }, [user, role, navigate]);

  // Socket.IO connection
  useEffect(() => {
    // Initialize Socket.IO connection
    socketRef.current = io(ip.address);

    // Listen for doctor activity status updates
    socketRef.current.on('doctorStatusUpdate', (updatedDoctor) => {
      setAllDoctors((prevDoctors) =>
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

  // Fetch and filter doctors by specialty
  useEffect(() => {
    setLoading(true);
    axios.get(`${ip.address}/api/doctor/api/alldoctor`)
      .then((res) => {
        const filteredDoctors = res.data.theDoctor.filter(doctor => 
          doctor.dr_specialty && doctor.dr_specialty.toLowerCase() === specialty.toLowerCase()
        );
        setAllDoctors(filteredDoctors);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [specialty]);

  // Navigate to doctor profile
  const handleDoctorClick = (did) => {
    navigate(`/doctorprofile`, { state: { did } });
  };

  // Helper function to calculate time since last active
  const timeSinceLastActive = (lastActive) => {
    if (!lastActive) return "Status not available";
    
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

  // Get status text and class for visualization
  const getStatusDetails = (doctor) => {
    if (doctor.activityStatus === "Online") {
      return { text: "Online", className: "doctor-status-online" };
    } else if (doctor.activityStatus === "In Session") {
      return { text: "In Session", className: "doctor-status-session" };
    } else {
      return { text: timeSinceLastActive(doctor.lastActive), className: "doctor-status-offline" };
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  const pid = user ? user._id : null;

  // Format specialty name for display
  const formattedSpecialty = specialty.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <>
      {user && role === 'Patient' && (
        <PatientNavBar pid={pid} />
      )}

      <Container className="mt-5 pt-4">
        <div className="doc-carousel-header mb-4">
          <div>
            <button 
              className="btn btn-link text-decoration-none p-0 mb-3 d-flex align-items-center"
              onClick={goBack}
              style={{ color: '#4a90e2', fontWeight: '600' }}
            >
              <ArrowLeftCircleFill className="me-2" /> Back
            </button>
            <h2 className="doc-carousel-title">{formattedSpecialty} Specialists</h2>
            <p className="text-muted mt-2">
              Select a doctor to view their profile and schedule an appointment
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center my-5 py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Finding specialists...</p>
          </div>
        ) : theDoctors.length > 0 ? (
          <div className="doc-carousel-wrapper">
            <div className="row g-4">
              {theDoctors.map((doctor) => {
                const doctorImage = doctor.dr_image || defaultImage;
                const status = getStatusDetails(doctor);
                
                return (
                  <div className="col-md-6 col-lg-4 col-xl-3" key={doctor._id}>
                    <div 
                      className="doc-card w-100 h-100"
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
                        
                        <div className="d-flex align-items-center mb-2 small text-muted">
                          <PersonSquare className="me-2" />
                          <span>{doctor.dr_gender || 'Not specified'}</span>
                        </div>
                        
                        {doctor.dr_clinic && (
                          <div className="d-flex align-items-center mb-2 small text-muted">
                            <GeoAltFill className="me-2" />
                            <span>{doctor.dr_clinic}</span>
                          </div>
                        )}
                        
                        <div className="doc-card-status mt-3">
                          <span className={`doc-status-text ${status.className}`}>
                            {status.text}
                          </span>
                        </div>
                        
                        <button 
                          className="btn btn-primary w-100 mt-3 d-flex align-items-center justify-content-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDoctorClick(doctor._id);
                          }}
                        >
                          <CalendarCheckFill className="me-2" /> Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <Alert variant="info" className="my-4 text-center">
            <h5 className="alert-heading">No Specialists Found</h5>
            <p>We couldn't find any {formattedSpecialty} specialists at the moment.</p>
            <button 
              className="btn btn-outline-primary mt-2"
              onClick={goBack}
            >
              Go Back
            </button>
          </Alert>
        )}
      </Container>
    </>
  );
}

export default ChooseDoctorSpecialization;