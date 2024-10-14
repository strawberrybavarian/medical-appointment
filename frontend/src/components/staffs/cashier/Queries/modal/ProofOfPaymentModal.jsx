import React from "react";
import { Modal, Button } from "react-bootstrap";
import './Styles.css'
import { ip } from "../../../../../ContentExport";
function ProofOfPaymentModal({ show, handleClose, patientName, proofOfPayment }) {
    return (
      <>
        {show && <div className="blur-overlay"></div>}
        <Modal show={show} onHide={handleClose} centered dialogClassName="modal-custom">
          <Modal.Header closeButton>
            <Modal.Title>Proof of Payment for {patientName}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {proofOfPayment ? (
              <img
                src={`${ip.address}/${proofOfPayment}`} // Assuming images are served from the root directory
                alt="Proof of Payment"
                style={{ width: "100%", height: "auto" }}
              />
            ) : (
              <p>No proof of payment available.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
  
  export default ProofOfPaymentModal;
