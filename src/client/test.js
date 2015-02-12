var co = require('co')
var Client = require("./youmagineStoreClient")


co(function* () {
  var rootUri    = "http://10.103.10.204:3000/api/v2"//https://test.api.youmagine.com/
  var authToken  = "testtoken"//"test.youmagine.com/integrations/jam" 
  
  var userName   = "wilco-123" //ckaos
  var designName = "wilco-s-design" //testDesign
  var designPath = userName+"/"+designName

  console.log("CLIENT")
  var client     = new Client( authToken, rootUri)
  //yield client.designs()
  //yield client.users()
  
  console.log("USER")
  var user = client.user( userName )
  //yield user.infos()

  console.log("DESIGN")
  var design = client.design(designPath)
  //yield design.infos()
  //yield design.assemblies()
  //yield design.annotations()
  //yield design.bom()

}); 

