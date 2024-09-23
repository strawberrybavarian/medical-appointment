import React from "react";
import { Container, Carousel } from "react-bootstrap";

function DoctorAnnouncements({ posts }) {
  return (
    <div className="shadow-sm">
      {posts.map((post, index) => (
        <div key={index} className="posted-announcement-container shadow-sm d-flex flex-column align-items-start p-4 mb-3 w-100">
          <div className="d-flex w-100 align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <img
                src={post.doctor_image}
                alt="Doctor"
                style={{ width: "45px", height: "45px", borderRadius: "9999px" }}
              />
              <div style={{ paddingLeft: '0.5rem' }}>
                <span>{post.doctor_name}</span>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
            {post.images && post.images.length > 0 && (
              <div className="d-flex justify-content-center">
                <Carousel indicators={false} controls={true} interval={null}>
                  {post.images.map((img, i) => (
                    <Carousel.Item key={i} className="d-flex justify-content-center">
                      <img
                        src={img}
                        alt="Post"
                        style={{ width: "400px", height: "400px", objectFit: "cover" }}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default DoctorAnnouncements;