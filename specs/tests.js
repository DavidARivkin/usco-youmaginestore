var co = require('co')
var request = require('co-request');
var requestN = require('request');

var token = "";
var baseUrl = "https://test.youmagine.com/designs/the-raptor-hand-by-e-nable/assemblies/1/annotations";
var testUrl = "https://test.youmagine.com/designs/the-raptor-hand-by-e-nable/assemblies/1/annotations.json";

var authData = {
    'user': 'beta',
    'pass': 'tester'
  }

co(function* () {
  var result = yield request(testUrl); 
  var response = result;
  var body = result.body;
  //console.log('Response: ', response);
  if(body){
    var annotations = JSON.parse(body);
    var latest = annotations[ annotations.length-1 ];
    console.log('annotations: ', annotations.length, latest);
  }

  /*ideally api should be
  design/designID/assemblies/assemblyId/annotations/annotationsID
  
  */
  
  /*var result = yield request({
    uri: 'http://google.com',
    method: 'POST'
  });*/
  //data update attempt
  
 var newAnnotation ={
 "annotationType":"note",
 "name":"note1",
 "title":"note1",
 "position":[0,10,0],
 //"uuid":null,
 "notes":"some notes, can be multiline \n great !",
 "partId":0
 };
 
 var annotUrl = testUrl;

 var altnewAnnotation = {"type":"diameter","value":7.53,"center":[12.94,-11,0.22],"orientation":[2.50,-1,5.41],"object":1377254961,"partId":1377254961,"uuid":"E5A09178-1E4C-41B1-A4F3-617977DB201D","name":"D1","notes":"","title":"","varName":""}
  
  
  function mapEntries( annotJson ){
    var output = {};
    for(key in annotJson){
      var newKey = `annotation[${key}]`;
      //console.log("bla", key, newKey);
      var value = annotJson[key]; 
      if(value instanceof Array){
        value = `[${value.join(',')}]`;
      }  
      output[newKey] = value; 
    }
    return output;
  }
  
 
   //create
   /*
   var mappedAnnot = mapEntries( newAnnotation);
   console.log("adding new annotation",mappedAnnot);
   var result = yield request({
      uri: annotUrl,
      method: 'POST',
      formData: mappedAnnot,
      auth:authData
   })
   console.log("result",result.body, result.error);*/
 
  //update
  var entryUri = baseUrl +"/4.json";
  var annotFieldsToUpdate ={
   "name":"MyNote",
   "position":[0,40,0],
   "notes":"Ohh, I changed the notes, again !",
   };
  
   var mappedAnnot = mapEntries( annotFieldsToUpdate );
   console.log("updating annotation at ",entryUri,mappedAnnot);
   var result = yield request({
      uri: entryUri,
      method: 'PUT',
      formData: mappedAnnot,
      auth:authData
   });
   
   //GET back some data
   var result = yield request({
      uri: entryUri,
      method: 'GET',
      auth:authData
   })
   console.log("result",result.body);  
 
  return;
  //delete
  console.log("deleting annotation");
  var delTestUrl = baseUrl +"/3";
  var result = yield request({
    uri: delTestUrl,
    method: 'DELETE',
    auth:authData
  })
  console.log("result",result.body, result);
}); 

 /*var delTestUrl = baseUrl +"/2";
requestN( delTestUrl, {method: 'DELETE',auth:authData}, function (error, response, body) {
  
  console.log("error", error,response, body);
  if (!error && response.statusCode == 200) {
    console.log(body) // Show the HTML for the Google homepage.
  }
});*/
/*
request(testUrl, function (error, response, body) {

  if (!error && response.statusCode == 200) {
    console.log(body) // Show the HTML for the Google homepage.
  }
})*/

/*request.post({url:'http://service.com/upload', formData: formData}, function optionalCallback(err, httpResponse, body) {
  if (err) {
    return console.error('upload failed:', err);
  }
  console.log('Upload successful!  Server responded with:', body);
});*/
