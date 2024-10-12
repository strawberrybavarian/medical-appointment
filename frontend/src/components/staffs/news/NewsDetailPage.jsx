import React, { useEffect, useState } from "react";
import { useParams, } from "react-router-dom";
import axios from "axios";
import { ip } from "../../../ContentExport";
function NewsDetailPage() {
  const { id } = useParams(); // Extract the newsId from the route
  const [news, setNews] = useState(null);

  useEffect(() => {
    // Fetch the news details by ID
    axios
      .get(`${ip.address}/news/api/getnews/${id}`)
      .then((res) => setNews(res.data.news))
      .catch((err) => console.log(err));
  }, [id]);

  if (!news) return <div>Loading...</div>;

  return (
    <div className="news-detail-container">
      <h2>{news.headline}</h2>
      <div dangerouslySetInnerHTML={{ __html: news.content }} />
      {/* Render images if available */}
      {news.images &&
        news.images.map((img, i) => (
          <img key={i} src={img} alt="News" style={{ maxWidth: "300px" }} />
        ))}
    </div>
  );
}

export default NewsDetailPage;
