var co = require('co')
var request = require('co-request')
var detectEnv = require("composite-detect")
var HTTPStatus = require('http-status')
//var Q = require ("q")
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
    this._uri = `${this.client.rootUri}/users/${this.name}.json?auth_token=${this.client.token}`;
  }
  
  *infos(){
    logger.debug("infos for this user");
    var response = yield this.client.get( this._uri ) ;
    logger.debug("response for user infos",response.body);
  }
  
  *list(){
    logger.debug("list users");
    var usersUri = `${this.client.rootUri}/users.json?auth_token=${this.client.token}`
    var response = this.client.request( this._uri );
    logger.debug("response for users list",response.body);
  }
  
  *designs(){
    logger.debug("designs for this user");
    var userDesignUri = `${this.client.rootUri}/users/${this.name}/designs.json?auth_token=${this.client.token}`
    var designs = yield this.client.get( userDesignUri ) ;
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
    
    this._uri     = `${this.client.rootUri}/designs/${this.name}.json?auth_token=${this.client.token}`;
    this.assembliesUrl  = `${this.client.rootUri}/designs/${this.name}/assembies.json?auth_token=${this.client.token}`
    this.annotationsUrl = `${this.client.rootUri}/designs/${this.name}/assembies/1/annotations.json?auth_token=${this.client.token}`
    this.bomUrl         = `${this.client.rootUri}/designs/${this.name}/bom.json?auth_token=${this.client.token}`
  }
  
  create(name){
  
  }
  
  *infos(){
    logger.debug(`Infos of ${this.name}`);
    var response = yield this.client.get( this._uri ) ;
    logger.debug("infos response",response);
  }
  
  list(){
  }
  
  *assemblies(){
    logger.debug(`Assemblies of ${this.name}`);
    var response = yield this.client.get( this.assembliesUrl ) ;
    logger.debug("assemblies response",response);
  }
  
  *annotations(){
    logger.debug(`Annotations of ${this.name}`);
    var response = yield this.client.get( this.annotationsUrl ) ;
    logger.debug("annotations response",response);
  }
  
  *bom(){
    logger.debug(`BOM of ${this.name}`);
    var response = yield this.client.get( this.bomUrl ) ;
    logger.debug("bomUrl response",response);
  }
  
  //CREATE
  *annotation( data ){
    logger.debug(`CREATING annotation`);
    var response = yield this.client.post( this.assembliesUrl ) ;
    logger.debug("CREATING annotation response",response);
  }
  *bomEntry( data ){
    logger.debug(`CREATING bom entry`);
    var response = yield this.client.post( this.bomUrl ) ;
    logger.debug("CREATING bom entry response",response);
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
  
  *get( path ){
    return yield this.request( path );
  }
  
  *post( path, data ){
    return yield this.request( path, "POST", data);
  }
  
  *put( path, data ){
    return yield this.request( path, "PUT", data);
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
    logger.debug("users",response);
  }
  
  *designs( ){
    logger.debug("Retrieving designs");
    var response = yield this.get( this.designsUri ) ;
    logger.debug("designs",response);
  }
  
  //helpers  
  *request( path, method, data ){
    var response = ""
    try{
      var method = method || "GET"
      
      logger.debug("request to path & stuff2 "+ path)
      response = yield request( path )
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
    return response.body//JSON.parse(response.body)
  
  }
}

module.exports = Client
