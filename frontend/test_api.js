const fetch = require('node-fetch');
const fs = require('fs');

async function testApi() {
    console.log("Calling API...");
    const res = await fetch('http://localhost:3000/api/admin/generate', {
        method: 'POST',
        headers: {
            'x-admin-password': 'shagrat1qaZ',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            seed: "1234",
            bodyType: "male",
            weapon: "sword"
        })
    });

    const data = await res.json();
    if (!data.success) {
        console.error("API Failed:", data);
        return;
    }

    console.log("\n--- API LOGS ---");
    console.log(data.logs.join('\n'));

    const base64Data = data.image.split(',')[1];
    fs.writeFileSync('api_output.png', Buffer.from(base64Data, 'base64'));
    console.log("\nSaved to api_output.png");
}

testApi().catch(console.error);
