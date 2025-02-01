import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card } from 'react-bootstrap';
import { ip } from '../../../../../ContentExport';
import './DeactivationRequests.css';
import Swal from 'sweetalert2';

function DeactivationRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // Fetch the deactivation requests only once
    axios.get(`${ip.address}/api/admin/deactivation-requests`)
      .then(res => setRequests(res.data))
      .catch(err => console.log(err));
  }, []); // Empty dependency array to run the effect only once

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
            setRequests((prevRequests) => prevRequests.filter(request => request._id !== doctorId));
          })
          .catch((err) => console.log(err));
      }
    });
  };

  return (
    <div style={{ width: '100%' }}>
      {requests.length === 0 ? (
        <p>No deactivation requests available.</p> // Display a message if no requests
      ) : (
        requests.map(request => (
          <div className="mb-3" key={request._id}> {/* Use key prop for unique identification */}
            <Card>
              <Card.Header className="py-3"> 
                <h6 className="m-0 font-weight-bold text-primary">Appointment Deactivation Requests</h6> 
              </Card.Header>
              <Card.Body>
                <Card.Title>{`${request.dr_firstName} ${request.dr_lastName}`}</Card.Title>
                <Card.Text>{`Reason: ${request.deactivationRequest.reason}`}</Card.Text>
                <button
                  className='approved-button'
                  onClick={() => handleConfirm(request._id, true)}
                >
                  Approve
                </button>
                <span> </span>
                <button
                  className='rejected-button'
                  onClick={() => handleConfirm(request._id, false)}
                >
                  Reject
                </button>
              </Card.Body>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}

export default DeactivationRequests;
