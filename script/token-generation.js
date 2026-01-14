import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { getAuthCred } from './manage-credentials.js';

const ENV_PATH = path.resolve(process.cwd(), '.env');

export async function fetchAccessToken() {

  const creds = getAuthCred();

  const response = await fetch('https://accounts.zoho.in/oauth/v2/token?'
     + new URLSearchParams({
      refresh_token: creds.ZC_REFRESH_TOKEN,
      client_id: creds.ZC_CLIENT_ID,
      client_secret: creds.ZC_CLIENT_SECRET,
      grant_type: 'refresh_token'
     }).toString(),{
      method: 'POST'
    });

  const jsonData = await response.json();
  
  return jsonData.access_token;
}

export async function fetchRefreshToken(grantToken, client_id, client_secret) {
  const response = await fetch('https://accounts.zoho.in/oauth/v2/token?'
    + new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: client_id,
      client_secret: client_secret,
      redirect_uri: 'https://ecommerce.zoho.in/',
      code: grantToken
    }).toString(), {
      method: 'POST'
    });

  const jsonData = await response.json();

  return jsonData.refresh_token;
}

export function saveCreds(creds = {}) {
  const content = Object.entries(creds)
    .map(([key, value]) => {
      if (value === undefined || value === null) return '';
      const v = String(value);
      return `${key}="${v}"`;
    })
    .filter(Boolean)
    .join('\n');

  fs.writeFileSync(ENV_PATH, content, 'utf-8');
}
