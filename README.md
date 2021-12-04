# week-3-assignment-fatih-kaya

## Express Web Server

- A NodeJS web server created by Express that logs each request with Morgan.
- The web server communicates in memory database created with an array that holds JSON data.
- The array consists of a market inventory which can be found under data folder.
- In order to send request you need to supply a Bearer Token

But first of all; for the **back-end**, install the dependencies once via the terminal.

```bash
npm install
```

Run the _server_ for Node. It listens on port 3000.

```bash
npm start
```

If you want to enable nodemon Run the _development-server_ for Node.

```bash
npm dev
```

### public key is the following 589b00de-9062-4fd3-8e01-6d3a49d877d1

- in order to test via the terminal

```
curl -X GET http://localhost:3000/ -H "Authorization: Bearer 589b00de-9062-4fd3-8e01-6d3a49d877d1"
```

or simply via Postman choose Bearer Token under Authorization page and fill token cell with public token.
![bearer token implementation](https://github.com/getir-nodejs-bootcamp/week-3-assignment-fatih-kaya/blob/main/pics/bearer.png)
If you do not give an authorization server responds with **code 401**

Following endpoints are available:

- GET http://localhost:3000/
- GET http://localhost:3000/inventory/
- GET http://localhost:3000/inventory/:id
- PUT http://localhost:3000/inventory/:id
- PATCH http://localhost:3000/inventory/:id
- POST http://localhost:3000/inventory/
- DELETE http://localhost:3000/inventory/:id

![GET request](https://github.com/getir-nodejs-bootcamp/week-3-assignment-fatih-kaya/blob/main/pics/get-request.png)

#### Note that you can only modify QUANTITY and PRICE of an item

#### You cannot edit quantity or price below zero

#### PUT and PATCH guide

- for the following endpoint PUT or PATCH http://localhost:3000/inventory/5
- send this as body

```
{
    "quantity": 10,
    "price": 99
}
```

#### POST guide

- for the following endpoint POST http://localhost:3000/inventory/5
- send this JSON as body since POST requests expects

```
{
    "name": "energy drink",
    "category": "Drinks",
    "quantity": 120,
    "price": 15
}
```

- You do not need to give ID number since application itself increments the product ID
- If you send ID number with POST requests, web server will ignore and latest product ID increments for new product.

##### There is an application logic behind this.

##### You cannot post an inventory if category does not exist in the DB.

##### You cannot post an inventory if price or category is below zero.

### FATİH KAYA

## Thank you for reviewing my repo :heart: :heart: :heart:
