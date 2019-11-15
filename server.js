const express = require('express')
//app is holding the express
const app = express()
//look in the form, grabbing data
const bodyParser = require('body-parser')
//how we interact with mongo database
const MongoClient = require('mongodb').MongoClient

var db, collection;

//
const url = "mongodb+srv://laAPPS:Dolemite@la-apps-ctgp5.mongodb.net/test?retryWrites=true&w=majority";
//name of DB
const dbName = "palindrome";

app.listen(3000, () => {
    MongoClient.connect(url, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
//SERVER KNOWS TO BE ABLE TO HOST ALL THE DATA IN THIS FOLDER
//this keeps you from making multiple requests by simply looking into this folder "public"
app.use(express.static('public'))


//Everything below are APIs
app.get('/', (req, res) => {
  //console.log(db)
  db.collection('messages').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('index.ejs', {word: result})
  })
})

app.post('/messages', (req, res) => {
  let word = req.body.word
  let isPalindrome = word.split("").reverse().join("")
  if(word === isPalindrome){
    isPalindrome = "true"
  }else {
    isPalindrome = "false"
  }

  db.collection('messages').save({word: word, isPalindrome: isPalindrome}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    //this code below reloads the page so that the new input shows right after entering
    res.redirect('/')
  })
})


app.put('/messages', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp + 1,
    }
  }, {
//code below ensures that
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})


app.put('/messages2', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp - 1,
    }
  }, {
//code below ensures that
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
