const async = require('async')
const firebase = require('firebase')

var firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  databaseURL: process.env.FIREBASE_DATA_URL,
}

const path = process.env.FIREBASE_DATA_PATH || '/'

// helpers

function forEachSubmission(path, handler, callback) {
  var q = async.queue(handler, 1) // handler(task, callnext) will be called for each child
  //q.push({name: 'foo', code1: 'console.log("test", 666)'}) // for testing
  firebase.initializeApp(firebaseConfig)
  firebase.database().ref(path).on('value', (snapshot) => {
    var remaining = snapshot.numChildren()
    q.drain = function() {
      if (!remaining) callback()
    } // TODO: move to parent function?
    snapshot.forEach(function(child) {
      var obj = child.val()
      obj.key = child.key
      q.push(obj)
      --remaining
    })
  })
}

// actual script

console.log('Fetching from:', firebaseConfig.databaseURL, '...')
forEachSubmission(path, (task, next) => {
  console.log(task)
  next()
}, function done() {
  console.log()
  process.exit()
})
