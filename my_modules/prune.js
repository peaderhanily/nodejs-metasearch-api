var forEach = require('async-foreach').forEach;
var async = require('async');

var prune = function (blek, goog, bing){

    async.parallel([
        function(cb){pruner(goog); cb(null,null)},
        function(cb){pruner(bing); cb(null,null)},
        function(cb){pruner(blek); cb(null,null)}
        ],
        function(err, results){
            if(err)
                console.log(err)
        })
};

var pruner = function(arr){
    try{
        forEach(arr, function(item, index, arr){
            delete item.tokenArr;
            delete item.termFreq;
            delete item.cosineSimDists;
            delete item.tfIdf;
            delete item.position;
            delete item.termAppears;
            delete item.normVecLen;
        })
    }
    catch(e){
        console.log(e);
    }
}

exports.prune = prune;
