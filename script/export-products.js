import 'dotenv/config';
import { fetchAccessToken } from './token-generation.js';
import fs from 'fs';
import ora from 'ora';

export default async function exportProducts(orgId) {

  const spinner = ora('Downloading data from source org...').start();

  try {
    const queryParams = new URLSearchParams();
    queryParams.append('entity', 'itemgroup');
    queryParams.append('accept', 'csv');

    const url = `https://commerce.zoho.in/store/api/v1/export?${queryParams}`;

    const accessToken = await fetchAccessToken();

    const headers = {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Cache-Control': 'no-cache',
      'X-com-zoho-store-organizationid': orgId
    };
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    const rawCsv = await response.text();

    fs.mkdirSync('data', { recursive: true });
    
    fs.writeFileSync('data/item.csv', rawCsv, 'utf-8');
  } catch(error) {
    console.log(error.message);
  } finally {
    spinner.stop();
  }
}