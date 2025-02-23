import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Table, Container, Pagination, Form, Row, Col, Button, Dropdown } from 'react-bootstrap';
import AssignAppointmentModal from './AssignAppointmentModal'; 
import './Styles.css';
import { ThreeDots } from 'react-bootstrap-icons';
import RescheduleModal from "../../../../practitioner/appointment/Reschedule Modal/RescheduleModal";
import { ip } from "../../../../../ContentExport";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const MedSecCancelled = ({ allAppointments, setAllAppointments }) => {
  const { did } = useParams();
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [alldoctors, setAllDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedAccountStatus, setSelectedAccountStatus] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const convertTimeRangeTo12HourFormat = (timeRange) => {
    // Check if the timeRange is missing or empty
    if (!timeRange) return 'Not Assigned';
  
    const convertTo12Hour = (time) => {
      // Handle single time values like "10:00"
      if (!time) return '';
  
      let [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // Convert 0 or 12 to 12 in 12-hour format
  
      return `${hours}:${String(minutes).padStart(2, '0')} ${period}`;
    };
  
    // Handle both single times and ranges
    if (timeRange.includes(' - ')) {
      const [startTime, endTime] = timeRange.split(' - ');
      return `${convertTo12Hour(startTime)} - ${convertTo12Hour(endTime)}`;
    } else {
      return convertTo12Hour(timeRange); // Single time case
    }
  };
  

    const handleConfirmReschedule = (rescheduledReason) => {
      const newStatus = {
        rescheduledReason: rescheduledReason,
        status: 'Rescheduled'
      };
      
      axios.put(`${ip.address}/api/doctor/${selectedAppointment._id}/rescheduledstatus`, newStatus)
        .then(() => {
          // Update the state of appointments in real-time
          setAllAppointments(prevAppointments =>
            prevAppointments.map(appointment =>
              appointment._id === selectedAppointment._id
                ? { ...appointment, status: 'Rescheduled', rescheduledReason: rescheduledReason }
                : appointment
            )
          );
          setShowRescheduleModal(false); // Close the modal after successful update
          setSelectedAppointment(null); // Clear selected appointment
        })
        .catch((err) => {
          console.log(err);
        });
    };

    const handleReschedule = (appointment) => {
      setSelectedAppointment(appointment);
      setShowRescheduleModal(true);
    };

    const handleCloseRescheduleModal = () => {
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
    };



  useEffect(() => {
    axios.get(`${ip.address}/api/doctor/api/alldoctor`)
      .then((result) => {
        setAllDoctors(result.data.theDoctor);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const getUniqueCategories = () => {
    const categories = allAppointments.flatMap(appointment => 
      appointment.appointment_type.map(typeObj => typeObj.appointment_type)
    );
    return [...new Set(categories)];
  };

  const uniqueCategories = getUniqueCategories();

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAppointments = [...allAppointments].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredAppointments = sortedAppointments
    .filter(appointment => appointment.status === 'Cancelled')
    .filter(appointment => 
      appointment.patient && 
      `${appointment.patient.patient_firstName} ${appointment.patient.patient_middleInitial}. ${appointment.patient.patient_lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    )
    .filter(appointment => selectedDoctor === "" || appointment.doctor?._id === selectedDoctor)
    .filter(appointment => selectedAccountStatus === "" || appointment.patient.accountStatus === selectedAccountStatus)
    .filter(appointment => 
      categoryFilter === "" || 
      appointment.appointment_type.some(typeObj => typeObj.appointment_type === categoryFilter)
    );

  const indexOfLastAppointment = currentPage * entriesPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - entriesPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredAppointments.length / entriesPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleAssignDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAssignModal(true);
  };

  const handleSaveDetails = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setError("Please fill all the fields.");
      return;
    }
  
    const updatedAppointment = {
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
    };
  
    axios.put(`${ip.address}/api/appointment/${selectedAppointment._id}/assign`, updatedAppointment)
      .then(() => {
        setAllAppointments(prevAppointments =>
          prevAppointments.map(appointment =>
            appointment._id === selectedAppointment._id ? { ...appointment, ...updatedAppointment, status: "Scheduled" } : appointment
          )
        );
        setShowAssignModal(false);
        setError("");
      })
      .catch((err) => {
        console.log(err);
        setError("An error occurred while saving the details.");
      });
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    const appointment = allAppointments.find(app => app._id === appointmentId);
  
    // Check if the appointment has time and services assigned
    const isValidAppointment =
      appointment.time &&
      appointment.time !== "Not Assigned" &&
      appointment.appointment_type &&
      appointment.appointment_type.length > 0 &&
      appointment.appointment_type.some(type => type.appointment_type);
  
    if (!isValidAppointment) {
      // Show a toast if required details are missing
      toast.warning('To schedule an appointment, please assign a time and select the services.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
  
    try {
      const response = await axios.put(
        `${ip.address}/api/appointments/${appointmentId}/status`,
        { status: newStatus }
      );
  
      if (response.status === 200 && response.data) {
        const updatedAppointment = response.data;
  
        // Update the state with the new status
        setAllAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment._id === appointmentId
              ? { ...appointment, status: updatedAppointment.status }
              : appointment
          )
        );
  
        console.log('Appointment status updated successfully:', updatedAppointment);
      } else {
        throw new Error('Unexpected server response');
      }
    } catch (err) {
      console.error('Error updating status:', err);
  
      const errorMessage =
        err.response?.data?.message || 'Failed to update the appointment status.';
      setError(errorMessage);
      alert(errorMessage);
    }
  };
  
  
  
  


  return (
    <>
      <Container fluid className="w-100">
       
          <h3>Cancelled Appointments</h3>
          <hr/>
          <div >
            <Row>
              <Col lg={4} md={6} sm={12}>
                <Form.Group controlId="formDoctorSearch" className="d-flex align-items-center">
                  <Form.Label style={{ marginRight: '1vh' }}>Doctor:</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">All Doctors</option>
                    {alldoctors.map((doctor) => (
                      <option key={doctor?._id} value={doctor?._id}>
                        {`${doctor?.dr_firstName} ${doctor?.dr_middleInitial}. ${doctor?.dr_lastName}`}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>

              <Col lg={4} md={6} sm={12}>
                <Form.Group controlId="formSearch" className="d-flex align-items-center">
                  <Form.Label style={{ marginLeft: '1vh', marginRight: '1vh' }}>Patient:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </Form.Group>
              </Col>

              <Col lg={4} md={6} sm={12}>
                <Form.Group controlId="formCategoryFilter" className="d-flex align-items-center">
                  <Form.Label style={{ marginRight: '1vh' }}>Category:</Form.Label>
                  <Form.Control
                    as="select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">All Categories</option>
                    {uniqueCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>

              <Col lg={3} md={5} sm={12} className="p-0">
                <Form.Group controlId="formAccountStatus" className="d-flex align-items-center">
                  <Form.Label style={{ marginLeft: '1vh', marginRight: '1vh' }}>Status:</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedAccountStatus}
                    onChange={(e) => setSelectedAccountStatus(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">All Account Statuses</option>
                    <option value="Registered">Registered</option>
                    <option value="Unregistered">Unregistered</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
          </div>
          <p><em>*</em></p>
          <Table responsive striped variant="light" className="mt-3">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Doctor Name</th>
          
                <th>Service</th>
                <th onClick={() => handleSort('date')}>
                  Date {sortConfig.key === 'date' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('time')}>
                  Time {sortConfig.key === 'time' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                </th>
                <th>Account Status</th>
                <th>Appointment Status</th>
                <th>Follow Up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentAppointments.map((appointment) => {
                const patient = appointment.patient;
                const patientName = `${patient.patient_firstName} ${patient.patient_middleInitial}. ${patient.patient_lastName}`;
                const doctor = appointment.doctor;
                const doctorName = doctor
                  ? `${doctor?.dr_firstName} ${doctor?.dr_middleInitial}. ${doctor?.dr_lastName}`
                  : "Not Assigned";
                  const appointmentTypes = appointment.appointment_type
                  .map(typeObj => typeObj.appointment_type)
                  .join(', ');

                  const categoryTypes = appointment.appointment_type
                  .map(typeObj => typeObj.category)
                  .join(', ');

                return (
                  <tr key={appointment._id}>
                    <td style={{fontSize: '14px', fontWeight: '600'}}>{patientName}</td>
                    <td style={{fontSize: '14px'}}>{doctorName}</td>
                
                    <td style={{fontSize: '14px'}}>{appointmentTypes}</td>
                    <td style={{fontSize: '14px'}}>{appointment.date ? new Date(appointment.date).toLocaleDateString() : "Not Assigned"}</td>
                    <td style={{ fontSize: '14px' }}>
                      {appointment.time ? convertTimeRangeTo12HourFormat(appointment.time) : 'Not Assigned'}
                    </td>


                    <td style={{fontSize: '14px'}}>{appointment.patient.accountStatus}</td>
                    <td>
                      <div className="d-flex justify-content-center">
                      <div className="pending-appointment" style={{fontSize: '12px'}}>
                            {appointment.status}
                      </div>
                      </div>
                    </td>

                    <td>
                      <Form.Check
                      type="checkbox"
                      disabled={true}
                      checked={appointment.followUp || false}
                     
                    />
                    </td>
                    <td>
                      <div className="d-flex justify-content-around flex-wrap">
                        <Dropdown >
                          <Dropdown.Toggle s as={Button} variant="light" className="action-button">
                            <ThreeDots size={20} />
                          </Dropdown.Toggle>

                          <Dropdown.Menu style={{zIndex:'99999'}}>
                            {/* {(  !appointment.date || !appointment.time || !appointmentTypes || !categoryTypes) && ( */}
                              <Dropdown.Item
                                onClick={() => handleAssignDetails(appointment)}
                                className="action-item"
                              >
                                Assign Details
                              </Dropdown.Item>
                            {/* )} */}
                            
                            {appointment.patient.accountStatus === "Unregistered" && (
                              <>


                              <Dropdown.Item
                                onClick={() => handleAssignDetails(appointment)}
                                className="action-item"
                              >
                                Reschedule
                              </Dropdown.Item>
                              </>
                             
                            )}
                            {appointment.patient.accountStatus === "Registered" && (
                              <>
                                

                                <Dropdown.Item
                                  onClick={() => handleReschedule(appointment)}
                                  className="action-item"
                                  >
                                    Reschedule
                                </Dropdown.Item>
                              </>
                             
                            )}
                            
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </Table>

          <Container className="d-flex justify-content-between p-0">
            <div style={{ height: '40%', width: '40%' }} className="d-flex p-0 align-content-center">
              <div style={{ height: '60%', width: '60%' }}>
                <label>Entries per page:</label>
              </div>
              <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}>
                <option value={5}>5</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>

            <Pagination>
              <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
              <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
              {pageNumbers.map(number => (
                <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
                  {number}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageNumbers.length))} disabled={currentPage === pageNumbers.length} />
              <Pagination.Last onClick={() => setCurrentPage(pageNumbers.length)} disabled={currentPage === pageNumbers.length} />
            </Pagination>
          </Container>
   

        {selectedAppointment && (
          <AssignAppointmentModal
            show={showAssignModal}
            handleClose={() => setShowAssignModal(false)}
            alldoctors={alldoctors}
            selectedDoctor={selectedDoctor}
            setSelectedDoctor={setSelectedDoctor}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            handleSaveDetails={handleSaveDetails}
            appointmentId={selectedAppointment?._id}
            pid={selectedAppointment?.patient?._id} 
            error={error}
          />
        )}

        {selectedAppointment && (
          <RescheduleModal 
            show={showRescheduleModal} 
            handleClose={handleCloseRescheduleModal} 
            appointment={selectedAppointment} 
            handleConfirm={handleConfirmReschedule}  // This will update the appointments in real-time
          />
        )}


      <ToastContainer />
      </Container>
    </>
  );
};

export default MedSecCancelled;
