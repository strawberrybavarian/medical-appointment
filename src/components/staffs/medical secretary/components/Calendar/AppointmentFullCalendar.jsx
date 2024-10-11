import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // Required for styling
import axios from 'axios';
import { Container, Card } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation
import { ip } from '../../../../../ContentExport';
function AppointmentFullCalendar() {
  const [allAppointments, setAllappointments] = useState([]);
  const calendarRef = useRef(null); // Reference to FullCalendar
  const navigate = useNavigate(); // Replace useHistory with useNavigate
  const location = useLocation(); // Use useLocation to get the passed state

  // Extract userId, userName, and role from location state
  const { userId: msid, userName: name, role: roles } = location.state || {};

  // State variable for headerToolbar
  const [headerToolbar, setHeaderToolbar] = useState({
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  });

  useEffect(() => {
    axios
      .get(`${ip.address}/medicalsecretary/api/allappointments`)
      .then((result) => {
        setAllappointments(result.data.Appointments);
      })
      .catch((error) => {
        console.log(error);
      });

    // Handle window resize
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Small screen
        setHeaderToolbar({
          left: 'prev,next',
          center: 'title',
          right: 'today',
        });
      } else {
        // Large screen
        setHeaderToolbar({
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial state

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const parseTimeString = (timeString) => {
    if (!timeString) return '00:00:00'; // Default to midnight if time is not provided

    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }

    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }

    return `${hours}:${minutes}:00`;
  };

  const events = allAppointments.map((appointment) => {
    const datePart = appointment.date.split('T')[0];
    const timePart = appointment.time ? parseTimeString(appointment.time) : '00:00:00'; // Fallback to '00:00:00' if no time
    const dateTimeString = `${datePart}T${timePart}`;
    const startTime = new Date(dateTimeString);

    return {
      id: appointment._id,
      title: `${appointment.patient.patient_firstName} ${appointment.patient.patient_lastName}`,
      start: startTime,
      end: new Date(startTime.getTime() + 30 * 60000),
      description: appointment.reason,
      status: appointment.status,
      doctorName: appointment.doctor
        ? `${appointment.doctor.dr_firstName} ${appointment.doctor.dr_lastName}`
        : 'No doctor assigned',
    };
  });

  const handleEventClick = (eventInfo) => {
    const { status } = eventInfo.event.extendedProps; // Get status from extendedProps

    // Determine the correct tab based on the appointment status
    let tab;
    if (status === 'Scheduled') {
      tab = 'todays';
    } else if (status === 'Ongoing') {
      tab = 'ongoing';
    } else if (status === 'Pending') {
      tab = 'pending';
    }

    // If a valid tab is found, navigate to the respective URL
    if (tab) {
      navigate(`/medsec/appointments?tab=${tab}`, {
        state: { userId: msid, userName: name, role: roles },
      });
    }
  };

  const renderEventContent = (eventInfo) => {
    const tooltipContent = `
      <strong>Patient:</strong> ${eventInfo.event.title} <br/>
      <strong>Doctor:</strong> ${eventInfo.event.extendedProps.doctorName} <br/>
      <strong>Concern:</strong> ${eventInfo.event.extendedProps.description} <br/>
      <strong>Start:</strong> ${eventInfo.event.start.toLocaleTimeString()} <br/>
      <strong>Status:</strong> ${eventInfo.event.extendedProps.status}
    `;

    return (
      <Tippy
        content={<span dangerouslySetInnerHTML={{ __html: tooltipContent }} />}
        allowHTML={true}
        theme="light-border"
      >
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => handleEventClick(eventInfo)} // Attach click handler here
        >
          {eventInfo.event.title}
        </div>
      </Tippy>
    );
  };

  const getEventClassNames = (eventInfo) => {
    return [eventInfo.event.extendedProps.status]; // Apply the status as a class name
  };

  const handleDatesRender = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      if (calendarApi) {
        const calendarEl = calendarApi.el;
        calendarEl.style.transition = 'transform 2s ease-in-out';
        calendarEl.style.transform = 'translateX(100%)'; // Start from the right
        setTimeout(() => {
          calendarEl.style.transform = 'translateX(0)'; // Slide to center
        }, 10); // Slight delay to allow transition to take effect
      }
    }
  };

  return (
    <div className="d-flex justify-content-between pt-3">
      <Card className="shadow mb-4 w-100">
        <Card.Header className="py-3">
          <h6 className="m-0 font-weight-bold text-primary">Appointment Calendar</h6>
        </Card.Header>
        <Card.Body>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={headerToolbar} // Use the responsive headerToolbar
            height="auto" // Or a fixed height like '500px'
            events={events}
            editable={false}
            selectable={true}
            eventContent={renderEventContent} // Use eventContent to render custom event content
            eventClassNames={getEventClassNames} // Use eventClassNames to apply custom styles
            datesSet={handleDatesRender} // Trigger transition when dates are rendered
          />
        </Card.Body>
      </Card>
    </div>
  );
}

export default AppointmentFullCalendar;
