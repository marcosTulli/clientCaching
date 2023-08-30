const express = require('express');
const router = express.Router();
const products = 'products';

module.exports = function (db) {
  router.route(`/${products}`).get((req, res) => {
    res.send(db.get(products).value());
  });
  return router;
};
