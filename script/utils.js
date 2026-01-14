import 'dotenv/config';

export function isAuthConfigEnabled() {
  return Boolean (
    process.env.ZC_REFRESH_TOKEN,
    process.env.ZC_CLIENT_ID,
    process.env.ZC_CLIENT_SECRET
  );
}