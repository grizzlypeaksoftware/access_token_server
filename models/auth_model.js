// includes
var dataAccess = require("./dataAccess.js");
var Model = function(){};

// pass a client_id and client_token to mongodb and return any records found.
// database name here is "token_server"
// collection name is "clients"
Model.prototype.authorize = function(client_id, client_secret){	
	return dataAccess.GetEntities("token_server", "clients",{"client_id": client_id, "client_secret": client_secret});
};

// export this as am instanted object.
module.exports = new Model();
