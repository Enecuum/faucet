const r = require('jsrsasign');
const crypto = require('crypto');
const logger = require('./logger');

function apiRequest(options){
    let request = require('request');
    options.timeout = 15000;
    return new Promise(function(resolve, reject){
            request(options, (err, res, body) => {
                if (err) {
                    return reject(new Error('apiRequest error : ' + err));
                }
                if(!body)
                    return resolve(null);
                if(options.method === 'GET')
                    try {
                        body = JSON.parse(body);
                    }
                    catch (err) {
                        return reject(new Error('apiRequest parse error : ' + err));
                    }
                return resolve(body);
            });
    });
}

module.exports = {
    sign : function(prvkey, msg){
        let sig = new r.Signature({"alg": 'SHA256withECDSA'});
        sig.init({ d: prvkey, curve: 'secp256k1' });
        sig.updateString(msg);
        return sig.sign();
    },
    test : function(){
        return new Promise(function(resolve, reject){
            return reject(new Error('api error'))
        });
    },
    verify : function(cpkey, msg, signedMsg){
        let sig = new r.Signature({ "alg": 'SHA256withECDSA' });
        try{
            let pkey = crypto.ECDH.convertKey(cpkey, 'secp256k1', 'hex', 'hex', 'uncompressed');
            sig.init({ xy: pkey, curve: 'secp256k1' });
            sig.updateString(msg);
            return sig.verify(signedMsg);
        }
        catch (e) {
            logger.error(e.stack);
            return false;
        }
    },
    randTx : function(){
        let keys = this.genKeys();
        let tx = {
            amount : Math.floor(Math.random() * 1e5),
            from: keys.pubkey,
            nonce: Math.floor(Math.random() * 1e15),
            to: crypto.randomBytes(32).toString('hex')
        };
        tx.sign = this.sign(keys.prvkey, this.hashTx(tx));
        return tx;
    },
    genKeys : function(){
        const bob = crypto.createECDH('secp256k1');
        bob.generateKeys();
        return {
            prvkey : bob.getPrivateKey().toString('hex'),
            pubkey : bob.getPublicKey('hex', 'compressed')
        };
    },
    sha256 : function(str){
        return crypto.createHash('sha256').update(str).digest('hex');
    },
    hashTx : function(tx){
        return this.sha256(
            ['amount','data','from','nonce','ticker','to'].map(v => this.sha256(tx[v].toString().toLowerCase())).join("")
        );
    },
    swapTypes : {
        erc_enq : 1,
        erc_bep : 2,
        enq_erc : 3,
        enq_bep : 4,
        bep_enq : 5
    },
    enq_regexp : /^(02|03)[0-9a-fA-F]{64}$/i,

    uncompressKey(key){
        return crypto.ECDH.convertKey(key, 'secp256k1', 'hex', 'hex', 'uncompressed');
    },
    compressKey(key){
        return crypto.ECDH.convertKey(key, 'secp256k1', 'hex', 'hex', 'compressed');
    },
    apiRequest : {
        get : function(url, data){
            let options = {
                method:  'GET',
                url: url,
                qs : data
            };
            return apiRequest(options)
        },
        post : function(url, data){
            let options = {
                method:  'POST',
                url: url,
                body: data,
                json: true
            };
            return apiRequest(options)
        }
    },
    sleep : function(ms){
        return new Promise(function(resolve, reject){
            setTimeout(() => resolve(), ms)
        });
    }
};