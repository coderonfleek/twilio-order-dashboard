//Setup Twilio SMS
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const client = require("twilio")(accountSid, authToken);

const TwilioService = {
  sendMessage,
  buildOrderMessage
};

async function sendMessage(recipient, message) {
  const sendResponse = await client.messages.create({
    body: message,
    from: process.env.TWILIO_NUMBER,
    to: recipient
  });

  return sendResponse;
}

function buildOrderMessage(data) {
  let messageFragment;

  if (data.status == "Dispatched") {
    messageFragment = "You will recieve your package in 3-7 business days";
  } else if (data.status == "Delivered") {
    messageFragment = "Thanks for doing business with us";
  }
  const message = `Hi ${data.name}. \nYour package has been ${data.status} \n${messageFragment}`;

  return message;
}

module.exports = TwilioService;
