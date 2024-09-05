import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import CreatePostModal from "./CreatePostModal"; // Import CreatePostModal
import { useParams } from "react-router-dom";

function PostAnnouncement({ doctor_image, doctor_name }) {
  const [thePost, setThePost] = useState("");
  const [postImages, setPostImages] = useState([]); // State to store images
  const [thePosts, setThePosts] = useState([]);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false); // State for post creation modal
  const { did } = useParams();
  const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

  useEffect(() => {
    // Fetch posts from server
    axios
      .get(`http://localhost:8000/doctor/api/post/getallpost/${did}`)
      .then((res) => setThePosts(res.data.posts.reverse()))
      .catch((err) => console.log(err));
  }, [did]);

  const submitPost = () => {
    const formData = new FormData();
    formData.append("content", thePost);

    postImages.forEach((image) => {
      formData.append("images", image.file);
    });

    axios
      .post(`http://localhost:8000/doctor/api/addpost/${did}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        setThePosts([thePost, ...thePosts]);
        setThePost("");
        setPostImages([]); // Clear the images after submitting
        setShowCreatePostModal(false); // Close the modal after submitting
      })
      .catch((err) => console.log(err));
  };

  const openCreatePostModal = () => {
    setShowCreatePostModal(true);
  };

  const closeCreatePostModal = () => {
    setShowCreatePostModal(false);
  };

  return (
    <Container className="pt-5">
      {/* Post Announcement Input Section */}
      <div>

    
      <Row className="justify-content-center mb-3">
        <Col xs={12} md={8} className="d-flex justify-content-center">
          <div className="post-container shadow-sm d-flex align-items-center p-3 w-100 ">
            <img
              src={doctor_image ? `http://localhost:8000/${doctor_image}` : defaultImage}
              alt="Doctor"
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "9999px",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <Container className="pl-1">
              <button className="button-post" onClick={openCreatePostModal}>
                <span className="font-gray">Share your thoughts, {doctor_name}!</span>
              </button>
            </Container>
          </div>
        </Col>
      </Row>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        show={showCreatePostModal}
        handleClose={closeCreatePostModal}
        handleSubmit={submitPost}
        postContent={thePost}
        setPostContent={setThePost}
        postImages={postImages}
        setPostImages={setPostImages}
      />

      {/* Posts Display Section */}
      <Row className="justify-content-center">
  <Col xs={12} md={8} className="d-flex justify-content-center">
    <div className="w-100">
      {thePosts.map((post, index) => (
        <div key={index} className="posted-announcement-container shadow-sm d-flex flex-column align-items-start p-4 mb-3 w-100">
          {/* Profile image and doctor name */}
          <div className="d-flex w-100 align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <img
                src={doctor_image ? `http://localhost:8000/${doctor_image}` : defaultImage}
                alt="Doctor"
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "9999px",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div style={{ paddingLeft: '0.5rem' }}>
                <span>{doctor_name}</span>
              </div>
            </div>

         
            <div>
              <p style={{ cursor: 'pointer', marginBottom: 0 }}>X</p>
            </div>
          </div>

          <li className="list-unstyled mt-2">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />

            {/* Post Images */}
            {post.images &&
              post.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Post"
                  style={{ maxWidth: "100px", height: "100px", cursor: "pointer" }}
                  className="posted-images"
                />
              ))}
          </li>
        </div>
      ))}
    </div>
  </Col>
</Row>
    </Container>
  );
}

export default PostAnnouncement;
