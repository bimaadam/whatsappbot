const venom = require('venom-bot');
const axios = require('axios');

venom.create().then((client) => start(client));

function start(client) {
  client.onMessage(async (message) => {
    const incomingMsg = message.body;

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
      client.sendText(message.from, "Perintah tidak dikenali. Gunakan /gpt, /gemini, /advance, /turbo, /gpt3.5, /simi, atau /bing untuk memilih engine.");
      return;
    }

    const apiUrl = `https://ai.galihmrd.my.id/bard_ai?query=${encodeURIComponent(query)}&engine=${engine}`;

    try {
      const response = await axios.get(apiUrl);
      const reply = response.data.reply;
      client.sendText(message.from, reply);
    } catch (error) {
      console.error(error);
      client.sendText(message.from, 'Terjadi kesalahan saat memproses permintaan Anda.');
    }
  });
}
