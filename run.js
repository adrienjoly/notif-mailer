var initSendgrid = require('sendgrid')
var firebaseFetcher = require('./firebaseFetcher.js')

const TIMEOUT_MS = 10000 // this process is killed after 10 seconds

// getting configuration/settings from environment variables

var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
var EMAIL_FROM = process.env.EMAIL_FROM
var EMAIL_TO = process.env.EMAIL_TO

var firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  databaseURL: process.env.FIREBASE_DATA_URL,
}

const path = process.env.FIREBASE_DATA_PATH || '/'

// setting sendEmail() depending on dry-run mode (for testing without sending emails)

var sendEmail // function to render and send the daily notification

const dryRun = process.argv.join(' ').indexOf('--dry-run') !== -1

if (dryRun) { // --dry-run mode
  sendEmail = function simulateEmail({ subject, text }, cb) {
    console.log('[dry-run] subject:', subject, 'text:', text.replace(/\n/g, '\\n'))
    setTimeout(cb, 1)
  }
} else { // or use sendgrid
  var sendgrid = initSendgrid(SENDGRID_API_KEY)
  sendEmail = function sendEmail({ to, from, subject, text, html }, cb){
    sendgrid.send({
      to: to || EMAIL_TO,
      from: from || EMAIL_FROM,
      subject,
      text: text && text.replace(/\n/g, '\n\n'),
      html,
    }, cb)
  }
}

// main script logic

setTimeout(() => {
  console.error('TIMEOUT: process killed after', TIMEOUT_MS / 1000, 'seconds')
  process.exit()
}, TIMEOUT_MS)

console.log('Fetching from:', firebaseConfig.databaseURL + path, '...')
firebaseFetcher.forEachSubmission(firebaseConfig, path, (task, next) => {
  const email = {
    subject: '(object)',
    text: JSON.stringify(task, null, 2),
  }
  sendEmail(email, (err) => {
    if (err) {
      console.error('=> /!\\ ERROR:', err)
    } else if (!dryRun) {
      console.log('=> email sent to:', EMAIL_TO + '.')
    }
    next() // process next email
  })
}, function done() {
  console.log('done.')
  process.exit()
})
