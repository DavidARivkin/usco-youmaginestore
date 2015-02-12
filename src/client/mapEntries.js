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

module.export = mapEntries;
