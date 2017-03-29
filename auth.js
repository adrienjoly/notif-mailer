var wunderlist = require('./wunderlist-client');

var WUNDERLIST_CLIENT_ID = process.env.WUNDERLIST_CLIENT_ID;
var WUNDERLIST_CLIENT_SECRET = process.env.WUNDERLIST_CLIENT_SECRET;

function onError(err) {
  console.error('Wunderlist API error:', err);
}

setTimeout(function() {
  var url = wunderlist.getUserLoginPageUrl(WUNDERLIST_CLIENT_ID);
  console.log('\nOpen this URL in web browser:', url);
}, 1000);

// open a web page asking for user's permissions for connecting to their wunderlist account
wunderlist.startWunderlistAuthServer(WUNDERLIST_CLIENT_ID, WUNDERLIST_CLIENT_SECRET, function onAuth(accessToken) {
  // once accepted by user, connecting to wunderlist API
  wunderlist.getWunderlistFromToken(WUNDERLIST_CLIENT_ID, accessToken, function onAuth(wunderlistAPI){
    // count user's lists
    wunderlistAPI.http.lists.all().fail(onError).done(function (lists) {
      console.log('user has', lists.length, 'lists');
      process.exit();
    });
  });
});
