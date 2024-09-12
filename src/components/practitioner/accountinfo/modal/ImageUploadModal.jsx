import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { Button, Form, Col } from "react-bootstrap";
import { useParams } from 'react-router-dom';
import CropResizeTiltModal from './CropResizeTiltModal';
import './UploadImageModal.css';

const ImageUploadModal = ({ isOpen, onRequestClose, did }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [editedImage, setEditedImage] = useState(null);


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setEditedImage(null); // Reset edited image when a new file is selected
    };
    reader.readAsDataURL(file);
  };

  const handleImageEdit = (croppedImageSrc) => {
    setEditedImage(croppedImageSrc);
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
        <Form className='ium-form'>
          <Form.Group as={Col} className="mb-3">
            <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
          </Form.Group>
        </Form>

        {imageSrc && (
          <>
            <Button onClick={() => setEditedImage(imageSrc)}>Edit Image</Button>
            <img src={editedImage || imageSrc} alt="Preview" className="preview-image" />
          </>
        )}

        <Button style={{ marginTop: "15px" }} type="submit" onClick={handleSubmit}>Upload</Button>

        <CropResizeTiltModal
          isOpen={Boolean(editedImage)}
          onRequestClose={() => setEditedImage(null)}
          imageSrc={imageSrc}
          onSave={handleImageEdit}
        />
      </div>
    </Modal>
  );
};

export default ImageUploadModal;
