require("dotenv").config();
const express = require("express");
const serverless = require("serverless-http");
const axios = require("axios");
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const getFormattedDate = () => {
    var today = new Date();
    var day = String(today.getDate()).padStart(2, '0');
    var month = String(today.getMonth() + 1).padStart(2, '0');
    var year = today.getFullYear();

    return day + '-' + month + '-' + year;
};

const saunaSchedule = async (today) => {
    const response = await axios.get(process.env.DATA_SCRIPT + `${today}`);

    if (!response) return console.log('Error: ', response);

    return response.data;
};

const client = new Client({
    puppeteer: {
        headless: true, // use for logins only
        args: [' --disable-setuid-sandbox', '--no-sandbox']
    },
    authStrategy: new LocalAuth({
        clientId: 'Sauna-Bot',
    }),
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

const makeJoke = async (mode, message) => {
    const joke = await axios.get(  `https://v2.jokeapi.dev/joke/${mode}`).then(res => res.data);

    const jokeMsg = await client.sendMessage(message.from, joke.setup);
    if (joke.delivery) setTimeout(function () { jokeMsg.reply(joke.delivery) }, 5000);
}

const jokeCategories = {
    'joke': 'Any',
    'safe joke': 'Any?safe-mode',
    'dark joke': 'Dark',
    'programming joke': 'Programming',
    'misc joke': 'Miscellaneous',
    'pun joke': 'Pun',
    'spooky joke': 'Spooky',
};

client.on('message', async message => {
    const content = message.body.toLowerCase();
    const data = await saunaSchedule(getFormattedDate());
    let msg = "";

    if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            msg += `Today we have a schedule for sauna: \n`;
            msg += `Date: ${data[i].Date} \n`;
            msg += `From: ${data[i].Start} - ${data[i].End} \n`;
            msg += `Location: ${data[i].Location} \n`;
            msg += `Booked by: ${data[i].BookedBy} \n`;
            msg += `Tags: ${data[i].Tags === "" ? "None" : data[i].Tags} \n`;
            msg += `Tule nauttimaan saunasta!\n\n`; // Added an extra newline for spacing between entries
        }
    } else {
        msg = 'No sauna schedules available today.';
    }

    if (content === 'sauna') {
        await client.sendMessage(message.from, msg);
    } else if (jokeCategories[content]){
        await makeJoke(jokeCategories[content], message);
    } else if (content === 'help') {
        await client.sendMessage(message.from, 'Please fill in the Google Sheet in this group description after you book a sauna.\nAvailable commands:\n 1. sauna\n 2. joke\n 3. safe joke\n 4. dark joke\n 5. programming joke\n 6. misc joke\n 7. pun joke\n 8. spooky joke\nWant more? Tell Toto about it');
    }
});

client.initialize();

const app = express();
const router = express.Router();

router.get('/', (req, res) => {
    res.send("Sauna Bot is ROCKING!!");
});

const startApp = async () => {
    app.listen(process.env.PORT || 3000, () => 
    console.log('Example app listening on port 3000!'));
}

startApp();
// app.use('/.netlify/functions/api', router);
// module.exports.handler = serverless(app);