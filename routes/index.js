var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    "message": "Fuck Golang, all my homies use NodeJS"
  });
});

module.exports = router;
