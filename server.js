const express = require('express');
const fetch   = require('node-fetch');
const app     = express();

app.use(express.json());
app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if(req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const APP_ID  = 'e9bd9007-1e73-4d4f-895f-10e1999c9952';
const API_KEY = process.env.OS_API_KEY; // من Render Environment
const APP_URL = 'https://cosmeticsmw.netlify.app';
const ICON    = 'https://cosmeticsmw.netlify.app/icon-192.png';

async function sendNotif(payload){
  payload.app_id          = APP_ID;
  payload.url             = APP_URL;
  payload.chrome_web_icon = ICON;

  var resp = await fetch('https://onesignal.com/api/v1/notifications', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': 'Basic ' + API_KEY
    },
    body: JSON.stringify(payload)
  });
  var data = await resp.json();
  console.log('Result:', JSON.stringify(data));
  return data;
}

app.post('/send-all', async function(req, res){
  try{
    var { title, body } = req.body;
    var data = await sendNotif({
      included_segments: ['Total Subscriptions'],
      headings: { ar: title, en: title },
      contents: { ar: body,  en: body  }
    });
    res.json(data);
  }catch(e){ res.status(500).json({ error: e.message }); }
});

app.post('/send-user', async function(req, res){
  try{
    var { phone, title, body } = req.body;
    var data = await sendNotif({
      filters:  [{ field:'tag', key:'phone', relation:'=', value: phone }],
      headings: { ar: title, en: title },
      contents: { ar: body,  en: body  }
    });
    res.json(data);
  }catch(e){ res.status(500).json({ error: e.message }); }
});

app.get('/', function(req, res){
  res.json({ status: 'MW Cosmetics Notification Server ✅', key_loaded: !!API_KEY });
});

app.listen(process.env.PORT || 3000, function(){
  console.log('Server running, key loaded:', !!API_KEY);
});
