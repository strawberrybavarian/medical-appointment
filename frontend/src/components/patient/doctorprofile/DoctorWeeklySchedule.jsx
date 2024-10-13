// DoctorWeeklySchedule.js
import React, { useEffect, useState } from 'react';
import { Container, Table } from 'react-bootstrap';
import { ip } from '../../../ContentExport';
import axios from 'axios';
const DoctorWeeklySchedule = ({ did }) => {
    const [availability, setAvailability] = useState({});
    useEffect(() => {
        axios
            .get(`${ip.address}/api/doctor/${did}/available`)
            .then((res) => {
                setAvailability(res.data.availability);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [did]);

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

        const morningAvailability = dayAvailability.morning?.available ? `${formatTime(dayAvailability.morning.startTime)} - ${formatTime(dayAvailability.morning.endTime)}` : 'Not available';
        const afternoonAvailability = dayAvailability.afternoon?.available ? `${formatTime(dayAvailability.afternoon.startTime)} - ${formatTime(dayAvailability.afternoon.endTime)}` : 'Not available';

        return (
            <>
                <td>{morningAvailability}</td>
                <td>{afternoonAvailability}</td>
            </>
        );
    };
    return (
        <>
         <p className="m-0" style={{fontWeight:'bold'}}>Weekly Schedule</p>
        <Container className='dp-schedule'>
         
            <Table responsive striped variant="light" className="mt-3">
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
        </Container>
        </>
    );
};

export default DoctorWeeklySchedule;
