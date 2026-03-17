const express = require('express');
const fetch   = require('node-fetch');
const app     = express();

app.use(express.json());
app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if(req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const APP_ID  = 'e9bd9007-1e73-4d4f-895f-10e1999c9952';
const API_KEY = 'os_v2_org_6tndnopxe5gafjc2yg6yabevjgz5ztyfwcne2mnqcrxeqrdqbtmeqcxcwubxwu6nxc2kh2lmcl2fwcmbgt2jnlbsa2jdulocdzktyoq';
const APP_URL = 'https://gentle-elf-8709cb.netlify.app';
const ICON    = 'https://gentle-elf-8709cb.netlify.app/icon-192.png';

async function sendNotification(payload){
  payload.app_id         = APP_ID;
  payload.target_channel = 'push';
  payload.url            = APP_URL;
  payload.chrome_web_icon= ICON;

  // Try Bearer first (v2 keys)
  var resp = await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY },
    body: JSON.stringify(payload)
  });
  var data = await resp.json();
  console.log('Bearer response:', JSON.stringify(data));

  // If failed, try Key prefix (legacy)
  if(data.errors){
    resp = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Key ' + API_KEY },
      body: JSON.stringify(payload)
    });
    data = await resp.json();
    console.log('Key response:', JSON.stringify(data));
  }
  return data;
}

app.post('/send-all', async function(req, res){
  try{
    var { title, body } = req.body;
    if(!title || !body) return res.status(400).json({ error: 'missing fields' });
    var data = await sendNotification({
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
    if(!phone||!title||!body) return res.status(400).json({ error: 'missing fields' });
    var data = await sendNotification({
      filters:  [{ field:'tag', key:'phone', relation:'=', value: phone }],
      headings: { ar: title, en: title },
      contents: { ar: body,  en: body  }
    });
    res.json(data);
  }catch(e){ res.status(500).json({ error: e.message }); }
});

app.get('/', function(req, res){
  res.json({ status: 'MW Cosmetics Notification Server ✅' });
});

app.listen(process.env.PORT || 3000, function(){
  console.log('Server running on port ' + (process.env.PORT || 3000));
});
