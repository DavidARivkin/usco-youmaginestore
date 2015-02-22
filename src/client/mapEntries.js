var mapEntries=function( srcJson, fieldName ){
  var output = {};
  for(var key in srcJson){
    var newKey = `${fieldName}[${key}]`;
    var value = srcJson[key]; 
    if(value instanceof Array){
      value = `[${value.join(',')}]`;
    }  
    output[newKey] = value; 
  }
  return output;
}

module.exports = mapEntries;
