import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import axios from "axios";
import { PassFill, CheckAll } from "react-bootstrap-icons";
import { Helmet } from "react-helmet";

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
  const [doctorServices, setDoctorServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    // Fetch doctor's services, availability, and name
    axios
      .get(`http://localhost:8000/doctor/${did}`)
      .then((response) => {
        const doctor = response.data.doctor;
        setDoctorName(`${doctor.dr_firstName} ${doctor.dr_lastName}`);
        setDoctorServices(doctor.dr_services || []);
        setAvailability(doctor.availability || {});
      })
      .catch((err) => {
        console.log(err);
      });
  }, [did]);

  const formatTicketDate = (dateString) => {
    const date = new Date(dateString);
  
    const day = String(date.getDate()).padStart(2, '0'); // Get day
    const dayOfWeek = date.toLocaleString('default', { weekday: 'short' }); // Get weekday abbreviation (e.g., Sat)
    const month = date.toLocaleString('default', { month: 'long' }); // Get full month name (e.g., September)
    const year = date.getFullYear(); // Get year
  
    return { day, dayOfWeek, month, year };
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return ""; // Handle cases where time is not provided or is invalid
  
    // Split the time string into hours and minutes (handle both "HH:MM" and "HH:MM:SS")
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(hours);
    time.setMinutes(minutes);
  
    // Return the time in 12-hour format with AM/PM
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  
  
  
  

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
      setAvailableTimes(getAvailableTimes(day));
    } else {
      setAvailableTimes([]);
    }
  }, [date, availability]);

  const getAvailableTimes = (day) => {
    const dayAvailability = availability[day];
    if (!dayAvailability) return [];
  
    let times = [];
    if (dayAvailability.morning?.available) {
      // Convert both start and end times to 12-hour format
      const startTime = formatTime(dayAvailability.morning.startTime);
      const endTime = formatTime(dayAvailability.morning.endTime);
  
      times.push({
        label: "Morning",
        timeRange: `${startTime} - ${endTime}`,
      });
    }
    if (dayAvailability.afternoon?.available) {
      // Convert both start and end times to 12-hour format
      const startTime = formatTime(dayAvailability.afternoon.startTime);
      const endTime = formatTime(dayAvailability.afternoon.endTime);
  
      times.push({
        label: "Afternoon",
        timeRange: `${startTime} - ${endTime}`,
      });
    }
    return times;
  };
  

  const handleServiceChange = (serviceId) => {
    setSelectedServices((prevSelected) =>
      prevSelected.includes(serviceId)
        ? prevSelected.filter((id) => id !== serviceId)
        : [...prevSelected, serviceId]
    );
  };

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
      appointment_type: selectedServices,
    };

    axios
      .post(`http://localhost:8000/patient/api/${pid}/createappointment`, formData)
      .then(() => {
        window.alert("Created an appointment!");
        navigate(`/myappointment/${pid}`);
      })
      .catch((err) => {
        if (err.response) {
          window.alert(`Error: ${err.response.data.message}`);
        } else {
          window.alert("An error occurred while creating the appointment.");
        }
      });
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleNextStep = () => {
    if (
      step === 1 &&
      (!date || !time || !reason || selectedServices.length === 0)
    ) {
      window.alert("Please fill out all fields.");
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const todayDate = getTodayDate();

  return (
    <>
      <Helmet>
        <title>Molino Care | Patient</title>
      </Helmet>
      <Container className="appointment-form-container">
       
        <div className="d-flex">
          <p className="m-0" style={{fontWeight:'600', fontSize:'20px'}}>Book an Appointment</p>
       
        </div>
        <hr/>
        

        <Container className="pt-2 pb-3">
          <div className="mt-3 steps d-flex flex-wrap flex-sm-nowrap justify-content-between padding-top-2x padding-bottom-1x">
            <div
              className={`step ${step >= 1 ? "completed" : ""} ${
                step === 1 ? "active" : ""
              }`}
            >
              <div className="step-icon-wrap">
                <div className="step-icon">
                  <PassFill size={20} />
                </div>
              </div>
              <h4 className="step-title">Fill Out the Form</h4>
            </div>
            <div
              className={`step ${step === 2 ? "completed" : ""} ${
                step === 2 ? "active" : ""
              }`}
            >
              <div className="step-icon-wrap">
                <div className="step-icon">
                  <CheckAll size={20} />
                </div>
              </div>
              <h4 className="step-title">Finalizing Information</h4>
            </div>
          </div>

        </Container>
        

        {step === 1 && (
          <div>
            <h6>Step 1: Fill Out the Form</h6>

            <Container>

           
            <Form>
              <Row>
                <Col>
                <Form.Group as={Col} className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    placeholder="Enter Date"
                    min={todayDate}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-appointment"
                  />
                </Form.Group>
                
                </Col>

              </Row>

              {availableTimes.length > 0 ? (
                <Row>
                  <Form.Group as={Col} className="mb-3">
                    <Form.Label>Time</Form.Label>
                    <center>
                      {availableTimes.map((timeSlot, index) => (
                        <Button
                          key={index}
                          variant={
                            time === timeSlot.timeRange
                              ? "secondary"
                              : "outline-primary"
                          }
                          onClick={() => setTime(timeSlot.timeRange)}
                          className="m-1"
                        >
                          {timeSlot.label}: {timeSlot.timeRange}
                        </Button>
                      ))}
                    </center>
                  </Form.Group>
                </Row>
              ) : (
                <Row>
                  <Form.Group as={Col} className="mb-3">
                    <Form.Label>Time</Form.Label>
                    <center>
                      <h5>The doctor has no available appointments for this day.</h5>
                    </center>
                  </Form.Group>
                </Row>
              )}

              

              {/* Add doctor's services as checkboxes */}
              <Row>
                <Form.Group as={Col} className="mb-3">
                  <Form.Label>Select Services: </Form.Label>
                  <div>
                    {doctorServices.map((service) => (
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
            </Container>
          </div>
        )}

        {step === 2 && (
          <>
          <h6 >Step 2: Finalizing Information</h6>
          <Container >
            
            <div className="ticket-container">
              <div className="ticket-item">
                <div className="ticket-left">
                  {/* Format the date with the helper function */}
                  {date && (
                    <>
                    <Container className="pt-4">
                      <p className="ticket-month">{formatTicketDate(date).month}</p>
                      <h2 className="ticket-num">{formatTicketDate(date).day}</h2>
                      <p className="ticket-month">{formatTicketDate(date).dayOfWeek}</p>
                      
                    </Container>
                    </>
                  )}
                  <span className="ticket-up-border"></span>
                  <span className="ticket-down-border"></span>
                </div>
                <div className="ticket-right">
                  <Container>
                    <p className="ticket-event">Appointment Details</p>
                    <hr/>
                  </Container>
                  
                  <Container className="d-flex align-items-center m-0 pb-3">
                    <div className="ticket-icon">
                      <i className="fa fa-table"></i>
                    </div>
                    <p  className="m-0 px-2">{formatTicketDate(date).month} {formatTicketDate(date).day}, {formatTicketDate(date).year} <br /> {time}</p>
                  </Container>

                  <Container  className="d-flex align-items-center m-0 pb-3">
                    <div className="ticket-icon">
                      <i className="fa fa-info-circle"></i>
                    </div>
                    <p  className="m-0 px-2 ">Primary Concern: {reason}</p>
                  </Container>

                  <div className="fix"></div>
                  <Container className="d-flex align-items-center m-0">
                    <div className="ticket-icon">
                      <i className="fa fa-stethoscope"></i>
                    </div>
                    <p className="m-0 px-2">Services: {selectedServices.join(", ")}</p>
                  </Container>
                </div> 
              </div>
            </div>
          </Container>
          </>)}



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
