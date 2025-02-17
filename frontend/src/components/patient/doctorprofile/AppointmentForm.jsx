import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import { PassFill, CheckAll } from "react-bootstrap-icons";
import { Helmet } from "react-helmet";
import { ip } from "../../../ContentExport";

function AppointmentForm({ pid, did }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(""); 
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availability, setAvailability] = useState({});
  const [doctorName, setDoctorName] = useState("");
  const [bookedPatients, setBookedPatients] = useState({
    morning: 0,
    afternoon: 0,
  });
  const [loading, setLoading] = useState(true); 

  const formatTicketDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const dayOfWeek = date.toLocaleString("default", { weekday: "short" });
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    return { day, dayOfWeek, month, year };
  };

  useEffect(() => {
    const today = getTodayDate();
    setDate(today);

    
    axios
      .get(`${ip.address}/api/doctor/${did}`)
      .then((response) => {
        const doctor = response.data.doctor;
        console.log("Doctor API bookedslots:", doctor.bookedSlots);
        console.log("Doctor API availability:", doctor.availability);
        setDoctorName(`${doctor.dr_firstName} ${doctor.dr_lastName}`);
        setAvailability(doctor.availability || {});
      })
      .catch((err) => {
        console.log(err);
      });
  }, [did]);

  useEffect(() => {
    if (date) {
      const fetchAppointments = async () => {
        try {
          setLoading(true); 
  
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
  
          
          const response = await axios.get(
            `${ip.address}/api/appointments/doctor/${did}/count?date=${date}`
          );
  
          console.log("Booked patients API response:", response.data, date);
          const { morning, afternoon } = response.data;
  
          setBookedPatients({ morning, afternoon });
  
          
          const updatedTimes = getAvailableTimes(day, morning, afternoon);
          setAvailableTimes(updatedTimes);
  
        } catch (err) {
          console.log("Error fetching appointments:", err);
        } finally {
          setLoading(false); 
        }
      };
  
      fetchAppointments(); 
    } else {
      setAvailableTimes([]); 
      setLoading(false); 
    }
  }, [date, availability, did]);

  const getAvailableTimes = (day, morningCount = 0, afternoonCount = 0) => {
    const dayAvailability = availability[day];
    if (!dayAvailability) return [];
  
    let times = [];
  
    if (dayAvailability.morning?.available) {
      const startTime = formatTime(dayAvailability.morning.startTime);
      const endTime = formatTime(dayAvailability.morning.endTime);
      const availableSlots = Math.max(
        dayAvailability.morning.maxPatients - morningCount,
        0
      );
  
      if (availableSlots > 0) {
        times.push({
          label: "Morning",
          timeRange: `${startTime} - ${endTime}`,
          availableSlots,
          period: "morning",
        });
      }
    }
  
    if (dayAvailability.afternoon?.available) {
      const startTime = formatTime(dayAvailability.afternoon.startTime);
      const endTime = formatTime(dayAvailability.afternoon.endTime);
      const availableSlots = Math.max(
        dayAvailability.afternoon.maxPatients - afternoonCount,
        0
      );
  
      if (availableSlots > 0) {
        times.push({
          label: "Afternoon",
          timeRange: `${startTime} - ${endTime}`,
          availableSlots,
          period: "afternoon",
        });
      }
    }
  
    return times;
  };

  const createAppointment = () => {
    if (!date || !time) {
      window.alert("Please select a valid date and time for the appointment.");
      return;
    }
  
    const formData = {
      doctor: did || null,
      date,
      time: time || null,
      reason,
      appointment_type: {
        appointment_type: "Consultation", 
        category: "General", 
      },
    };
  
    axios
      .post(`${ip.address}/api/patient/api/${pid}/createappointment`, formData)
      .then(() => {
        window.alert("Created an appointment!");
  
        
        const updatedAvailableTimes = availableTimes.map((slot) => {
          if (slot.timeRange === time) {
            return { ...slot, availableSlots: slot.availableSlots - 1 };
          }
          return slot;
        });
  
        setAvailableTimes(updatedAvailableTimes); 
  
        
        const period = updatedAvailableTimes.find(
          (slot) => slot.timeRange === time
        )?.period;
        setBookedPatients((prev) => ({
          ...prev,
          [period]: prev[period] + 1, 
        }));
  
        navigate("/myappointment", { state: { pid } });
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

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!date || !time || !reason) {
        window.alert("Please fill out all fields.");
        return;
      }

      const selectedPeriod = availableTimes.find(
        (timeSlot) => timeSlot.timeRange === time
      );

      if (!selectedPeriod || selectedPeriod.availableSlots <= 0) {
        window.alert(
          `No available slots for the ${
            selectedPeriod?.label || "selected"
          } period. Please choose another date or time.`
        );
        return;
      }
    }

    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const time = new Date();
    time.setHours(hours);
    time.setMinutes(minutes);

    return time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <Helmet>
        <title>Molino Care | Patient</title>
      </Helmet>
      <Container className="appointment-form-container">
        <div className="d-flex">
          <p className="m-0" style={{ fontWeight: "600", fontSize: "20px" }}>
            Book an Appointment
          </p>
        </div>
        <hr />

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
                      <Form.Label style={{ fontWeight: "600" }}>
                        Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        placeholder="Enter Date"
                        min={getTodayDate()}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="form-appointment"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {loading ? (
                  <Spinner animation="border" />
                ) : availableTimes.length > 0 ? (
                  <Row>
                    <Form.Group as={Col} className="mb-5">
                      <Form.Label style={{ fontWeight: "600" }} className="m-0">
                        Time
                      </Form.Label>{" "}
                      <center>
                        {" "}
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
                            {" "}
                            {timeSlot.label}: {timeSlot.timeRange} <br /> Slots
                            left: {timeSlot.availableSlots}{" "}
                          </Button>
                        ))}{" "}
                      </center>{" "}
                    </Form.Group>{" "}
                  </Row>
                ) : (
                  <Row>
                    {" "}
                    <Form.Group as={Col} className="mb-3">
                      {" "}
                      <Form.Label style={{ fontWeight: "600" }}>
                        Time
                      </Form.Label>{" "}
                      <Alert>
                        <h6 className="m-0">
                          The doctor has no available appointments for this day.
                        </h6>
                      </Alert>{" "}
                    </Form.Group>{" "}
                  </Row>
                )}
                <Row>
                  <Form.Group as={Col} className="mb-3">
                    <Form.Label style={{ fontWeight: "600" }}>
                      Primary Concern
                    </Form.Label>
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
            <h6>Step 2: Finalizing Information</h6>
            <Container>
              <div className="ticket-container">
                <div className="ticket-item">
                  <div className="ticket-left">
                    {date && (
                      <>
                        <Container className="pt-4">
                          <p className="ticket-month">
                            {formatTicketDate(date).month}
                          </p>
                          <h2 className="ticket-num">
                            {formatTicketDate(date).day}
                          </h2>
                          <p className="ticket-month">
                            {formatTicketDate(date).dayOfWeek}
                          </p>
                        </Container>
                      </>
                    )}
                    <span className="ticket-up-border"></span>
                    <span className="ticket-down-border"></span>
                  </div>
                  <div className="ticket-right">
                    <Container>
                      <p className="ticket-event">Appointment Details</p>
                      <hr />
                    </Container>

                    <Container className="d-flex align-items-center m-0 pb-3">
                      <div className="ticket-icon">
                        <i className="fa fa-table"></i>
                      </div>
                      <p className="m-0 px-2">
                        {formatTicketDate(date).month}{" "}
                        {formatTicketDate(date).day},{" "}
                        {formatTicketDate(date).year} <br /> {time}
                      </p>
                    </Container>

                    <Container className="d-flex align-items-center m-0 pb-3">
                      <div className="ticket-icon">
                        <i className="fa fa-info-circle"></i>
                      </div>
                      <p className="m-0 px-2">Primary Concern: {reason}</p>
                    </Container>

                    <div className="fix"></div>
                  </div>
                </div>
              </div>
            </Container>
          </>
        )}

        <div className="d-flex justify-content-between mt-4">
          {step > 1 && (
            <Button variant="secondary" onClick={handlePrevStep}>
              Previous
            </Button>
          )}
          {step < 2 && (
            <div className="d-flex w-100 justify-content-end">
              <Button
                variant="primary"
                onClick={handleNextStep}
                disabled={availableTimes.every(
                  (timeSlot) => timeSlot.availableSlots <= 0
                )}
              >
                Next
              </Button>
            </div>
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
