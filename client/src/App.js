import { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [posts, setPosts] = useState([]);
  const [postData, setPostData] = useState({
    title: '',
    content: '',
  });

  const getPosts = async () => {
    const response = await axios.get('http://localhost:8080/posts');
    const data = await response.data;

    setPosts(data.posts);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'title') {
      setPostData((prevValue) => {
        return {
          title: value,
          content: prevValue.content,
        };
      });
    } else if (name === 'content') {
      setPostData((prevValue) => {
        return {
          title: prevValue.title,
          content: value,
        };
      });
    }
  };

  const submitPost = async (e) => {
    e.preventDefault();

    await axios({
      url: 'http://localhost:8080/posts',
      method: 'POST',
      data: postData,
    })
      .then((res) => {
        console.log(res);
        setPostData({ title: '', content: '' });
        getPosts();
      })
      .catch((err) => {
        console.log(err);
        alert('Error submitting post, please try again.');
      });
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div style={{ marginLeft: '8px' }}>
      <h1>SQL FullStack Blog App</h1>
      <form onSubmit={submitPost}>
        <label>Title</label>
        <br />
        <input
          type={'text'}
          name="title"
          placeholder="enter title here..."
          value={postData.title}
          onChange={handleChange}
        />
        <br />
        <label>Content</label>
        <br />
        <textarea
          rows={8}
          cols={25}
          name="content"
          placeholder="enter content here..."
          value={postData.content}
          onChange={handleChange}
        ></textarea>
        <br />
        <input type={'submit'} value="Post" style={{ padding: '5px' }} />
      </form>
      <br />
      <hr />
      <br />
      <div className="posts">
        {posts.map((post) => {
          return (
            <div
              key={post.post_id}
              style={{
                borderBottom: '2px solid gray',
                width: '35%',
                padding: '5px',
              }}
            >
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <small>
                Posted on:{' '}
                {new Date(post.date_created).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                at{' '}
                {new Date(post.date_created).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </small>
              <br />
              <button
                style={{
                  marginTop: '5px',
                  backgroundColor: 'red',
                  color: 'white',
                  padding: '3px',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={async () => {
                  await axios
                    .delete(`http://localhost:8080/posts/${post.post_id}`)
                    .then((res) => {
                      console.log(res);
                      getPosts();
                    })
                    .catch((err) => {
                      console.error(err);
                      alert('Error deleting post');
                    });
                }}
              >
                Delete Post
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
