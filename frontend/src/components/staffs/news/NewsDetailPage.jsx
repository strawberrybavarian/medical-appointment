import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ip } from "../../../ContentExport";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaUser, FaClock } from "react-icons/fa";
import { Container, Row, Col, Breadcrumb, Badge } from "react-bootstrap";
import NavigationalBar from "../../landpage/navbar";
import "./NewsDetailPage.css";

function NewsDetailPage() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [otherNews, setOtherNews] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const servicesRef = useRef(null);
  const aboutRef = useRef(null);
  const newsRef = useRef(null);

  const scrollToServices = () => {
    if (servicesRef.current) {
      servicesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToAbout = () => {
    if (aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToNews = () => {
    if (newsRef.current) {
      newsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    
    const fetchNewsData = async () => {
      try {
        const newsResponse = await axios.get(`${ip.address}/api/news/api/getnews/${id}`);
        setNews(newsResponse.data.news);
        
        const otherNewsResponse = await axios.get(`${ip.address}/api/news/api/getgeneralnews`);
        const filteredNews = otherNewsResponse.data.news.filter(
          (item) => item.news_ID !== parseInt(id)
        );
        const randomNews = filteredNews
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        setOtherNews(randomNews);
        
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    
    fetchNewsData();
  }, [id]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? news.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === news.images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <>
        <NavigationalBar
          scrollToServices={scrollToServices}
          scrollToAbout={scrollToAbout}
          scrollToNews={scrollToNews}
        />
        <div className="news-loading-container">
          <div className="news-loading-spinner"></div>
          <p>Loading article...</p>
        </div>
      </>
    );
  }

  return (
    <>

      <Container fluid className="overflow-y-scroll g-0    h-100">
      <NavigationalBar
        scrollToServices={scrollToServices}
        scrollToAbout={scrollToAbout}
        scrollToNews={scrollToNews}
      />
      <Container fluid className="news-detail-wrapper p-0">
        <Container className="news-detail-container">
          <Breadcrumb className="news-breadcrumb">
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/news">News</Breadcrumb.Item>
            <Breadcrumb.Item active>{truncateText(news.headline, 30)}</Breadcrumb.Item>
          </Breadcrumb>
          
          <Row className="news-detail-content">
            {/* Main Article Column */}
            <Col lg={8} className="main-article-column">
              <article className="news-article">
                <h1 className="article-headline">{news.headline}</h1>
                
                <div className="article-meta">
                  <div className="meta-item">
                    <FaCalendarAlt />
                    <span>{formatDate(news.createdAt)}</span>
                  </div>
                  {news.postedByInfo && (
                    <div className="meta-item">
                      <FaUser />
                      <span>
                        {news.postedByInfo.role === "Admin"
                          ? `${news.postedByInfo?.firstName || ""} ${news.postedByInfo?.lastName || ""}`
                          : `${news.postedByInfo?.ms_firstName || ""} ${news.postedByInfo?.ms_lastName || ""}`}
                      </span>
                    </div>
                  )}
                  {news.role && (
                    <Badge className="role-badge">{news.role}</Badge>
                  )}
                </div>

                {news.images && news.images.length > 0 && (
                  <div className="article-gallery">
                    <div className="article-image-container">
                      <img
                        src={`${ip.address}/${news.images[currentImageIndex]}`}
                        alt={news.headline}
                        className="article-feature-image"
                      />
                      
                      {news.images.length > 1 && (
                        <>
                          <button
                            className="gallery-nav gallery-prev"
                            onClick={handlePrevImage}
                            aria-label="Previous image"
                          >
                            <FaChevronLeft />
                          </button>
                          <button
                            className="gallery-nav gallery-next"
                            onClick={handleNextImage}
                            aria-label="Next image"
                          >
                            <FaChevronRight />
                          </button>
                          
                          <div className="gallery-indicators">
                            {news.images.map((_, index) => (
                              <button
                                key={index}
                                className={`gallery-indicator ${index === currentImageIndex ? 'active' : ''}`}
                                onClick={() => setCurrentImageIndex(index)}
                                aria-label={`Go to image ${index + 1}`}
                              />
                            ))}
                          </div>
                          
                          <div className="gallery-counter">
                            {currentImageIndex + 1}/{news.images.length}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="article-content">
                  <div dangerouslySetInnerHTML={{ __html: news.content }} />
                </div>
              </article>
            </Col>
            
            {/* Sidebar Column */}
            <Col lg={4} className="sidebar-column">
              <aside className="news-sidebar">
                <div className="sidebar-section">
                  <h3 className="sidebar-heading">More News</h3>
                  
                  <div className="related-news-list">
                    {otherNews.length > 0 ? (
                      otherNews.map((item) => (
                        <Link
                          key={item._id}
                          to={`/news/${item.news_ID}`}
                          className="related-news-card"
                        >
                          <div className="related-news-image-container">
                            {item.images && item.images.length > 0 ? (
                              <img
                                src={`${ip.address}/${item.images[0]}`}
                                alt={item.headline}
                                className="related-news-image"
                              />
                            ) : (
                              <div className="related-news-image-placeholder">
                                <FaCalendarAlt />
                              </div>
                            )}
                          </div>
                          
                          <div className="related-news-content">
                            <h4 className="related-news-headline">
                              {truncateText(item.headline, 45)}
                            </h4>
                            <p className="related-news-excerpt">
                              {stripHtml(truncateText(item.content, 80))}
                            </p>
                            <div className="related-news-meta">
                              <FaClock />
                              <span>{formatDate(item.createdAt)}</span>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="no-related-news">
                        No related news available at this time.
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            </Col>
          </Row>
        </Container>
      </Container>
      </Container>
    </>
  );
}

function truncateText(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

function stripHtml(html) {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export default NewsDetailPage;  