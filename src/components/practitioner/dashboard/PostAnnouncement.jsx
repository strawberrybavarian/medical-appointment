import React, { useState, useEffect } from "react";
import { Container, Row, Col, Dropdown, ButtonGroup, Button } from "react-bootstrap";
import axios from "axios";
import CreatePostModal from "./CreatePostModal";
import EditPostModal from "./EditPostModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

function PostAnnouncement({ doctor_image, doctor_name, did }) {
  const [thePost, setThePost] = useState(""); 
  const [postImages, setPostImages] = useState([]); 
  const [deletedImages, setDeletedImages] = useState([]); 
  const [thePosts, setThePosts] = useState([]);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false); 
  const [showEditPostModal, setShowEditPostModal] = useState(false); 
  const [editPostId, setEditPostId] = useState(null); 
  const [currentImageIndexes, setCurrentImageIndexes] = useState({}); // Store individual image indexes for each post

  const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";

  useEffect(() => {
    axios
      .get(`http://localhost:8000/doctor/api/post/getallpost/${did}`)
      .then((res) => {
        const posts = res.data.posts.reverse();
        setThePosts(posts);

        // Initialize image indexes for each post
        const initialIndexes = {};
        posts.forEach((post) => {
          if (post.images && post.images.length > 0) {
            initialIndexes[post._id] = 0; // Initialize to the first image
          }
        });
        setCurrentImageIndexes(initialIndexes);
      })
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

  // Handler for navigating to the previous image for a specific post
  const handlePreviousImage = (postId, images) => {
    setCurrentImageIndexes((prevIndexes) => ({
      ...prevIndexes,
      [postId]: prevIndexes[postId] === 0 ? images.length - 1 : prevIndexes[postId] - 1,
    }));
  };

  // Handler for navigating to the next image for a specific post
  const handleNextImage = (postId, images) => {
    setCurrentImageIndexes((prevIndexes) => ({
      ...prevIndexes,
      [postId]: prevIndexes[postId] === images.length - 1 ? 0 : prevIndexes[postId] + 1,
    }));
  };

  return (
    <Container fluid className="pt-5 w-100">
      <Row className="justify-content-center mb-3">
        <Col>
          <div className="post-container shadow-sm d-flex align-items-center p-3 w-100">
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
      <Row className="justify-content-center p-0">
        <Col className="d-flex justify-content-center ">
          <div className="w-100">
            {thePosts.map((post, index) => 
              post && post.content ? (  // Check if post and content exist
                <div key={index} className="posted-announcement-container shadow-sm d-flex flex-column align-items-start mb-3 w-100">
                  <div className="d-flex w-100 align-items-center justify-content-between p-3">
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
                    <div className="px-4">
                      <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>
                   
                    <div className=" w-100 p-0 m-0 no-gutters" style={{ position: 'relative', margin: '0 auto' }}>
                      {post.images && post.images.length > 0 && (
                        <>
                          <img
                            src={post.images[currentImageIndexes[post._id]]}
                            alt="Post"
                            className="d-block mx-auto"
                            style={{ width: "100%", height: "600px", objectFit: "cover" }}
                          />
                          {/* Left chevron button */}
                          <Button
                            className="position-absolute top-50 start-0 mx-3 translate-middle-y"
                            variant="light"
                            onClick={() => handlePreviousImage(post._id, post.images)}
                            style={{ zIndex: 1,  borderRadius: '9999px' }}
                          >
                            <FontAwesomeIcon icon={faChevronLeft} />
                          </Button>
                          {/* Right chevron button */}
                          <Button
                            className="position-absolute top-50 end-0 translate-middle-y"
                            
                            variant="light"
                            onClick={() => handleNextImage(post._id, post.images)}
                            style={{ zIndex: 1, borderRadius: '9999px' }}
                          >
                            <FontAwesomeIcon icon={faChevronRight} />
                          </Button>
                        </>
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
