var express = require('express'),
    session = require('express-session'),
 bodyParser = require('body-parser'),
     assert = require('assert'),
ivr_session = require('./ivr-session');

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
  ivr_session.newSession(req).then(function(response) {
    res.send(response);
  }).catch(function(err) {
    console.error(err.stack);
    res.status(500).send('error'); // this should be replaced with a default error say node
  });
});

app.post('/', function(req, res) {
  res.send(ivr_session.resumeSession(req));
});

app.post('/gather', function(req, res) {
  res.send(ivr_session.gather(req));
});

app.post('/split', function(req, res) {
  res.send(ivr_session.split(req));
});
