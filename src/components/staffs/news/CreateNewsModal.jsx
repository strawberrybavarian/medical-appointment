import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ImageNewsUpload from "./ImageNewsUpload"; // Import image upload component

function CreateNewsModal({ show, handleClose, handleSubmit, newsContent, setNewsContent, newsImages, setNewsImages }) {
  const [headline, setHeadline] = useState(""); // Add headline state

  const handleFormSubmit = () => {
    handleSubmit(headline, newsContent); // Pass both headline and news content to submit handler
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create News</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Input for the headline */}
          <Form.Group>
            <Form.Label>Headline</Form.Label>
            <Form.Control
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)} // Update headline state
              placeholder="Enter headline"
            />
          </Form.Group>

          {/* Textarea for news content */}
          <Form.Group>
            <Form.Label>News Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={newsContent}
              onChange={(e) => setNewsContent(e.target.value)}
              placeholder="What's happening?"
            />
          </Form.Group>

          {/* Image upload field */}
          <ImageNewsUpload newsImages={newsImages} setNewsImages={setNewsImages} />

        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleFormSubmit}>
          Post
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CreateNewsModal;
