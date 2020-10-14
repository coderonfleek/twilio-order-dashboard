const { MongoMemoryServer } = require("mongodb-memory-server");
const { MongoClient } = require("mongodb");
const faker = require("faker");

let database = null;

const mongo = new MongoMemoryServer();

async function startDatabase() {
  const mongoDBURL = await mongo.getConnectionString();
  const connection = await MongoClient.connect(mongoDBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  //Seed Database
  if (!database) {
    let orders = [];

    console.log("Seeding Database");

    for (let i = 1; i <= 5; i++) {
      let record = {
        order_id: faker.random.number(),
        item: `${i} piece(s) of ${faker.commerce.productName()}. ${faker.commerce.color()} in color and ${faker.commerce.productMaterial()}`,
        status: "New",
        customer: {
          name: faker.name.findName(),
          address: `${faker.address.streetName()}, ${faker.address.state()}`,
          phone: "+2347068006051"
        },
        date: faker.date.recent(i)
      };
      orders.push(record);
    }

    database = connection.db();
    await database.collection("orders").insertMany(orders);

    console.log("Seeding Complete");
  }

  return database;
}

async function stopDatabase() {
  await mongo.stop();
}

module.exports = {
  startDatabase,
  stopDatabase
};
