//Require modules
var async = require('async');
var set = require('./setCalls');
var norm = require('./normalizeUrls');
var request = require('request');
var combRank = require('./combmnzrank');
var recipRank = require('./reciprocalrankfuse');
var natLang = require('./clustering/naturalLanguagePreProcess');
var cluster = require('./clustering/clustering.js').cluster;
var error = require('./errorCheckResults');
var prune = require("./prune").prune;
var js2xmlparser = require("js2xmlparser");




var metaSearch = function (res, reqObj, bingQuery, googQuery, blekQuery, date, isCalcBool) {

    //Set api calls with preprocessed query and the clients ip address (for location)
    set.calls(res, reqObj, bingQuery, googQuery, blekQuery);

    //Function to do GET requests for every object
    var getFunc = function(reqobj, cb){
        var tmpTimeStart = new Date()
        console.log("Start : " + (tmpTimeStart-time));
        //Uses request module response should be 200 OK and json held in body
        request(reqobj, function(err,response,body){
            if (err){//Check for error
                    cb(err);
            } else {
                    console.log("End : " + (new Date() - tmpTimeStart))
                    cb(null, body); //null means no error
            }
        });
    };

    //Array that stores a list of objects that will be sent for api calls
    var apiCallsArr = [];
    for(var key in set.goog)
        apiCallsArr.push(set.goog[key]);
    for(var key in set.bing)
        apiCallsArr.push(set.bing[key]);
    for(var key in set.blek)
        apiCallsArr.push(set.blek[key]);
    if(Object.keys(set.bingRelSearch) > 0)
        apiCallsArr.push(set.bingRelSearch);
    console.log("LENGTH OF API CALLS ARR " + apiCallsArr.length)
    var time = new Date();
    //Async map applies getFunc to all obj's and gets results in callback
    async.map(apiCallsArr, getFunc,
        function(err, results){
            if (err){//If error print the error
                console.log(err);
            }else{
                var googArr = [];
                var bingArr = [];
                var blekArr = [];
                var bingRelArr = [];
                var i = 0;

                //Error Check google results
                if(Object.keys(set.goog).length > 0)
                    for(;i < Object.keys(set.goog).length && i < results.length;i++)
                        googArr = error.checkGoogle(results[i], googArr);

                //Error Check Bing Results
                if(Object.keys(set.bing).length === 1){
                    bingArr = error.checkBing(JSON.parse(results[i]), {});
                    i++;
                }
                else if(Object.keys(set.bing).length ===2){
                    bingArr = error.checkBing(JSON.parse(results[i]), JSON.parse(results[i+1]));
                    i += 2;
                }

                //Error Check Blekko Results
                if(Object.keys(set.blek).length > 0)
                    for(;i < Object.keys(set.blek).length && i < results.length;i++)
                        blekArr = error.checkBlekko(results[i], blekArr);

                console.log("LENGTH OF GOOGLE RESULTS " + googArr.length)
               async.parallel(
                    [
                    function(cb){
                        norm.normUrl(googArr, bingArr, blekArr);
                        cb(null,null)
                    },
                    function(cb){
                        if((reqObj.results.indexOf("all") > -1 || reqObj.results.indexOf("kmeans") > -1) &&
                            ((bingArr.length + googArr.length + blekArr.length) >=30)){
                            natLang.natLangPrePro(googArr, bingArr, blekArr);
                            cb(null,null)
                        }
                        else
                            cb(null,null);
                    }
                    ],
                    function(err, results){
                        if(err)
                            console.log(err)
                    }
                );


                //Perform Url normalization + 2 aggregation functions in parellel
                async.parallel([
                    function(cbToMeta){
                        //If google is the only engine to return results then it is the aggregated list
                        if(googArr.length > 0 && bingArr.length  === 0 && blekArr.length === 0){
                            cbToMeta(null, googArr);
                        }
                        //If bing is the only engine to return results then it is the aggregated list
                        else if (googArr.length === 0 && bingArr.length  > 0 && blekArr.length === 0){
                            cbToMeta(null, bingArr);
                        }
                        //If blekko is the only engine to return results then it is the aggregated list
                        else if(googArr.length === 0 && bingArr.length  === 0 && blekArr.length > 0){
                            var blekTmp = {};//aggreg list must be in the form {items:[]} so create tmp variable and put array in it then return
                            cbToMeta(null, blekArr);
                        }
                        else if(googArr.length === 0 && bingArr.length  === 0 && blekArr.length  === 0){
                            cbToMeta(null, [])
                        }
                        else if(reqObj.results.indexOf("all") > -1 || reqObj.results.indexOf("rrf") > -1){
                        //Reciprocal Rank Fusion Agregation
                        recipRank.RRF(googArr, blekArr, bingArr, cbToMeta);
                        }
                        else{
                            cbToMeta(null, []);
                        }
                    },
                    function(cbToMeta){
                        //If google is the only engine to return results then it is the aggregated list
                        if(googArr.length > 0 && bingArr.length  === 0 && blekArr.length === 0){
                            cbToMeta(null, googArr);
                        }
                        //If bing is the only engine to return results then it is the aggregated list
                        else if (googArr.length === 0 && bingArr.length  > 0 && blekArr.length === 0){
                            cbToMeta(null, bingArr);
                        }
                        //If blekko is the only engine to return results then it is the aggregated list
                        else if(googArr.length === 0 && bingArr.length  === 0 && blekArr.length > 0){
                            cbToMeta(null, blekArr);
                        }
                        else if(googArr.length === 0 && bingArr.length  === 0 && blekArr.length  === 0){
                            cbToMeta(null, [])
                        }
                        else if(reqObj.results.indexOf("all") > -1 || reqObj.results.indexOf("combmnz") > -1){
                        //CombMNZ Rank aggregation
                        combRank.combMNZ(googArr, blekArr, bingArr, cbToMeta);
                        }
                        else{
                            cbToMeta(null, []);
                        }
                    },
                    function(cbToMeta){
                        //If toggle cluster set to true and at least one search engine returns results
                        if((reqObj.results.indexOf("all") > -1 || reqObj.indexOf("kmeans")) &&
                           (bingArr.length > 0 || googArr.length > 0 || blekArr.length > 0) &&
                           ((bingArr.length + googArr.length + blekArr.length) >=30)){
                                cluster(googArr, blekArr, bingArr, cbToMeta);
                        }
                        else{
                            //If clustering is set to off return boolean false
                            cbToMeta(null, {});
                        }
                    }
                ],
                function(err, results) {
                    if(err)//If error print error
                        console.log(err);
                    else{

                        prune(blekArr, googArr, bingArr);

                        if(reqObj.resFormat == "xml"){
                            res.send(js2xmlparser("results", {
                                msg : "Successful Results",
                                reqDetails : reqObj,
                                goog: googArr,
                                blek: blekArr,
                                bing: bingArr,
                                rrf: results[0],
                                combMNZ: results[1],
                                kmeans: results[2],
                                time:(new Date() - date),
                                bingRelated: bingRelArr
                            }));
                        }
                        else{
                            //Objects to send to page
                            res.send({
                                msg : "Successful Results",
                                reqDetails : reqObj,
                                goog: googArr,
                                blek: blekArr,
                                bing: bingArr,
                                rrf: results[0],
                                combMNZ: results[1],
                                kmeans: results[2],
                                time:(new Date() - date),
                                bingRelated: bingRelArr
                            });
                        }
                    }
                });
            }
        }
    );
};


//Export metasearch from node_modules to app.js
exports.metaSearch = metaSearch;
