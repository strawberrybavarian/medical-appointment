import axios from "axios";
import { useState, useEffect } from "react";
import { Row, Col, Button, Form, Modal } from 'react-bootstrap';
import Select from 'react-select';
import { ip } from "../../../../../ContentExport";

function AssignAppointmentModal({ show, handleClose, appointmentId }) {
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]); // Store available services
  const [selectedService, setSelectedService] = useState(null); // Store selected service
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(""); // Store time in AM/PM format
  const [availability, setAvailability] = useState({});
  const [morningTimeRange, setMorningTimeRange] = useState("");
  const [afternoonTimeRange, setAfternoonTimeRange] = useState("");
  const [bookedSlots, setBookedSlots] = useState({ morning: 0, afternoon: 0 });
  const [availableSlots, setAvailableSlots] = useState({ morning: 0, afternoon: 0 });

  // Fetch all doctors
  useEffect(() => {
    axios.get(`${ip.address}/api/doctor/api/alldoctor`)
      .then((response) => {
        const doctorOptions = response.data.theDoctor.map((doctor) => ({
          value: doctor._id,
          label: `${doctor.dr_firstName} ${doctor.dr_middleInitial}. ${doctor.dr_lastName}`,
        }));
        setDoctors(doctorOptions);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // Fetch doctor's availability and services based on the selected doctor
  useEffect(() => {
    if (selectedDoctor) {
      axios.get(`${ip.address}/api/doctor/${selectedDoctor.value}`)
        .then((response) => {
          const doctor = response.data.doctor;
          setDoctorName(`${doctor.dr_firstName} ${doctor.dr_middleInitial}. ${doctor.dr_lastName}`);
          setAvailability(doctor.availability || {});
          setServices(doctor.dr_services || []); // Fetch only doctor's specific services
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      // Fetch all services if no doctor is selected
      axios.get(`${ip.address}/api/admin/getall/services`)
        .then((response) => {
          setServices(response.data); // Fetch all available services
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [selectedDoctor]);

  // Fetch existing appointment details when the modal is opened
  useEffect(() => {
    if (show && appointmentId) {
      axios.get(`${ip.address}/api/appointments/${appointmentId}`)
        .then((response) => {
          const appointment = response.data;

          // Pre-fill the form fields with appointment details
          if (appointment.doctor) {
            setSelectedDoctor({
              value: appointment.doctor._id,
              label: `${appointment.doctor.dr_firstName} ${appointment.doctor.dr_middleInitial}. ${appointment.doctor.dr_lastName}`
            });
          }
          if (appointment.appointment_type) {
            setSelectedService({
              value: appointment.appointment_type._id,
              label: appointment.appointment_type.appointment_type,
              category: appointment.appointment_type.category
            });
          }
          if (appointment.date) {
            setDate(new Date(appointment.date).toISOString().split('T')[0]); // Format date for the input
          }
          if (appointment.time) {
            setTime(appointment.time); // Assuming time is in AM/PM format
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [show, appointmentId]);

  // Function to generate time range in 12-hour format with AM/PM for display
  const generateTimeRange = (start, end) => {
    const startTime = new Date(`1970-01-01T${start}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const endTime = new Date(`1970-01-01T${end}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${startTime} - ${endTime}`;
  };

  // Update available time slots based on selected date and doctor
  useEffect(() => {
    if (date && selectedDoctor) {
      const selectedDate = new Date(date);
      const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const day = daysOfWeek[selectedDate.getDay()];

      if (availability[day]) {
        const dayAvailability = availability[day];

        // Fetch booked slots for the selected date and doctor
        axios
          .get(`${ip.address}/api/doctor/${selectedDoctor.value}/booked-slots?date=${date}`)
          .then((response) => {
            console.log('Booked slots response:', response.data);
            const bookedSlots = response.data.bookedSlots || [];

            // Count morning and afternoon bookings
            const morningBookedCount = bookedSlots.filter((time) => {
              const hour = parseInt(time.split(':')[0], 10);
              return hour < 12;
            }).length;

            const afternoonBookedCount = bookedSlots.filter((time) => {
              const hour = parseInt(time.split(':')[0], 10);
              return hour >= 12;
            }).length;

            setBookedSlots({ morning: morningBookedCount, afternoon: afternoonBookedCount });

            // Calculate available slots
            let morningTimeRange = "";
            let afternoonTimeRange = "";
            let morningAvailableSlots = 0;
            let afternoonAvailableSlots = 0;

            if (dayAvailability.morning?.available) {
              morningTimeRange = generateTimeRange(dayAvailability.morning.startTime, dayAvailability.morning.endTime);
              morningAvailableSlots = dayAvailability.morning.maxPatients - morningBookedCount;
            }

            if (dayAvailability.afternoon?.available) {
              afternoonTimeRange = generateTimeRange(dayAvailability.afternoon.startTime, dayAvailability.afternoon.endTime);
              afternoonAvailableSlots = dayAvailability.afternoon.maxPatients - afternoonBookedCount;
            }

            setMorningTimeRange(morningTimeRange);
            setAfternoonTimeRange(afternoonTimeRange);
            setAvailableSlots({ morning: morningAvailableSlots, afternoon: afternoonAvailableSlots });
          })
          .catch((err) => {
            console.log(err);
            setMorningTimeRange("");
            setAfternoonTimeRange("");
            setAvailableSlots({ morning: 0, afternoon: 0 });
          });
      } else {
        setMorningTimeRange("");
        setAfternoonTimeRange("");
        setAvailableSlots({ morning: 0, afternoon: 0 });
      }
    } else {
      setMorningTimeRange("");
      setAfternoonTimeRange("");
      setAvailableSlots({ morning: 0, afternoon: 0 });
    }
  }, [date, availability, selectedDoctor]);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  // Function to handle time selection and directly set AM/PM formatted time
  const handleTimeSelection = (selectedTime) => {
    setTime(selectedTime); // Save time directly in AM/PM format
  };

  // Handle appointment update
  const updateAppointment = () => {
    if (selectedDoctor && !selectedDoctor.value) {
      window.alert("Please select a valid doctor.");
      return;
    }

    if (!date || !time || !selectedService) {
      window.alert("Please select a valid date, time, and service.");
      return;
    }

    const appointmentType = {
      appointment_type: selectedService.label,
      category: selectedService.category || 'General'
    };

    // Check if the selected time period has available slots
    let period = '';
    if (time === morningTimeRange) {
      period = 'morning';
      if (availableSlots.morning <= 0) {
        window.alert('No available slots for the selected morning period.');
        return;
      }
    } else if (time === afternoonTimeRange) {
      period = 'afternoon';
      if (availableSlots.afternoon <= 0) {
        window.alert('No available slots for the selected afternoon period.');
        return;
      }
    } else {
      // Custom time
      period = 'custom';
    }

    const formData = {
      doctor: selectedDoctor ? selectedDoctor.value : null,
      appointment_type: appointmentType,
      date,
      time,
    };

    axios.put(`${ip.address}/api/appointments/${appointmentId}/assign`, formData)
      .then(() => {
        window.alert("Appointment updated successfully!");
        // After successful update, decrease the available slots
        if (period === 'morning' || period === 'afternoon') {
          setAvailableSlots(prevSlots => ({
            ...prevSlots,
            [period]: prevSlots[period] - 1
          }));
        }
        window.location.reload();
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response.data);
          window.alert(`Error: ${err.response.data.message}`);
        } else {
          console.log(err);
          window.alert('An error occurred while updating the appointment.');
        }
      });
  };

  return (
    <Modal show={show} onHide={handleClose} className='am-overlay'>
      <Modal.Header className="am-header" closeButton>
        <Modal.Title>Assign Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body className="w-100">
        {/* Doctor Selection with react-select */}
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Select Doctor</Form.Label>
          <Select
            options={doctors}
            value={selectedDoctor}
            onChange={(selected) => {
              setSelectedDoctor(selected);
              if (!selected) {
                setSelectedService(null);
                setDoctorName("");
                setDate("");
                setTime("");
                setAvailability({});
                setMorningTimeRange("");
                setAfternoonTimeRange("");
                setAvailableSlots({ morning: 0, afternoon: 0 });
              }
            }}
            placeholder="Search for a doctor"
            isClearable={true}
          />
        </Form.Group>

        {/* Service Selection with react-select */}
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Select Service</Form.Label>
          <Select
            options={services.map(service => ({
              value: service._id,
              label: service.name,
              category: service.category  // Assuming the category field is available
            }))}
            value={selectedService}
            onChange={(selected) => setSelectedService(selected)}
            placeholder="Select a service"
            isClearable={true}
          />
        </Form.Group>

        {/* Date Selection */}
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            min={todayDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Form.Group>

        {/* Time Selection */}
        <Form.Group as={Col} className="mb-3">
          <Form.Label>Time</Form.Label>
          {morningTimeRange && availableSlots.morning > 0 && (
            <Button
              variant={time === morningTimeRange ? "secondary" : "outline-primary"}
              onClick={() => handleTimeSelection(morningTimeRange)}
              className="m-1"
            >
              Morning: {morningTimeRange} <br />
              Slots left: {availableSlots.morning}
            </Button>
          )}
          {afternoonTimeRange && availableSlots.afternoon > 0 && (
            <Button
              variant={time === afternoonTimeRange ? "secondary" : "outline-primary"}
              onClick={() => handleTimeSelection(afternoonTimeRange)}
              className="m-1"
            >
              Afternoon: {afternoonTimeRange} <br />
              Slots left: {availableSlots.afternoon}
            </Button>
          )}
          {(!morningTimeRange || availableSlots.morning <= 0) && (!afternoonTimeRange || availableSlots.afternoon <= 0) && (
            <Form.Control
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Enter time"
              required
            />
          )}
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={updateAppointment}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AssignAppointmentModal;
