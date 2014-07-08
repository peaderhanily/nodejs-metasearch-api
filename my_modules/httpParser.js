/**
*This module takes the input from the http API call and
*Processes the data into variables for later use.
*It also sends an error message if the data does not fufil madatory requirements
*such as having a query and API keys
**/

var varParse = require('./variableParser').parseVars;

function parseData(req, res, date){

    var reqObj = {msg : "Good Request"};

    if(!("eng" in req.query))
      req.query.eng = {};

    if((!("keys" in req.query) || req.query.keys === "") && "blek" in req.query.eng)
      req.query.keys = {};

    if(req.query.q === undefined || req.query.q === "" ||
       req.query.keys === undefined || req.query.keys === "" ||
       ("all" in req.query.eng && Object.keys(req.query.eng).length > 1)
      ){
        reqObj.msg = "ERROR Invalid Params";
        res.send(reqObj);
    }
    else{
        reqObj.query = req.query.q;
        reqObj.apiKeys = req.query.keys;
        var tmpBool = true;//Needs a better name but stops from going further with bad args

        for(var key in reqObj.apiKeys)
            if((reqObj.apiKeys[key] === undefined || reqObj.apiKeys[key] === "") ){
              reqObj = {"msg" : "ERROR Invalid API Keys"}
              tmpBool = false;
              res.send(reqObj);
            }

        //DO NOT continue if tmpBool is false
        if(tmpBool){
          req.query.eng === "" || req.query.eng === undefined ? reqObj.engines = {"all" : 50} : reqObj.engines = req.query.eng;
          for(var key in reqObj.engines){
            if(reqObj.engines[key] === undefined || reqObj.engines[key] === ""){
              reqObj.engines[key] = 50;
            }
          }
          reqObj.results = req.query.resType === undefined || req.query.resType === "" ? "all" : req.query.resType;
          reqObj.resFormat = req.query.formType === undefined || req.query.formType === "" ? "json" : req.query.formType;

          //Call Variable Parser and Pass resposonse and request Object with details of request
          varParse(res, reqObj, date);
        }
    }
}

exports.parseData = parseData;
