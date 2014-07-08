//require modules
var async = require('async');
var metaSearch = require('./metasearch').metaSearch;

//enclose functionality in function so it can be exported as one piece
var preProcess = function (res, reqObj, query, date) {

    //Do query preprocessing 3 versions in parellel + check if its a calculation
    async.parallel([
        //1.Bing Preprocessing
        function (callback) {
            var bingQry = query.replace(/\s{2,}/g, ' ');//remove 2 or more spaces together;
                bingQry = encodeURIComponent(bingQry);//Encode query
            callback(null, bingQry );
        },
        //2.Bellko preprocessing
        function (callback) {
            var blekQry = query.replace(/OR/g, ' ')//Remove OR
                               .replace(/\*/g, ' ')//Remove wildcard
                               .replace(/AND/g, ' ')//Remove AND
                               .replace(/\s{2,}/g, ' ');//Remove 2 or more spaces together

            if(query.match(/NOT/g)){//If query has NOT edit to fit Blekko "tiger" -woods format etc
                var blekTmp = blekQry.match(/^.*NOT/g);
                blekQry = blekQry.replace(/^.*NOT/g, '"' + blekTmp + '" -');
                blekQry = blekQry.replace(/NOT\s{0,}/g, '');
                blekQry = blekQry.replace(/\s{0,}\"/g, '"');
                blekQry = blekQry.replace(/\-\s{0,}/g, '-');
            }

            blekQry = encodeURIComponent(blekQry);//Encode query
            callback(null, blekQry);
        },
        //3.Google Preprocessing
        function (callback) {
            if(query.match(/AND/g) === true){//If the query has AND use tiger "woods" format instead of old google version + operator
                var googQry = query.replace(/AND\s*/g, '"')
                                   .replace(/\s{0,}\"/g, '" "')
                                   .replace(/$/g, '"')
                                   .replace(/\"/g, '');
            }
            var googQry = query.replace(/NOT\s{0,}/g, '-')//Replace Not and spaces with "-"
                               .replace(/AND/g, ' ')//Remove AND
                               .replace(/\s{2,}/g, ' ')//Remove extra spaces

            googQry = encodeURIComponent(googQry);//Encode query
            callback(null, googQry);
        },
        //4.Check if query is maths expression
        function (callback) {
            var isCalcBool = true;
            if(query.match(/[^x\+\/\-\*\d\s\)\(\.]/g))//if the query contains expressions beside */+x- or numbers set is calc off
                isCalcBool = false;

            //If its still a calculation turn query pre processing off
            //as its a maths expression so it is not needed due to calculator
            if(isCalcBool)
                isqueryPrePro = false

            callback(null, isCalcBool);
        }],
        //Callback function to collect results and pass to next module
        function(err, results) {
            if(err) {
                console.log('ERROR In queryPreProcessing');
            }
            else{
            var bingQuery = results[0];
            var blekQuery = results[1];
            var googQuery = results[2];
            var isCalcBool = results[3];

            //Pass variables to metasearch module
            metaSearch(res, reqObj, bingQuery, googQuery, blekQuery, date, isCalcBool);
            }
    });
};

//Export preProcess module
exports.preProcess = preProcess;
