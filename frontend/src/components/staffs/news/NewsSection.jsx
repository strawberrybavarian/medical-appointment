import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './NewsSection.css'; // Import CSS for styling
import { ip } from '../../../ContentExport';
import { Container } from 'react-bootstrap';

function NewsSection() {
  const [newsList, setNewsList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState('');
  const intervalRef = useRef(null); // To store interval ID

  const itemsPerPage = 5;

  useEffect(() => {
    axios
      .get(`${ip.address}/api/news/api/getgeneralnews`)
      .then((res) => {
        setNewsList(res.data.news);
        console.log(res.data.news);
      })
      .catch((err) => {
        console.error('Error fetching news:', err);
      });
  }, []);

  // Function to handle next page with circular logic
  const handleNext = () => {
    setTransitionDirection('next');
    setCurrentPage((prevPage) =>
      (prevPage + 1) * itemsPerPage < newsList.length
        ? prevPage + 1
        : 0 // Reset to first page when reaching the end
    );
  };

  const handlePrev = () => {
    setTransitionDirection('prev');
    setCurrentPage((prevPage) =>
      prevPage > 0 ? prevPage - 1 : Math.ceil(newsList.length / itemsPerPage) - 1
    );
  };

  // Automatically slide every 5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      handleNext();
    }, 5000); // Slide every 5 seconds

    // Clear the interval when the component unmounts or when user interacts
    return () => clearInterval(intervalRef.current);
  }, [newsList]); // Restart interval if newsList changes

  // Stop automatic sliding when user clicks next/prev (optional)
  const handleManualSlide = (direction) => {
    clearInterval(intervalRef.current); // Clear existing interval
    direction === 'next' ? handleNext() : handlePrev(); // Slide manually
    intervalRef.current = setInterval(handleNext, 5000); // Restart auto-slide
  };

  const displayedNews = newsList.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <section id="news" style={{ padding: '50px', backgroundColor: '#f7f7f7' }}>
      <div className="container section-title" data-aos="fade-up">
        <h2>Latest News</h2>
      </div>

      <div className="news-navigation">
        <button
          className="nav-button"
          onClick={() => handleManualSlide('prev')}
          disabled={currentPage === 0}
        >
          <FaChevronLeft size={24} />
        </button>
        <button
          className="nav-button"
          onClick={() => handleManualSlide('next')}
          disabled={(currentPage + 1) * itemsPerPage >= newsList.length}
        >
          <FaChevronRight size={24} />
        </button>
      </div>

      <Container className="d-flex justify-content-center">
        <div className={`news-grid ${transitionDirection}`}>
          {displayedNews.map((newsItem) => (
            <div key={newsItem._id} className="news-item">
              <Link
                to={`/news/${newsItem.news_ID}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {newsItem.images && newsItem.images.length > 0 ? (
                  <img
                    src={`${ip.address}/${newsItem.images[0]}`}
                    alt="News"
                    style={{
                      width: '300px',
                      height: '200px',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <img
                    src={`${ip.address}/path/to/default/image.jpg`}
                    alt="News"
                    style={{
                      width: '300px',
                      height: '200px',
                      objectFit: 'contain',
                    }}
                  />
                )}
                <h3>{newsItem.headline}</h3>
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default NewsSection;
