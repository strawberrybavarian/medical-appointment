import React, { useState, useEffect } from 'react';
import { Table, Card, Badge, Alert } from 'react-bootstrap';
import axios from 'axios';
import { ip } from '../../../../../../ContentExport';

function AdminDoctorAvailability({ doctorId }) {
    const [availability, setAvailability] = useState({});
    const [activeAppointmentStatus, setActiveAppointmentStatus] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!doctorId) return;

        setLoading(true);
        axios.get(`${ip.address}/api/doctor/${doctorId}/available`)
            .then(res => {
                const { availability, activeAppointmentStatus } = res.data;
                setAvailability(availability || {});
                setActiveAppointmentStatus(activeAppointmentStatus);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching doctor availability:', err);
                setError('Failed to load doctor availability');
                setLoading(false);
            });
    }, [doctorId]);

    const renderAvailability = (day) => {
        const dayAvailability = availability[day];
        if (!dayAvailability) return <td colSpan="2">Not configured</td>;

        const formatTime = (time) => {
            if (!time) return 'Not set';
            
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

        const morningAvailability = dayAvailability.morning?.available 
            ? (
                <div>
                    <div className="mb-1">{formatTime(dayAvailability.morning.startTime)} - {formatTime(dayAvailability.morning.endTime)}</div>
                    <div><small className="text-muted">Max Patients: {dayAvailability.morning.maxPatients || 'Not set'}</small></div>
                </div>
            ) 
            : <Badge bg="light" text="dark">Not available</Badge>;
            
        const afternoonAvailability = dayAvailability.afternoon?.available 
            ? (
                <div>
                    <div className="mb-1">{formatTime(dayAvailability.afternoon.startTime)} - {formatTime(dayAvailability.afternoon.endTime)}</div>
                    <div><small className="text-muted">Max Patients: {dayAvailability.afternoon.maxPatients || 'Not set'}</small></div>
                </div>
            ) 
            : <Badge bg="light" text="dark">Not available</Badge>;

        return (
            <>
                <td>{morningAvailability}</td>
                <td>{afternoonAvailability}</td>
            </>
        );
    };

    if (loading) {
        return <div className="text-center p-3">Loading availability information...</div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Doctor's Appointment Settings</h5>
                <div>
                    <span className="me-2">Appointment Status:</span>
                    <Badge bg={activeAppointmentStatus ? 'success' : 'danger'} className="py-2 px-3">
                        {activeAppointmentStatus ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </div>

            {!activeAppointmentStatus && (
                <Alert variant="warning" className="mb-4">
                    <Alert.Heading className="h6">Appointments Disabled</Alert.Heading>
                    <p className="mb-0">This doctor has disabled appointment bookings. Patients cannot schedule appointments with this doctor.</p>
                </Alert>
            )}

            <h5 className="mb-3">Weekly Schedule</h5>
            <Table responsive bordered hover className="appointment-schedule-table">
                <thead className="bg-light">
                    <tr>
                        <th width="16%">Day</th>
                        <th width="42%">Morning</th>
                        <th width="42%">Afternoon</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="fw-bold">Monday</td>
                        {renderAvailability('monday')}
                    </tr>
                    <tr>
                        <td className="fw-bold">Tuesday</td>
                        {renderAvailability('tuesday')}
                    </tr>
                    <tr>
                        <td className="fw-bold">Wednesday</td>
                        {renderAvailability('wednesday')}
                    </tr>
                    <tr>
                        <td className="fw-bold">Thursday</td>
                        {renderAvailability('thursday')}
                    </tr>
                    <tr>
                        <td className="fw-bold">Friday</td>
                        {renderAvailability('friday')}
                    </tr>
                    <tr>
                        <td className="fw-bold">Saturday</td>
                        {renderAvailability('saturday')}
                    </tr>
                    <tr>
                        <td className="fw-bold">Sunday</td>
                        {renderAvailability('sunday')}
                    </tr>
                </tbody>
            </Table>
        </div>
    );
}

export default AdminDoctorAvailability;