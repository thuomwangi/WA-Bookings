const express = require('express');
require('dotenv').config();
const axios = require('axios');


const app = express();
const baseurl = 'https://graph.facebook.com/v24.0';
const accessToken = process.env.wa_permanent_token;

app.use(express.json());


const port = process.env.PORT;


app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

app.post('/', (req, res) => {
  res.status(200).end();

  const body = req.body;
  //only act if the message os from a real user.
  if (!req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
    const status = req.body.entry[0].changes[0].value.statuses[0];
    console.log(`Reply is ${status.status} for message ID ${status.id}`);
    return;
  }

  const message = body.entry[0].changes[0].value.messages[0];
  const from = message.from;
  const text = message.text?.body || 'No text content';

  console.log(req.body?.entry?.[0]?.changes?.[0]?.value);

  console.log(`Message from ${from}: ${text}`);


  reply_action(from);

})


//function to handle the webhook
async function reply_action(toPhone){
  const payload = {
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": toPhone,
  "type": "text",
  "text": {
    "preview_url": false,
    "body": "Hello, this is a reply from the webhook!"
  }
};

  const  url= `https://graph.facebook.com/v24.0/354048041134011/messages`;
  const options = {
    method: 'POST',
    headers: {Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json'},
    body: JSON.stringify(payload),

    }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    //console.log('Response from Meta API:', JSON.stringify(data, null, 2));
    return;
  } catch (error) {
    console.error('Fetch error:', error);
  }
}



app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});

