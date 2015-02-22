var co = require('co')
var request = require('co-request')
var detectEnv = require("composite-detect")
var HTTPStatus = require('http-status')
//var Q = require ("q")

var mapEntries = require('./mapEntries')


//TODO
/*
 - units should come from a pre-established list of units , and should not be a "free field"
 - amounts are float/int and nothing else

*/

/*
if( detectEnv.isModule )
{
  Minilog=require("minilog")
  Minilog.pipe(Minilog.suggest).pipe(Minilog.backends.console.formatClean).pipe(Minilog.backends.console)
  logger = Minilog('youmagine-store')
}

if( detectEnv.isNode ){
  XMLHttpRequest = require("xhr2").XMLHttpRequest
  Minilog.pipe(Minilog.suggest).pipe(Minilog.backends.console.formatColor).pipe(Minilog.backends.console)
}

if( detectEnv.isBrowser){

  XMLHttpRequest = window.XMLHttpRequest
  Minilog.pipe(Minilog.suggest).pipe(Minilog.backends.console.formatClean).pipe(Minilog.backends.console)
  logger = Minilog('youmagine-store')
}*/

//FIXME: hack
var logger = function(){
}
logger.debug = function(  ){
  var args = "";
  for(var key in arguments)
  {
    args+=arguments[key];
  }
  console.log(args);
}
logger.info = function( stuff ){
  console.log(stuff);
}
logger.warn = function( stuff ){
  console.log(stuff);
}
logger.error = function( stuff ){
   var args = "";
  for(var key in arguments)
  {
    args+=arguments[key];
  }
  console.log(args);
}



class User {
  constructor(name, client){
    this.name   = name 
    this.client = client
    this.usersUri = `${this.client.rootUri}/users.json?auth_token=${this.client.token}`
    this._uri     = `${this.client.rootUri}/users/${this.name}.json?auth_token=${this.client.token}`
  }
  
  *infos(){
    logger.debug("infos for this user");
    var response = yield this.client.get( this._uri ) 
    logger.debug("response for user infos",response.body)
  }
  
  *list(){
    logger.debug("list users");
    var usersUri = `${this.client.rootUri}/users.json?auth_token=${this.client.token}`
    var response = this.client.request( this._uri )
    logger.debug("response for users list",response.body)
    
  }
  
  *designs(){
    logger.debug("designs for this user");
    var userDesignUri = `${this.client.rootUri}/users/${this.name}/designs.json?auth_token=${this.client.token}`
    var designs = yield this.client.get( userDesignUri )
  }
}


class Design {
  constructor(name, client){
    //FIXME:no destructuring yet...
    //[this.userName,this.name] = name.split("/");
    
    var _tmp = name.split("/");
    this.name     = _tmp[1];
    this.userName = _tmp[0];
    
    this.client   = client
    
    this.designsUri = `${this.client.rootUri}/designs.json?auth_token=${this.client.token}`
    this._uri       = `${this.client.rootUri}/designs/${this.name}.json?auth_token=${this.client.token}`
    this.assembliesUrl  = `${this.client.rootUri}/designs/${this.name}/assembies.json?auth_token=${this.client.token}`
    this.annotationsUrl = `${this.client.rootUri}/designs/${this.name}/assembies/1/annotations.json?auth_token=${this.client.token}`
    this.bomUrl         = `${this.client.rootUri}/designs/${this.name}/bom?auth_token=${this.client.token}`
  }
  
  static _fromJson( jsonData, client ){
    console.log("from json", jsonData, client)
    return new Design(jsonData.name, client);
  }
  
  *create(name){
    logger.debug("Creating design");
    var response = yield this.client.post( this._uri ) ;
    logger.debug("created design",response);
  }
  
  *infos(){
    logger.debug(`Infos of ${this.name}`);
    var response = yield this.client.get( this._uri ) ;
    logger.debug("infos response",response);
  }
  
  *update( data ){
    logger.debug(`Updating of ${this.name}`);
    var response = yield this.client.patch( this._uri ) ;
    logger.debug("updated design",response);
  }
  
  *delete(){
    logger.debug(`Deleting DESIGN ${this.name}`);
    var response = yield this.client.delete( this._uri ) ;
    logger.debug("infos response",response);
  }
  
  *list(){
    logger.debug("Retrieving designs");
    var response = yield this.get( this.designsUri ) ;
    logger.debug("designs",response);
  }
  
  *assemblies( options ){
    logger.debug(`Assemblies of ${this.name}`);
    var response = yield this.client.get( this.assembliesUrl ) ;
    logger.debug("assemblies response",response);
    return response
  }
  
  *annotations( options ){
    logger.debug(`Annotations of ${this.name}`);
    var response = yield this.client.get( this.annotationsUrl ) ;
    logger.debug("annotations response",response);
    return response
  }
  
  *bom( options ){
    logger.debug(`BOM of ${this.name}`);
    var response = yield this.client.get( this.bomUrl ) ;
    logger.debug("bom fetched:",response);
    return response
  }
  
  //CREATE
  *assembly( data ){
    logger.debug("CREATING assembly");
    data = mapEntries( data, "assembly" );
    var response = yield this.client.post( this.assembliesUrl, data ) ;
    logger.debug("CREATING assembly response",response);
  }
  
  *annotation( data ){
    logger.debug("CREATING annotation");
    data = mapEntries( data, "annotation" );
    var response = yield this.client.post( this.annotationsUrl, data ) ;
    logger.debug("CREATING annotation response",response);
  }
  
  *bomEntry( data, options ){
    //FIXME: experimental
    var options = options || {};
    var bomUrl = `${this.client.rootUri}/designs/${this.name}/bom`
    
    logger.debug("CREATING bom entry");
    
    var origData = data;
    data = mapEntries( data, "bom_entry" );
    
    var what = options.what  !== undefined ? options.what : "create";
    
    switch(what)
    {
      case "create":
        var response = yield this.client.post( this.bomUrl, data )
      break;
      case "update":
        var bla = bomUrl+"/"+options.idx+`?auth_token=${this.client.token}`
        console.log( bla, data )
        response = yield this.client.patch( bla, data )
      break
      case "delete":
        response = yield this.client.delete( this.bomUrl )
      break
    }
    logger.debug("edited bom entry :",JSON.stringify(response) );
    
    /*var response = yield this.client.post( this.bomUrl, data ) ;
    logger.debug("CREATED bom entry :",JSON.stringify(response) );*/
  }
}

class Annotation{

}

class BomEntry{
  constructor( name, client ){
    this.client = client
    this.name   = name
    this.bomUrl = ""
  }
  
  *create( data ){
    logger.debug("CREATING bom entry");
    data = mapEntries( data, "bom_entry" );
    
    var response = yield this.client.post( this.bomUrl, data ) ;
    logger.debug("CREATED bom entry :",JSON.stringify(response) );
  }
  
  *update( data ){
    logger.debug("UPDATING bom entry");
    data = mapEntries( data, "bom_entry" );
    
    var response = yield this.client.patch( this.bomUrl, data ) ;
    logger.debug("CREATED bom entry :",JSON.stringify(response) );
  }
}


class Client {
  constructor(token, rootUri) {
    this.token   = token   || "";
    this.rootUri = rootUri || "";
    this.designsUri = `${this.rootUri}/designs.json?auth_token=${this.token}`;
    this.usersUri   = `${this.rootUri}/users.json?auth_token=${this.token}`;
  }
  
  //basic crud methods etc
  
  *get( uri ){
    return yield this.request( uri );
  }
  
  *post( uri, data ){
    return yield this.request( uri, "POST", data);
  }
  
  *patch( uri, data ){
    return yield this.request( uri, "PATCH", data);
  }
  
  *delete( path ){
    return yield this.request( uri, "DELETE");
  }
  
  ///
  user( name ){
    return new User( name, this );
  }
  
  design( name ){
    return new Design( name, this );
  }
  
  *users( ){
    logger.debug("Retrieving users");
    var response = yield this.get( this.usersUri ) ;
    if(! response ) return null;
    var users = [];
    
    for(var userData of response){
      var user = User._fromJson( userData, this );
      //console.log("design",design);
    }
    logger.debug("users",users);
    return users;
  }
  
  *designs( options ){
    var options = options || {}
    var raw = options.raw  !== undefined ? options.raw : true;
    
    logger.debug("Retrieving designs");
    var response = yield this.get( this.designsUri ) ;
    if(! response ) return null;
    if( raw ) return response;
 
    var designs = [];
    
    for(var designData of response){
      var design = Design._fromJson( designData, this );
      //console.log("design",design);
    }
    //logger.debug("designs",designs);
    return designs;
  }
  
  //helpers  
  *request( uri, method, data ){
    var method = method || "GET"
    var response = ""
    try{
      
      logger.debug("request to uri "+ uri +" using method "+method)
      response = yield request( {
                        uri: uri,
                        method: method,
                        formData: data} )
      //logger.debug("response", response.statusCode, response.body)
      
      response = this._formatResponse( response )
    }
    catch(error){
      logger.error( error )
      response = null
    }
    return response
  }
  
  _formatResponse( response ){
    if(!response) throw new Error("no response!")
    if(response.error) throw new Error(response.error)
    //logger.debug(HTTPStatus[response.statusCode])
    if(response.statusCode === 404) throw new Error(HTTPStatus[404])
    response = JSON.parse(response.body)
    //response = response.body
    return response
  }
}

module.exports = Client
