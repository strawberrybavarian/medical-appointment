import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Form, Container, Row, Col } from 'react-bootstrap';
import RescheduleModal from '../../../../practitioner/appointment/Reschedule Modal/RescheduleModal';
import { Link } from 'react-router-dom';
import { ip } from '../../../../../ContentExport';

function SpecificDoctorAppointments({ did, msid }) {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [sortColumn, setSortColumn] = useState(null);  // Track the column being sorted
  const [sortDirection, setSortDirection] = useState('asc'); // Track the sorting direction

  // Fetch appointments for the doctor
  const fetchAppointments = () => {
    axios.get(`${ip.address}/api/doctor/${did}/appointments`)
      .then(res => {
        setAppointments(res.data);
        setFilteredAppointments(res.data);  // Set filteredAppointments only once
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchAppointments(); // Fetch the data when the component mounts
  }, [did]);

  useEffect(() => {
    filterAppointments(); // Filter the appointments every time the search term or status changes
  }, [selectedStatus, searchTerm, appointments]);  // Added `appointments` as a dependency

  // Function to filter appointments based on status and search term
  const filterAppointments = () => {
    let filtered = [...appointments];  // Work with a copy of the appointments state
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(appointment => appointment.status === selectedStatus);
    }
    if (searchTerm) {
      filtered = filtered.filter(appointment => {
        const fullName = `${appointment.patient.patient_firstName} ${appointment.patient.patient_lastName}`.toLowerCase();
        return (
          fullName.includes(searchTerm.toLowerCase()) || 
          appointment.patient.patient_firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.patient.patient_lastName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    applySorting(filtered);  // Apply sorting before setting filteredAppointments
  };

  // Function to apply sorting to filtered appointments
  const applySorting = (appointmentsToSort) => {
    let sortedAppointments = [...appointmentsToSort];

    if (sortColumn) {
      sortedAppointments.sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

        // Handle sorting for nested values like patient name
        if (sortColumn === 'patient') {
          aValue = `${a.patient.patient_firstName} ${a.patient.patient_lastName}`;
          bValue = `${b.patient.patient_firstName} ${b.patient.patient_lastName}`;
        }

        if (sortColumn === 'date') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }
    setFilteredAppointments(sortedAppointments);  // Set the sorted appointments
  };

  // Handle sorting when the user clicks a table header
  const handleSort = (column) => {
    const direction = (sortColumn === column && sortDirection === 'asc') ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);
    applySorting(filteredAppointments);  // Reapply sorting immediately
  };

  // Function to render the sort arrow in the header
// Function to render the sort arrow in the header
const renderSortArrow = (column) => {
  return (
    <span className="dt-column-order">
      {/* Up Arrow */}
      <span
        className={`arrow ${sortColumn === column && sortDirection === 'asc' ? 'active' : 'inactive'}`}
      >
        &#9650;
      </span>
      {/* Down Arrow */}
      <span
        className={`arrow ${sortColumn === column && sortDirection === 'desc' ? 'active' : 'inactive'}`}
      >
        &#9660;
      </span>
    </span>
  );
};


  // Update the status of the appointment and refetch the appointments
  const updateAppointmentStatus = (appointmentID, newStatus) => {
    axios.put(`${ip.address}/api/appointments/${appointmentID}/status`, { status: newStatus })
      .then(() => {
        fetchAppointments(); // Refetch the updated list of appointments
      })
      .catch(err => console.log(err));
  };

  // Handle reschedule action
  const handleConfirmReschedule = (rescheduledReason) => {
    const newStatus = {
      rescheduledReason: rescheduledReason,
      status: 'Rescheduled'
    };

    axios.put(`${ip.address}/api/doctor/${selectedAppointment._id}/rescheduledstatus`, newStatus)
      .then(() => {
        fetchAppointments(); // Refetch the appointments after rescheduling
        setShowRescheduleModal(false); // Close the modal after success
      })
      .catch(err => console.log(err));
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  return (
    <Container>
      <Row className="g-3">
        <Col lg={4} md={6}>
          <Form.Group>
            <Form.Label>Filter by Status</Form.Label>
            <Form.Control as="select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="All">All</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Pending">Pending</option>
              <option value="Ongoing">Ongoing</option>
            </Form.Control>
          </Form.Group>
        </Col>

        <Col lg={4} md={6}>
          <Form.Group>
            <Form.Label>Search by Patient Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      <Table responsive striped variant="light" className="mt-3">
        <thead>
          <tr>
            <th onClick={() => handleSort('patient')}>Patient Name {renderSortArrow('patient')}</th>
            <th onClick={() => handleSort('date')}>Date {renderSortArrow('date')}</th>
            <th onClick={() => handleSort('time')}>Time {renderSortArrow('time')}</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => {
              const patientName = `${appointment.patient.patient_firstName} ${appointment.patient.patient_lastName}`;
              return (
                <tr key={appointment._id}>
                  <td>{patientName}</td>
                  <td>{new Date(appointment.date).toLocaleDateString()}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.reason}</td>
                  <td>{appointment.status}</td>
                  <td>
                    <div className='d-flex justify-content-around flex-wrap'>
                        <Link
                            onClick={() => updateAppointmentStatus(appointment._id, 'Ongoing')}
                            className='custom-link'
                            style={{ color: 'blue', fontSize: '0.7rem' }}
                        >
                            Ongoing
                        </Link>
                        <Link
                            onClick={() => updateAppointmentStatus(appointment._id, 'Scheduled')}
                            className='custom-link'
                            style={{ color: 'blue', fontSize: '0.7rem' }}
                        >
                            Scheduled
                        </Link>
                        <Link
                            onClick={() => updateAppointmentStatus(appointment._id, 'Completed')}
                            className='custom-link'
                            style={{ color: 'blue', fontSize: '0.7rem' }}
                        >
                            Completed
                        </Link>
                        <Link
                            onClick={() => handleReschedule(appointment)}
                            className='custom-link'
                            style={{ color: 'orange', fontSize: '0.7rem' }}
                        >
                            Reschedule
                        </Link>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No appointments found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Reschedule Modal */}
      <RescheduleModal
        show={showRescheduleModal}
        handleClose={() => setShowRescheduleModal(false)}
        handleConfirm={handleConfirmReschedule}
      />
    </Container>
  );
}

export default SpecificDoctorAppointments;
