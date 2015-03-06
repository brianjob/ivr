var express = require('express'),
    session = require('express-session'),
 bodyParser = require('body-parser'),
     assert = require('assert'),
        ivr = require('./ivr');

assert(process.env.ACCOUNTS_HOST, 'ACCOUNTS_HOST must be set');
assert(process.env.SESSION_SECRET, 'SESSION_SECRET must be set');

var app = express();
var port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(session({
  secret            : process.env.SESSION_SECRET,
  resave            : false,
  saveUninitialized : false
}));

app.listen(port, function() {
  console.log('listening on port ' + port);
});

// new ivr session
app.get('/', function(req, res) {
  ivr.newSession(req).then(function(response) {
    res.send(response);
  }).catch(function(err) {
    console.error(err.stack);
    res.status(500).send('error'); // this should be replaced with a default error say node
  });
});

app.post('/', function(req, res) {
  res.send(ivr.resumeSession(req));
});

app.post('/gather', function(req, res) {
  ivr.gather(req.body);
  res.redirect('/');
});

app.post('/split', function(req, res) {
  ivr.split(req.body);
  res.redirect('/');
});
