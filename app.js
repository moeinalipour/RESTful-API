const express = require('express');
const mysql = require('mysql');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')


//Set Database connection info
const dbHOST = 'localhost';
const dbUSER = 'root';
const dbPASSWORD = '';
const dbTABLE = 'mydb';


//Create Database connection
const myDB = mysql.createConnection({
  host: dbHOST,
  user: dbUSER,
  password: dbPASSWORD,
  database: dbTABLE,
});


const app = express();

app.use(bodyParser.json());

//Enable CORS for all origin
app.use(cors({
  origin: '*'
}));


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
})

//
app.post('/add-product', (req, res) => {

  const { pName, pPrice, image, imageExtension } = req.body;

  //Create a uuid version 4 for image name
  const newImageName = uuidv4();

  // Remove header
  let base64Image = image.split(';base64,').pop();

  // Create a file path with the uuid version 4 and image extention
  const imagePath = path.join(__dirname, 'pictures', `${newImageName}.${imageExtension}`);


  myDB.query(`INSERT INTO products (name , price , imageName) VALUES ('${ProductName}', '${ProductPrice}', '${newImageName + '.' + imageExtension}')`, (error, data) => {
    if (error) {
      console.log(error)
      return res.json({ status: 'ERROR', error });
    } else {
      console.log(data)
    }
  });



  // Save the image to the server
  fs.writeFile(imagePath, base64Image, { encoding: 'base64' }, (err) => {
    if (err) {

      console.error(err);

      res.status(500).json({ message: 'Failed to save the image' });

    } else {


      // Send a response indicating the product and image were successfully added
      res.json({ message: 'Product and image added successfully' });
    }
  });
})



//


//Here is API Endpoint
app.get('/products', (req, res) => {
  myDB.query('SELECT * FROM products', (error, data) => {
    if (error) {
      return res.json({ status: 'ERROR', error });
    }
    const baseURL = `${req.protocol}://${req.get('host')}`;
    const dataWithImages = data.map(product => {
      const imagePath = baseURL + '\\pictures\\' + product.imageName;
      return {
        ...product,
        imageName: imagePath
      };
    });
    return res.json(dataWithImages);
  })
})


// Serve the images from the "pictures" directory
app.use('/pictures', express.static(path.join(__dirname, 'pictures')));


app.listen(4000, function () {
  console.log("Server is up and runnig on port 4000");
});