async function main() {
  const sourceOrgId = document.querySelector('#source-org');
  const destOrgId = document.querySelector('#dest-org');

  const clientId = document.querySelector('#client-id');
  const clientSecret = document.querySelector('#client-secret');

  const transferBtn = document.querySelector('#transfer');
  const generateBtn = document.querySelector('#generate-token');

  const moreBtn = document.querySelector('#more-btn');
  const moreOptions = document.querySelector('#more-options');

  const editBtn = document.querySelector('#edit-btn');

  const grantTokenModal = document.querySelector('#grant-token-modal');
  const grantToken = document.querySelector('#grant-token');
  const grantTokenBtn = document.querySelector('#grant-token-btn');

  const backdrop = document.querySelector('#backdrop');

  try {
    const resp = await fetch('http://localhost:3000/auth-status');
    const { isAuthConfigEnabled } = await resp.json();

    transferBtn.disabled = !isAuthConfigEnabled;
    generateBtn.disabled = isAuthConfigEnabled;

    if (isAuthConfigEnabled) {
      clientId.value = ''.padEnd(35, '.');
      clientSecret.value = ''.padEnd(42, '.');
      clientId.disabled = true;
      clientSecret.disabled = true;
    }
  } catch {
    alert('Failed to check auth status');
  }

  moreBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleVisibility(moreOptions);
  });

  document.addEventListener('click', (event) => {
    const isOpened = moreOptions.classList.contains('d-flex');
    const isClickInside =
      moreOptions.contains(event.target) || moreBtn.contains(event.target);

    if (isOpened && !isClickInside) {
      hide(moreOptions);
    }
  });

  editBtn.addEventListener('click', () => {
    clientId.disabled = false;
    clientSecret.disabled = false;
    generateBtn.disabled = false;
    clientId.value = '';
    clientSecret.value = '';
  });

  generateBtn.addEventListener('click', (event) => {
    event.preventDefault();
    if (!clientId.value || !clientSecret.value) return;

    const url =
      `https://accounts.zoho.com/oauth/v2/auth?response_type=code` +
      `&client_id=${clientId.value}` +
      `&scope=ZohoCommerce.import.CREATE,ZohoCommerce.import.UPDATE,ZohoCommerce.export.READ,ZohoCommerce.items.READ` +
      `&redirect_uri=https://ecommerce.zoho.in/&access_type=offline`;

    window.open(url, '_blank');
    show(grantTokenModal);
    show(backdrop);
  });

  grantTokenBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    if (!grantToken.value) return;

    grantTokenBtn.disabled = true;

    let isSuccessful = false;

    const body = new FormData();
    body.append('grant_token', grantToken.value);
    body.append('client_id', clientId.value);
    body.append('client_secret', clientSecret.value);

    try {
      const resp = await fetch('http://localhost:3000/save-cred', {
        method: 'POST',
        body
      });

      const { success, message } = await resp.json();
      isSuccessful = success;
      alert(message);
    } catch {
      alert('Network error while saving credentials');
    }

    grantTokenBtn.disabled = false;
    hide(grantTokenModal);
    hide(backdrop);

    if (isSuccessful) {
      generateBtn.disabled = true;
      clientId.value = ''.padEnd(35, '.');
      clientSecret.value = ''.padEnd(42, '.');
      clientId.disabled = true;
      clientSecret.disabled = true;
      transferBtn.disabled = false;
    }
  });

  transferBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    if (!sourceOrgId.value || !destOrgId.value) return;

    const body = new FormData();
    body.append('source_org_id', sourceOrgId.value);
    body.append('dest_org_id', destOrgId.value);

    try {
      const resp = await fetch('http://localhost:3000/transfer', {
        method: 'POST',
        body
      });

      const { message } = await resp.json();
      alert(message);
    } catch {
      alert('Transfer failed');
    }
  });

  backdrop.addEventListener('click', () => {
    hide(grantTokenModal);
    hide(backdrop);
  });
}

function show(el) {
  el.classList.remove('d-none');
  el.classList.add('d-flex');
}

function hide(el) {
  el.classList.remove('d-flex');
  el.classList.add('d-none');
}

function toggleVisibility(el) {
  el.classList.contains('d-flex') ? hide(el) : show(el);
}

main();
