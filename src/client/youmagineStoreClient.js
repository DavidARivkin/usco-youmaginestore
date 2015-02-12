var co = require('co')
var request = require('co-request')


class User {
  constructor(name, client){
    this.name   = name 
    this.client = client
    this._uri = `https://api.youmagine.com/users/${this.name}.json?auth_token=${this.client.token}`;
    //"https://test.youmagine.com/designs/the-raptor-hand-by-e-nable/assemblies/1/annotations.json";
  }
  
  *infos(){
    console.log("infos for this user");
    var response = yield this.client.request( this._uri ) ;
    console.log("response for user infos",response.body);
  }
  
  *list(){
    console.log("list users");
    var usersUri = "https://test-api.youmagine.com/users.json?auth_token=`${this.client.token}`"
    //
    //http://api.youmagine.com/designs.json?auth_token={token}
    var response = this.client.request( this._uri );
    console.log("response for users list",response.body);
  }
  
  *designs(){
    console.log("designs for this user");
    var userDesignUri = `https://api.youmagine.com/users/${this.name}/designs.json?auth_token=${this.client.token}`
    var designs = yield this.client.request( userDesignUri ) ;
  }
}
/*

function User(name, client){
  this.name   = name 
  this.client = client
  this._uri = `https://api.youmagine.com/users/${this.name}.json?auth_token=${this.client.token}`;
  console.log("user created");
}

User.prototype={};

User.prototype.infos=function*(path){
 console.log("infos for this user");
  console.log("gnswsdf");
  var response = yield this.client.request( this._uri ) ;
  console.log("final response",response.body);
}*/


class Design {
  constructor(userName, name, client){
    this.userName = userName
    this.name     = name 
    this.client   = client
    this._uri     = `https://api.youmagine.com/designs/${this.name}.json?auth_token=${this.client.token}`;
    //"https://test.youmagine.com/designs/the-raptor-hand-by-e-nable/assemblies/1/annotations.json";
  }
  
  create(name){
  
  }
  
  *infos(){
    console.log("infos for this design");
    var response = yield this.client.request( this._uri ) ;
    console.log("final response",response.body);
  }
  
  list(){
  }
  
  *assemblies(){
    var assembliesUrl = `https://test.api.youmagine.com/designs/${this.name}/assembies.json?auth_token=${this.client.token}`
    var response = yield this.client.request( assembliesUrl ) ;
    console.log("final response",response.body);
  }
  
  *annotations(){
    var annotationsUrl = `https://test.api.youmagine.com/designs/${this.name}/assembies/1/annotations.json?auth_token=${this.client.token}`
    //"https://test.youmagine.com/designs/the-raptor-hand-by-e-nable/assemblies.json";
    var response = yield this.client.request( assembliesUrl ) ;
    console.log("annotationsUrl response",response.body);
  }
  
  *bom(){
    var bomUrl = `https://test.api.youmagine.com/designs/${this.name}/bom.json?auth_token=${this.client.token}`
    var response = yield this.client.request( bomUrl ) ;
    console.log("bomUrl response",response.body);
  }
}



class Client {
  constructor(token) {
    this.token = "test.youmagine.com/integrations/jam"
  }
  
  user( name ){
    return new User( name, this );
  }
  
  design( userName, name ){
    return new Design( userName, name, this );
  }
  
  *designs( ){
  }
  
  *request( path ){
    console.log("request to path & stuff2", path)
    var response = yield request( path )
    console.log("response", response.statusCode, response.body)
    return response
  }
}

/*var Client =function(token){
  this.token = "test.youmagine.com/integrations/jam"
}

Client.prototype.user=function( name ){
  return new User( name, this );
}

Client.prototype.request=function*(path){
  console.log("request to path & stuff", path)
  var response = yield request( path )
  console.log("response", response.statusCode, response.body)
  return response
}*/


module.exports = Client
