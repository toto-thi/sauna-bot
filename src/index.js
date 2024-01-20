require("dotenv").config();
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
    // puppeteer: {
    //     headless: false, // use for logins only
    // },
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

    if (content === 'sauna') {
        await client.sendMessage(message.from, `Today we have a schedule for sauna: \nDate: ${data[0].Date} \nTime: ${data[0].Time} \nLocation: ${data[0].Location} \nBooked by: ${data[0].BookedBy} \nCome enjoy the experience of Finnish sauna!`);
    } else if (jokeCategories[content]){
        await makeJoke(jokeCategories[content], message);
    }
});

client.initialize();