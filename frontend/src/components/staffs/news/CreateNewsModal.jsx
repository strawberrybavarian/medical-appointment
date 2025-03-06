import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ImageNewsUpload from "./ImageNewsUpload";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
function CreateNewsModal({ show, handleClose, handleSubmit, newsContent, setNewsContent, newsImages, setNewsImages }) {
  const [headline, setHeadline] = useState("");
  const handleFormSubmit = () => {
    handleSubmit(headline, newsContent);
    setHeadline("");
    setNewsContent("");
    setNewsImages([]);

    window.location.reload();
  };
  return (
    <Modal size="lg" show={show} className='am-overlay' onHide={() => { handleClose(); setHeadline(''); setNewsContent(''); setNewsImages([]); }}>
      <div className="">
      <Modal.Header closeButton className="am-header">
        <Modal.Title>Create News</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {}
          <Form.Group>
            <Form.Label>Headline</Form.Label>
            <Form.Control
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Enter headline"
            />
          </Form.Group>
          {}
          <Form.Group>
            <Form.Label>News Content</Form.Label>
            <ReactQuill
              value={newsContent}
              onChange={setNewsContent}
              style={{ height: '300px', marginBottom: '50px' }}
              modules={CreateNewsModal.modules}
              formats={CreateNewsModal.formats}
              placeholder="Write your news content here..."
            />
          </Form.Group>
          {}
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
