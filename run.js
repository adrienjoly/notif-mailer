var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
var EMAIL_FROM = process.env.EMAIL_FROM;
var EMAIL_TO = process.env.EMAIL_TO;

var sendgrid = require('sendgrid')(SENDGRID_API_KEY);

// dry run mode -- for testing without sending emails

var dryRun = process.argv.join(' ').indexOf('--dry-run') != -1;
console.log('--dry-run =', dryRun);

if (dryRun) {
  sendgrid.send = function simulateEmail(object, cb) {
    console.log('=> EMAIL DATA:', object);
    cb();
  };  
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

fetchMyDoneTasks(function(err, doneTasks){
  if (err) {
    console.error('fetchMyDoneTasks error:', err);
    process.exit();
  }
  var lines = doneTasks;
  console.log('lines:', lines);
  sendEmail(lines.join('\n\n'), function(){
    console.warn('email =>', arguments);
    process.exit();
  });
})
