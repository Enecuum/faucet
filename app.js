const config = require("./config.json");
const DB = require('./db').DB;
const logger = require('./logger');
const enecuum = require("./enecuum");
const Utils = require("./Utils.js");
const moment = require('moment');
const express = require ('express');
const bodyParser = require('body-parser');

let db = new DB(config.mysql);

app = express();

app.use( bodyParser.urlencoded({extended: true}) );
app.use( bodyParser.json() );

app.use('/assets',express.static('assets'));
app.use('/views', express.static('views'));
app.use('/locales',express.static('locales'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get("/", function( req, res ){
	res.render( 'index.ejs' );
});

app.post("/",async function( req, res ){
	var pubkey = req.body.pubkey;
	let result = await sendTX(pubkey);

	return res.send(result);
});

sendTX = async function(pubkey) {
    try {
        let last = await db.get_last_time(pubkey);

        if (last.length > 0) {
            var dateNow = moment(new Date(), "YYYY-MM-DD HH:mm:ss");
            var dateBefore = moment(new Date(last[0]['date_time'] * 1000), "YYYY-MM-DD HH:mm:ss");
            if (dateNow.diff(dateBefore, 'minutes') < config.timeout_min) {
                logger.silly("TIMEOUT");
                return false;
            }
        } else
            logger.silly("VALID_TIMEOUT");

        //let rec = inputs[i];
        let bit_hub = config.bit_hub;
        let balance = await enecuum.getBalance(bit_hub.pub);
        if (balance < config.quantity) {
            logger.warn('Out of BIT');
            return false;
        }

        logger.debug(`faucet balance ${balance}`);
        let tx = {
            amount: config.quantity,
            from: bit_hub.pub,
            nonce: Math.floor(Math.random() * 1e15),
            to: pubkey,
            ticker: "0000000000000000000000000000000000000000000000000000000000000001",
            data: ''
        };
        let signHash = Utils.hashTx(tx);
        tx.sign = Utils.sign(bit_hub.prv, signHash);
        //let txhash = Utils.hashSignedTx(tx);
        //tx.hash = txhash;

        let res = await enecuum.sendTransaction(tx);
        if(res !== undefined){
            if(res.err === 0){
                if(Array.isArray(res.result)){
                    logger.info(`response result status - ${res.result[0].status}`);
                    tx.hash = res.result[0].hash;
                    await db.put_txs(tx.hash, tx.from, tx.to, tx.amount, tx.nonce, Date.now() / 1000 | 0);
                    return true;
                }else {
                    logger.error(`invalid response format`);
                }
            }else {
                logger.error(res.message);
            }
        }else {
            logger.warn(`Empty response`);
        }


    } catch (err) {
        logger.error(err);
        return false;
    }
};

app.listen(config.port, function() {
	logger.info(`Service start on port: ${config.port}`);
});

app.use(function(req, res, next){
    res.status(404).render('404.html', {title: "Sorry, page not found"});
});