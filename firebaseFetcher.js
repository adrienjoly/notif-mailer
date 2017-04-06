const async = require('async')
const firebase = require('firebase')

function forEachSubmission(firebaseConfig, path, handler, callback) {
  var q = async.queue(handler) // handler(task, callnext) will be called for each child
  //q.push({name: 'foo', code1: 'console.log("test", 666)'}) // for testing
  firebase.initializeApp(firebaseConfig)
  firebase.database().ref(path).once('value', (snapshot) => {
    var remaining = snapshot.numChildren()
    q.drain = function() {
      if (!remaining) callback()
    } // TODO: move to parent function?
    snapshot.forEach(function(child) {
      var obj = child.val()
      obj.key = child.key
      obj.delete = function(callback) {
        firebase.database().ref(path + '/' + obj.key).remove(callback)
      }
      q.push(obj)
      --remaining
    })
  })
}

module.exports = {
  forEachSubmission,
}
