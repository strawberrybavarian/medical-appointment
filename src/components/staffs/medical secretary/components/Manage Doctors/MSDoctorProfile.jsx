import React, { useState, useEffect } from 'react';
import { Container, Button, Table, Card } from 'react-bootstrap';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ip } from '../../../../../ContentExport';
import AppointmentModal from '../../../../patient/doctorprofile/AppointmentModal';
const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

function MSDoctorProfile() {
    const { did } = useParams();
    const [theDoctor, setTheDoctor] = useState({});
    const [theImage, setTheImage] = useState("");
    const [fullName, setFullName] = useState("");
    const [availability, setAvailability] = useState({});
    const [thePost, setThePost] = useState([]);
    const [showModal, setShowModal] = useState(false); // State for managing modal visibility
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch doctor details
        axios.get(`${ip.address}/doctor/api/finduser/${did}`)
            .then(res => {
                const doctor = res.data.theDoctor;
                setTheDoctor(doctor);

                const formattedName = `${doctor.dr_firstName} ${doctor.dr_middleInitial ? doctor.dr_middleInitial + '.' : ''} ${doctor.dr_lastName}`;
                setFullName(formattedName);

                setTheImage(doctor.dr_image || defaultImage);
            })
            .catch(err => console.log(err));
    }, [did]);

    useEffect(() => {
        // Fetch doctor's posts
        axios.get(`${ip.address}/doctor/api/post/getallpost/${did}`)
            .then(res => {
                setThePost(res.data.posts);
            })
            .catch(err => console.log(err));
    }, [did]);

    useEffect(() => {
        // Fetch doctor's availability
        axios.get(`${ip.address}/doctor/${did}/available`)
            .then(res => {
                setAvailability(res.data.availability);
            })
            .catch(err => console.log(err));
    }, [did]);

    const handleDoctorClick = () => {
        setShowModal(true); // Show the modal when the button is clicked
    };

    const renderAvailability = (day) => {
        const dayAvailability = availability[day];
        if (!dayAvailability) return <td colSpan="2">Doctor is not available</td>;

        const formatTime = (time) => {
            const [hour, minute] = time.split(':');
            const parsedHour = parseInt(hour);
            if (parsedHour === 12) {
                return `${hour}:${minute} PM`;
            } else if (parsedHour > 12) {
                return `${parsedHour - 12}:${minute} PM`;
            } else {
                return `${hour}:${minute} AM`;
            }
        };

        const morningAvailability = dayAvailability.morning.available ? `${formatTime(dayAvailability.morning.startTime)} - ${formatTime(dayAvailability.morning.endTime)}` : 'Not available';
        const afternoonAvailability = dayAvailability.afternoon.available ? `${formatTime(dayAvailability.afternoon.startTime)} - ${formatTime(dayAvailability.afternoon.endTime)}` : 'Not available';

        return (
            <>
                <td>{morningAvailability}</td>
                <td>{afternoonAvailability}</td>
            </>
        );
    };

    return (
        <>
            <Card className="msdp-card shadow-sm mt-4">
                <Card.Header as="h5">
                    Doctor Profile
                </Card.Header>
                <Card.Body>
                    <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                            <img src={`${ip.address}/${theImage}`} alt="Doctor" className="dp-image" style={{ maxWidth: '150px' }} />
                        </div>
                        <div className="flex-grow-1 ms-3">
                            <Card.Title style={{fontSize: '2rem', fontWeight: '800'}}>{fullName}</Card.Title>
                            <Card.Text style={{ fontStyle: 'italic' }}>{theDoctor.dr_specialty}</Card.Text>
                            
                        </div>
                    </div>

                    <hr />

                    <h5>Weekly Schedule</h5>
                    <Table responsive bordered className="dp-schedule">
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Morning Availability</th>
                                <th>Afternoon Availability</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Monday</td>
                                {renderAvailability('monday')}
                            </tr>
                            <tr>
                                <td>Tuesday</td>
                                {renderAvailability('tuesday')}
                            </tr>
                            <tr>
                                <td>Wednesday</td>
                                {renderAvailability('wednesday')}
                            </tr>
                            <tr>
                                <td>Thursday</td>
                                {renderAvailability('thursday')}
                            </tr>
                            <tr>
                                <td>Friday</td>
                                {renderAvailability('friday')}
                            </tr>
                            <tr>
                                <td>Saturday</td>
                                {renderAvailability('saturday')}
                            </tr>
                            <tr>
                                <td>Sunday</td>
                                {renderAvailability('sunday')}
                            </tr>
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <AppointmentModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                pid={null} // Adjust if you have patient information
                did={did}
                doctorName={fullName}
            />
        </>
    );
}

export default MSDoctorProfile;
