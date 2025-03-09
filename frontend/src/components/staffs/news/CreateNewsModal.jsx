import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ImageNewsUpload from "./ImageNewsUpload";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import './CreateNewsModal.css';

function CreateNewsModal({ show, handleClose, handleSubmit, newsContent, setNewsContent, newsImages, setNewsImages }) {
  const [headline, setHeadline] = useState("");
  
  const handleFormSubmit = () => {
    handleSubmit(headline, newsContent);
    setHeadline("");
    setNewsContent("");
    setNewsImages([]);
    window.location.reload();
  };
  
  const handleCancel = () => {
    handleClose();
    setHeadline('');
    setNewsContent('');
    setNewsImages([]);
  };
  
  return (
    <Modal size="lg" show={show} className='news-modal' onHide={handleCancel}>
      <Modal.Header closeButton className="news-modal-header">
        <Modal.Title>Create News Article</Modal.Title>
      </Modal.Header>
      <Modal.Body className="news-modal-body">
        <Form>
          <Form.Group className="mb-4">
            <Form.Label className="news-form-label">
              <i className="fas fa-heading news-form-icon"></i> Headline
            </Form.Label>
            <Form.Control
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Enter headline"
              className="news-form-input"
            />
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label className="news-form-label">
              <i className="fas fa-pen-alt news-form-icon"></i> News Content
            </Form.Label>
            <div className="quill-wrapper">
              <ReactQuill
                value={newsContent}
                onChange={setNewsContent}
                modules={CreateNewsModal.modules}
                formats={CreateNewsModal.formats}
                placeholder="Write your news content here..."
                className="news-quill-editor"
              />
            </div>
          </Form.Group>
          
          <Form.Group className="mt-5">
            <Form.Label className="news-form-label">
              <i className="fas fa-images news-form-icon"></i> News Media
            </Form.Label>
            <ImageNewsUpload newsImages={newsImages} setNewsImages={setNewsImages} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="news-modal-footer">
        <Button variant="light" className="news-btn-cancel" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="primary" className="news-btn-submit" onClick={handleFormSubmit}>
          Publish News
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Keep the existing modules and formats
CreateNewsModal.modules = {
  toolbar: [
    [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, 
     {'indent': '-1'}, {'indent': '+1'}],
    ['link'],
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