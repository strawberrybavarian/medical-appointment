import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import ImageUpload from "./ImageUpload"; // Import the image upload component

function CreatePostModal({ show, handleClose, handleSubmit, postContent, setPostContent, postImages, setPostImages }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header className="d-flex justify-content-around w-100" closeButton>
        <Modal.Title>Create Post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex align-items-center mb-3">
          <img
            src="https://via.placeholder.com/40"
            alt="User Avatar"
            className="rounded-circle"
          />
          <span className="ml-2">Your Name</span>
        </div>

        <Form>
          <Form.Group controlId="exampleForm.ControlTextarea1">
            <ReactQuill
              value={postContent}
              onChange={setPostContent}
              placeholder="What's on your mind?"
              style={{ minHeight: '120px', resize: 'vertical' }}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  ['link', 'image'],
                  ['clean']
                ]
              }}
              formats={['bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link', 'image']}
            />
          </Form.Group>

          {/* ImageUpload Component for handling image upload */}
          <ImageUpload postImages={postImages} setPostImages={setPostImages} />

          <Button variant="primary" onClick={handleSubmit} className="w-100">Post</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default CreatePostModal;
