const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const router = express.Router();
const fs = require('fs');

const FILE_NAME = './ProductService.json';

const db = {
  get: (res, rej) => {
    try {
      fs.readFile(FILE_NAME, (err, data) => {
        if (err) {
          rej(err);
        } else {
          res(JSON.parse(data));
        }
      });
    } catch (error) {
      console.log('Unable to read file: ', error);
    }
  },
};

router.get('/', (req, res, next) => {
  db.get(
    (data) => {
      res.status(200).send(data);
    },
    (err) => {
      next(err);
    }
  );
});

app.use(express.static(path.join(__dirname, './app/')));

app.use('/api/', router);
app.get('/', (req, res) => {
  res.render('index');
});

app.listen(PORT, () => {
  console.log('Listening on PORT ', PORT);
});
