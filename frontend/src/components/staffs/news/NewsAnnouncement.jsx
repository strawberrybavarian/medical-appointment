import React, { useState, useEffect } from "react";
import { Container, Row, Col, Dropdown, ButtonGroup, Button } from "react-bootstrap";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import CreateNewsModal from "./CreateNewsModal";
import axios from "axios";
import EditNewsModal from "./EditNewsModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { ip } from "../../../ContentExport";
function NewsAnnouncement({ user_image, user_name, user_id, role }) {
  const [theNews, setTheNews] = useState("");
  const [newsImages, setNewsImages] = useState([]); // For storing new images during creation
  const [theNewsList, setTheNewsList] = useState([]); // List of all news
  const [showCreateNewsModal, setShowCreateNewsModal] = useState(false); // Show modal to create news
  const [showEditNewsModal, setShowEditNewsModal] = useState(false); // Show modal to edit news
  const [editNewsId, setEditNewsId] = useState(null); // Track news being edited
  const [deletedImages, setDeletedImages] = useState([]); // Images deleted during edit
  const [headline, setHeadline] = useState(""); // Headline state
  const [currentImageIndexes, setCurrentImageIndexes] = useState({}); // Store individual image indexes for each news

  
  const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
  
  // Fetch all news
  useEffect(() => {
    axios
      .get(`${ip.address}/api/news/api/getallnews/${user_id}/${role}`)
      .then((res) => {
        const news = res.data.news.reverse();
        setTheNewsList(news);

        // Initialize image indexes for each news
        const initialIndexes = {};
        news.forEach((newsItem) => {
          if (newsItem.images && newsItem.images.length > 0) {
            initialIndexes[newsItem._id] = 0; // Initialize to the first image
          }
        });
        setCurrentImageIndexes(initialIndexes);
      })
      .catch((err) => console.log(err));
  }, [user_id, role]);

  // Submit new news
  const submitNews = (headline, newsContent) => {
    const formData = new FormData();
    formData.append("headline", headline);
    formData.append("content", newsContent);
    formData.append("role", role);
  
    newsImages.forEach((image) => {
      formData.append("images", image.file);
    });
  
    axios
      .post(`${ip.address}/api/news/api/addnews/${user_id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        setTheNewsList([{ headline, content: newsContent, images: newsImages }, ...theNewsList]);
        setTheNews("");  // Reset news content
        setHeadline("");  // Reset headline (if necessary)
        setNewsImages([]);
        setShowCreateNewsModal(false); // Close modal
      })
      .catch((err) => console.log(err));
  };

  // Open edit modal with selected news
  const openEditNewsModal = (newsId, content, images) => {
    setTheNews(content);
    setNewsImages(images);
    setDeletedImages([]);
    setEditNewsId(newsId); 
    setShowEditNewsModal(true);
  };

  // Close the edit modal
  const closeEditNewsModal = () => {
    setShowEditNewsModal(false);
    setTheNews("");
    setNewsImages([]);
  };

  // Update state after editing news
  const updateNewsInState = (newsId, updatedNews) => {
    const updatedNewsList = theNewsList.map((news) =>
      news._id === newsId ? updatedNews : news
    );
    setTheNewsList(updatedNewsList);
  };

  // Delete news from the list
// Delete news from the list
// Delete news from the list
// Delete news by its _id
const deleteNews = (newsId) => {
  axios
    .delete(`${ip.address}/api/news/api/deletenews/${user_id}/${newsId}`, {
      data: { role: role }, // Pass the role in the request body
    })
    .then(() => {
      setTheNewsList(theNewsList.filter(news => news._id !== newsId)); // Remove from state
    })
    .catch((err) => console.log("Error deleting news:", err.response ? err.response.data : err.message));
};




  // Handler for navigating to the previous image for a specific news
  const handlePreviousImage = (newsId, images) => {
    setCurrentImageIndexes((prevIndexes) => ({
      ...prevIndexes,
      [newsId]: prevIndexes[newsId] === 0 ? images.length - 1 : prevIndexes[newsId] - 1,
    }));
  };

  // Handler for navigating to the next image for a specific news
  const handleNextImage = (newsId, images) => {
    setCurrentImageIndexes((prevIndexes) => ({
      ...prevIndexes,
      [newsId]: prevIndexes[newsId] === images.length - 1 ? 0 : prevIndexes[newsId] + 1,
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }} className="mt-2">
      <div className="mb-2">
        <h2> Share News </h2>
        <hr/>
      </div>
      <div className="d-flex post-container p-3 w-100 shadow-sm">
        <img
          src={`${ip.address}/${defaultImage}`}
          alt="User"
          style={{
            width: "45px",
            height: "45px",
            borderRadius: "9999px",
            objectFit: "cover",
          }}
        />
        <Container>
          <button className="button-post" onClick={() => setShowCreateNewsModal(true)}>
            <span className="font-gray">Share your news, {user_name}!</span>
          </button>
        </Container>
      </div>
      <hr/>
      {/* News List */}
      <div className="w-100">
        {theNewsList.map((newsItem, index) => (
          <div key={index} className="posted-announcement-container shadow-sm d-flex flex-column align-items-start p-3 mb-3 w-100">
            {/* Profile image and user name */}
            <div className="d-flex w-100 align-items-center justify-content-between">
              <div className="d-flex align-items-center" style={{ width: "100%" }}>
                <img
                  src={`${ip.address}/${defaultImage}`}
                  alt="User"
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "9999px",
                    objectFit: "cover",
                    flexShrink: 0,
                    marginRight: "10px", // Space between image and text
                  }}
                />
                <div className="w-100">
                  <span style={{ fontSize: "12px", margin: "5px 0", fontWeight: "bold", lineHeight: "1.2" }}>{user_name}</span>
                  <p style={{ fontSize: "12px", margin: "1.2px 0", lineHeight: "1.2" }}>
                    <span>{role}</span>
                  </p>
                </div>
              </div>

              {/* Dropdown for Edit and Delete */}
              <Dropdown as={ButtonGroup}>
                <Dropdown.Toggle variant="secondary">&#8942;</Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => openEditNewsModal(newsItem._id, newsItem.content, newsItem.images)}>
                    Edit
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => deleteNews(newsItem._id)}>Delete</Dropdown.Item>

                </Dropdown.Menu>
              </Dropdown>
            </div>

            {/* News Headline */}
            {newsItem.headline && (
              <h5 className="mt-2" style={{ fontWeight: "bold" }}>
                <Link to={`/news/${newsItem._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {newsItem.headline}
                </Link>
              </h5>
            )}

            {/* News Content */}
            <div className="mt-2">
              <div dangerouslySetInnerHTML={{ __html: newsItem.content }} />
              {newsItem.images && newsItem.images.length > 0 && (
                <div className="w-100 position-relative">
                  <img
                    src={`${ip.address}/${newsItem.images[currentImageIndexes[newsItem._id]]}`}
                    alt="News"
                    style={{ maxWidth: "100%", height: "auto", cursor: "pointer" }}
                  />
                  {/* Left chevron button */}
                  <Button
                    className="position-absolute top-50 start-0 mx-3 translate-middle-y"
                    variant="light"
                    onClick={() => handlePreviousImage(newsItem._id, newsItem.images)}
                    style={{ zIndex: 1, borderRadius: '9999px' }}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </Button>
                  {/* Right chevron button */}
                  <Button
                    className="position-absolute top-50 end-0 translate-middle-y"
                    variant="light"
                    onClick={() => handleNextImage(newsItem._id, newsItem.images)}
                    style={{ zIndex: 1, borderRadius: '9999px' }}
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateNewsModal
        show={showCreateNewsModal}
        handleClose={() => setShowCreateNewsModal(false)}
        handleSubmit={submitNews}
        newsContent={theNews}
        setNewsContent={setTheNews}
        newsImages={newsImages}
        setNewsImages={setNewsImages}
      />

      {/* Edit News Modal */}
      <EditNewsModal
        show={showEditNewsModal}
        handleClose={closeEditNewsModal}
        newsContent={theNews}
        setNewsContent={setTheNews}
        newsImages={newsImages}
        setNewsImages={setNewsImages}
        deletedImages={deletedImages}
        setDeletedImages={setDeletedImages}
        userId={user_id}
        newsId={editNewsId}
        updateNewsInState={updateNewsInState}
        role={role}
      />
    </div>
  );
}

export default NewsAnnouncement;
