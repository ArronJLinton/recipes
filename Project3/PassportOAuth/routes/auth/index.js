const express = require('express');
const router = express.Router();
const User = require('../../db/models/user');
const passport = require('../../passport');

// router.get('/google', passport.authenticate('google', { scope: ['profile'] }))

// router.get('/google/callback',
// 	passport.authenticate('google', {
// 		successRedirect: 'http://localhost:3000',
// 		failureRedirect: 'http://localhost:3000/login'
// 	}))

// this route is just used to get the user basic info
router.get('/user', (req, res) => {
  console.log('===== user!!======');
  console.log(req.user);
  if (req.user) {
    return res.json({ user: req.user });
  } else {
    return res.json({ user: null });
  }
});

router.get('/user/:id', (req, res) => {
  console.log('===== user!!======');
  const id = req.params.id;
  User.findOne({
    '_id': id
  }, (err, userMatch) => {
    if (userMatch) {
      res.json(userMatch);
    }else{
      res.json({"ERROR": "NO MATCH"});
    }
  });
});

router.post(
  '/login',
  function(req, res, next) {
    console.log(req.body);
    console.log('================');
    next();
  },
  passport.authenticate('local'),
  (req, res) => {
    console.log('POST to /login');
    const user = JSON.parse(JSON.stringify(req.user)); // hack
    const cleanUser = Object.assign({}, user);
    if (cleanUser.local) {
      console.log(`Deleting ${cleanUser.local.password}`);
      delete cleanUser.local.password;
    }
    console.log(cleanUser);
    res.json({ user: cleanUser });
  }
);

router.post('/logout', (req, res) => {
  if (req.user) {
    req.session.destroy();
    res.clearCookie('connect.sid'); // clean up!
    return res.json({ msg: 'logging you out' });
  } else {
    return res.json({ msg: 'no user to log out!' });
  }
});

router.post('/signup', (req, res) => {
  const { username, password, firstName, lastName, photo } = req.body;
  console.log("REQ.BODY: ", req.body);
  // ADD VALIDATION
  User.findOne({ 'local.username': username }, (err, userMatch) => {
    if (userMatch) {
      return res.json({
        error: `Sorry, already a user with the username: ${username}`
      });
    }
    const newUser = new User({
      'local.username': username,
      'local.password': password,
      firstName,
      lastName,
      photo
    });
    newUser.save((err, savedUser) => {
      if (err) {return res.json(err);}
      return res.json(savedUser);
    });
  });
});

module.exports = router;
