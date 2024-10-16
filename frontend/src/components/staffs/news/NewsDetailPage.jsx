import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ip } from "../../../ContentExport";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Container, Row, Col } from "react-bootstrap";
import NavigationalBar from "../../landpage/navbar";

function NewsDetailPage() {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [otherNews, setOtherNews] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    axios
      .get(`${ip.address}/api/news/api/getnews/${id}`)
      .then((res) => setNews(res.data.news))
      .catch((err) => console.log(err));

    axios
      .get(`${ip.address}/api/news/api/getgeneralnews`)
      .then((res) => {
        const filteredNews = res.data.news.filter(
          (item) => item.news_ID !== parseInt(id)
        );
        const randomNews = filteredNews
          .sort(() => 0.5 - Math.random()) // Randomize
          .slice(0, 3); // Limit to 3 items
        setOtherNews(randomNews);
      })
      .catch((err) => console.log(err));
  }, [id]);

  if (!news) return <div>Loading...</div>;

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

  return (
    <>
      <div>
        <NavigationalBar
          scrollToServices={scrollToServices}
          scrollToAbout={scrollToAbout}
          scrollToNews={scrollToNews}
        />
      </div>
      <div
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          height: "calc(100vh)",
          paddingBottom: "1.5rem",
        }}
      >
        <div className="maincolor-container p-0">
          <div className="content-area" style={{ marginTop: "5.4rem" }}>
            <Container fluid className="news-detail-page-container">
              <Row className="justify-content-center">
                {/* Main News Content */}
                <Col lg={7} md={10} className="news-content-column mb-4">
                  <div className="news-details">
                    <h2 className="news-title">{news.headline}</h2>
                    {news.images && news.images.length > 0 && (
                      <div className="news-carousel">
                        <button
                          className="carousel-btn carousel-btn-left"
                          onClick={handlePrevImage}
                        >
                          <FaChevronLeft size={24} />
                        </button>
                        <img
                          src={`${ip.address}/${news.images[currentImageIndex]}`}
                          alt="News"
                          className="carousel-image"
                        />
                        <button
                          className="carousel-btn carousel-btn-right"
                          onClick={handleNextImage}
                        >
                          <FaChevronRight size={24} />
                        </button>
                      </div>
                    )}
                    <div
                      dangerouslySetInnerHTML={{ __html: news.content }}
                      className="news-content mt-3"
                    />
                  </div>
                </Col>

                {/* Other News Section */}
                <Col lg={4} md={8} className="other-news-column">
                  <div className="news-other-section">
                    <h3 className="other-news-title">At a Glance</h3>
                    <div className="other-news-grid">
                      {otherNews.map((otherItem) => (
                        <div
                          key={otherItem._id}
                          className="other-news-item-wrapper"
                        >
                          <Link
                            to={`/news/${otherItem.news_ID}`}
                            className="other-news-link"
                          >
                            {otherItem.images && otherItem.images.length > 0 ? (
                              <img
                                src={`${ip.address}/${otherItem.images[0]}`}
                                alt="News"
                                className="other-news-image"
                              />
                            ) : (
                              <img
                                src={`${ip.address}/path/to/default/image.jpg`}
                                alt="News"
                                className="other-news-image"
                              />
                            )}
                            <h4 className="other-news-headline">
                              {truncateText(otherItem.headline, 50)}
                            </h4>
                            <p className="other-news-content" style={{color : 'gray', fontSize: '12px'}}> 
                              {truncateText(otherItem.content, 100)}
                            </p>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </div>
    </>
  );
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export default NewsDetailPage;
