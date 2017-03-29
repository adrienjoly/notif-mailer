var WUNDERLIST_CLIENT_ID = process.env.WUNDERLIST_CLIENT_ID;
var WUNDERLIST_USER_TOKEN = process.env.WUNDERLIST_USER_TOKEN;
var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
var EMAIL_FROM = process.env.EMAIL_FROM;
var EMAIL_TO = process.env.EMAIL_TO;

var _ = require('lodash');
var async = require('async');
var sendgrid = require('sendgrid')(SENDGRID_API_KEY);
var wunderlist = require('./wunderlist-client');

// REF: https://developer.wunderlist.com/documentation/endpoints/task
// SDK: file:///Users/adrienjoly/Dev/github/1st-thing/wunderlist.js/docs/index.html

// dry run mode -- for testing without sending emails

var dryRun = process.argv.join(' ').indexOf('--dry-run') != -1;
console.log('--dry-run =', dryRun);

if (dryRun) {
  sendgrid.send = function simulateEmail(object, cb) {
    console.log('=> EMAIL DATA:', object);
    cb();
  };  
}

// wunderlist helpers

function onError(err) {
  console.error('Wunderlist API error:', err);
}

var now = new Date();

function wasDoneToday(task) {
  return (now - new Date(task.completed_at) < 24 * 60 * 60 * 1000);
}

function fetchMyDoneTasks(wunderlistAPI, cb) {
  var doneToday = [];
  function processList(list, cb) {
    wunderlistAPI.http.tasks.forList(list.id, true).fail(onError).done(function (tasks) {
      var tasksDoneToday = _.filter(tasks, wasDoneToday);
      console.warn('list:', list.title, '->', tasksDoneToday.length);
      if (tasksDoneToday.length) {
        var results = tasksDoneToday.forEach(function(t) {
          doneToday.push({
            task: t,
            list: list
          });
        });
      }
      cb();
    });
  }
  wunderlistAPI.http.lists.all().fail(cb).done(function (lists) {
    async.eachSeries(lists, processList, function(err, res) {
      cb(err, doneToday);
    });
  });
}

// function to render and send the daily notification

function sendEmail(text, cb){
  sendgrid.send({
    to:       EMAIL_TO,
    from:     EMAIL_FROM,
    subject:  'Today\'s Wunderlist Report',
    text:     text
  }, cb);
}

// main script logic

wunderlist.getWunderlistFromToken(WUNDERLIST_CLIENT_ID, WUNDERLIST_USER_TOKEN, function(wunderlistAPI){
  fetchMyDoneTasks(wunderlistAPI, function(err, doneTasks){
    if (err) {
      console.error('fetchMyDoneTasks error:', err);
      process.exit();
    }
    var lines = doneTasks.map(function(doneTask){
      return '√ ' + doneTask.task.title
    });
    console.log('lines:', lines);
    sendEmail(lines.join('\n\n'), function(){
      console.warn('email =>', arguments);
      process.exit();
    });
  })
});
