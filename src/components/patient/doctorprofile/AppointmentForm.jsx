import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import axios from "axios";
import { useState, useEffect } from "react";
import PatientNavBar from "../PatientNavBar/PatientNavBar";
import { PassFill, CheckAll } from "react-bootstrap-icons";

function AppointmentForm() {
  const navigate = useNavigate();
  const { pid, did } = useParams();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availability, setAvailability] = useState({});
  const [doctorName, setDoctorName] = useState("");
  const [activeAppointmentStatus, setActiveAppointmentStatus] = useState(true);
  const [services, setServices] = useState([]); // For available services (appointment_type)
  const [selectedServices, setSelectedServices] = useState([]); // For selected services

  // Function to fetch available services (appointment_type)
  useEffect(() => {
    axios.get("http://localhost:8000/admin/get/services")
      .then((response) => {
        setServices(response.data); // Assuming response.data contains the services array
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const createAppointment = () => {
    if (!time || !selectedServices.length) {
      window.alert("Please select a valid time and service for the appointment.");
      return;
    }

    const formData = {
      doctorId: did,
      date,
      time,
      reason,
      appointment_type: selectedServices, // Send selected services
    };

    axios
      .post(`http://localhost:8000/patient/api/${pid}/createappointment`, formData)
      .then((response) => {
        window.alert("Created an appointment!");
        navigate(`/myappointment/${pid}`);
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response.data);
          window.alert(`Error: ${err.response.data.message}`);
        } else {
          console.log(err);
          window.alert("An error occurred while creating the appointment.");
        }
      });
  };

  // Handle checkbox changes for services
  const handleServiceChange = (serviceId) => {
    setSelectedServices((prevSelected) => {
      if (prevSelected.includes(serviceId)) {
        return prevSelected.filter((id) => id !== serviceId); // Remove if already selected
      } else {
        return [...prevSelected, serviceId]; // Add if not selected
      }
    });
  };

  // Fetch doctor's availability and name
  useEffect(() => {
    axios
      .get(`http://localhost:8000/doctor/${did}/available`)
      .then((response) => {
        const { availability, activeAppointmentStatus } = response.data;
        setAvailability(availability);
        setActiveAppointmentStatus(activeAppointmentStatus);
      })
      .catch((err) => {
        console.log(err.response.data);
      });

    axios
      .get(`http://localhost:8000/doctor/api/finduser/${did}`)
      .then((res) => {
        const doctor = res.data.theDoctor;
        const formattedName = `${doctor.dr_firstName} ${
          doctor.dr_middleInitial ? doctor.dr_middleInitial + "." : ""
        } ${doctor.dr_lastName}`;
        setDoctorName(formattedName);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [did]);

  useEffect(() => {
    if (date) {
      const selectedDate = new Date(date);
      const daysOfWeek = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const day = daysOfWeek[selectedDate.getDay()];

      const times = getAvailableTimes(day);
      setAvailableTimes(times);
    } else {
      setAvailableTimes([]);
    }
  }, [date, did, availability]);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getAvailableTimes = (day) => {
    const dayAvailability = availability[day];
    if (!dayAvailability) return [];

    let times = [];
    if (dayAvailability.morning.available) {
      const morningTime = `${new Date(
        `1970-01-01T${dayAvailability.morning.startTime}`
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${new Date(
        `1970-01-01T${dayAvailability.morning.endTime}`
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      times.push({ label: "Morning", timeRange: morningTime });
    }

    if (dayAvailability.afternoon.available) {
      const afternoonTime = `${new Date(
        `1970-01-01T${dayAvailability.afternoon.startTime}`
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${new Date(
        `1970-01-01T${dayAvailability.afternoon.endTime}`
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      times.push({ label: "Afternoon", timeRange: afternoonTime });
    }

    return times;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!date || !time || !reason) {
        window.alert("Please fill out all fields.");
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const todayDate = getTodayDate();

  return (
    <>
      <PatientNavBar />
      <Container className="appointment-form-container">
        <h1>Book an Appointment with Dr. {doctorName}</h1>
        <div className="steps d-flex flex-wrap flex-sm-nowrap justify-content-between padding-top-2x padding-bottom-1x">
          <div className={`step ${step >= 1 ? "completed" : ""} ${step === 1 ? "active" : ""}`}>
            <div className="step-icon-wrap">
              <div className="step-icon">
                <PassFill size={20} />
              </div>
            </div>
            <h4 className="step-title">Fill Out the Form</h4>
          </div>
          <div className={`step ${step === 2 ? "completed" : ""} ${step === 2 ? "active" : ""}`}>
            <div className="step-icon-wrap">
              <div className="step-icon">
                <CheckAll size={20} />
              </div>
            </div>
            <h4 className="step-title">Finalizing Information</h4>
          </div>
        </div>
        {/* Steps */}
        {step === 1 && (
          <div>
            <h4>Step 1: Fill Out the Form</h4>
            <Form>
              <Row>
                <Form.Group as={Col} className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    placeholder="Enter Date"
                    min={todayDate}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </Form.Group>
              </Row>
              {availableTimes.length > 0 ? (
                <Row>
                  <Form.Group as={Col} className="mb-3">
                    <Form.Label>Time</Form.Label>
                    <center>
                      <div>
                        {availableTimes.map((timeSlot, index) => (
                          <Button
                            key={index}
                            variant={time === timeSlot.timeRange ? "secondary" : "outline-primary"}
                            onClick={() => setTime(timeSlot.timeRange)}
                            disabled={time === timeSlot.timeRange}
                            className="m-1"
                          >
                            {timeSlot.label}: {timeSlot.timeRange}
                          </Button>
                        ))}
                      </div>
                    </center>
                  </Form.Group>
                </Row>
              ) : (
                <Row>
                  <Form.Group as={Col} className="mb-3">
                    <Form.Label>Time</Form.Label>
                    <center>
                      <div>
                        <h5>The doctor has no available appointments for this day.</h5>
                      </div>
                    </center>
                  </Form.Group>
                </Row>
              )}

              {/* Add services as checkboxes */}
              <Row>
                <Form.Group as={Col} className="mb-3">
                  <Form.Label>Select Services (Appointment Type)</Form.Label>
                  <div>
                    {services.map((service) => (
                      <Form.Check
                        key={service._id}
                        type="checkbox"
                        label={service.name}
                        value={service.name}
                        onChange={() => handleServiceChange(service.name)}
                        checked={selectedServices.includes(service.name)}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Row>

              <Row>
                <Form.Group as={Col} className="mb-3">
                  <Form.Label>Primary Concern</Form.Label>
                  <Form.Control
                    as="textarea"
                    placeholder="Enter Reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </Form.Group>
              </Row>
            </Form>
          </div>
        )}
        {step === 2 && (
          <div>
            <h4>Step 2: Finalizing Information</h4>
            <div>
              <div>
                <p>Date: {date}</p>
                <p>Time: {time}</p>
                <p>Primary Concern: {reason}</p>
                <p>Services: {selectedServices.join(", ")}</p>
              </div>
            </div>
          </div>
        )}
        <div className="d-flex justify-content-between mt-4">
          {step > 1 && (
            <Button variant="secondary" onClick={handlePrevStep}>
              Previous
            </Button>
          )}
          {step < 2 && (
            <Button variant="primary" onClick={handleNextStep}>
              Next
            </Button>
          )}
          {step === 2 && (
            <Button variant="success" onClick={createAppointment}>
              Submit
            </Button>
          )}
        </div>
      </Container>
    </>
  );
}

export default AppointmentForm;
