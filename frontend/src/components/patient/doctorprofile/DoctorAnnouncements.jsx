import React, { useState, useEffect } from "react";
import { Button, Dropdown, ButtonGroup } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import { ip } from "../../../ContentExport";  // Assuming this contains your IP

function DoctorAnnouncements({ doctorId, theImage, theName }) {
  const [posts, setPosts] = useState([]);
  const [doctorName, setDoctorName] = useState('');
  const [doctorImage, setDoctorImage] = useState('');
  const [currentImageIndexes, setCurrentImageIndexes] = useState({}); // Store individual image indexes for each post

  useEffect(() => {
    // Fetch doctor posts
    axios.get(`${ip.address}/api/doctor/api/post/getallpost/${doctorId}`)
      .then((res) => {
        const fetchedPosts = res.data.posts.reverse();
        setPosts(fetchedPosts);

        // Initialize image indexes for each post
        const initialIndexes = {};
        fetchedPosts.forEach((post) => {
          if (post.images && post.images.length > 0) {
            initialIndexes[post._id] = 0; // Initialize to the first image
          }
        });
        setCurrentImageIndexes(initialIndexes);
      })
      .catch((err) => console.log(err));

    // Fetch doctor info

  }, [doctorId]);

  const handlePreviousImage = (postId, images) => {
    setCurrentImageIndexes((prevIndexes) => ({
      ...prevIndexes,
      [postId]: prevIndexes[postId] === 0 ? images.length - 1 : prevIndexes[postId] - 1,
    }));
  };

  const handleNextImage = (postId, images) => {
    setCurrentImageIndexes((prevIndexes) => ({
      ...prevIndexes,
      [postId]: prevIndexes[postId] === images.length - 1 ? 0 : prevIndexes[postId] + 1,
    }));
  };

  return (
    <div className="shadow-sm w-100">
      {posts.map((post, index) => (
        <div key={index} className="posted-announcement-container shadow-sm d-flex flex-column align-items-start p-4 mb-3 w-100">
          <div className="d-flex w-100 align-items-center justify-content-between p-3">
            <div className="d-flex align-items-center">
              <img
                 src={`${ip.address}/${theImage}`}
                alt="Doctor"
                style={{ width: "45px", height: "45px", borderRadius: "9999px" }}
              />
              <div style={{ paddingLeft: '0.5rem' }}>
                <span>{doctorName}</span>
              </div>
            </div>

            <Dropdown as={ButtonGroup}>
              <Dropdown.Toggle variant="secondary" as="div" className="p-0 m-0 border-0 bg-transparent">
                <FontAwesomeIcon icon={faEllipsisH} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>View</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <div className="mt-2 mb-3 w-100">
            <div className="px-4">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            <div className="w-100 p-0 m-0 no-gutters" style={{ position: 'relative', margin: '0 auto' }}>
              {post.images && post.images.length > 0 && (
                <>
                  <img
                    src={post.images[currentImageIndexes[post._id]]}
                    alt="Post"
                    className="d-block mx-auto"
                    style={{ width: "100%", height: "500px", objectFit: "cover" }}
                  />

                  <Button
                    className="position-absolute top-50 start-0 mx-3 translate-middle-y"
                    variant="light"
                    onClick={() => handlePreviousImage(post._id, post.images)}
                    style={{ zIndex: 1, borderRadius: '9999px' }}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </Button>

                  <Button
                    className="position-absolute top-50 end-0 mx-3 translate-middle-y"
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
      ))}
    </div>
  );
}

export default DoctorAnnouncements;
