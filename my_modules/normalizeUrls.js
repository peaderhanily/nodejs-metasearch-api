var async = require('async');
var forEach = require('async-foreach').forEach;
var url = require('url');

var normUrl = function(goog, bing, blek){

  async.parallel([
    function(callback){
      if(goog.length != undefined){
        forEach(goog,
          function(item, index, arr){

            item.URL = item.link;

            if(url.parse(item.link).path != "")
              item.link = url.parse(item.link).host +
                          url.parse(item.link).path;

            else if(url.parse(item.link).query != "")
              item.link = url.parse(item.link).host +
                          url.parse(item.link).query;

            item.link = item.link
                        .replace(/^www\./g, '')
                        .replace(/^www2\./g, '')
                        .replace(/index\.\w{3,4}/g, '')
                        .replace(/home\.\w{3,4}/g, '')
                        .replace(/default\.\w{3,4}/g, '')
                        .replace(/\/$/g, '')
                        .replace(/\.html/g, '')
                        .replace(/\.htm/g, '');
          });
      }
      callback(null, true);
    },
    function(callback){

      if(bing.length != undefined){
        forEach(bing,
          function(item, index, arr){
            item.URL = item.Url;
            if(url.parse(item.Url).path != "")
              item.Url = url.parse(item.Url).host +
                         url.parse(item.Url).path;
            else if(url.parse(item.Url).query != "")
              item.Url = url.parse(item.Url).host +
                         url.parse(item.Url).query;
            item.Url = item.Url
                        .replace(/^www\./g, '')
                        .replace(/^www2\./g, '')
                        .replace(/index\.\w{3,4}/g, '')
                        .replace(/home\.\w{3,4}/g, '')
                        .replace(/default\.\w{3,4}/g, '')
                        .replace(/\/$/g, '')
                        .replace(/\.html/g, '')
                        .replace(/\.htm/g, '');
          });
      }
      callback(null, true);
    },
    function(callback){
      if(blek.length != undefined){
        forEach(blek,
          function(item, index, arr){

            item.URL = item.url;
            if(url.parse(item.url).path != "")
              item.url = url.parse(item.url).host +
                         url.parse(item.url).path;
            else if(url.parse(item.url).query != "")
              item.url = url.parse(item.url).host +
                         url.parse(item.url).query;
            item.url = item.url
                        .replace(/^www\./g, '')
                        .replace(/^www2\./g, '')
                        .replace(/index\.\w{3,4}/g, '')
                        .replace(/home\.\w{3,4}/g, '')
                        .replace(/default\.\w{3,4}/g, '')
                        .replace(/\/$/g, '')
                        .replace(/\.html/g, '')
                        .replace(/\.htm/g, '');
          });
      }
      callback(null, true);
    }
    ],
    function(err, results){
      if(err)//check for error
        console.log(err);
      else
          console.log('ALL Succesfully Normalized');
    });
};

exports.normUrl = normUrl;


