var co = require('co')
var Client = require("./youmagineStoreClient")


co(function* () {

  var client = new Client()

  var user = client.user("ckaos")
  yield user.infos();

  console.log("DESIGN")
  var design = client.design("ckaos/testDesign")
  yield design.assemblies();

}); 

