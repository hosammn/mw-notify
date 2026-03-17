const express = require('express');
const fetch   = require('node-fetch');
const app     = express();

app.use(express.json());

// CORS - allow all origins
app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if(req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const ONESIGNAL_APP_ID  = 'e9bd9007-1e73-4d4f-895f-10e1999c9952';
const ONESIGNAL_API_KEY = 'njn27yluwezpmrxxmnxmq622v';
const APP_URL           = 'https://gentle-elf-8709cb.netlify.app';
const ICON_URL          = 'https://gentle-elf-8709cb.netlify.app/icon-192.png';

// Send to all users
app.post('/send-all', async function(req, res){
  try{
    var { title, body } = req.body;
    if(!title || !body) return res.status(400).json({ error: 'title and body required' });
    var resp = await fetch('https://onesignal.com/api/v1/notifications', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Key ' + ONESIGNAL_API_KEY
      },
      body: JSON.stringify({
        app_id:            ONESIGNAL_APP_ID,
        included_segments: ['Total Subscriptions'],
        headings:          { ar: title, en: title },
        contents:          { ar: body,  en: body  },
        url:               APP_URL,
        chrome_web_icon:   ICON_URL
      })
    });
    var data = await resp.json();
    console.log('send-all response:', JSON.stringify(data));
    res.json(data);
  }catch(e){
    console.log('send-all error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Send to specific user by phone tag
app.post('/send-user', async function(req, res){
  try{
    var { phone, title, body } = req.body;
    if(!phone || !title || !body) return res.status(400).json({ error: 'missing fields' });
    var resp = await fetch('https://onesignal.com/api/v1/notifications', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Key ' + ONESIGNAL_API_KEY
      },
      body: JSON.stringify({
        app_id:          ONESIGNAL_APP_ID,
        filters:         [{ field:'tag', key:'phone', relation:'=', value: phone }],
        headings:        { ar: title, en: title },
        contents:        { ar: body,  en: body  },
        url:             APP_URL,
        chrome_web_icon: ICON_URL
      })
    });
    var data = await resp.json();
    console.log('send-user response:', JSON.stringify(data));
    res.json(data);
  }catch(e){
    console.log('send-user error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/', function(req, res){
  res.json({ status: 'MW Cosmetics Notification Server running ✅' });
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function(){
  console.log('Server running on port ' + PORT);
});
