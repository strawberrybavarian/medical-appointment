import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import ImageUpload from "./ImageUpload"; // Import image upload component
import axios from "axios";
import { ip } from "../../../ContentExport";
function EditPostModal({ show, handleClose, postContent, setPostContent, postImages, setPostImages, deletedImages, setDeletedImages, did, postId, updatePostInState }) {
  const [loading, setLoading] = useState(false);

  // Function to delete images, now correctly passed down to the ImageUpload component
  const handleImageDelete = (imageToDelete) => {
    setDeletedImages([...deletedImages, imageToDelete]);
    setPostImages(postImages.filter(image => image !== imageToDelete));
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("content", postContent);
    postImages.forEach((image) => {
      formData.append("images", image.file ? image.file : image);
    });
    formData.append("deletedImages", JSON.stringify(deletedImages));

    try {
      setLoading(true);
      const response = await axios.put(
        `${ip.address}/api/doctor/api/post/updatepost/${did}/${postId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      updatePostInState(postId, response.data.updatedPost);
      handleClose();
      setLoading(false);
    } catch (error) {
      console.error('Error updating post:', error);
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Update Post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <ReactQuill value={postContent} onChange={setPostContent} />

          {/* ImageUpload component now correctly handles deletion */}
          <ImageUpload
            postImages={postImages}
            setPostImages={setPostImages}
            handleImageDelete={handleImageDelete} // Pass the delete function
          />

          <Button variant="primary" onClick={handleUpdate} disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditPostModal;
