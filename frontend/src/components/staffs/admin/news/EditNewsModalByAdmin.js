import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import axios from "axios";
import { ip } from "../../../../ContentExport";
import ImageNewsUpload from "../../news/ImageNewsUpload";

function EditNewsModalByAdmin({ 
  show,
  handleClose,
  newsContent,
  setNewsContent,
  newsImages,
  setNewsImages,
  deletedImages,
  setDeletedImages,
  newsId,
  updateNewsInState,
  role,
  headline,
}) {
  const [loading, setLoading] = useState(false);

  // Function to delete images, correctly passed down to the ImageUpload component
  const handleImageDelete = (imageToDelete) => {
    setDeletedImages([...deletedImages, imageToDelete]);
    setNewsImages(newsImages.filter(image => image !== imageToDelete));
  };

  const handleUpdate = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append("content", newsContent);

    newsImages.forEach((image) => {
      formData.append("images", image.file ? image.file : image);
    });

    // Ensure deletedImages is always a valid JSON string
    formData.append("deletedImages", JSON.stringify(deletedImages || []));
    formData.append("role", role);  // Ensure the role is appended to the request body

    try {
      const response = await axios.put(
        `${ip.address}/api/news/api/updatenewsbyadmin/${newsId}`, // New endpoint for admin update
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      updateNewsInState(response.data.updatedNews);  // Update the news list state with updated news
      handleClose();  // Close the modal after successful update
    } catch (error) {
      console.error("Error updating news:", error);
    } finally {
      setLoading(false);
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

export default EditNewsModalByAdmin;
