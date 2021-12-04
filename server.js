const express = require("express");
const bodyParser = require("body-parser");
const bearerToken = require("express-bearer-token");
const _ = require("lodash");
const db = require("./data/db");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

// instantiate express application
const app = express();

// define public key for API
const PUBLIC_KEY = "589b00de-9062-4fd3-8e01-6d3a49d877d1";

// define port
const PORT = process.env.PORT || 3000;

// define log file location
const location = path.join(__dirname, "./logs/access.log");

// create a write stream (in append mode)
const logStream = fs.createWriteStream(location, { flags: "a" });

// setup the logger middleware
app.use(morgan("combined", { stream: logStream }));

// parse json body for POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// instantiate bearer token middleware
app.use(bearerToken());

// continue middleware with Bearer token Authorization
app.use(function (req, res, next) {
  if (req.token == PUBLIC_KEY) {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: `Not Authorized for this API with ${
        req.token ? "token: " + req.token : "no token"
      }`,
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    msg: "api is ready to receive requests. please use /inventory endpoint",
  });
});

app.get("/inventory", (req, res) => {
  res.json({ inventory: db });
});

app.get("/inventory/:id", (req, res) => {
  const { id } = req.params;
  const item = db.find((item) => item.id === Number(id));
  if (item) {
    res.status(200).json(item);
  } else {
    res.status(404).json({ msg: `Item not found with specified id: ${id}` });
  }
});

app.put("/inventory/:id", (req, res) => {
  // get id from parameter
  const { id } = req.params;

  const itemIndex = db.findIndex((item) => item.id === Number(id));
  const item = db[itemIndex];

  if (!item)
    res.status(400).json({
      msg: `Cannot handle PUT request item with id ${id} does not exists`,
    });

  if (item) {
    // only quantity and price can be modified
    const { quantity, price } = req.body;

    // id, item name and category are ignored from request body for resiliency in inventory management
    const { id, name, category } = item;

    // TODOS: refactor repeating control logic
    // TODOS: check for types: quantity as number, price as number

    // check price is valid or not
    if (price < 0)
      res.status(400).json({ msg: "Price cannot be less than zero" });
    // check quantity is valid or not
    else if (quantity < 0)
      res.status(400).json({ msg: "Quantity cannot be less than zero" });
    else {
      // new object is created due to PUT method
      const modifiedItem = {
        id: id,
        name: name,
        category: category,
        quantity: quantity,
        price: price,
      };

      // copies properties modifiedItem to existing item then return new object
      Object.assign(item, modifiedItem);

      res.status(200).json(item);
    }
  } else {
    res.status(400).json({ msg: "Cannot handle PUT request" });
  }
});

app.patch("/inventory/:id", (req, res) => {
  // get id from parameter
  const { id } = req.params;

  // only quantity and price can be modified
  // id, item name and category are ignored from request body for resiliency in inventory management
  const { quantity, price } = req.body;

  const itemIndex = db.findIndex((item) => item.id === Number(id));
  const item = db[itemIndex];

  if (item) {
    // change quantity and price attributes as requested
    // partial modification is due to PATCH method.
    item.quantity = quantity;
    item.price = price;

    // check price is valid or not
    if (price < 0)
      res.status(400).json({ msg: "Price cannot be less than zero" });
    // check quantity is valid or not
    else if (quantity < 0)
      res.status(400).json({ msg: "Quantity cannot be less than zero" });
    else res.json(db[itemIndex]);
  } else {
    res.status(400).send({ msg: "Cannot handle PATCH request" });
  }
});

app.post("/inventory", (req, res) => {
  // make sure that request body has the following properties
  if (
    req.body.hasOwnProperty("name") &&
    req.body.hasOwnProperty("category") &&
    req.body.hasOwnProperty("quantity") &&
    req.body.hasOwnProperty("price")
  ) {
    const { name, category, quantity, price } = req.body;

    // get unique item categories from db by using lodash library
    const categories = _.uniq(_.map(db, "category"));

    // check category sent by request is valid or not
    if (!categories.includes(category))
      res.status(400).json({
        msg: `Category '${category}' does not exists in the inventory. Please choose from ${categories.join(
          " | "
        )}`,
      });
    // check price is valid or not
    else if (price < 0)
      res.status(400).json({ msg: "Price cannot be less than zero" });
    // check quantity is valid or not
    else if (quantity < 0)
      res.status(400).json({ msg: "Quantity cannot be less than zero" });
    // insert new record
    else {
      let lastID = db[db.length - 1].id;
      const newItemID = lastID + 1;

      const newItem = {
        id: newItemID,
        name: name,
        category: category,
        quantity: quantity,
        price: price,
      };
      // insert item to the array
      db.push(newItem);
      res.status(201).json(newItem);
    }
  } else {
    res.status(400).json({
      msg: "Cannot handle post request. You need to supply item, category, quantity and price info.",
    });
  }
});

app.delete("/inventory/:id", (req, res) => {
  const { id } = req.params;
  const itemIndex = db.findIndex((item) => item.id === Number(id));
  if (itemIndex !== -1) {
    // remove item from array
    db.splice(itemIndex, 1);

    res.status(200).json({ msg: `Item with id ${id} is deleted` });
  } else {
    res
      .status(400)
      .json({ msg: `Cannot handle delete request with specified id: ${id}` });
  }
});

// error handling middleware
app.use(function (err, req, res, next) {
  res.status(500).send("Server respons with error message: " + err.message);
  next(err);
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
