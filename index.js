const express = require('express');
require('dotenv').config();
const axios = require('axios');
const { calendar } = require('googleapis/build/src/apis/calendar');
const { google } = require('googleapis');


const app = express();
const port = process.env.PORT;
const baseurl = 'https://graph.facebook.com/v24.0';
const accessToken = process.env.wa_permanent_token;
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const calendar = google.calendar({ version: 'v3', auth });
let syncToken = null; 
const auth = new google.auth.GoogleAuth({
  credentials, 
  scopes: ['https://www.googleapis.com/auth/calendar.events'],
});


app.use(express.json());



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

  // Log the incoming request body
  console.log('Incoming webhook:', JSON.stringify(body, null, 2));

  //only act if the message os from a real user.
  if (!req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
    const status = req.body.entry[0].changes[0].value.statuses[0];
    console.log(`Reply is ${status.status} for message ID ${status.id}`);
    return;
  }

  const message = body.entry[0].changes[0].value.messages[0];
  const from = message.from;
  const text = message.text?.body || message?.interactive?.product_reply?.title || "No text content";

  const ls_slctn_body = req.body?.entry?.[0]?.changes?.[0]?.value.messages?.[0].interactive;
  const prod_name = ls_slctn_body?.list_reply?.title || "Unknown Product";

  console.log(`Message from ${from}: ${text}`); 

  //reply_action(from);
  reply_to_list_action(prod_name, from);  

});

reply_to_list_action = async (prod_name, toPhone) => {
  const payload = {
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": toPhone,
    "type": "text",
    "text": {
      "preview_url": false,
      "body": "Confirmed Order for " + prod_name
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

reply_action = async (toPhone) => {
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

app.post('/google-calendar-webhook', async (req, res) => {
  console.log(req.headers);

  const resourceState = req.headers['x-goog-resource-state'];
  const channelId = req.headers['x-goog-channel-id'];

  res.status(200).send('OK');

  if (resourceState === 'sync') {
    //Initial sync notification; ignore or handle as needed
    return;
  } else if (resourceState === 'exists') {
    //Resource changed; fetch updates
    try {
      const response = await calendar.events.list({
        calendarId: "",
        syncToken: syncToken,
        singleEvents: true,
      });

      const events = resposen.data.items;
      //process new/updated events
      events.forEach(event => {
        if (event.status === 'confirmed'){
          console.log('New appointment details:', event);
          //logic to send whatsapp message with event details


        }
      });

      //update the syncToken for the next fetch
      syncToken = response.data.nextSyncToken;
    } catch (error) {
      console.log('Error fetching events:', error);
    }
  } else if (resourceState === 'not_exists') {
    //Resource deleted; handle if relevant
  }
});

// Function to create a watch channel for Google Calendar events
createWatchChannel = async () => {
  const channel = {
    id: 'unique-channel-id-' + Date.now(), 
    type: 'web_hook',
    address: 'https://wa-bookings.onrender.com',
    token: '',
    expiration: Date.now() + (7 * 24 * 60 * 60 * 1000),
  };

  try {
    
  } catch (error) {
    console.log('Error creating watch:', error);
  }
}



app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});

