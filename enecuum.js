const config = require("./config.json");
const logger = require('./logger');
const Utils = require("./Utils.js");

module.exports = {
    getBalance : async function(pubkey){
        return (await Utils.apiRequest.get(config.nodeURL + '/api/v1/balance', {id : pubkey})).amount;
    },
    sendTransaction : async function(tx){
        try{
            let res = await Utils.apiRequest.post(config.nodeURL + '/api/v1/tx', [tx]);
            if(res.hasOwnProperty('err'))
                return res;
            return false;
        }
        catch(err){
            logger.error(err);
            return false;
        }
    },
    getTransaction : async function(hash){
        return await Utils.apiRequest.get(config.nodeURL + '/api/v1/tx', {hash : hash});
    },

    // getBalance : async function(){
    //
    // },
    // getBalance : async function(){
    //
    // },
};