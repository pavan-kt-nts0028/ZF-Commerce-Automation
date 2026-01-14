import importProducts from "./import-products.js";
import exportProducts from "./export-products.js";
import fs from 'fs';
import path from 'path';

export default async function populateProducts(fromOrdId, toOrgId) {
  try {
    await exportProducts(fromOrdId);
    await importProducts(toOrgId);
    console.log(`Data imported successfully from Org@${fromOrdId} to Org@${toOrgId}`)
  } catch(error) {
    console.log(error.message);
  } finally {
    fs.rmSync(path.join(process.cwd(), 'data'), { recursive: true, force: true });
  }
}