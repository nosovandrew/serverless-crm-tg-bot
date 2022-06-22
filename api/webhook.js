import TelegramBot from 'node-telegram-bot-api';

// enable CORS in a single serverless func (wrapper)
const allowCors = (fn) => async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    // replace * with app url
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,OPTIONS,PATCH,DELETE,POST,PUT'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    return await fn(req, res);
};

// bot send msg handler
const handler = async (req, res) => {
    try {
        const bot = new TelegramBot(process.env.BOT_TOKEN); // create telegram bot handler

        // check request method
        if (req.method === 'POST') {
            const { body } = req; // get POST request body from app

            // create Telegram msg
            let orderMsg = '📬 NEW ORDER:\n';
            orderMsg += 'Customer info: ' + body.customer.messenger + '\n';

            await bot.sendMessage(process.env.ADMIN_TG_ID, orderMsg); // send msg to store manager in Telegram
        }
    } catch (err) {
        // log error into the Vercel console
        console.error('Error sending message');
        console.log(err.toString());
    }

    // send a 200 HTTP status code
    res.status(200).send('Success!');
};

// export secured by CORS handler
export default allowCors(handler);