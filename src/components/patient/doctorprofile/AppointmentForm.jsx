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
  const [medium, setMedium] = useState("Online");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [availability, setAvailability] = useState({});
  const [doctorName, setDoctorName] = useState("");
  const [activeAppointmentStatus, setActiveAppointmentStatus] = useState(true);
  const [totalAvailableSlots, setTotalAvailableSlots] = useState(0);

  const createAppointment = () => {
    if (!time) {
      window.alert("Please select a valid time for the appointment.");
      return;
    }

    const formData = {
      doctorId: did,
      date,
      time,
      reason,
      medium,
    };

    axios
      .post(
        `http://localhost:8000/patient/api/${pid}/createappointment`,
        formData
      )
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

  // Getting the information and status
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
      setTotalAvailableSlots(times.length);

      axios
        .get(`http://localhost:8000/doctor/${did}/booked-slots?date=${date}`)
        .then((response) => {
          setBookedTimes(response.data.bookedSlots);
        })
        .catch((err) => {
          console.log(err.response.data);
        });
    } else {
      setAvailableTimes([]);
      setBookedTimes([]);
      setTotalAvailableSlots(0);
    }
  }, [date, did, availability]);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const generateTimeIntervals = (start, end, interval) => {
    const times = [];
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    let currentTime = new Date(1970, 0, 1, startHour, startMinute);
    const endTime = new Date(1970, 0, 1, endHour, endMinute);

    while (currentTime <= endTime) {
      times.push(
        currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      currentTime = new Date(currentTime.getTime() + interval * 60000);
    }

    return times;
  };

  const getAvailableTimes = (day) => {
    const dayAvailability = availability[day];
    if (!dayAvailability) return [];

    let times = [];
    if (dayAvailability.morning.available) {
      const morningTimes = generateTimeIntervals(
        dayAvailability.morning.startTime,
        dayAvailability.morning.endTime,
        dayAvailability.morning.interval || 30
      );
      times = times.concat(morningTimes);
    }
    if (dayAvailability.afternoon.available) {
      const afternoonTimes = generateTimeIntervals(
        dayAvailability.afternoon.startTime,
        dayAvailability.afternoon.endTime,
        dayAvailability.afternoon.interval || 30
      );
      times = times.concat(afternoonTimes);
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
  const availableSlots = totalAvailableSlots - bookedTimes.length;

  return (
    <>
      <PatientNavBar />
      <Container className="appointment-form-container">
        <h1>Book an Appointment with Dr. {doctorName}</h1>
        <div className="steps d-flex flex-wrap flex-sm-nowrap justify-content-between padding-top-2x padding-bottom-1x">
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
                            variant="outline-primary"
                            onClick={() => setTime(timeSlot)}
                            disabled={
                              bookedTimes.includes(timeSlot) ||
                              time === timeSlot
                            }
                            className="m-1"
                          >
                            {timeSlot}
                          </Button>
                        ))}
                      </div>
                    </center>
                  </Form.Group>
                  <center>
                    <h5>Slots Available: {availableSlots}</h5>
                  </center>
                </Row>
              ) : (
                <Row>
                  <Form.Group as={Col} className="mb-3">
                    <Form.Label>Time</Form.Label>
                    <center>
                      <div>
                        <h5>
                          The doctor has no available appointments for this day.
                        </h5>
                      </div>
                    </center>
                  </Form.Group>
                </Row>
              )}

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
              <Row>
                <Form.Group as={Col} className="mb-3">
                  <Form.Label>Medium</Form.Label>
                  <Form.Check
                    type="radio"
                    label="Online"
                    name="medium"
                    checked={medium === "Online"}
                    onChange={() => setMedium("Online")}
                  />
                  <Form.Check
                    type="radio"
                    label="Face to Face"
                    name="medium"
                    checked={medium === "Face to Face"}
                    onChange={() => setMedium("Face to Face")}
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
                <p>Medium: {medium}</p>
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
