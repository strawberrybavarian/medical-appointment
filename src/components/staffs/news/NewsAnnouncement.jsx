import React, { useState, useEffect } from "react";
import { Container, Row, Col, Dropdown, ButtonGroup } from "react-bootstrap";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import CreateNewsModal from "./CreateNewsModal";
import axios from "axios";
import EditNewsModal from "./EditNewsModal";

function NewsAnnouncement({ user_image, user_name, user_id, role }) {
  const [theNews, setTheNews] = useState("");
  const [newsImages, setNewsImages] = useState([]); // For storing new images during creation
  const [theNewsList, setTheNewsList] = useState([]); // List of all news
  const [showCreateNewsModal, setShowCreateNewsModal] = useState(false); // Show modal to create news
  const [showEditNewsModal, setShowEditNewsModal] = useState(false); // Show modal to edit news
  const [editNewsId, setEditNewsId] = useState(null); // Track news being edited
  const [deletedImages, setDeletedImages] = useState([]); // Images deleted during edit
  const [headline, setHeadline] = useState(""); // Add this line to define the headline state

  const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
  console.log(role);
  
  // Fetch all news (Disregard API logic)
  useEffect(() => {
    axios
      .get(`http://localhost:8000/news/api/getallnews/${user_id}/${role}`)
      .then((res) => setTheNewsList(res.data.news.reverse()))
      .catch((err) => console.log(err));
  }, [user_id, role]);

  // Submit new news
  const submitNews = (headline, newsContent) => {
    const formData = new FormData();
    formData.append("headline", headline);  // Add the headline to the form data
    formData.append("content", newsContent); // Add the content to the form data
    formData.append("role", role);
  
    newsImages.forEach((image) => {
      formData.append("images", image.file);
    });
  
    axios
      .post(`http://localhost:8000/news/api/addnews/${user_id}`, formData, {
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
  const deleteNews = (index) => {
    axios
      .delete(`http://localhost:8000/news/api/delete/${user_id}/${index}`)
      .then(() => {
        setTheNewsList(theNewsList.filter((_, i) => i !== index));
      })
      .catch((err) => console.log("Error deleting news:", err.response ? err.response.data : err.message));
  };

  return (
  <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
    <div className="mb-2">
      <h2> Share News </h2>
      <hr/>
    </div>
  <div className="d-flex post-container p-3 w-100 shadow-sm">
    <img
      src={ `http://localhost:8000/${defaultImage}`}
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
          <div className="d-flex align-items-center">
            <img
              src={`http://localhost:8000/${defaultImage}`}
              alt="User"
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "9999px",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <div style={{ paddingLeft: "0.5rem" }}>
              <div>
              <span>{user_name}</span>
              <p>{role}</p>

              </div>
           
            </div>
          </div>

          {/* Dropdown for Edit and Delete */}
          <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle variant="secondary">&#8942;</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => openEditNewsModal(newsItem._id, newsItem.content, newsItem.images)}>
                Edit
              </Dropdown.Item>
              <Dropdown.Item onClick={() => deleteNews(index)}>Delete</Dropdown.Item>
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
          {newsItem.images && newsItem.images.map((img, i) => (
            <img key={i} src={img} alt="News" style={{ maxWidth: "100px", height: "100px", cursor: "pointer" }} />
          ))}
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
        newsContent={theNews} // Correct this from postContent to newsContent
        setNewsContent={setTheNews} // Correct setter for news content
        newsImages={newsImages} // Pass newsImages instead of postImages
        setNewsImages={setNewsImages} // Pass setNewsImages instead of setPostImages
        deletedImages={deletedImages}
        setDeletedImages={setDeletedImages}
        userId={user_id} // Reuse this for the user ID
        newsId={editNewsId} // Correct the ID being passed
        updateNewsInState={updateNewsInState}
        role={role}
      />
</div>


     

  );
}

export default NewsAnnouncement;
