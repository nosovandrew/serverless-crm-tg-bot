import TelegramBot from 'node-telegram-bot-api';

// allowed origin by CORS in dev/production mode
const origin =
    process.env.VERCEL_ENV === 'production'
        ? process.env.PROD_APP_URL
        : process.env.DEV_APP_URL;

// enable CORS in a single serverless func (wrapper)
const allowCors = (fn) => async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', origin.toString());
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,OPTIONS,PATCH,DELETE,POST,PUT'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Api-Key'
    );
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    return await fn(req, res);
};

// bot send msg handler
const handler = async (req, res) => {
    const apiKeyFromApp = req.headers['x-api-key']; // get API key from app request
    // check if apiKey is available and correct
    if (!apiKeyFromApp || apiKeyFromApp !== process.env.API_KEY) {
        res.status(401).end('You have no rights for this route.');
        return;
    }
    // main logic
    try {
        const bot = new TelegramBot(process.env.BOT_TOKEN); // create telegram bot handler

        // check request method
        if (req.method === 'POST') {
            const { body } = req; // get POST request body from app

            // create Telegram msg
            let orderMsg = '📬 NEW ORDER:\n\n';
            orderMsg += '📞 Phone number: ' + body.phoneNumber + '\n';
            orderMsg += '🚚 Shipping:\n';
            orderMsg += ' - customer: ' + body.shipping.firstName + ' ' + body.shipping.lastName + '\n';
            orderMsg += ' - address: ' + body.shipping.address + '\n';
            orderMsg += ' - postal code: ' + body.shipping.postalCode + '\n\n';
            orderMsg += '🛒 Items:\n\n';
            body.items.map(
                (_item) => (orderMsg += `Name: ${_item.item}\nSKU: ${_item.sku}\nPrice: ${_item.price}\nQTY: ${_item.qtyForSale}\n\n`)
            );
            orderMsg += '💰 Total: ' + body.total + ' ' + body.currency;

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
