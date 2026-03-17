const express  = require('express');
const OneSignal = require('@onesignal/node-onesignal');
const app      = express();

app.use(express.json());
app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if(req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const APP_ID   = 'e9bd9007-1e73-4d4f-895f-10e1999c9952';
const APP_KEY  = 'os_v2_app_5g6zaby6ongu7ck7cdqzthezkl6u7gc4s6wuv2umtwxckcraqvegtsx5hl6556y5xaqyaqjul7wasy2dohvgrosdtbfwwdau23ku2ga';
const USER_KEY = 'os_v2_org_6tndnopxe5gafjc2yg6yabevjgz5ztyfwcne2mnqcrxeqrdqbtmeqcxcwubxwu6nxc2kh2lmcl2fwcmbgt2jnlbsa2jdulocdzktyoq';
const APP_URL  = 'https://gentle-elf-8709cb.netlify.app';
const ICON     = 'https://gentle-elf-8709cb.netlify.app/icon-192.png';

const config = OneSignal.createConfiguration({
  restApiKey:  APP_KEY,
  userAuthKey: USER_KEY
});
const client = new OneSignal.DefaultApi(config);

async function sendNotification(payload){
  const notif = new OneSignal.Notification();
  notif.app_id          = APP_ID;
  notif.target_channel  = 'push';
  notif.url             = APP_URL;
  notif.chrome_web_icon = ICON;
  notif.headings        = payload.headings;
  notif.contents        = payload.contents;
  if(payload.included_segments) notif.included_segments = payload.included_segments;
  if(payload.filters)           notif.filters           = payload.filters;
  const resp = await client.createNotification(notif);
  console.log('Response:', JSON.stringify(resp));
  return resp;
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
  }catch(e){ console.log('error:', e); res.status(500).json({ error: e.message }); }
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
  }catch(e){ console.log('error:', e); res.status(500).json({ error: e.message }); }
});

app.get('/', function(req, res){
  res.json({ status: 'MW Cosmetics Notification Server ✅' });
});

app.listen(process.env.PORT || 3000, function(){
  console.log('Server running on port ' + (process.env.PORT || 3000));
});
