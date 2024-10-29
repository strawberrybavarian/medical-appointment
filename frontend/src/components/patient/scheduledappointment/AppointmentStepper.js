import React from 'react';
import './AppointmentStepper.css';
import { PeopleFill, ClockFill, PersonFill, PencilFill } from 'react-bootstrap-icons';

const statusSteps = [
  'Pending',
  'Scheduled',
  'Ongoing',
  'For Payment',
  'To-send',
  'Completed',
  'Rescheduled',
  'Cancelled',
];

function AppointmentStepper({ currentStatus, latestAppointment }) {
  const activeStep = statusSteps.indexOf(currentStatus);

  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleString('default', { weekday: 'short' });
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${dayOfWeek}, ${month} ${day}, ${year}`;
  };

  return (
    <div className="stepper-container">
      {statusSteps.map((status, index) => (
        <div
          key={index}
          className={`step-item ${
            index < activeStep
              ? 'completed'
              : index === activeStep
              ? 'active'
              : ''
          }`}
        >
          <div className="step-marker">
            <div className="step-circle">{index + 1}</div>
            {index < statusSteps.length - 1 && (
              <div className="step-line"></div>
            )}
          </div>
          <div className="step-content">
            <p className="step-label">{status}</p>
          </div>
        </div>
      ))}

      {/* Display appointment details below the stepper */}
      {latestAppointment && (
        <div className="appointment-details">
          <h4>Appointment Details</h4>
          <p>
            <ClockFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} />
            {formatDate(latestAppointment.date)} at {latestAppointment.time}
          </p>
          <p>
            <PersonFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} />
            Doctor: {latestAppointment.doctor ? `Dr. ${latestAppointment.doctor.dr_firstName} ${latestAppointment.doctor.dr_middleInitial}. ${latestAppointment.doctor.dr_lastName}` : 'Not assigned yet'}
          </p>
          <p>
            <PencilFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} />
            Appointment Type: {latestAppointment.appointment_type?.appointment_type || 'N/A'}
          </p>
          <p>
            <PeopleFill className='font-gray' size={20} style={{ marginRight: '0.7rem' }} />
            Category: {latestAppointment.appointment_type?.category || 'N/A'}
          </p>
          <p>
            Follow-up: {latestAppointment.followUp ? 'Yes' : 'No'}
          </p>
        </div>
      )}
    </div>
  );
}

export default AppointmentStepper;
