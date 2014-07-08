/*
The purpose of this module is to error check the results returned
by each of the search engines and modulise it from the metasearch module to make it easier to read.
Reasons for errors may include queries being too abstrat and returing no results
For bing and google results may be returned by as they concatonate lists
if one is empty this can throw an erro and crash the program
*/

function checkGoogle (googIndivRes, googArr) {

    //Create a temp array of all objects
    var tmp = JSON.parse(googIndivRes);
    try{
        if(tmp.items.length != undefined)
            //Concat method creates a new array so this is the only option for looping concat
            googArr = googArr.concat(tmp.items);
    }
    catch(e){
        //Print error
        console.log(e);
    }
    //Return goog Array
    return googArr;
}

function checkBing (bing1, bing2) {
    var bingArr;
    try{
        //Concatenate Bing results into an object with an array of 100 results
        bingArr = bing1.d.results.concat(bing2.d.results);
        return bingArr;
    }
    catch(e){
        try{
            //If there was an error concationation has failed as bing51to100 has no results
            bingArr = bing1.d.results;
            //Test if it has length if not it will be undefined and throw error
            bingArr.length;
            //if it does have a length return list
            return bingArr;
        }
        catch(e){
            //Print error
            console.log(e);
            //catch error return empty array
            return [];
        }
    }
}




function checkBlekko (blek, blekArr) {
    //In case someone abuses blekkos
    //api conditions and it returns nothing
    //or Query returns no results as can sometimes happen catch error
    try{
        var blekList = JSON.parse(blek);
        //Test if the list is empty
        blekList.RESULT.length;
        blekArr = blekArr.concat(blekList.RESULT);
    }
    catch(e) {
        //If the list is empty return empty arrayS
        console.log(e);
    }

    return blekArr;
}


//Export functions so they can be used in metasearch module
exports.checkGoogle = checkGoogle;
exports.checkBing = checkBing;
exports.checkBlekko = checkBlekko;
