/**************************************************************
This file is used to store the request objects for 16 of the api's used
in this project (the suggestion and calulator api stored elsewhere)
the variables can be set with the proper query and then
exported to be used when requesting in the metasearch module.
***************************************************************/

var async = require('async');

//Create API call objects
var goog = {};
var bing = {};
var blek = {};
var bingRelSearch = {};


var calls = function(res, reqObj, bingQuery, googQuery, blekQuery){

    var googBool = "goog" in reqObj.engines || "all" in reqObj.engines ? true : false;
    var bingBool = "bing" in reqObj.engines || "all" in reqObj.engines ? true : false;
    var blekBool = "blek" in reqObj.engines || "all" in reqObj.engines ? true : false;

    var googSize;
    var bingSize;
    var blekSize;

    if("all" in reqObj.engines){
        googSize = reqObj.engines.all;
        bingSize = reqObj.engines.all;
        blekSize = reqObj.engines.all;
    }
    else{
        if(googBool)
            googSize = reqObj.engines.goog;
        if(bingBool)
            bingSize = reqObj.engines.bing;
        if(blekBool)
            blekSize = reqObj.engines.blek;
    }

    async.parallel(
       [
       function(cb){setGoogle(reqObj, googSize, googBool, googQuery); cb(null, null)},
       function(cb){setBing(reqObj, bingSize, bingBool, bingQuery); cb(null, null);},
       function(cb){setBlekko(reqObj, blekSize, blekBool, blekQuery); cb(null, null)},
       function(cb){setBingRelatedSearch(reqObj, bingQuery); cb(null, null)}
       ],
       function(err, results){
            if(err)
                console.log(err);
        });
}

function setGoogle(reqObj, googSize, googBool, googQuery){

    if(googBool){
        if(googSize >= 100)
            googSize = 10;
        else if (googSize <= 0)
            googSize = 1;
        else
            googSize = (Math.ceil(googSize / 10) * 10)/10;//Round to nearest 10 then divide by 10 to get goog reqs needed

        for(var i = 0, tmp = 1; i < googSize; i++, tmp = i*10+1){
            goog["goog" + i] = {
                                url: 'https://www.googleapis.com/customsearch/v1?' +
                                     'key='+ reqObj.apiKeys.goog.key +
                                     '&cx=' + reqObj.apiKeys.goog.cx +
                                     '&q='+ googQuery +'&alt=json' +
                                     '&start=' + tmp
                               };
        }
    }
};

function setBing(reqObj, bingSize, bingBool, bingQuery){
    if(bingBool){
        if(bingSize > 100)
            bingSize = 100;
        else if(bingSize <= 0)
            bingSize = 10;
        else
            bingSize = Math.ceil(bingSize / 10) * 10;

        if(bingSize <=50){
            bing.bing0 = {url: "", headers: ""};
            //Get bing 100 results in 50 * 2 sections
            bing.bing0.url = "https://api.datamarket.azure.com/Bing/Search/Web?" +
                             "Query=%27"+ bingQuery +"%27&$format=json&$top=" + bingSize;

            //Send basic auth in headers no username api key as pasword
            bing.bing0.headers = {"Authorization" : "Basic " +
                                 new Buffer(":" + reqObj.apiKeys.bing).toString("base64")};
        }
        else{
            bingSize = bingSize - 50;
            bing.bing0 = {url: "", headers: ""};
            bing.bing1 = {url: "", headers: ""};

            //Get bing 100 results in 50 * 2 sections
            bing.bing0.url = "https://api.datamarket.azure.com/Bing/Search/Web?" +
                     "Query=%27"+ bingQuery +"%27&$format=json&$top=50";

            //Send basic auth in headers no username api key as pasword
            bing.bing0.headers = {
                "Authorization" : "Basic " +
                new Buffer(":" + reqObj.apiKeys.bing).toString("base64")};

            bing.bing1.url = "https://api.datamarket.azure.com/Bing/Search/Web?" +
                     "Query=%27"+ bingQuery +"%27&$format=json&$skip=50&$top=" + bingSize;

            bing.bing1.headers = {
                "Authorization" : "Basic " +
                new Buffer(":" + reqObj.apiKeys.bing).toString("base64")};
        }
    }
}

function setBlekko(reqObj, blekSize, blekBool, blekQuery){
    if(blekBool){
        if(blekSize >= 100)
            blekSize = 5;
        else if(blekSize <= 0)
            blekSize = 1;
        else
            blekSize = Math.ceil(blekSize / 10)/2;

        //First blekko is different as it doesn't need page number
        blek["blek" + i] = { url : 'http://blekko.com/?q=' + blekQuery + '+/json+/ps=20'};
        for(var i = 1, tmp = 1; i < blekSize; i++, tmp = i){
            blek["blek" + i] = { url : 'http://blekko.com/?q=' + blekQuery + '+/json+/ps=20&p=' + tmp};
        }
    }
}

function setBingRelatedSearch(reqObj, bingQuery){
    if((reqObj.results.indexOf("all") > -1 || reqObj.results.indexOf("related") > -1 ) && "bing" in reqObj.apiKeys){
        //Get bing realeated search results ie query mining logs
        bingRelSearch.url = "https://api.datamarket.azure.com/Bing/Search/RelatedSearch?Query=%27" + bingQuery + "%27&$format=json";

        bingRelSearch.headers = {"Authorization" : "Basic " +
                                new Buffer(":" + reqObj.apiKeys.bing).toString("base64")};
    }
}


//Export setter function and variables
exports.calls = calls;
exports.goog = goog;
exports.bing = bing;
exports.blek = blek;
exports.bingRelSearch = bingRelSearch;
