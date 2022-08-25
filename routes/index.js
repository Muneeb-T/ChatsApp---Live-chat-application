var express = require('express');
var user_helpers = require('../helpers/user_helpers')
var router = express.Router();

verifyUserLogin = (req, res, next) => {
  if (req.session.userLogin) {
    next()
  } else {
    res.redirect('/')
  }
}


userLogin = (user, req, res) => {
  req.session.user = user;
  req.session.userLogin = true;
  return
}

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.userLogin)
    res.redirect('/homepage')
  else
    res.render('user/index');
});

router.get('/signUp', (req, res) => {
  if (req.session.userLogin)
    res.redirect('/homepage')
  else
    res.render('user/signup');
})

router.post('/signUp', (req, res) => {

  if (req.files)
    req.body.profile_picture = true
  else
    req.body.profile_picture = false;


  user_helpers.doSignUp(req.body).then((insertedId) => {
    if (insertedId) {
      if (req.body.profile_picture)
        req.files.profile_picture.mv('./public/images/Profile pictures/IMG' + (insertedId + "").toUpperCase() + '.jpg')

      let user = {
        _id: insertedId,
        user_name: req.body.user_name,
        email_address: req.body.email_address,
        profile_picture: req.body.profile_picture
      }

      userLogin(user, req, res)
      res.json({ signupSucess: true })
    }
  }).catch((error_message) => {
    res.json({ error_message: error_message })
  })

})


router.post('/login', (req, res) => {
  user_helpers.doLogin(req.body).then((user) => {
    userLogin(user, req, res)
    res.json({ loginSuccess: true })
  }).catch((error_message) => {
    res.json({ error_message: error_message })
  })
})

router.get('/homepage', verifyUserLogin, (req, res) => {
  let user = req.session.user;
  user_helpers.getAllusers(user._id).then((allUsers) => {
    user._id = (user._id + "").toUpperCase()
    res.render('user/homepage', { user: user, other_users: true, allUsers: allUsers })
  }).catch(() => {
    res.render('user/homepage', { user: user, other_users: false })
  })
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

router.post('/get_chat', verifyUserLogin, (req, res) => {
  user_helpers.get_single_chat(req.body.chat, req.session.user._id).then((chat) => {
    res.json(chat)
  })
})

router.post('/save_message', (req, res) => {
  user_helpers.save_message(req.body)
})


module.exports = router;
