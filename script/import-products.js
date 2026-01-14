import { fetchAccessToken } from './token-generation.js';
import { openAsBlob } from 'node:fs';
import ora from 'ora';

async function uploadImportFile(orgId, filePath) {

  const spinner = ora('Uploading data to server...').start();

  try {
    const fileBlob = await openAsBlob(filePath);

    const queryParams = new URLSearchParams();
    queryParams.append('entity', 'itemgroup');
    queryParams.append('duplicate_handling', 'overwrite');
    queryParams.append('charencoding', 'UTF-8');
    queryParams.append('delimiter', ',');

    const url = `https://commerce.zoho.in/store/api/v1/import/uploadfile?${queryParams}`;
    const accessToken = await fetchAccessToken();
    const headers = {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Cache-Control': 'no-cache',
      'X-com-zoho-store-organizationid': orgId
    };
    
    const body = new FormData();
    body.append('importfile', fileBlob, 'item.csv');

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    });

    const jsonData = await response.json();

    return jsonData;
  } catch(error) {
    console.log(error);
  } finally {
    spinner.stop();
  }
}

async function previewImportFile(uploadResponse, orgId) {

  const spinner = ora('Mapping columns to the template...').start();

  try {
    const jsonString = new Object();

    jsonString.entity_columns = uploadResponse.data.entity_columns.map(entity => {
      return {
        csv_column: entity.csv_column==='Product ID' ? '': entity.csv_column,
        entity_column: entity.entity_column
      };
    });

    const url = `https://commerce.zoho.in/store/api/v1/import/${uploadResponse.data.import_id}/preview`;
    const accessToken = await fetchAccessToken();
    const headers = {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Cache-Control': 'no-cache',
      'X-com-zoho-store-organizationid': orgId,
      'content-type': 'text/json'
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(jsonString)
    });

    const jsonData = await response.json();
    
    return jsonData;
  } catch(error) {
    console.log(error);
  } finally {
    spinner.stop();
  }
}

async function importFile(importId, orgId) {

  const spinner = ora('Importing the processed data...').start();

  try {
    const url = `https://commerce.zoho.in/store/api/v1/import/${importId}`;
    const accessToken = await fetchAccessToken();
    const headers = {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Cache-Control': 'no-cache',
      'X-com-zoho-store-organizationid': orgId,
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: headers
    });

    const jsonData = await response.json();
    return jsonData;
  } catch(error) {
    console.log(error.message);
  } finally {
    spinner.stop();
  }
}

export default async function importProducts(orgId) {

  const filePath = 'data/item.csv';

  const uploadResponse = await uploadImportFile(orgId, filePath);
  
  const previewResponse = await previewImportFile(uploadResponse, orgId);

  const importResponse = await importFile(uploadResponse.data.import_id, orgId);
}