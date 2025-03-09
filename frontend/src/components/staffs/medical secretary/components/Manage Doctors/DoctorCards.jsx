import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Card, Container, Row, Col, Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import io from "socket.io-client";
import "./Styles.css";
import { ip } from "../../../../../ContentExport";
import ManageDoctorMain from "./ManageDoctorMain";
import { Filter, Search, Alarm, CalendarMonth, PersonBadge } from 'react-bootstrap-icons';

const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

function DoctorCards({ msid }) {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDays, setSelectedDays] = useState({
    monday: false, tuesday: false, wednesday: false, thursday: false, 
    friday: false, saturday: false, sunday: false
  });
  const [availability, setAvailability] = useState({
    am: false, pm: false
  });
  const [clinicHoursRange, setClinicHoursRange] = useState({ start: '', end: '' });
  
  const location = useLocation();
  const socketRef = useRef(null);

  useEffect(() => {
    // Fetch doctors data initially
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${ip.address}/api/doctor/api/alldoctor`);
        const doctorsData = response.data.theDoctor;
        
        // Set all doctors and filtered list
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData); // Initially show all doctors
        
        // Extract unique specializations
        const uniqueSpecializations = [...new Set(doctorsData.map((doctor) => doctor.dr_specialty))];
        setSpecializations(uniqueSpecializations);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    
    fetchDoctors();

    // Initialize Socket.IO connection
    socketRef.current = io(ip.address);
    
    // Log socket connection
    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
    });
    
    // Listen for doctor activity status updates
    socketRef.current.on("doctorStatusUpdate", (updatedDoctor) => {
      setDoctors((prevDoctors) =>
        prevDoctors.map((doctor) =>
          doctor._id === updatedDoctor.doctorId
            ? { 
                ...doctor, 
                activityStatus: updatedDoctor.activityStatus, 
                lastActive: updatedDoctor.lastActive 
              }
            : doctor
        )
      );
      
      // Also update filtered doctors list
      setFilteredDoctors((prevFilteredDoctors) =>
        prevFilteredDoctors.map((doctor) =>
          doctor._id === updatedDoctor.doctorId
            ? { 
                ...doctor, 
                activityStatus: updatedDoctor.activityStatus, 
                lastActive: updatedDoctor.lastActive 
              }
            : doctor
        )
      );
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off("doctorStatusUpdate");
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleDoctorClick = (did) => {
    setSelectedDoctor(did);
    setShowModal(true);
  };

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
  };

  const handleSpecializationChange = (e) => {
    setSelectedSpecialization(e.target.value);
  };

  const handleDayChange = (e) => {
    const { name, checked } = e.target;
    setSelectedDays(prevDays => ({ ...prevDays, [name]: checked }));
  };

  const handleAvailabilityChange = (e) => {
    const { name, checked } = e.target;
    setAvailability(prevAvailability => ({ ...prevAvailability, [name]: checked }));
  };

  const handleClinicHoursChange = (e) => {
    const { name, value } = e.target;
    setClinicHoursRange(prevRange => ({ ...prevRange, [name]: value }));
  };

  const resetFilters = () => {
    setSearchName('');
    setSelectedSpecialization('');
    setSelectedDays({
      monday: false, tuesday: false, wednesday: false, thursday: false,
      friday: false, saturday: false, sunday: false
    });
    setAvailability({
      am: false, pm: false
    });
    setClinicHoursRange({ start: '', end: '' });
  };

  // Apply filters to doctors
  useEffect(() => {
    const filterDoctors = () => {
      const filtered = doctors.filter((doctor) => {
        // Filter by name or specialization
        const doctorName = doctor.dr_firstName && doctor.dr_lastName 
          ? `${doctor.dr_firstName} ${doctor.dr_lastName}`.toLowerCase() 
          : '';
        const doctorSpecialty = doctor.dr_specialty || '';

        const matchesName = doctorName.includes(searchName.toLowerCase());
        const matchesSpecialty = selectedSpecialization === '' || doctorSpecialty === selectedSpecialization;

        // Filter by selected days and availability (AM/PM)
        const selectedDaysArray = Object.keys(selectedDays).filter(day => selectedDays[day]);
        const matchesDays = selectedDaysArray.length === 0 || selectedDaysArray.some(day => {
          const scheduleForDay = doctor.availability?.[day]; // Access availability by day
          return scheduleForDay && (
            (!availability.am || scheduleForDay.morning?.available) &&
            (!availability.pm || scheduleForDay.afternoon?.available)
          );
        });

        // Filter by clinic hours range
        const matchesClinicHours = (!clinicHoursRange.start && !clinicHoursRange.end) || 
          Object.values(doctor.availability || {}).some(schedule => {
            return (
              (!clinicHoursRange.start || (schedule.morning?.startTime >= clinicHoursRange.start && schedule.morning?.endTime <= clinicHoursRange.end)) ||
              (!clinicHoursRange.end || (schedule.afternoon?.startTime >= clinicHoursRange.start && schedule.afternoon?.endTime <= clinicHoursRange.end))
            );
          });

        return matchesName && matchesSpecialty && matchesDays && matchesClinicHours;
      });

      // Sort doctors by activity status: In Session, Online, Offline
      const sortedFiltered = [...filtered].sort((a, b) => {
        const statusOrder = { "In Session": 1, "Online": 2, "Offline": 3 };
        return (statusOrder[a.activityStatus] || 4) - (statusOrder[b.activityStatus] || 4);
      });

      setFilteredDoctors(sortedFiltered);
    };

    filterDoctors();
  }, [doctors, searchName, selectedSpecialization, selectedDays, availability, clinicHoursRange]);

  const timeSinceLastActive = (lastActive) => {
    if (!lastActive) return "Status not available";
    
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const secondsAgo = Math.floor((now - lastActiveDate) / 1000);
    const minutesAgo = Math.floor(secondsAgo / 60);
    const hoursAgo = Math.floor(minutesAgo / 60);
    const daysAgo = Math.floor(hoursAgo / 24);
    
    if (minutesAgo < 1) return "Active just now";
    if (minutesAgo < 60) return `Active ${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
    if (hoursAgo < 24) return `Active ${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
    if (daysAgo < 7) return `Active ${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
    return `Inactive for a while`;
  };
  
  // Get status details
  const getStatusDetails = (doctor) => {
    if (doctor.activityStatus === "Online") {
      return { text: "Online", className: "doctor-status-online" };
    } else if (doctor.activityStatus === "In Session") {
      return { text: "In Session", className: "doctor-status-session" };
    } else {
      return { text: timeSinceLastActive(doctor.lastActive), className: "doctor-status-offline" };
    }
  };

  return (
    <>
      <Container fluid  className=" m-0 w-100 p-4">
        {/* Title and Filters Section */}
        <h4 className="doc-carousel-title mb-4">Doctors</h4>
        
        {/* Modern Search and Filter UI */}
        <div className="doctor-search-container mb-4">
          <div className="search-bar-wrapper">
            <div className="search-input-group">
              <Search className="search-icon" />
              <input 
                type="text" 
                value={searchName} 
                onChange={handleSearchChange}
                className="search-input" 
                placeholder="Search by doctor's name" 
              />
            </div>
            <div className="search-filter-actions">
              <Button 
                variant="outline-primary" 
                className="filter-toggle-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter /> Filters {showFilters ? '▲' : '▼'}
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="filter-panel">
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="filter-label">
                      <PersonBadge className="filter-icon" /> Specialization
                    </Form.Label>
                    <Form.Select value={selectedSpecialization} onChange={handleSpecializationChange}>
                      <option value="">All Specializations</option>
                      {specializations.map((specialization, index) => (
                        <option key={index} value={specialization}>
                          {specialization}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="filter-label">
                      <Alarm className="filter-icon" /> Availability
                    </Form.Label>
                    <div className="d-flex gap-3">
                      <Form.Check 
                        type="switch"
                        id="am-switch"
                        label="AM" 
                        name="am" 
                        checked={availability.am} 
                        onChange={handleAvailabilityChange} 
                      />
                      <Form.Check 
                        type="switch"
                        id="pm-switch"
                        label="PM" 
                        name="pm" 
                        checked={availability.pm} 
                        onChange={handleAvailabilityChange} 
                      />
                    </div>
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="filter-label">
                      <Alarm className="filter-icon" /> Clinic Hours
                    </Form.Label>
                    <div className="d-flex gap-2 align-items-center">
                      <Form.Control 
                        type="time" 
                        name="start" 
                        value={clinicHoursRange.start} 
                        onChange={handleClinicHoursChange}
                        size="sm"
                      />
                      <span>to</span>
                      <Form.Control 
                        type="time" 
                        name="end" 
                        value={clinicHoursRange.end} 
                        onChange={handleClinicHoursChange}
                        size="sm"
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="filter-label">
                      <CalendarMonth className="filter-icon" /> Clinic Days
                    </Form.Label>
                    <div className="days-filter">
                      {Object.entries({
                        monday: "Mon",
                        tuesday: "Tue",
                        wednesday: "Wed",
                        thursday: "Thu",
                        friday: "Fri",
                        saturday: "Sat",
                        sunday: "Sun"
                      }).map(([day, label]) => (
                        <Form.Check 
                          key={day}
                          inline
                          type="checkbox"
                          id={`day-${day}`}
                          name={day}
                          label={label}
                          checked={selectedDays[day]}
                          onChange={handleDayChange}
                          className="day-checkbox"
                        />
                      ))}
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end mt-3">
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={resetFilters} 
                  className="me-2"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Doctor Results Count */}
        <div className="doctor-results-count mb-3">
          Found {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'}
        </div>
        
        <Container fluid className="doc-grid-container w-100">
  <Container fluid className="doc-grid-row w-100">
    {filteredDoctors.map((doctor) => {
      const doctorImage = doctor.dr_image || defaultImage;
      const status = getStatusDetails(doctor);
      
      return (
        <div className="doc-grid-item" key={doctor._id}>
          <div 
            className="doc-card h-100"
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
        </div>
      );
    })}
    
    {filteredDoctors.length === 0 && (
      <div className="doc-grid-empty">
        <p>No doctors match your search criteria.</p>
      </div>
    )}
  </Container>
</Container>
      </Container>

      {/* Modal for ManageDoctorMain */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="xl"
        backdrop="static"
        className="am-overlay"
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

      <style jsx>{`
        .doctor-search-container {
          background-color: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          padding: 20px;
        }
        
        .search-bar-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .search-input-group {
          display: flex;
          align-items: center;
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 8px 16px;
          flex: 1;
          min-width: 200px;
        }
        
        .search-icon {
          color: #6c757d;
          margin-right: 10px;
        }
        
        .search-input {
          border: none;
          background: transparent;
          flex: 1;
          padding: 5px;
          outline: none;
          font-size: 16px;
          color: #495057;
        }
        
        .filter-toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        
        .filter-panel {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
        }
        
        .filter-label {
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        
        .filter-icon {
          color: #4a90e2;
        }
        
        .days-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .day-checkbox {
          flex: 0 0 auto;
        }
        
        .doctor-results-count {
          font-weight: 500;
          color: #6c757d;
        }
        
        .doc-carousel-wrapper {
    width: 100%;
    min-width: 100%;
    display: block;
  }
  
  .invisible {
    visibility: hidden;
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    .search-bar-wrapper {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-filter-actions {
      display: flex;
      justify-content: space-between;
    }
    
    .filter-toggle-btn {
      width: 100%;
    }
    
    .days-filter {
      justify-content: space-between;
    }
  }
      `}</style>
    </>
  );
}

export default DoctorCards;