import React, { useState, useEffect } from "react";
import { Container, Dropdown, ButtonGroup, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import CreateNewsModal from "./CreateNewsModal";
import axios from "axios";
import EditNewsModal from "./EditNewsModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH, faChevronLeft, faChevronRight, faNewspaper, faPen, faTrash, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { ip } from "../../../ContentExport";
import './NewsAnnouncement.css';

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
  const [isLoading, setIsLoading] = useState(true);

  const defaultImage = user_image || "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
  
  // Fetch all news
  useEffect(() => {
    setIsLoading(true);
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
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="news-announcement">
      <div className="news-header">
        <div className="news-title-wrapper">
          <FontAwesomeIcon icon={faNewspaper} className="news-title-icon" />
          <h2 className="news-title">Share News</h2>
        </div>
        <p className="news-subtitle">Share updates and important information with patients and staff</p>
      </div>

      <div className="news-composer">
        <div className="news-composer-avatar">
          <img src={`${ip.address}/${defaultImage}`} alt={user_name} />
        </div>
        <button className="news-composer-button" onClick={() => setShowCreateNewsModal(true)}>
          <span>Share your news, {user_name}!</span>
        </button>
      </div>

      {isLoading ? (
        <div className="news-loading">
          <div className="news-loading-spinner"></div>
          <p>Loading news...</p>
        </div>
      ) : theNewsList.length > 0 ? (
        <div className="news-feed">
          {theNewsList.map((newsItem, index) => (
            <div key={index} className="news-card">
              <div className="news-card-header">
                <div className="news-author">
                  <div className="news-author-avatar">
                    <img src={`${ip.address}/${defaultImage}`} alt={user_name} />
                  </div>
                  <div className="news-author-info">
                    <h5 className="news-author-name">{user_name}</h5>
                    <div className="news-meta">
                      <span className="news-author-role">{role}</span>
                      {newsItem.createdAt && (
                        <span className="news-date">
                          <FontAwesomeIcon icon={faCalendarAlt} className="news-date-icon" />
                          {formatDate(newsItem.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Dropdown className="news-actions">
                  <Dropdown.Toggle variant="light" className="news-actions-toggle">
                    <FontAwesomeIcon icon={faEllipsisH} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu align="end" className="news-actions-menu">
                    <Dropdown.Item className="news-action-item" onClick={() => openEditNewsModal(newsItem._id, newsItem.content, newsItem.images)}>
                      <FontAwesomeIcon icon={faPen} className="news-action-icon" /> Edit
                    </Dropdown.Item>
                    <Dropdown.Item className="news-action-item news-action-delete" onClick={() => deleteNews(newsItem._id)}>
                      <FontAwesomeIcon icon={faTrash} className="news-action-icon" /> Delete
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div className="news-card-body">
                {newsItem.headline && (
                  <Link to={`/news/${newsItem.news_ID}`} className="news-headline-link">
                    <h4 className="news-headline">{newsItem.headline}</h4>
                  </Link>
                )}

                <div className="news-content">
                  <div dangerouslySetInnerHTML={{ __html: newsItem.content }} />
                </div>

                {newsItem.images && newsItem.images.length > 0 && (
                  <div className="news-image-gallery">
                    <div className="news-image-container">
                      <img
                        src={`${ip.address}/${newsItem.images[currentImageIndexes[newsItem._id] || 0]}`}
                        alt="News"
                        className="news-image"
                      />

                      {newsItem.images.length > 1 && (
                        <>
                          <Button
                            className="news-nav-button news-prev-button"
                            variant="light"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePreviousImage(newsItem._id, newsItem.images);
                            }}
                            aria-label="Previous image"
                          >
                            <FontAwesomeIcon icon={faChevronLeft} />
                          </Button>

                          <Button
                            className="news-nav-button news-next-button"
                            variant="light"
                            onClick={(e) => {
                              e.preventDefault();
                              handleNextImage(newsItem._id, newsItem.images);
                            }}
                            aria-label="Next image"
                          >
                            <FontAwesomeIcon icon={faChevronRight} />
                          </Button>

                          <div className="news-image-counter">
                            {(currentImageIndexes[newsItem._id] || 0) + 1}/{newsItem.images.length}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="news-empty">
          <FontAwesomeIcon icon={faNewspaper} className="news-empty-icon" />
          <h4>No News Available</h4>
          <p>Be the first to share news and updates!</p>
          <Button variant="primary" className="news-empty-button" onClick={() => setShowCreateNewsModal(true)}>
            Create Your First News
          </Button>
        </div>
      )}

      <CreateNewsModal
        show={showCreateNewsModal}
        handleClose={() => setShowCreateNewsModal(false)}
        handleSubmit={submitNews}
        newsContent={theNews}
        setNewsContent={setTheNews}
        newsImages={newsImages}
        setNewsImages={setNewsImages}
      />

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