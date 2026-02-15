const https = require('https');
https.get('https://gateway.irys.xyz/4VbCXuDEAJ3sBe3DUx4WeUxZSfNmEiRRBrGnjJB8BfXZ', { rejectUnauthorized: false }, (res) => {
    console.log('STATUS:', res.statusCode);
    let len = 0;
    res.on('data', d => len += d.length);
    res.on('end', () => console.log('TOTAL LEN:', len));
}).on('error', e => console.error('ERROR:', e));
