const express = require('express');
require('dotenv').config();
const axios = require('axios');


const app = express();
const baseurl = 'https://graph.facebook.com/v24.0';
const accessToken = process.env.ACCESS_TOKEN;

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
  reply_action();
  res.status(200).end();
});

//function to handle the webhook

async function reply_action(){
  console.log(`Reply Action Called. Access token: ${accessToken}`);
  const  url= `https://graph.facebook.com/v24.0/354048041134011/messages`;
  const options = {
    method: 'POST',
    headers: {Authorization: `Bearer EAAMV4bvFNkcBQjMKKKoXZCYuKpJBqxr9bEPOlJZB5ko7OIhZArjLAfIROH5QXlb4vcvZAZAc78VLzszJK3DqlfjUgyCSgXqSsOZCX9ZCGM5mkFpPyFBqeWbeub5hr0rLwaoZAcUnqUsrLTHeDZAZAG1fscytQq2lUkmEFkeUmvlaqdZBPkwzTBZBHTG9ZAgZAT6Ux79XaOVTZCsOYhVoedY3N2vxS5SpkJiOWnJZBqbiwy9C`, 'Content-Type': 'application/json'},
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": "254797263246",
      "type": "text",
      "text": {
        "preview_url": false,
        "body": "Hello, this is a reply from the webhook!"
      
    },
    json: true
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log('Response from Meta API:', data);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}
// async function reply_action(){
//   console.log('Reply Action Called')
//   try{
//     const response = await axios.post('https://graph.facebook.com/v24.0/me/messages', {
//       "recipient": {
//         "id": "<PSID>"
//       },
//       "message": {
//         "text": "Hello, this is a reply from the webhook!"
//       }
//     });
//   } catch (error){
//     console.error('Axios error:', error);
//   }
// }


app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});

