const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

let db = new sqlite3.Database('./db/blog.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to sqlite database');
  }
});

const createPostsTable = async () => {
  const sql =
    'CREATE TABLE IF NOT EXISTS posts(post_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, date_created TEXT NOT NULL)';

  db.serialize(() => {
    db.prepare(sql)
      .run()
      .finalize((err) => {
        if (err) {
          console.error(err.message);
        }
      });
  });
};
createPostsTable();

app.get('/posts', (req, res) => {
  const sql = 'SELECT * from posts';

  db.serialize(() => {
    db.all(sql, (err, rows) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, errorMessage: err.message });
      }

      return res.status(200).json({ success: true, posts: rows });
    });
  });
});

app.post('/posts', (req, res) => {
  const { title, content } = req.body;
  const sql = `INSERT INTO posts(title, content, date_created) VALUES ('${title}', '${content}', '${new Date()}')`;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      errorMessage: 'You must enter content for both title and content fields.',
    });
  }

  db.serialize(() => {
    db.run(sql, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, errorMessage: err.message });
      }

      return res
        .status(200)
        .json({ success: true, msg: 'Successfully added new post' });
    });
  });
});

app.get('/posts/:postId', (req, res) => {
  const { postId } = req.params;
  const sql = `SELECT * FROM posts WHERE post_id = ${postId}`;

  db.serialize(() => {
    db.each(sql, (err, row) => {
      if (!err) {
        return res.status(200).json({ success: true, post: row });
      }
      console.log(err);
      return res
        .status(400)
        .json({ success: false, errorMessage: err.message });
    });
  });
});

app.delete('/posts/:postId', (req, res) => {
  const { postId } = req.params;
  const sql = `DELETE FROM posts WHERE post_id = ${postId}`;

  db.serialize(() => {
    db.run(sql, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, errorMessage: err.message });
      }

      return res
        .status(200)
        .json({ success: true, msg: 'Succesfully deleted post' });
    });
  });
});

app.listen(port, () => console.log(`Server running on port: ${port}`));
