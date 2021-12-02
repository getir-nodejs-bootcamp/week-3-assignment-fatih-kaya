const express = require('express');
const bodyParser = require('body-parser');
const bearerToken = require('express-bearer-token');
const db = require('./data/db');

// instantiate express application
const app = express();

// define public key for API
const PUBLIC_KEY = '589b00de-9062-4fd3-8e01-6d3a49d877d1';

// define port
const PORT = process.env.PORT || 3000;

// parse json body for POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// instantiate bearer token as first middleware
app.use(bearerToken());

// continue middleware with
app.use(function (req, res, next) {
  if(req.token == PUBLIC_KEY){
    next()
  }else{
    res.status(401).json({
      success: false,
      message: `Not Authorized for this API with ${req.token ? 'token: ' + req.token: 'no token'}`,
    });
  }
});

// TODO: bütün res.send res.json olarak güncellenecek
app.get('/', (req, res) => {
    res.json({msg: 'api is ready to receive requests. please use /inventory endpoint'});
});

app.get('/inventory', (req, res) => {
    res.json({inventory: db});
});

app.get('/inventory/:id', (req, res) => {
    const {id} = req.params;
    const item = db.find( item => item.id === Number(id) )
    if(item){
      res.status(200).json(item);
    } else {
      res.status(404).json({msg: `Item not found with specified id: ${id}`});
    }
});

app.put('/inventory/:id', (req, res) => {
    const {id} = req.params;
    const {quantity, price} = req.body;
    const itemIndex = db.findIndex( item  => item.id === Number(id) );
    const item = db[itemIndex]
    if (item) {
      item.quantity = quantity;
      item.price = price;
      res.json(db[itemIndex]);
    } else {
      res.status(400).json({msg: 'Cannot handle PUT request'});
    }
});

app.patch('/inventory/:id', (req, res) => {
    const {id} = req.params;
    const {quantity, price} = req.body;
    const itemIndex = db.findIndex( item  => item.id === Number(id) );
    const item = db[itemIndex]
    if (item) {
      item.quantity = quantity;
      item.price = price;
      res.json(db[itemIndex]);
    } else {
      res.status(400).send({msg: 'Cannot handle PATCH request'});
    }
});

// TODO: CHECK OBJECT KEYS, CATEGORIES, VALID PRICES ETC
app.post('/inventory', (req, res, next) => {
    console.log(req.body)
    // TODO: body boş olsa da ekliyor
    if (req.body) {
        const {item, category, quantity, price} = req.body;
        let lastID = db[db.length-1].id;
        // TODO: DELETE CONSOLE.LOG FOR PRODUCTION
        console.log("lastID:" + lastID)
        const newItemID = lastID + 1;
        // TODO: DELETE CONSOLE.LOG FOR PRODUCTION
        console.log(newItemID)
        const newItem = {
            "id": newItemID,
            "item": item,
            "category": category,
            "quantity": quantity,
            "price": price
        }
        db.push(newItem);
        res.status(201).json(newItem);
    } else {
      res.status(400).json({msg: 'Cannot handle post request'});
    }
});

app.delete('/inventory/:id', (req, res, next) => {
    const {id} = req.params;
    const itemIndex =  db.findIndex( item  => item.id === Number(id) );
    if (itemIndex !== -1) {
      db.splice(itemIndex, 1);
      // TODO:: what info to send?
      res.status(200).json({msg: `Item with id ${id} is deleted`});
    } else {
      res.status(400).json({msg: `Cannot handle delete request with specified id: ${id}`});
    }
});


app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});

// curl -X GET http://localhost:3000/ -H "Authorization: Bearer 589b00de-9062-4fd3-8e01-6d3a49d877d1"