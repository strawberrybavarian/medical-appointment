import React, { useState } from "react";
import { Form } from "react-bootstrap";

function ImageNewsUpload({ newsImages = [], setNewsImages, handleImageDelete }) {
  const [dragActive, setDragActive] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewsImages([...newsImages, ...newImages]); // Use newsImages and setNewsImages for news-specific images
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewsImages([...newsImages, ...newImages]);
  };

  const removeImage = (index) => {
    const imageToDelete = newsImages[index]; // Get the image to delete for news
    handleImageDelete(imageToDelete); // Call the delete function passed from EditNewsModal
    const newImages = [...newsImages];
    newImages.splice(index, 1);
    setNewsImages(newImages);
  };

  return (
    <Form.Group>
      <div
        className={`upload-container ${dragActive ? "drag-active" : ""}`}
        onClick={() => document.getElementById("imageInput").click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-inside-container">
          {newsImages.length === 0 ? (
            <div className="add-photos-placeholder">
              <span>Add Photos/Videos</span>
              <span>or drag and drop</span>
            </div>
          ) : (
            <div className="image-previews">
              {newsImages.map((image, index) => (
                <div key={index} className="image-preview">
                  <img
                    src={image.preview || image} // Use image.preview for new images or existing images
                    alt="preview"
                    style={{ cursor: "pointer" }}
                  />
                  <button
                    className="button-delete-image"
                    onClick={() => removeImage(index)} // Call removeImage to delete the image
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <input
        id="imageInput"
        type="file"
        multiple
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
    </Form.Group>
  );
}

export default ImageNewsUpload;
