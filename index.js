var express = require('express'),
    session = require('express-session'),
 bodyParser = require('body-parser'),
        ivr = require('./ivr');

var app = express();
var port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(session({secret : process.env.SESSION_SECRET }));

app.listen(port, function() {
  console.log('listening on port ' + port);
});

// new ivr session
app.get('/', function(req, res) {
  ivr.newSession(req).then(function(response) {
    res.send(response);
  });
});

app.post('/', function(req, res) {
  res.send(ivr.resumeSession(req));
});

app.post('/gather', function(req, res) {
  res.send(ivr.gather(req));
});

app.post('/split', function(req, res) {
  res.send(ivr.split(req));
});
