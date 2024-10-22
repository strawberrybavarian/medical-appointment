import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ImageNewsUpload from "./ImageNewsUpload"; // Import image upload component
import ReactQuill from "react-quill"; // Import React Quill
import 'react-quill/dist/quill.snow.css'; // Import React Quill CSS

function CreateNewsModal({ show, handleClose, handleSubmit, newsContent, setNewsContent, newsImages, setNewsImages }) {
  const [headline, setHeadline] = useState(""); // Add headline state

  const handleFormSubmit = () => {
    handleSubmit(headline, newsContent); // Pass both headline and news content to submit handler
    setHeadline(""); // Reset headline after submitting
    setNewsContent(""); // Reset news content
    setNewsImages([]); // Reset news images
  };

  return (
    <Modal show={show} className='am-overlay' onHide={() => { handleClose(); setHeadline(''); setNewsContent(''); setNewsImages([]); }}>
      <div className="am-content">
      <Modal.Header closeButton className="am-header">
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

          {/* React Quill editor for news content */}
          <Form.Group>
            <Form.Label>News Content</Form.Label>
            <ReactQuill
              value={newsContent}
              onChange={setNewsContent}
              style={{ height: '300px', marginBottom: '50px' }} // Increase the height of the editor
              modules={CreateNewsModal.modules}
              formats={CreateNewsModal.formats}
              placeholder="Write your news content here..."
            />
          </Form.Group>

          {/* Image upload field */}
          <ImageNewsUpload newsImages={newsImages} setNewsImages={setNewsImages} />

        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => { handleClose(); setHeadline(''); setNewsContent(''); setNewsImages([]); }}>
          Close
        </Button>
        <Button variant="primary" onClick={handleFormSubmit}>
          Post
        </Button>
      </Modal.Footer>

      </div>

    </Modal>
  );
}

// React Quill modules and formats
CreateNewsModal.modules = {
  toolbar: [
    [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, 
     {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

CreateNewsModal.formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'video'
];

export default CreateNewsModal;
