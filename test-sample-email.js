const async = require('async')
const firebase = require('firebase')

const path = process.env.FIREBASE_DATA_PATH || '/'

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  databaseURL: process.env.FIREBASE_DATA_URL,
})

const db = firebase.database().ref(path)

const fakeEmails = [
  {
    when: new Date().getTime(),
    subject: 'fake email 1',
    text: 'should be sent now',
  },
  {
    when: new Date().getTime() + 5000,
    subject: 'fake email 2',
    text: 'should be sent in 5 seconds or more',
  },
]

async.forEachSeries(fakeEmails, (email, next) => {
  db.push(email, (err) => {
    console.log('=>', err || ('pushed ' + email.subject))
    next()
  })
}, process.exit)
