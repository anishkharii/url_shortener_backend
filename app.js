const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
const randomString = require('randomstring');
require('dotenv').config();

const app = express();
app.use('/public', express.static('public'));
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Connected to MongoDB");
});

const URLSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

function checkUrlExists(hostname, callback) {
  dns.resolve(hostname, (err, addresses) => {
    if (err) callback(false);
    else callback(true);
  });
}

const URLModel = mongoose.model('URLModel', URLSchema);


app.post('/', async (req, res) => {
  const givenURL = req.body.url;
  console.log(givenURL);
  //if URL already exists, return short URL
  const data = await URLModel.findOne({ original_url: givenURL });
  if(data){
    res.status(200).json({ original_url: data.original_url, short_url:process.env.BACKEND_URL+data.short_url });
    return;
  }

  //check if URL is valid

  let hostname;
  try {
    hostname = new URL(givenURL).hostname;
  } catch (err) {
    res.status(400).json({ error: "Invalid URL" });
    return;
  }

  checkUrlExists(hostname, async (exists) => {
    if (!exists) {
      res.status(400).json({ error: "Invalid URL" });
      return;
    }
      const newURL = new URLModel({
        original_url: givenURL,
        short_url: randomString.generate({ length: 6, charset: 'alphanumeric' })
      }); 

      await newURL.save().then((data) => {
        const shortURL = process.env.BACKEND_URL+data.short_url;
        res.status(200).json({ original_url: data.original_url, short_url: shortURL });
      });
    
  });
});

app.get('/:id', async (req, res) => {
  const data = await URLModel.findOne({ short_url: req.params.id });

  if (data) {
    res.redirect(data.original_url);
  } else {
    res.status(404).json({ error: "URL not found" });
  }
});

// app.get('/api/url/view', async (req, res) => {
//   try {
//     const adminKey = req.body.key || req.query.key;

//     if (adminKey === process.env.ADMIN_KEY) {
//       const allUrls = await URLModel.find({});
//       res.render('view', { urls: allUrls });
//     } else {
//       res.status(401).json({ error: 'Unauthorized' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching URLs. Try again.' });
//   }
// });


// app.post('/api/shorturl/delete', async (req, res) => {
//   const urlIdToDelete = req.body.urlId;
//   try {
//     await URLModel.findByIdAndDelete(urlIdToDelete);
//     res.json({ success: true });
//   } catch (error) {
//     res.json({ error: "Error deleting URL" });
//   }
// });

app.listen(3000, () => {
  console.log("Connected to server.");
});
