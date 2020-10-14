require("dotenv").config();

const express = require("express");
let bodyParser = require("body-parser");
const { startDatabase } = require("./database");
let cors = require("cors");

const TwilioService = require("./messaging");

const app = express();
const port = process.env.PORT || 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(cors());

const dbSetup = async (req, res, next) => {
  if (!req.db) {
    const db = await startDatabase();
    req.db = db;
  }

  next();
};

app.use(dbSetup);

app.get("/", (req, res) => {
  res.send("Welcome to the Order Processing API!");
});

app.get("/orders", async (req, res) => {
  const locations = await req.db.collection("orders").find().toArray();

  res.status(200).send(locations);
});

app.post("/updateorder", async (req, res) => {
  const order_id = Number(req.body.order_id);
  console.log(order_id);
  try {
    let order = await req.db
      .collection("orders")
      .findOne({ order_id: order_id });

    const update_order = await req.db
      .collection("orders")
      .updateOne({ order_id: order_id }, { $set: { status: req.body.status } });

    //Send Message to customer
    let smsData = {
      status: req.body.status,
      name: order.customer.name
    };
    await TwilioService.sendMessage(
      order.customer.phone,
      TwilioService.buildOrderMessage(smsData)
    );

    res.status(201).send({
      message: "Order Successfully Updated"
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
