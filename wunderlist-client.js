var WunderlistSDK = require('wunderlist');
var express = require('express');
var request = require('request');

var AUTH_URL = 'https://www.wunderlist.com/oauth/authorize';
var TOKEN_URL = 'https://www.wunderlist.com/oauth/access_token';
var STATE = 'RANDOM';
// TODO: replace RANDOM by a "An unguessable random string. It is used to protect against cross-site request forgery attacks."
// cf https://developer.wunderlist.com/documentation/concepts/authorization

var CALLBACK_PORT = process.env.PORT || 3000;
var CALLBACK_PATH = '/wunderlistCallback';
var CALLBACK_URL = 'http://localhost:' + CALLBACK_PORT + CALLBACK_PATH;

var HTML_AUTOCLOSE = [
  '<!DOCTYPE html>',
  '<html>',
  '<body>',
  'Thank you! You can close this page while we\'re logging you in.',
  '<script>window.close();</script>',
  '</body>',
  '</html>'
].join('\n');

var server = null;

function startWunderlistAuthServer(clientId, clientSec, onAuth) {
  var app = express();
  app.get(CALLBACK_PATH, function (req, res) {
    console.log('Incoming wunderlist auth:', req.query);
    var post = {
      url: TOKEN_URL,
      form: {
        client_id: clientId,
        client_secret: clientSec,
        code: req.query.code
      }
    };
    console.log('POSTing to:', post.url, '...');
    request.post(post, function(err, httpResponse, body){
      console.log('=> wunderlist POST response:', body);
      try { body = JSON.parse(body); }
      catch (e) { return e.printStack(); }
      onAuth(body.access_token);
    });
    res.send(HTML_AUTOCLOSE);
  });
  server = app.listen(CALLBACK_PORT, function () {
    console.log('Wunderlist auth callback server listening on port %s', server.address().port);
  });
}

exports.startWunderlistAuthServer = startWunderlistAuthServer;

exports.getUserLoginPageUrl = function(clientId) {
  return AUTH_URL + '?client_id=' + clientId + '&redirect_uri=' + CALLBACK_URL + '&state=' + STATE;
  // this web page from wunderlist ask user's permission for us to access their tasks.
  // when user accepts => wunderlist calls our server, as run by startWunderlistAuthServer()
}

exports.askUserToken = function(clientId, clientSec, callback) {
  if (!server) startWunderlistAuthServer(clientId, clientSec, callback);
  var url = exports.getUserLoginPageUrl(clientId);
  console.log('Opening in web browser:', url);
  require('child_process').exec('open "' + url + '"');
};

exports.getWunderlistFromToken = function(clientId, accessToken, callback) {
  var login = {
    'clientID': clientId,
    'accessToken': accessToken
  };
  console.log('Wunderlist login:', login, '...');
  var wunderlistAPI = new WunderlistSDK(login);
  callback(wunderlistAPI);
};
