const express = require('express');
const fetch   = require('node-fetch');
const app     = express();

app.use(express.json());

// Allow requests from GitHub Pages
app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', 'https://hosammn.github.io');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if(req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const ONESIGNAL_APP_ID  = 'e9bd9007-1e73-4d4f-895f-10e1999c9952';
const ONESIGNAL_API_KEY = 'njn27yluwezpmrxxmnxmq622v';
const APP_URL           = 'https://hosammn.github.io/CosmrticsMW';
const ICON_URL          = 'https://hosammn.github.io/CosmrticsMW/icon-192.png';

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
        included_segments: ['All'],
        headings:          { ar: title, en: title },
        contents:          { ar: body,  en: body  },
        url:               APP_URL,
        chrome_web_icon:   ICON_URL
      })
    });
    var data = await resp.json();
    res.json(data);
  }catch(e){
    res.status(500).json({ error: e.message });
  }
});

// Send to specific user by phone tag
app.post('/send-user', async function(req, res){
  try{
    var { phone, title, body } = req.body;
    if(!phone || !title || !body) return res.status(400).json({ error: 'phone, title and body required' });

    var resp = await fetch('https://onesignal.com/api/v1/notifications', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Key ' + ONESIGNAL_API_KEY
      },
      body: JSON.stringify({
        app_id:   ONESIGNAL_APP_ID,
        filters:  [{ field:'tag', key:'phone', relation:'=', value: phone }],
        headings: { ar: title, en: title },
        contents: { ar: body,  en: body  },
        url:      APP_URL,
        chrome_web_icon: ICON_URL
      })
    });
    var data = await resp.json();
    res.json(data);
  }catch(e){
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
