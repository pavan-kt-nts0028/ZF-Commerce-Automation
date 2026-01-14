import express from 'express';
import multer from 'multer';
import { isAuthConfigEnabled } from './utils.js';
import { fetchRefreshToken, saveCreds } from './token-generation.js';
import { setAuthCred } from './manage-credentials.js';
import populateProducts from './populate-products.js';
import path from 'path';
import open from 'open';

const upload = multer();
const app = express();

app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/auth-status', (request, response) => {
  if (isAuthConfigEnabled()) {
    setAuthCred({
      ZC_REFRESH_TOKEN: process.env.ZC_REFRESH_TOKEN,
      ZC_CLIENT_ID: process.env.ZC_CLIENT_ID,
      ZC_CLIENT_SECRET: process.env.ZC_CLIENT_SECRET
    });
  };
  return response.json({ isAuthConfigEnabled: isAuthConfigEnabled() });
});

app.post('/save-cred', upload.none(), async (req, res) => {
  const { client_id, client_secret, grant_token } = req.body;
  let isSuccessful = true;
  let message = 'Token generated successfully';
  try {
    const refresh_token = await fetchRefreshToken(grant_token, client_id, client_secret);
    saveCreds({
      ZC_REFRESH_TOKEN: refresh_token,
      ZC_CLIENT_ID: client_id,
      ZC_CLIENT_SECRET: client_secret
    });
  } catch(error) {
    isSuccessful = false;
    message = error.message;
  }
  return res.json({ success: isSuccessful, message: message });
});

app.post('/transfer', upload.none(), async (req, res) => {
  const { source_org_id, dest_org_id } = req.body; 
  let isSuccessful = true;
  let message = `Product data transferred successfully from Org@${source_org_id} to Org@${dest_org_id}`;
  try {
    await populateProducts(source_org_id, dest_org_id);
  } catch(error) {
    isSuccessful = false;
    message = error.message;
  }
  return res.json({ success: isSuccessful, message: message });
});

app.listen(3000, async () => {
  await open('http://localhost:3000');
});