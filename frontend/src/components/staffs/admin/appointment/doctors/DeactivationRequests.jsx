import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card } from 'react-bootstrap';
import { ip } from '../../../../../ContentExport';
import './DeactivationRequests.css';
import Swal from 'sweetalert2';

function DeactivationRequests() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        axios.get(`${ip.address}/api/admin/deactivation-requests`)
            .then(res => setRequests(res.data))
            .catch(err => console.log(err));
    }, []);

    const handleConfirm = (doctorId, isApproved) => {
        const actionText = isApproved ? 'approve' : 'reject';
        Swal.fire({
            title: `Are you sure you want to ${actionText} this request?`,
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .post(`${ip.address}/api/admin/confirm-deactivation/${doctorId}`, { confirm: isApproved })
                    .then((res) => {
                        alert(res.data.message);
                        setRequests(requests.filter(request => request._id !== doctorId));
                    })
                    .catch((err) => console.log(err));
            }
        });
    };

    return (
        <div>
            {requests.map(request => (
                <div className='mb-3' key={request._id}>
                    <Card>
                        <Card.Body>
                            <Card.Title>{`${request.dr_firstName} ${request.dr_lastName}`}</Card.Title>
                            <Card.Text>{`Reason: ${request.deactivationRequest.reason}`}</Card.Text>
                            <button
                                variant="success"
                                className='approved-button'
                                onClick={() => handleConfirm(request._id, true)}
                            >
                                Approve
                            </button>
                            <span> </span>
                            <button
                                variant="danger"
                                className='rejected-button'
                                onClick={() => handleConfirm(request._id, false)}
                            >
                                Reject
                            </button>
                        </Card.Body>
                    </Card>
                </div>
            ))}
        </div>
    );
}

export default DeactivationRequests;