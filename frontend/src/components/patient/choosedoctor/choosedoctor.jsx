import { useNavigate } from "react-router-dom";
import { Card, Form, Row, Col, Button, Container } from 'react-bootstrap';
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import './ChooseDoctor.css';
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import { Helmet } from "react-helmet";
import Footer from "../../Footer";
import { ip } from "../../../ContentExport";
import { useUser } from "../../UserContext";
import { io } from "socket.io-client";
import { Filter, Search, Alarm, CalendarMonth, PersonBadge } from 'react-bootstrap-icons';
import "../homepage/DoctorCarousel.css"; // Import DoctorCarousel CSS

const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

function ChooseDoctor() {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const [selectedDays, setSelectedDays] = useState({
        monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false
    });
    const [availability, setAvailability] = useState({
        am: false, pm: false
    });
    const [clinicHoursRange, setClinicHoursRange] = useState({ start: '', end: '' });
    const [showFilters, setShowFilters] = useState(false);
    const socketRef = useRef(null);
    const { user, role } = useUser();
    const { setDoctorId } = useUser();
    const navigate = useNavigate();

    // Fetch all doctors and populate specializations
    useEffect(() => {
      // Fetch doctors and initialize state
      const fetchDoctors = async () => {
        try {
          const response = await axios.get(`${ip.address}/api/doctor/api/alldoctor`);
          const doctorsData = response.data.theDoctor;

          // Set all doctors and filtered list
          setDoctors(doctorsData);
          setFilteredDoctors(doctorsData); // Initially show all doctors

          // Extract unique specializations
          const uniqueSpecializations = [
            ...new Set(doctorsData.map((doctor) => doctor.dr_specialty)),
          ];
          setSpecializations(uniqueSpecializations);
        } catch (error) {
          console.error("Error fetching doctors:", error);
        }
      };

      fetchDoctors(); // Initial fetch of doctor data

      // Initialize Socket.IO connection
      socketRef.current = io(ip.address);

      // Log socket connection
      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current.id);
      });

      // Listen for doctor activity status updates
      socketRef.current.on("doctorStatusUpdate", (updatedDoctor) => {
        console.log("Received doctorStatusUpdate:", updatedDoctor); // Debug log

        // Update the relevant doctor's activity status and last active time
        setDoctors((prevDoctors) =>
          prevDoctors.map((doctor) =>
            doctor._id === updatedDoctor.doctorId
              ? {
                  ...doctor,
                  activityStatus: updatedDoctor.activityStatus,
                  lastActive: updatedDoctor.lastActive,
                }
              : doctor
          )
        );

        // Also update the filtered doctors list, if applicable
        setFilteredDoctors((prevFilteredDoctors) =>
          prevFilteredDoctors.map((doctor) =>
            doctor._id === updatedDoctor.doctorId
              ? {
                  ...doctor,
                  activityStatus: updatedDoctor.activityStatus,
                  lastActive: updatedDoctor.lastActive,
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
    }, []); // Empty dependency array

    const handleDoctorClick = (did) => {
        navigate('/doctorprofile', { state: { did } });
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
            monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false
        });
        setAvailability({
            am: false, pm: false
        });
        setClinicHoursRange({ start: '', end: '' });
    };

    const filterDoctors = () => {
        const filtered = doctors.filter((doctor) => {
            // Filter by name or specialization
            const doctorName = doctor.dr_firstName && doctor.dr_lastName ? `${doctor.dr_firstName} ${doctor.dr_lastName}`.toLowerCase() : '';
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

        setFilteredDoctors(filtered);
    };

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
    
    // Get status details like in DoctorCarousel
    const getStatusDetails = (doctor) => {
      if (doctor.activityStatus === "Online") {
        return { text: "Online", className: "doctor-status-online" };
      } else if (doctor.activityStatus === "In Session") {
        return { text: "In Session", className: "doctor-status-session" };
      } else {
        return { text: timeSinceLastActive(doctor.lastActive), className: "doctor-status-offline" };
      }
    };

    useEffect(() => {
        filterDoctors(); // Apply the filter every time the search or filters change
    }, [searchName, selectedSpecialization, selectedDays, availability, clinicHoursRange]);

    return (
        <>
            <Helmet>
                <title>Molino Care | Find a Doctor</title>
            </Helmet>
          
            <Container 
                className="cont-fluid-no-gutter w-100"
                fluid
                style={{ overflowY: 'scroll', height: '100vh'}}
            >
                <PatientNavBar pid={user._id} />
                <div className="maincolor-container">
                    <div className="content-area">
                        <Container className="py-4">
                            <h4 className="doc-carousel-title mb-4">Find Your Doctor</h4>
                            
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
                            
                            {/* Doctor Cards using DoctorCarousel styling */}
                            <div className="doctor-results-count mb-3">
                                Found {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'}
                            </div>
                            
                            <div className="doc-carousel-wrapper d-flex justify-content-center">
    {/* Change from g-4 (which has 1.5rem gutters) to g-3 (1rem gutters) */}
    <div className="row g-4 w-100 ">
        {filteredDoctors.map((doctor) => {
            const doctorImage = doctor.dr_image || defaultImage;
            const status = getStatusDetails(doctor);
            
            return (
                /* Fix inconsistent column classes for better spacing */
                <div className=" col-md-2" key={doctor._id}>
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
            <div className="col-12 text-center p-5">
                <p className="mb-0">No doctors match your search criteria.</p>
            </div>
        )}
    </div>
</div>
                        </Container>
                    </div>
                </div>
            </Container>
            
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

export default ChooseDoctor;