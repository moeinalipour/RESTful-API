const express = require('express');
const mysql = require('mysql');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path')


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


//Enable CORS for all origin
app.use(cors({
    origin: '*'
}));


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


//Here is API Endpoint
app.get('/products' , (req, res)=>{
    myDB.query('SELECT * FROM products', (error, data)=>{
        if (error){
            return res.json({status: 'ERROR' , error});
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


app.listen(4000, function() {
  console.log("Server is up and runnig on port 4000");
});