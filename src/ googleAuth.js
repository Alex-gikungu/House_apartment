const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(YOUR_GOOGLE_CLIENT_ID);

async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: 702134413636-ia4lgbqlnavedhpd83toc2d04g0afigf.apps.googleusercontent.com,  
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  // Handle user login or registration logic here
}