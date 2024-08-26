import React, { useEffect, useState } from "react";
import SidebarMenu from "../sidebar/SidebarMenu";
import { CDBCard, CDBBadge } from "cdbreact";
import "./Dashboard.css";

import * as Icon from "react-bootstrap-icons";

import { Dropdown } from "react-bootstrap";
import { Container, Form, Button } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function PostAnnouncement() {
  //to store the state
  const { did, role } = useParams();

  const [thePost, setThePost] = useState([]);

  const [postDropdowns, setPostDropdowns] = useState([]);
  const [thePosts, setThePosts] = useState([]);
  const [theImage, setTheImage] = useState ("");
  const [theId, setTheId] = useState("");
  const [theName, setTheName] = useState("");
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const navigate = useNavigate();
  const defaultImage = "images/014ef2f860e8e56b27d4a3267e0a193a.jpg";
  useEffect(() => {
    if (Array.isArray(thePosts)) {
      const dropdowns = thePosts.map(() => false);
      setPostDropdowns(dropdowns);
    }
  }, [thePosts]);

  const handleDropdownToggle = (index) => {
    const updatedDropdowns = postDropdowns.map((dropdown, i) => {
      return index === i ? !dropdown : false;
    });
    setPostDropdowns(updatedDropdowns);
  };

  //Setting a State for Id


  //deleting post
  const deletePost = (index) => {
    const reversedIndex = thePosts.length - 1 - index;
    axios
      .delete(
        `http://localhost:8000/doctor/api/post/deletepost/${did}/` + reversedIndex
      )
      .then((res) => {
        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //display all posts
  useEffect(() => {
    axios
      .get(`http://localhost:8000/doctor/api/post/getallpost/${did}`)
      .then((res) => {

        setThePosts(res.data.posts.reverse());
      })
      .catch((err) => {
        console.log(err);
      });
  }, [did]);

  //creating new post
  const submitPost = (e) => {
    if (thePost.length > 3) {
      axios
        .post("http://localhost:8000/doctor/api/addpost/" + did, {
          content: thePost,
        })
        .then((res) => {
          setThePosts([thePost, ...thePosts]);
          setThePost("");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const editPost = (id, index) => {
    const reversedIndex = thePosts.length - 1 - index;
    setSelectedPostIndex(reversedIndex);
    navigate(`/PostAnnouncement/edit/${theId}/` + reversedIndex);
  };

  return (
        <Container className="pt-3">
          
            <h1 className="PostAnnouncement-title">Post Announcement <hr className=" divider d-lg" /> </h1>
            
      
            <Form>
              <Form.Group controlId="exampleForm.ControlInput1">
                <Form.Label>Create Post</Form.Label>
                <Form.Control
                  value={thePost}
                  onChange={(e) => {
                    setThePost(e.target.value);
                  }}
                  as="textarea"
                  rows={4}
                  placeholder="What's on your mind?"
                />
              </Form.Group>
              <div className="  d-lg-inline-flex removegutter container4 container-fluid justify-content-end ">
                <Button
                  onClick={() => {
                    submitPost();
                  }}
                  variant="primary"
                  type="submit"
                >
                  Submit
                </Button>
              </div>
            </Form>
            <hr className=" divider d-lg" />
  

          <Container>
            <h3>Posted Announcements:</h3>
            <hr className=" divider d-lg" />
              {thePosts.map((post, index) => (
                <div key={index}>
                  <Container className="d-flex align-items-center justify-content-between">
                    <li className="list-unstyled decoration-none" key={index}>
                      {post.content}
                    </li>

                    <Dropdown
                      show={postDropdowns[index]}
                      onToggle={() => handleDropdownToggle(index)}
                    >
                      <Dropdown.Toggle
                        variant="link"
                        className="text-decoration-none"
                      >
                        <Icon.ThreeDots className="threedots" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => editPost(post._id, index)}
                        >
                          Edit
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => deletePost(index)}>
                          Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </Container>
                  <hr className="divider d-lg" />
                </div>
              ))}
          </Container>
        </Container>
  );
}

export default PostAnnouncement;
