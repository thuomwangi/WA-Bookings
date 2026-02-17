const express = require('express');
require('dotenv').config();
const axios = require('axios');


const app = express();


app.use(express.json());


const port = process.env.PORT;
const verifyToken = process.env.VERIFY_TOKEN;


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
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  //reply_action();
  res.status(200).end();
});

//function to handle the webhook
async function reply_action(){
  console.log('Reply Action Called')
  try{
    const response = await axios.post('https://graph.facebook.com/v24.0/me/messages', {
      "recipient": {
        "id": "<PSID>"
      },
      "message": {
        "text": "Hello, this is a reply from the webhook!"
      }
    });
  } catch (error){
    console.error('Axios error:', error);
  }
}


app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});

