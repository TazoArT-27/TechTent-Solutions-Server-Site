const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const { initializeApp } = require('firebase-admin/app');


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


var admin = require("firebase-admin");

var serviceAccount = require("./techtentsolutions-firebase-adminsdk-ybjv7-974ac1ac1d.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dzshb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const port = 5000;

app.get('/', (req, res) => {
    res.send("Hello from db it's working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const orderedServicesCollection = client.db("projectDatabase").collection("orderedServices");
  const reviewCollection = client.db("projectDatabase").collection("customerReview");
  const adminCollection = client.db("projectDatabase").collection("addNewAdmin");
  
  app.post('/addOrderedServices', (req, res) => {
    const orderedServices = req.body;
    orderedServicesCollection.insertOne(orderedServices)
    .then(result => {
        res.send(result.insertedCount > 0)
    })    
  })

  app.post('/review', (req, res) => {
    const review = req.body;
    reviewCollection.insertOne(review)
    .then(result => {
        res.send(result.insertedCount > 0)
    })
  })

  app.post('/addNewAdmin', (req, res) => {
    const newAdmin = req.body;
    adminCollection.insertOne(newAdmin)
    .then(result => {
        res.send(result.insertedCount > 0)
    })
  })

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email})
    .toArray((err, documents) => {
      res.send(documents.length > 0)
    })
  })

  app.get('/orders', (req, res) => {
    console.log(req.query.email)
      orderedServicesCollection.find({email: req.query.email})
      .toArray((err, documents) => {
         res.send(documents);
    })
  })

  app.get('/allOrders', (req, res) => {
    orderedServicesCollection.find({})
    .toArray((err, documents) => {
       res.send(documents);
  })
  })
});

app.listen(process.env.PORT || port, ()=> {console.log("listening to port 5000")});