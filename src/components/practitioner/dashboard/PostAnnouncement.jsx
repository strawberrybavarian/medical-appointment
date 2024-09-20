import React, { useState, useEffect } from "react";
import { Container, Row, Col, Dropdown, ButtonGroup } from "react-bootstrap";
import axios from "axios";
import Slider from "react-slick";  // Importing react-slick for the slider
import CreatePostModal from "./CreatePostModal";
import EditPostModal from "./EditPostModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
// import { textAlign } from "html2canvas/dist/types/css/property-descriptors/text-align";

function PostAnnouncement({ doctor_image, doctor_name, did }) {
  const [thePost, setThePost] = useState(""); 
  const [postImages, setPostImages] = useState([]); 
  const [deletedImages, setDeletedImages] = useState([]); 
  const [thePosts, setThePosts] = useState([]);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false); 
  const [showEditPostModal, setShowEditPostModal] = useState(false); 
  const [editPostId, setEditPostId] = useState(null); 

  const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

  useEffect(() => {
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
      .then((res) => {
        setThePosts([res.data.newPost, ...thePosts]); 
        setThePost("");
        setPostImages([]);
        setShowCreatePostModal(false);
      })
      .catch((err) => console.log(err));
  };

  const updatePostInState = (postId, updatedPost) => {
    const updatedPosts = thePosts.map((post) => (post._id === postId ? updatedPost : post));
    setThePosts(updatedPosts);
  };

  const openEditPostModal = (postId, content, images) => {
    setThePost(content);
    setPostImages(images);
    setDeletedImages([]);
    setEditPostId(postId);
    setShowEditPostModal(true);
  };

  const closeEditPostModal = () => {
    setShowEditPostModal(false);
    setThePost("");
  };

  const deletePost = (index) => {
    axios
      .delete(`http://localhost:8000/doctor/api/post/deletepost/${did}/${index}`)
      .then(() => setThePosts(thePosts.filter((_, i) => i !== index)))
      .catch((err) => {
        console.log("Error deleting post:", err.response ? err.response.data : err.message);
      });
  };

  // Slider settings for react-slick
  const sliderSettings = {
    dots: true,  // Show dots for navigation like Instagram
    infinite: false,  // Do not loop around
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <FontAwesomeIcon icon={faChevronLeft} className="slick-prev" />,
    nextArrow: <FontAwesomeIcon icon={faChevronRight} className="slick-next" />,
    swipeToSlide: true,  // Allow swiping to slide images like Instagram
  };
  
  // CSS changes
  const sliderContainerStyle = {
    width: '100%',  // Ensure the slider takes the full width
    maxWidth: '400px',  // Limit the max width for better control
    margin: '0 auto', 
  };

  return (
    <Container className="pt-5">
      <Row className="justify-content-center mb-3">
        <Col xs={12} md={8}>
          <div className="post-container shadow-sm d-flex align-items-center p-3 w-100 ">
            <img
              src={doctor_image ? `http://localhost:8000/${doctor_image}` : defaultImage}
              alt={doctor_name}
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "9999px",
                objectFit: "cover",
              }}
            />
            <Container>
              <button className="button-post" onClick={() => setShowCreatePostModal(true)}>
                <span className="font-gray">Share your thoughts, {doctor_name}!</span>
              </button>
            </Container>
          </div>
        </Col>
      </Row>

      {/* Create Post Modal */}
      <CreatePostModal
        show={showCreatePostModal}
        handleClose={() => setShowCreatePostModal(false)}
        handleSubmit={submitPost}
        postContent={thePost}
        setPostContent={setThePost}
        postImages={postImages}
        setPostImages={setPostImages}
      />

      {/* Edit Post Modal */}
      <EditPostModal
        show={showEditPostModal}
        handleClose={closeEditPostModal}
        postContent={thePost}
        setPostContent={setThePost}
        postImages={postImages}
        setPostImages={setPostImages}
        deletedImages={deletedImages}
        setDeletedImages={setDeletedImages}
        did={did}
        postId={editPostId}
        updatePostInState={updatePostInState}
      />

      {/* Posts List */}
      <Row className="justify-content-center">
        <Col xs={12} md={8} className="d-flex justify-content-center">
          <div className="w-100">
            {thePosts.map((post, index) => 
              post && post.content ? (  // Check if post and content exist
                <div key={index} className="posted-announcement-container shadow-sm d-flex flex-column align-items-start p-4 mb-3 w-100">
                  <div className="d-flex w-100 align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <img
                        src={doctor_image ? `http://localhost:8000/${doctor_image}` : defaultImage}
                        alt={doctor_name}
                        style={{ width: "45px", height: "45px", borderRadius: "9999px" }}
                      />
                      <div style={{ paddingLeft: '0.5rem' }}>
                        <span>{doctor_name}</span>
                      </div>
                    </div>

                    <Dropdown as={ButtonGroup}>
                      <Dropdown.Toggle variant="secondary" as="div" className="p-0 m-0 border-0 bg-transparent">
                        <FontAwesomeIcon icon={faEllipsisH} />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => openEditPostModal(post._id, post.content, post.images)}>
                          Edit
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => deletePost(index)}>  {/* Pass index instead of postId */}
                          Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>

                  <div className="mt-2 w-100">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    <div className="d-flex justify-content-center w-100" style={{width:'100%'}}>
                      {post.images && post.images.length > 0 && (
                        <Container style={sliderContainerStyle}>  {/* Apply the container styling */}
                          <Slider {...sliderSettings}>
                            {post.images.map((img, i) => (
                              <div key={i}>
                                <img
                                  src={img}
                                  alt="Post"
                                  className="d-block mx-auto"  // Ensure image is centered
                                  style={{ width: "100%", height: "400px", objectFit: "cover" }} // Ensure image fits correctly
                                />
                              </div>
                            ))}
                          </Slider>
                        </Container>
                      )}
                    </div>
                  </div>
                </div>
              ) : null  // If post or content is undefined, do not render
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default PostAnnouncement;
