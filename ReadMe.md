Fusion as a Service (FaaS)
===================
--------

Install Node.js
----------------
  * sudo apt-get install python-software-properties python g++ make
  * sudo add-apt-repository ppa:chris-lea/node.js
  * sudo apt-get update
  * sudo apt-get install nodejs

Install Dependancies
--------------------
  * cd /path/to/folder
  * npm install


List of Dependancies
---------------

 * [async](https://github.com/caolan/async)
 * [async-foreach](https://github.com/cowboy/javascript-sync-async-foreach)
 * [express.js](http://expressjs.com/)
 * [jquery](http://jquery.com/)
 * [socket.io](http://socket.io/)
 * [natural](https://github.com/NaturalNode/natural)
 * [pos](https://github.com/dariusk/pos-js)
 * [js2xmlparser](https://www.npmjs.org/package/js2xmlparser)
 * [number-extended](https://github.com/doug-martin/number-extended)
 * [request](https://github.com/mikeal/request)
 * [mathjs](http://mathjs.org/)


API Overview
-------------
<url>/?q=<query>&eng[engine]=<numOfResults>&resType=<typesOfResult(s)> &keys[apiKey(s)]=&formType=<resultFormat>

### General Rules:
    1. Query + Api Keys are mandatory (unless you specify Blekko to search only)
    2. Defaults are set to use everything, i.e. if you leave out result type it tries to get everything
    3. Be specific in what you want to return and query will be faster


### \<url\>:
    This is the base URL e.g. https://localhost.com/


### \<query\>:
    This is the query must be a html encoded string surronded in double quotes
    https://localhost.com/?q=Big Blue


### \<engines\>:
    Each engine must be specified e.g. &eng[goog]&eng[blek]
    You can also specify the amount of results to return e.g &eng[goog]=100
    Specify the amount of results to return in 10's i.e. 60,70,80
    If you choose any other numbers not it will round to closest 10 e.g. &eng[blek]=17 you get 20 back

        For Google use goog e.g. &eng[goog]
        For Bing use bing e.g. &eng[bing]
        For Blekko use blek e.g. &eng[blek]
        For all 3 use all e.g &eng[all]

        Example:
            https://faas.stage1.mybluemix.net/q?=IBM&eng[all]=100 //Gets 100 results from each search engine
            https://faas.stage1.mybluemix.net/q?=IBM&eng[all]=60 //Gets 60 results from each engine
            https://faas.stage1.mybluemix.net/q?=IBM&eng[goog]=10&eng[bing]=10 //Gets 10 results from google bing
            https://faas.stage1.mybluemix.net/q?=IBM&eng[blek]=100 //

    Note: 
        1. Choosing different amounts for each engine e.g. bing[30] and goog[60] may effect aggregation and k-means clustering
        2. Choosing to return 100 search results for each engine ie 300 results overall will slow down your query


### \<typesOfResult(s)\>: 
    The types of results must be specified next.
    These are the different list of results types created from the engines
    Each list of the results that were returned by the individual search engines will also be returned
    individually this is to specify other methods

        For Combination Multiply Non-Zero use combmnz
        For Reciprocal Rank Fusion Results use rrf
        For k-means Clustering Restuls use kmeans
        For a list of related results use related
        For all result types to be returned use all

        Example: 
            https://faas.stage1.mybluemix.net/q?=IBM&eng[all]=100resType=all
            https://faas.stage1.mybluemix.net/q?=IBM&eng[goog]=100&eng[bing]=100&resType=rrf+kmeans


### \<apiKey(s)\>: 
    These are the API keys you have need will need to get before you try a request
    If left blank it will throw an error

    [Google Custom Search API](https://support.google.com/customsearch/answer/2631040?hl=en)
    Set up a free account with your gmail and Googles API console and recieve up to 100 results per day
    The amount of results you specify to recieve will have an effect on the amount of total
    searches you can make. For example 10 searches asking for 100 results will use up your alotment
    When you sign up you will recieve a project number called a CX and and API key
    Specify you google API details in the following format
    &keys[goog]=CX+APIkey

    Bing Search API
    Set up a free Bing Seach API account with Microsoft Azure
    The amount of results you can make 5000 searches per month.
    When you sign up you will recieve an API key
    Specify it it in the following format
    &keys[bing]=APIkey

        Example: 
            https://faas.stage1.mybluemix.net/q?="IBM"&eng[all]&resType=all&keys[goog]=CX+APIkey&keys[bing]=APIKey
            https://faas.stage1.mybluemix.net/q?="IBM"&eng[goog]=100&resType=rrf+kMeans&keys[goog]=CX+APIkey
            https://faas.stage1.mybluemix.net/q?="IBM"&eng[blek]&resType=combMNZ /*Key not needed/*



### \<resultFormat\>: 
    This is the format of the result you want to be returned
    At the momment the API supports the only JSON and XML
    but let me know what else you'd like an I'll try to accomadate it
    This can be specifed using
    * JSON
    * XMl
    If left blank it defaults to json

        Example:
        https://faas.stage1.mybluemix.net/q?="IBM"&eng[all]&resType=all&keys[goog]=CX+APIkey&keys[bing]=APIKey&formType=xml
        https://faas.stage1.mybluemix.net/q?="IBM"&eng[goog]=100&resType=rrf+kMeans&keys[goog]=CX+APIkey&formType=json


Response
------

Generally if you request the full feature set of this API your response will come in the following format

### Response in JSON:
    {
      msg : "Successful Results",
      reqDetails : //An object with the Details of your Request,
      goog: //An array of objects with Results from Googles Custom Search API,
      blek: //An array of objects with Results from Blekkos Search API,
      bing: //An array of objects with Results from Bings Search API,
      rrf: //An array of objects from different engines aggregated using Reciprocal Rank Fusion,
      combMNZ: //An array of objects from different engines aggregated using Combination Multiply Non-Zero,
      kmeans: //An object with 3 arrays of,
      time: //The time taken in miliseconds for the search Request,
      bingRelated: //An array of Realated searches from the Bing realted search terms api
    }

### Resonse in XML:
    <?xml version="1.0" encoding="UTF-8"?>
    <results> //Root Node
      <msg>Successful Results</msg>
      <goog></goog>
      <blek></blek>
      <bing></bing>
      <rrf></rrf>
      <combMNZ></combMNZ>
      <kmeans></kmeans>
      <time></time>
      <bingRelated></bingRelated>
    </results>



















