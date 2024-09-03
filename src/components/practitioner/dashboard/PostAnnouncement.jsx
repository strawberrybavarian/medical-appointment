import React, { useEffect, useState } from "react";
import { Container, Form, Button, Dropdown } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS
import { ThreeDots } from "react-bootstrap-icons";

function PostAnnouncement() {
  const { did } = useParams();
  const [thePost, setThePost] = useState("");
  const [postDropdowns, setPostDropdowns] = useState([]);
  const [thePosts, setThePosts] = useState([]);
  const navigate = useNavigate();

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

  const deletePost = (index) => {
    const reversedIndex = thePosts.length - 1 - index;
    axios
      .delete(`http://localhost:8000/doctor/api/post/deletepost/${did}/` + reversedIndex)
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  };

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

  const submitPost = () => {
    if (thePost.length > 3) {
      axios
        .post("http://localhost:8000/doctor/api/addpost/" + did, {
          content: thePost,
        })
        .then(() => {
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
    navigate(`/PostAnnouncement/edit/${id}/` + reversedIndex);
  };

  return (
    <Container  className="pt-3">
      <h1 className="PostAnnouncement-title">Post Announcement <hr className="divider d-lg" /></h1>

      <Form>
        <Form.Group controlId="exampleForm.ControlInput1">
          <Form.Label>Create Post</Form.Label>
          <ReactQuill
            value={thePost}
            onChange={setThePost}
            placeholder="What's on your mind?"
            style={{ minHeight: '300px', resize: 'vertical' }}
            modules={{
              toolbar: [
                [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                [{ size: [] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' },
                { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image', 'video'],
                ['clean']
              ],
            }}
            formats={[
              'header', 'font', 'size',
              'bold', 'italic', 'underline', 'strike', 'blockquote',
              'list', 'bullet', 'indent',
              'link', 'image', 'video'
            ]}
          />

        </Form.Group>
        <div className="d-lg-inline-flex removegutter container4 container-fluid justify-content-end">
          <Button onClick={submitPost} variant="primary" type="button">
            Submit
          </Button>
        </div>
      </Form>
      <hr className="divider d-lg" />

      <Container>
        <h3>Posted Announcements:</h3>
        <hr className="divider d-lg" />
        {thePosts.map((post, index) => (
          <div key={index}>
            <Container className="d-flex align-items-center justify-content-between">
              <li className="list-unstyled decoration-none" key={index}>
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </li>

              <Dropdown
                show={postDropdowns[index]}
                onToggle={() => handleDropdownToggle(index)}
              >
                <Dropdown.Toggle variant="link" className="text-decoration-none">
                  <ThreeDots className="threedots" />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => editPost(post._id, index)}>
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
