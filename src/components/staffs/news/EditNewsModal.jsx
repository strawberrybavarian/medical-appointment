import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import axios from "axios";
import ImageNewsUpload from "./ImageNewsUpload";
import { ip } from "../../../ContentExport";

function EditNewsModal({ 
    show,
    handleClose,
    newsContent,
    setNewsContent,
    newsImages,
    setNewsImages,
    deletedImages,
    setDeletedImages,
    userId,
    newsId,
    updateNewsInState,
    role,
    headline, // Pass headline here
}) {
  const [loading, setLoading] = useState(false);

  // Function to delete images, correctly passed down to the ImageUpload component
  const handleImageDelete = (imageToDelete) => {
    setDeletedImages([...deletedImages, imageToDelete]);
    setNewsImages(newsImages.filter(image => image !== imageToDelete));
  };

  const handleUpdate = async () => {
    console.log("userId:", userId);  // Check if userId is correct
    console.log("newsId:", newsId);  // Check if newsId is correct
    console.log("role:", role);      // Check if role is defined and correct
  
    const formData = new FormData();
    formData.append("content", newsContent);
  
    newsImages.forEach((image) => {
      formData.append("images", image.file ? image.file : image);
    });
  
    formData.append("deletedImages", JSON.stringify(deletedImages));
    formData.append("role", role);  // Ensure the role is appended to the request body
  
    try {
      const response = await axios.put(
        `${ip.address}/news/api/updatenews/${userId}/${newsId}`, // Correct URL format
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      updateNewsInState(newsId, response.data.updatedNews);
      handleClose();
    } catch (error) {
      console.error("Error updating news:", error);  // Log error to debug further
    }
  };
  

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Update News</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Quill editor for the content */}
          <ReactQuill value={newsContent} onChange={setNewsContent} />

          {/* ImageUpload component now correctly handles deletion */}
          <ImageNewsUpload
            newsImages={newsImages}  // Use the correct prop names for news
            setNewsImages={setNewsImages}
            handleImageDelete={handleImageDelete} // Pass the delete function
          />

          {/* Update button with loading state */}
          <Button variant="primary" onClick={handleUpdate} disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditNewsModal;
