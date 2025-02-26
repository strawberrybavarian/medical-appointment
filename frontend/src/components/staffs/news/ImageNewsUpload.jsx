import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { ip } from "../../../ContentExport";

function ImageNewsUpload({ newsImages = [], setNewsImages, handleImageDelete }) {
  const [dragActive, setDragActive] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    }));
    setNewsImages([...newsImages, ...newImages]);
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
      isNew: true
    }));
    setNewsImages([...newsImages, ...newImages]);
  };

  const removeImage = (index) => {
    const imageToDelete = newsImages[index];
    if (typeof handleImageDelete === 'function') {
      handleImageDelete(imageToDelete);
    }
    const newImages = [...newsImages];
    newImages.splice(index, 1);
    setNewsImages(newImages);
  };

  // Updated helper function to get image source with IP address when needed
  const getImageSource = (image) => {
    if (typeof image === 'string') {
      // For string paths, add the IP address prefix
      return `${ip.address}/${image}`;
    } else if (image.preview) {
      // For new uploads with preview URL
      return image.preview;
    } else if (image.path) {
      // For existing images with path property
      return `${ip.address}/${image.path}`;
    } else if (image.url) {
      // For images with a url property
      return image.url;
    } else if (image.src) {
      // For images with a src property
      return image.src;
    } else if (image.image) {
      // For images with an image property
      return image.image;
    }
    
    console.log("Unknown image format:", image);
    return ""; // Fallback
  };

  console.log("Current newsImages:", newsImages); // Debug log

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
                    src={getImageSource(image)}
                    alt={`preview-${index}`}
                    style={{ cursor: "pointer" }}
                    onError={(e) => {
                      console.error("Image failed to load:", image);
                      e.target.src = "https://via.placeholder.com/150?text=Image+Error";
                    }}
                  />
                  <Button
                    className="button-delete-image"
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent opening file dialog
                      removeImage(index);
                    }}
                  >
                    x
                  </Button>
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
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
    </Form.Group>
  );
}

export default ImageNewsUpload;