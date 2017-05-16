var accessToken = require('./AccessToken/accessToken');
var customer = require('./Customer/customer');
var transaction = require('./Transaction/maintainTransaction');

// module.exports = exports = {
// 	init: function (ACCESS_TOKEN) {
// 		console.log('INITIALIZING SQUAREUP ......');
// 		accessToken.setAccessToken(ACCESS_TOKEN);
//
// 		//Initializing Transaction to set location Id for all transactions
// 		transaction.init();
// 	},
// 	createCustomer: customer.create,
// 	createCustomerCard: customer.createCustomerCard,
// 	deleteCustomer: customer.deleteCustomerCard,
// 	charge: transaction.charge,
// 	refund: transaction.refund
// };


var SquareUp = function (ACCESS_TOKEN) {
	accessToken.setAccessToken(ACCESS_TOKEN);

	//Initializing Transaction to set location Id for all transactions
	transaction.init();
};

SquareUp.prototype.createCustomer = customer.create;
SquareUp.prototype.createCustomerCard = customer.createCustomerCard;
SquareUp.prototype.deleteCustomerCard = customer.deleteCustomerCard;
SquareUp.prototype.charge = transaction.charge;
SquareUp.prototype.refund = transaction.refund;

module.exports = SquareUp;
