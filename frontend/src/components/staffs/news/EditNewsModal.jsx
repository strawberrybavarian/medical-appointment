import React, { useState, useEffect } from "react";
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
  console.log("newsImages:", newsImages);  // Check if newsImages is correctly passed down
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
        `${ip.address}/api/news/api/updatenews/${userId}/${newsId}`, // Correct URL format
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      updateNewsInState(newsId, response.data.updatedNews);
      handleClose();
    } catch (error) {
      console.error("Error updating news:", error);  // Log error to debug further
    }
  };


  
  const fetchNewsData = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${ip.address}/api/news/api/getnews/${id}`);
      const newsData = response.data.news;

      
      // THIS IS THE KEY PART - Transform the image paths for ImageNewsUpload
      if (newsData.images && newsData.images.length > 0) {
        // Create properly formatted image objects for each path
        const formattedImages = newsData.images.map(imagePath => ({
          path: imagePath,                       // Store original path
          preview: `${ip.address}/${imagePath}`, // Full URL for preview
          isExisting: true                       // Flag to identify existing images
        }));
        
        console.log("Formatted images for upload:", formattedImages);
        setNewsImages(formattedImages);
      } else {
        setNewsImages([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching news:", error);
      setLoading(false);
    }
  };

  

  return (
    <Modal size='lg' className="am-overlay" show={show} onHide={handleClose}>
      <Modal.Header className="am-header" closeButton>
        <Modal.Title>Update News</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Quill editor for the content */}
          <ReactQuill style={{marginBottom: '10px'}} value={newsContent} onChange={setNewsContent} />

          {/* ImageUpload component now correctly handles deletion */}
          <ImageNewsUpload
            style={{marginBottom: '10px'}}
            newsImages={newsImages}  // Use the correct prop names for news
            setNewsImages={setNewsImages}
            handleImageDelete={handleImageDelete} // Pass the delete function
          />

          {/* Update button with loading state */}

        </Form>


      </Modal.Body>


      <Modal.Footer>
          <Button variant="primary" onClick={handleUpdate} disabled={loading}>
                {loading ? 'Updating...' : 'Update'}
              </Button>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
      </Modal.Footer>

    </Modal>
  );
}

export default EditNewsModal;
