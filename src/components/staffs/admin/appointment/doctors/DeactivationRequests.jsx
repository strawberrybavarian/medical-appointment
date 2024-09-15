import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card } from 'react-bootstrap';

function DeactivationRequests() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/admin/deactivation-requests')
            .then(res => setRequests(res.data))
            .catch(err => console.log(err));
    }, []);

    const handleConfirm = (doctorId, confirm) => {
        axios
            .post(`http://localhost:8000/admin/confirm-deactivation/${doctorId}`, { confirm })
            .then((res) => {
                alert(res.data.message);
                setRequests(requests.filter(request => request._id !== doctorId)); // Remove handled request
            })
            .catch((err) => console.log(err));
    };

    return (
        <div>
           
            {requests.map(request => (
                <div className='mb-3'>
                 <h3>Pending Deactivation Requests</h3>
                 <Card key={request._id}>
                    
                    <Card.Body>
                        <Card.Title>{`${request.dr_firstName} ${request.dr_lastName}`}</Card.Title>
                        <Card.Text>{`Reason: ${request.deactivationRequest.reason}`}</Card.Text>
                        <Button variant="success" onClick={() => handleConfirm(request._id, true)}>
                            Approve
                        </Button>
                        <Button variant="danger" onClick={() => handleConfirm(request._id, false)}>
                            Reject
                        </Button>
                    </Card.Body>
                </Card>
                </div>
                
            ))}
        </div>
    );
}

export default DeactivationRequests;
