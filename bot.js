const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('message', async message => {
    const incomingMsg = message.body.toLowerCase();
    let engine, query;

    if (incomingMsg.startsWith('/gpt')) {
        engine = 'gpt4';
        query = incomingMsg.split('/gpt ')[1];
    } else if (incomingMsg.startsWith('/gemini')) {
        engine = 'gemini';
        query = incomingMsg.split('/gemini ')[1];
    } else if (incomingMsg.startsWith('/advance')) {
        engine = 'gemini-advance';
        query = incomingMsg.split('/advance ')[1];
    } else if (incomingMsg.startsWith('/turbo')) {
        engine = 'gpt-turbo';
        query = incomingMsg.split('/turbo ')[1];
    } else if (incomingMsg.startsWith('/gpt3.5')) {
        engine = 'gpt-3.5';
        query = incomingMsg.split('/gpt3.5 ')[1];
    } else if (incomingMsg.startsWith('/simi')) {
        engine = 'simi';
        query = incomingMsg.split('/simi ')[1];
    } else if (incomingMsg.startsWith('/bing')) {
        engine = 'bing-balanced';
        query = incomingMsg.split('/bing ')[1];
    } else {
        client.sendMessage(message.from, "Perintah tidak dikenali. Gunakan /gpt, /gemini, /advance, /turbo, /gpt3.5, /simi, atau /bing untuk memilih engine.");
        return;
    }

    const apiUrl = `https://ai.galihmrd.my.id/bard_ai?query=${encodeURIComponent(query)}&engine=${engine}`;
    console.log(`Sending request to: ${apiUrl}`);

    try {
        const response = await axios.get(apiUrl);
        client.sendMessage(message.from, response.data.result);
    } catch (error) {
        console.error('Error fetching response:', error);
        client.sendMessage(message.from, 'Terjadi kesalahan saat memproses permintaan Anda.');
    }
});

client.on('qr', qr => {
    console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();
