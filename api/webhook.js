import TelegramBot from 'node-telegram-bot-api';

// bot send msg handler
export default async (req, res) => {
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