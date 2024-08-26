// ImageUploadModal.js
import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { Button, Form, Col } from "react-bootstrap";
import './UploadImageModal.css';
import { useParams } from 'react-router-dom';

const ImageUploadModal = ({ isOpen, onRequestClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const { did } = useParams();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post(`http://localhost:8000/doctor/api/${did}/updateimage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Image uploaded successfully:', response.data);
      onRequestClose(response.data.updatedDoctor.dr_image); // Pass the new image URL back to the parent component
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => onRequestClose(null)}
      contentLabel="Image Upload Modal"
      className="image-upload-modal" 
      overlayClassName="modal-overlay" 
      ariaHideApp={false} 
    >
      <div className="modal-content">
        <h2>Upload Image</h2>
        {previewImage && (
            <img src={previewImage} alt="Preview" className="preview-image" />
          )}
        <Form className='ium-form'>
          <Form.Group as={Col} className="mb-3">
          
              <Form.Control type="file" accept="image/*" onChange={handleFileChange}   />
            </Form.Group>
        </Form>
         
  
        <Button style={{marginTop:"15px"}} type="submit" onClick={handleSubmit}>Upload</Button>
      </div>
    </Modal>
  );
};

export default ImageUploadModal;
