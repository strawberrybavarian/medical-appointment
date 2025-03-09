import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Button, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEllipsisH, faChevronLeft, faChevronRight, 
  faNewspaper, faPen, faTrash, faCalendarAlt 
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { ip } from "../../../../ContentExport";
import EditNewsModalByAdmin from "./EditNewsModalByAdmin";
import { ChatDotsFill } from "react-bootstrap-icons";
import ChatComponent from "../../../chat/ChatComponent";
import "../../news/NewsAnnouncement.css"; // Import the NewsAnnouncement CSS

function NewsList({ user_id, role }) {
  const [newsList, setNewsList] = useState([]);
  const [showEditNewsModal, setShowEditNewsModal] = useState(false);
  const [editNewsId, setEditNewsId] = useState(null);
  const [editNewsContent, setEditNewsContent] = useState("");
  const [editNewsImages, setEditNewsImages] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all general news posts
  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${ip.address}/api/news/api/getgeneralnews`)
      .then((res) => {
        const news = res.data.news.reverse(); // Reverse the order to show the latest news first
        setNewsList(news);

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
        console.log("Error fetching news:", err);
        setIsLoading(false);
      });
  }, []);

  // Open edit modal for specific news post
  const openEditNewsModal = (newsId, content, images) => {
    setEditNewsId(newsId);
    setEditNewsContent(content);
    setEditNewsImages(images);
    setShowEditNewsModal(true);
  };

  // Close the edit modal
  const closeEditNewsModal = () => {
    setShowEditNewsModal(false);
    setEditNewsContent("");
    setEditNewsImages([]);
  };

  // Delete news
  const deleteNews = (newsId) => {
    axios
      .delete(`${ip.address}/api/news/api/deletenews/${user_id}/${newsId}`, {
        data: { role: role }, // Pass the role in the request body
      })
      .then(() => {
        setNewsList(newsList.filter((news) => news._id !== newsId));
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
          <h2 className="news-title">All News</h2>
        </div>
        <p className="news-subtitle">View and manage all news posts from the platform</p>
      </div>

      {isLoading ? (
        <div className="news-loading">
          <div className="news-loading-spinner"></div>
          <p>Loading news...</p>
        </div>
      ) : newsList.length > 0 ? (
        <div className="news-feed">
          {newsList.map((newsItem, index) => (
            <div key={index} className="news-card">
              <div className="news-card-header">
                <div className="news-author">
                  <div className="news-author-avatar">
                    <img
                      src={`${ip.address}/images/014ef2f860e8e56b27d4a3267e0a193a.jpg`}
                      alt="User"
                    />
                  </div>
                  <div className="news-author-info">
                    <h5 className="news-author-name">
                      {newsItem.postedByInfo.role === "Admin"
                        ? `${newsItem.postedByInfo?.firstName} ${newsItem.postedByInfo?.lastName}`
                        : `${newsItem.postedByInfo?.ms_firstName} ${newsItem.postedByInfo?.ms_lastName}`}
                    </h5>
                    <div className="news-meta">
                      <span className="news-author-role">{newsItem?.role}</span>
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
          <p>There are no news posts to display at this time.</p>
        </div>
      )}

      {/* Chat Button */}
      <div className="chat-btn-container">
        <Button
          className="chat-toggle-btn"
          onClick={() => setShowChat(!showChat)}
        >
          <ChatDotsFill size={30} />
        </Button>
      </div>

      {showChat && (
        <div className="chat-overlay">
          <ChatComponent
            userId={user_id}
            userRole={role}
            closeChat={() => setShowChat(false)}
          />
        </div>
      )}

      {/* Edit News Modal */}
      <EditNewsModalByAdmin
        show={showEditNewsModal}
        handleClose={() => setShowEditNewsModal(false)}
        newsContent={editNewsContent}
        setNewsContent={setEditNewsContent}
        newsImages={editNewsImages}
        setNewsImages={setEditNewsImages}
        userId={user_id}
        newsId={editNewsId}
        role={role}
        updateNewsInState={(updatedNews) => {
          setNewsList((prevNewsList) =>
            prevNewsList.map((newsItem) =>
              newsItem._id === updatedNews._id ? updatedNews : newsItem
            )
          );
        }}
      />
    </div>
  );
}

export default NewsList;