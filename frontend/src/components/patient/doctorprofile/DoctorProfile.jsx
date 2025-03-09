import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Collapse } from 'react-bootstrap';
import axios from "axios";
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import { ip } from "../../../ContentExport";
import DoctorWeeklySchedule from './DoctorWeeklySchedule';
import AppointmentForm from './AppointmentForm';
import './DoctorProfile.css';
import DoctorAnnouncements from "./DoctorAnnouncements";
import Footer from "../../Footer";
import DoctorBiography from "./DoctorBiography";
import DoctorHMO from "./DoctorHMO";

// Use your new unified context:
import { useUser } from "../../UserContext";

function DoctorProfile() {
  const location = useLocation(); 
  const navigate = useNavigate();
  // Attempt to read the doc ID from route state:
  // e.g. navigate('/doctorprofile', { state: { did } })
  const did = location.state ? location.state.did : null;

  // Use the new unified context to get the logged-in user (who is presumably a patient).
  const { user, role } = useUser();

  const [theDoctor, setTheDoctor] = useState(null); 
  const [theImage, setTheImage] = useState("");
  const [FullName, setFullName] = useState("");
  const [biography, setBiography] = useState({});
  const [theHmo, setTheHmo] = useState([]);
  const [openProfile, setOpenProfile] = useState(false); 
  const [openAnnouncements, setOpenAnnouncements] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);

  // If we need the patient’s ID for AppointmentForm or NavBar:
  const patientId = user ? user._id : null;

  // 1. If there's no doctor ID in location.state, or no user, handle it
  useEffect(() => {
    if (!did) {
      console.log("No doctor ID provided; redirecting or show fallback");
      // You might:
      // navigate('/somewhere') or just return...
    }
    if (!user || role !== 'Patient') {
      // If user is not logged in or not a Patient
      console.log("No patient user found or role not 'Patient'; redirect to login");
      navigate('/medapp/login');
    }
  }, [did, user, role, navigate]);

  // 2. Fetch the doctor’s data
  useEffect(() => {
    if (did) {
      axios.get(`${ip.address}/api/doctor/api/finduser/${did}`)
        .then((res) => {
          const doctor = res.data.theDoctor;
          setTheDoctor(doctor);

          const formattedName = `${doctor.dr_firstName} ${
            doctor.dr_middleInitial ? doctor.dr_middleInitial + '.' : ''
          } ${doctor.dr_lastName}`;
          setFullName(formattedName);

          setTheImage(doctor.dr_image || "images/014ef2f860e8e56b27d4a3267e0a193a.jpg");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [did]);

  // 3. Fetch biography
  useEffect(() => {
    if (did) {
      axios.get(`${ip.address}/api/doctor/${did}/getbiography`)
        .then((response) => {
          setBiography(response.data.biography || {});
        })
        .catch((error) => {
          console.error('Error fetching biography:', error);
        });
    }
  }, [did]);

  // 4. Fetch HMO
  useEffect(() => {
    if (did) {
      axios.get(`${ip.address}/api/doctor/${did}/gethmo`)
        .then((response) => {
          setTheHmo(response.data.dr_hmo || []);
        })
        .catch((error) => {
          console.error('Error fetching HMOs:', error);
        });
    }
  }, [did]);

  // 5. If no doctor ID or no doctor data yet, show fallback


  // If doctor data not loaded yet, you can show a loading or just do:
  if (!theDoctor) {
    return null; // or <div>Loading...</div>
  }

  return (
    <>
      {/* If user is a patient, show the nav bar */}
      {user && role === 'Patient' && (
        <PatientNavBar pid={patientId} />
      )}

      <Container
        fluid
        style={{ overflowY: 'scroll', height: '100vh', paddingBottom: '100px', paddingTop: '1.5rem' }}
      >
        <Container className='maincolor-container'>
          <div className="content-area">
            <Row>
              <Col md={6}>
                <Container className="dp-container1 white-background shadow-sm">
                  <img src={`${ip.address}/${theImage}`} alt="Doctor" className='dp-image' />
                  <div className="dp-container2">
                    <h4>{FullName}</h4>
                    <p style={{ fontStyle: 'italic', fontSize: '14px' }}>
                      {theDoctor.dr_specialty}
                    </p>
                  </div>
                </Container>

                <Container className="p-3 shadow-sm white-background dp-container11 mt-3">
                  <DoctorWeeklySchedule did={did} />
                </Container>

                <Container className="announcement-container white-background align-items-center mt-3 mb-3 shadow-sm">
                  <div className="d-flex align-items-center">
                    <div className="w-100 d-flex align-items-center">
                      <span className="m-0" style={{ fontWeight: 'bold' }}>
                        Doctor Profile
                      </span>
                    </div>
                    <div className="w-100 d-flex justify-content-end align-items-center">
                      <Link
                        onClick={() => setOpenProfile(!openProfile)}
                        aria-controls="profile-collapse"
                        aria-expanded={openProfile}
                        className="link-collapse"
                        style={{ transition: 'transform 0.3s ease' }}
                      >
                        {openProfile ? <span>&#8722;</span> : <span>&#43;</span>}
                      </Link>
                    </div>
                  </div>

                  <Collapse in={openProfile}>
                    <div id="profile-collapse">
                      <DoctorBiography
                        biography={biography}
                        doctor_image={theImage}
                        doctor_name={FullName}
                      />
                    </div>
                  </Collapse>
                </Container>

                <Container className="announcement-container white-background align-items-center mt-3 mb-3 shadow-sm">
                  <div className="d-flex align-items-center">
                    <div className="w-100 d-flex align-items-center">
                      <p className="m-0" style={{ fontWeight: 'bold' }}>
                        Announcements
                      </p>
                    </div>
                    <div className="w-100 d-flex justify-content-end align-items-center">
                      <Link
                        onClick={() => setOpenAnnouncements(!openAnnouncements)}
                        aria-controls="announcements-collapse"
                        aria-expanded={openAnnouncements}
                        className="link-collapse"
                        style={{ transition: 'transform 0.3s ease' }}
                      >
                        {openAnnouncements ? <span>&#8722;</span> : <span>&#43;</span>}
                      </Link>
                    </div>
                  </div>

                  <Collapse in={openAnnouncements}>
                    <div id="announcements-collapse">
                      <DoctorAnnouncements doctorId={did} theImage={theImage} />
                    </div>
                  </Collapse>
                </Container>

                <Container className="announcement-container white-background align-items-center mt-3 mb-3 shadow-sm">
                  <div className="d-flex align-items-center">
                    <div className="w-100 d-flex align-items-center">
                      <p className="m-0" style={{ fontWeight: 'bold' }}>
                        HMO Accreditation
                      </p>
                    </div>
                    <div className="w-100 d-flex justify-content-end align-items-center">
                      <Link
                        onClick={() => setOpenCalendar(!openCalendar)}
                        aria-controls="calendar-collapse"
                        aria-expanded={openCalendar}
                        className="link-collapse"
                        style={{ transition: 'transform 0.3s ease' }}
                      >
                        {openCalendar ? <span>&#8722;</span> : <span>&#43;</span>}
                      </Link>
                    </div>
                  </div>

                  <Collapse in={openCalendar}>
                    <div id="calendar-collapse">
                      <DoctorHMO did={did} theHmo={theHmo} />
                    </div>
                  </Collapse>
                </Container>
              </Col>

              <Col md={6}>
                <Container className="shadow-sm white-background dp-container1">
                  {/* Pass the doctor ID, plus the user's (patient's) ID */}
                  <AppointmentForm did={did} pid={patientId} />
                </Container>
              </Col>
            </Row>
          </div>
        </Container>

      </Container>
    </>
  );
}

export default DoctorProfile;
