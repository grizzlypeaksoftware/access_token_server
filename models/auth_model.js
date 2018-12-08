var dataAccess = require("./dataAccess.js");
var Model = function(){};

Model.prototype.authorize = function(client_id, client_secret){	
	return dataAccess.GetEntities("token_server", "clients",{"client_id": client_id, "client_secret": client_secret});
};

module.exports = new Model();
