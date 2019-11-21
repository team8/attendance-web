var express = require('express');
var router = express.Router();
var fb = require('../api/firebase')
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

/* GET home page. */
// router.get('/', function(req, res, next) {
//   fb.logTime(95034019, 4, '14:00', '18:00')
//   res.render('logs', { title: 'team8-attendance-web' });
// });

router.get('/', function (req, res, next) {
  fb.getUsers().then(snapshot => {
    res.render('users', { title: 'Attendance Web', users: snapshot });
  });
});

router.get('/user/:user', function (req, res) {
  fb.getUser(req.params.user).then(snapshot => {
    console.log(snapshot);
    res.render('user', { user: snapshot, token: req.params.user });
  });
});

router.post('/log_hours', function (req, res, next) {
  var data = req.body;
  fb.logTime(data.id, data.hours, data.timein, data.timeout);
});

router.post('/signup', jsonParser, function (req, res, next) {
  var data = req.body;
  fb.createUser(data.id, data.first, data.last, data.email, data.subteam, data.password).then(value => {
    res.send(value);
  }).catch(error => {
    res.send(error);
  });
});

router.post('/deleteUser', jsonParser, function (req, res, next ) {
  var data = req.body;
  fb.deleteUser(data.id);
  res.send("Success");
}); 
  
router.post('/signin', function (req, res, next) {
  var data = req.body;
  fb.authenticateUser(data.id, data.password).then(value => {
    res.send(value);
  });
});

module.exports = router;