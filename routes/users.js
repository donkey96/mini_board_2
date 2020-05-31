var express = require('express');
var router = express.Router();

var mysql = require('mysql');

var knex = require('knex')({
  dialect: 'mysql',
  connection: {
    host:     'localhost',
    user:     'root',
    password: '',
    database: 'my-nodeapp-db',
    charset:  'utf8'
  }
});

var Bookshelf = require('bookshelf')(knex);

var User = Bookshelf.Model.extend({
  tableName: 'users'
});

router.get('/add', function(req, res, next) {
  var data = {
    title: 'Users/Add',
    form: { name: '', password: '', comment: '' },
    content: '※登録する名前・パスワード・コメントを入力ください。'
  }
  res.render('users/add', data);
});

router.post('/add', function(req, res, next) {
  var request = req;
  var response = res;
  req.check('name', 'NAME は必ず入力して下さい。').notEmpty();
  req.check('password', 'PASSWORD は必ず入力して下さい。').notEmpty();
  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      var content = '<ul class="error">';
      var result_arr = result.array();
      for (var n in result_arr) {
        content += '<li>' + result_arr[n].msg + '</li>'
      }
      content += '</ul>';
      var data = {
        title: 'Users/Add',
        content: content,
        form: req.body
      }
      response.render('users/add', data);
    } else {
      request.session.login = null;
      new User(req.body).save().then(function(model) {
        response.redirect('/');
      });
    }
  });
});

router.get('/', function(req, res, next) {
  var data = {
    title: 'Users/Login',
    form: { name: '', password: '' },
    content: '名前とパスワードを入力下さい。'
  }
  res.render('users/login', data);
});

router.post('/', function(req, res, next) {
  var request = req;
  var response = res;
  req.check('name', 'NAME は必ず入力して下さい。').notEmpty();
  req.check('password', 'PASSWORD は必ず入力して下さい。').notEmpty();
  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      var content = '<ul class="error">';
      var result_arr = result.array();
      for (var n in result_arr) {
        content += '<li>' + result_arr[n].msg + '</li>'
      }
      content += '</ul>';
      var data = {
        title: 'Users/Login',
        content: content,
        form: req.body
      }
      response.render('users/login', data);
    } else {
      var nm = req.body.name;
      var pw = req.body.password;
      User.query({ where: { name: nm }, andWhere: { password: pw } })
        .fetch()
        .then(function(model) {
          if (model == null) {
            var data = {
              title: '再入力',
              content: '<p class="error">名前またはパスワードが違います。</p>',
              form: req.body
            }
            response.render('users/login', data);
          } else {
            request.session.login = model.attributes;
            var data = {
              title: 'Users/Login',
              content: '<p>ログインしました！<br>トップページに戻ってメッセージを送信下さい。</p>',
              form: req.body
            };
            response.render('users/login', data);
          }
        });
    }
  });
});

module.exports = router;
