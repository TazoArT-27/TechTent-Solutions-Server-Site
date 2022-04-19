const express = require('express');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const { initializeApp } = require('firebase-admin/app');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');





const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('servicePhoto'));
app.use(fileUpload());


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

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const orderedServicesCollection = client.db("projectDatabase").collection("orderedServices");
  const reviewCollection = client.db("projectDatabase").collection("customerReview");
  const adminCollection = client.db("projectDatabase").collection("addNewAdmin");
  const serviceCollection = client.db("projectDatabase").collection("addNewService");

  
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

  app.post('/addServices', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const description = req.body.description;
    const filePath = `${__dirname}/servicePhoto/${file.name}`;
    file.mv( filePath, err => {
      if (err) {
        console.log(err);
        res.status(500).send({msg: 'failed to upload file'})
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');
      var image = {
        contentType: req.files.file.mimetype,
        size: req.files.file.size,
        img: Buffer.from(encImg, 'base64')
      };
      
      serviceCollection.insertOne({name, description, image})
      .then(result => {
        fs.remove(filePath, error => {
          if (error){
            res.status(500).send({msg: 'Failed to upload image'});
          }
          res.send(result.insertedCount > 0);
        })
      })
    })
  })

  app.get('/orders', (req, res) => {
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

  app.get('/reviewPage', (req, res) => {
    reviewCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
     })
  });

  app.get('/servicePage', (req, res) => {
    serviceCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
     })
  });

  app.delete('/deleteOrder/:id', (req, res) => {
    const orderId = req.params.id;
    orderedServicesCollection.deleteOne({_id: ObjectId(orderId)})
    .then(res => {
    })
})
});

app.listen(process.env.PORT || port, ()=> {console.log("listening to port 5000")});