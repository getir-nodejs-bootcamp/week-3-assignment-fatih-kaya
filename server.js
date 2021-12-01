const express = require('express');
const bodyParser = require('body-parser');
const db = require('./data/db');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('api is ready to receive requests. please use /inventory endpoint');
});

app.get('/inventory', (req, res) => {
    res.send({inventory: db});
});

app.get('/inventory/:id', (req, res) => {
    const {id} = req.params;
    const item = db.find( item => item.id === Number(id) )
    if(item){
      res.status(200).send(item);
    } else {
      res.status(404).send('item not found');
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
      res.send(db[itemIndex]);
    } else {
      res.status(404).send();
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
      res.send(db[itemIndex]);
    } else {
      res.status(404).send();
    }
});

// TODO: CHECK OBJECT KEYS, CATEGORIES, VALID PRICES ETC
app.post('/inventory', (req, res, next) => {
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
        res.status(201).send(newItem);
    } else {
      res.status(400).send();
    }
});

app.delete('/inventory/:id', (req, res, next) => {
    const {id} = req.params;
    const itemIndex =  db.findIndex( item  => item.id === Number(id) );
    if (itemIndex !== -1) {
      db.splice(itemIndex, 1);
      // TODO:: what info to send?
      res.status(200).send();
    } else {
      res.status(404).send();
    }
});
  

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
