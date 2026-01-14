let authCredentials = {};

export function setAuthCred(cred) {
  authCredentials = cred;
}

export function getAuthCred() {
  return authCredentials;
}