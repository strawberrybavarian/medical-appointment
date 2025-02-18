import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Button, Dropdown, ButtonGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import EditNewsModal from "../../news/EditNewsModal";
import { ip } from "../../../../ContentExport";
import EditNewsModalByAdmin from "./EditNewsModalByAdmin";
function NewsList({ user_id, role }) {
  const [newsList, setNewsList] = useState([]);
  const [showEditNewsModal, setShowEditNewsModal] = useState(false);
  const [editNewsId, setEditNewsId] = useState(null);
  const [editNewsContent, setEditNewsContent] = useState("");
  const [editNewsImages, setEditNewsImages] = useState([]);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({}); // Store individual image indexes for each news
    console.log(newsList);  // Check if userId is correct
  // Fetch all general news posts
  useEffect(() => {
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
      })
      .catch((err) => console.log("Error fetching news:", err));
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

  return (
    <div className="news-list-container">
      <h3>All News</h3>
      <hr />
      <Container>
        {newsList.map((newsItem, index) => (
          <div key={index} className="posted-announcement-container shadow-sm d-flex flex-column align-items-start p-3 mb-3 w-100">
            {/* Profile image and user name */}
            <div className="d-flex w-100 align-items-center justify-content-between">
              <div className="d-flex align-items-center" style={{ width: "100%" }}>
                <img
                  src={`${ip.address}/images/014ef2f860e8e56b27d4a3267e0a193a.jpg`} // Use your default or dynamic profile image path
                  alt="User"
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "9999px",
                    objectFit: "cover",
                    marginRight: "10px", // Space between image and text
                  }}
                />
                <div className="w-100">

                <span
                    style={{
                        fontSize: "12px",
                        margin: "5px 0",
                        fontWeight: "bold",
                        lineHeight: "1.2",
                    }}
                    >
                    {/* Check if the role is 'Admin' or 'Medical Secretary' */}
                    {newsItem.postedByInfo.role === "Admin"
                        ? (`${newsItem.postedByInfo?.firstName} ${newsItem.postedByInfo?.lastName} `)  // If Admin, show firstName
                        : (`${newsItem.postedByInfo?.ms_firstName} ${newsItem.postedByInfo?.ms_lastName} `)}  
                    </span>


                  <p style={{ fontSize: "12px", margin: "1.2px 0", lineHeight: "1.2" }}>
                    <span>{newsItem?.role}</span>
                  </p>
                </div>
              </div>

              {/* Dropdown for Edit and Delete */}
              <Dropdown as={ButtonGroup}>
                <Dropdown.Toggle variant="secondary" id="dropdown-custom-components">
                  <FontAwesomeIcon icon={faEllipsisH} />
                </Dropdown.Toggle>
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
                <Link to={`/news/${newsItem.news_ID}`} style={{ textDecoration: "none", color: "inherit" }}>
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
                    style={{ zIndex: 1, borderRadius: "9999px" }}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </Button>
                  {/* Right chevron button */}
                  <Button
                    className="position-absolute top-50 end-0 translate-middle-y"
                    variant="light"
                    onClick={() => handleNextImage(newsItem._id, newsItem.images)}
                    style={{ zIndex: 1, borderRadius: "9999px" }}
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </Container>

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
