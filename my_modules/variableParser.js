/*****
* This module builds on httpParser and takes its output
* It is used to split variables such as engs or resType which
* may have multiple args inside for example goog+bing or bing+blek or all[30] etc
* It also does error checking so if you enter bad args it will set them to defaults
*   reqObj.query //Will be dealt with in query.js module
*   reqObj.engines //Parsed Here
*   reqObj.results //Parsed Here
*   reqObj.apiKeys //Parsed Here
*   reqObj.resFormat //Parsed Here
******/
var async = require('async');
var query = require("./query");


function parseVars(res, reqObj, date){

    async.parallel([
        function(cb){parseEngines(reqObj.engines); cb(null, null)},
        function(cb){reqObj.results = parseResultTypes(reqObj.results); cb(null, null)},
        function(cb){reqObj.resFormat = parseResultFormat(reqObj.resFormat); cb(null, null)},
        function(cb){cb(null, parseKeys(reqObj.apiKeys, reqObj.engines));}
        ],
        function(err, results){
            if(err)
                console.log(err)
            else{
                if(typeof results[3] === "object"){
                    reqObj.apiKeys = results[3];
                    query.preProcess(res, reqObj, reqObj.query, date);
                }
                else{
                    reqObj = {"msg" : "ERROR Invalid API Keys"}
                    res.send(reqObj);
                }
            }
        }
    );
}

//TODO for the love of god come back to this and make it less repative
function parseEngines(eng){
    for(var key in eng)
        if(key != "goog" && key != "bing" && key != "blek" && key != "all")
            delete eng[key]
    if(Object.keys(eng).length === 0)
        eng.all = 50;
}

function parseResultTypes(res){
    if(res === "all")
        return ["all"];

    res.replace(/\s*/g, " ");
    var resArr = res.split(" ");
    var tmp = "";
    for(var i = 0; i < resArr.length; i++){
        resArr[i] = resArr[i].toLowerCase();
        if(resArr[i] != "combmnz" && resArr[i] != "rrf" && resArr[i] != "kmeans" &&
           resArr[i] != "math" && resArr[i] != "all" && resArr[i] != "related" || tmp === resArr[i]){
            resArr.splice(i,1);
            i--;
        }
        tmp = resArr[i];
    }
    if(resArr.length === 0)
        return ["all"];
    else
        return resArr;
}

function parseKeys(keys, engs){
    if("all" in engs)
        if(!("goog" in keys && "bing" in keys))
            return false;
    if("bing" in engs && !("bing" in keys))
        return false;
    if("blek" in engs && !("goog" in engs)  && !("bing" in engs))
        return {};
    if("goog" in engs && !("goog" in keys)){
        return false;
    }
    else if("goog" in engs){
        keys.goog.replace(/\s*/g," ");
        var tmpArr = keys.goog.split(" ");
        if(tmpArr.length === 2 && tmpArr[0] != "" && tmpArr[1] != ""){
            keys.goog = {cx: tmpArr[0], key : tmpArr[1]};
            return keys;
        }
        else
            return false;
    }
    return keys;
}

function parseResultFormat(form){
    if(form === "json")
        return ["json"];

    form.replace(/\s*/g, " ");
    var resFormArr = form.split(" ");
    for(var i = 0; i < resFormArr.length; i++){
        resFormArr[i] = resFormArr[i].toLowerCase();
        if(resFormArr[i] != "json" && resFormArr[i] != "xml"){
            resFormArr.splice(i,1);
            i--;
        }
    }
    if(resFormArr.length === 0)
        return ["json"];
    else
        return resFormArr;
}

//Export function
exports.parseVars = parseVars;
