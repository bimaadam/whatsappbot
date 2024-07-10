const venom = require('venom-bot');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Gunakan direktori sementara untuk menyimpan sesi
const sessionDir = path.join('/tmp', 'whatsapp-session');
if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

venom
    .create(
        'whatsapp-session', // Nama sesi
        (base64Qr, asciiQR, attempts, urlCode) => {
            console.log(asciiQR); // Menampilkan QR di terminal
        },
        undefined,
        {
            folderSession: sessionDir,
            headless: true,
            puppeteerOptions: {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                executablePath: '/usr/bin/chromium-browser', // Path ke Chromium yang sudah ada di Vercel
            },
            useChrome: false, // Menggunakan Chromium build-in
            multidevice: true // Untuk versi multidevice, gunakan true (default: true)
        }
    )
    .then((client) => start(client))
    .catch((error) => console.log(error));

function start(client) {
    console.log('Client is ready!');
    client.onMessage(async (message) => {
        console.log('Received message:', message.body);
        const incomingMsg = message.body.toLowerCase();

        // Pesan selamat datang saat pengguna mengirimkan "/start"
        if (incomingMsg === '/start') {
            const welcomeMessage = `Selamat datang! Bot ini adalah buatan Bima Adam Nugraha. Gunakan perintah berikut untuk berinteraksi dengan bot:
- /gpt [pertanyaan]: untuk menggunakan GPT-4
- /gemini [pertanyaan]: untuk menggunakan Gemini
- /advance [pertanyaan]: untuk menggunakan Gemini-Advance
- /turbo [pertanyaan]: untuk menggunakan GPT-Turbo
- /gpt3.5 [pertanyaan]: untuk menggunakan GPT-3.5
- /simi [pertanyaan]: untuk menggunakan Simi
- /bing [pertanyaan]: untuk menggunakan Bing-Balanced
- /cuaca [nama kota]: untuk mendapatkan informasi cuaca

Silakan coba perintah-perintah tersebut dan bot akan merespon sesuai dengan engine yang Anda pilih.`;
            await client.sendText(message.from, welcomeMessage);
            return;
        }

        let engine = null;
        let query = null;

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
        } else if (incomingMsg.startsWith('/cuaca')) {
            const city = incomingMsg.split('/cuaca ')[1];
            getWeather(client, message.from, city);
            return;
        } else {
            client.sendText(message.from, "Perintah tidak dikenali. Gunakan /gpt, /gemini, /advance, /turbo, /gpt3.5, /simi, /bing, atau /cuaca untuk mendapatkan informasi.");
            return;
        }

        // Make request to AI service
        const apiUrl = `https://ai.galihmrd.my.id/bard_ai?query=${encodeURIComponent(query)}&engine=${engine}`;
        console.log(`Sending request to: ${apiUrl}`);

        try {
            const response = await axios.get(apiUrl);
            const result = response.data.data || 'No result found.';
            client.sendText(message.from, result);
        } catch (error) {
            console.error('Error fetching API:', error);
            let errorMessage = 'Request failed:';
            if (error.response) {
                errorMessage += ` Server responded with status code ${error.response.status}`;
            } else if (error.request) {
                errorMessage += ' No response received from server';
            } else {
                errorMessage += ` ${error.message}`;
            }
            client.sendText(message.from, errorMessage);
        }
    });
}

// Fungsi untuk mendapatkan informasi cuaca
async function getWeather(client, from, city) {
    const apiUrl = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
    console.log(`Sending request to: ${apiUrl}`);

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        const weatherDescription = data.current_condition[0].weatherDesc[0].value;
        const temperature = data.current_condition[0].temp_C;
        const humidity = data.current_condition[0].humidity;
        const windSpeed = data.current_condition[0].windspeedKmph;

        const weatherMessage = `Cuaca di ${city}:
Deskripsi: ${weatherDescription}
Suhu: ${temperature}°C
Kelembaban: ${humidity}%
Kecepatan angin: ${windSpeed} km/h`;

        client.sendText(from, weatherMessage);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        let errorMessage = 'Request failed:';
        if (error.response) {
            errorMessage += ` Server responded with status code ${error.response.status}`;
        } else if (error.request) {
            errorMessage += ' No response received from server';
        } else {
            errorMessage += ` ${error.message}`;
        }
        client.sendText(from, errorMessage);
    }
}

