import React from 'react';
import './AppointmentStepper.css';
import {
  PeopleFill,
  ClockFill,
  PersonFill,
  PencilFill,
} from 'react-bootstrap-icons';
import { Row, Col } from 'react-bootstrap';
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
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleString('default', { weekday: 'short' });
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${dayOfWeek}, ${month} ${day}, ${year}`;
  };
  const getAppointmentType = () => {
    if (Array.isArray(latestAppointment.appointment_type)) {
      return latestAppointment.appointment_type[0]?.appointment_type || 'N/A';
    }
    return latestAppointment.appointment_type?.appointment_type || 'N/A';
  };
  const convertTimeRangeTo12HourFormat = (timeRange) => {
    if (!timeRange) return 'Not Assigned';
    const convertTo12Hour = (time) => {
      if (!time) return '';
      let [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${String(minutes).padStart(2, '0')} ${period}`;
    };
    if (timeRange.includes(' - ')) {
      const [startTime, endTime] = timeRange.split(' - ');
      return `${convertTo12Hour(startTime)} - ${convertTo12Hour(endTime)}`;
    } else {
      return convertTo12Hour(timeRange);
    }
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
              : index === statusSteps.length - 1
              ? 'processing'
              : ''
          }`}
        >
          <div className="step-marker">
            <div className="step-circle">{index + 1}</div>
            {index < statusSteps.length - 1 && <div className="step-line" />}
          </div>
          <div className="step-content">
            <p className="step-label">{status}</p>
            {index === activeStep && latestAppointment && (
              <div className="appointment-details shadow-sm">
                <h4>Appointment Details</h4>
                <p> ID : {latestAppointment.appointment_ID}</p>
                <Row>
                  <Col>
                    <p>
                      <ClockFill
                        className="font-gray"
                        size={20}
                        style={{ marginRight: '0.7rem' }}
                      />
                      {formatDate(latestAppointment.date)} at{' '}
                      {latestAppointment.time ? convertTimeRangeTo12HourFormat(latestAppointment.time) : 'Not Assigned'}
                    </p>
                    <p>
                      <PersonFill
                        className="font-gray"
                        size={20}
                        style={{ marginRight: '0.7rem' }}
                      />
                      Doctor:{' '}
                      {latestAppointment.doctor
                        ? `Dr. ${latestAppointment.doctor.dr_firstName} ${latestAppointment.doctor.dr_middleInitial}. ${latestAppointment.doctor.dr_lastName}`
                        : 'Not assigned yet'}
                    </p>
                    <p>
                      <PencilFill
                        className="font-gray"
                        size={20}
                        style={{ marginRight: '0.7rem' }}
                      />
                      Appointment Type: {getAppointmentType()}
                    </p>
                  </Col>
                </Row>
                <p>Follow-up: {latestAppointment.followUp ? 'Yes' : 'No'}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
export default AppointmentStepper;
