var request = require('request');
var accessToken = require('../AccessToken/accessToken');
var Joi = require('joi');
var crypto = require('crypto');

module.exports = exports = {

	create: function (details, callback) {
		if (!accessToken.isTokenSet()) return callback(new Error("No Token Set Fot This Application. Please set a valid token"));
		let schema = {
			"given_name": Joi.string().required(),
			"family_name": Joi.string().required(),
			"email_address": Joi.string().email().required(),
			"address": Joi.object().keys({
				"address_line_1": Joi.string(),
				"address_line_2": Joi.string(),
				"locality": Joi.string(),
				"postal_code": Joi.string(),
				"country": Joi.string()
			}).optional(),
			"phone_number": [Joi.number(), Joi.string()],
			"note": Joi.string().allow("")
		};

		let isValid = Joi.validate(details, schema);
		if (!isValid) return callback(new Error("Please provide all required fields"));

		// details["reference_id"] = randomValueHex(16);

		request({
			method: 'POST',
			url: 'https://connect.squareup.com/v2/customers',
			headers: {
				'Content-Type': "application/json",
				'Authorization': "Bearer " + accessToken.getAccessToken()
			},
			json: details
		}, function (error, response, body) {
			if (error || body.errors) return callback(error || body.errors[0].detail);
			else {
				if (typeof body == 'string') body = JSON.parse(body);
				// body['reference_id'] = details["reference_id"];
				callback(null, body);
			}
		})
	},

	createCustomerCard: function (customerId, details, callback) {
		if (!accessToken.isTokenSet()) return callback(new Error("No Token Set Fot This Application. Please set a valid token"));
		if (!customerId) return callback('Please provide customer id');
		let schema = {
			"card_nonce": Joi.string().required(),
			"billing_address": Joi.object().keys({
				"address_line_1": Joi.string(),
				"address_line_2": Joi.string(),
				"locality": Joi.string(),
				"administrative_district_level_1": Joi.string(),
				"postal_code": Joi.string(),
				"country": Joi.string()
			}).optional(),
			"cardholder_name": Joi.string().required()
		};

		let isValid = Joi.validate(details, schema);
		if (!isValid) return callback(new Error("Please provide all required fields"));

		request({
			method: 'POST',
			url: 'https://connect.squareup.com/v2/customers/' + customerId + '/cards',
			headers: {
				'Content-Type': "application/json",
				'Authorization': "Bearer " + accessToken.getAccessToken()
			},
			json: details
		}, function (error, response, body) {
			if (error || body.errors) return callback(error || body.errors[0].detail);
			else {
				if (typeof body == 'string') body = JSON.parse(body);
				callback(null, body);
			}
		})
	},

	deleteCustomerCard: function (customerId, cardId, callback) {
		if (!accessToken.isTokenSet()) return callback(new Error("No Token Set Fot This Application. Please set a valid token"));
		if (!customerId) return callback('Please provide customer id');
		if (!cardId) return callback('Please provide card id');

		request({
			method: 'DELETE',
			url: 'https://connect.squareup.com/v2/customers/' + customerId + '/cards/' + cardId,
			headers: {
				'Authorization': "Bearer " + accessToken.getAccessToken()
			}
		}, function (error, response, body) {
			if (error || body.errors) return callback(error || body.errors[0].detail);
			else {
				if (typeof body == 'string') body = JSON.parse(body);
				callback(null, body);
			}
		})
	}
};

function randomValueHex(len) {
	return crypto.randomBytes(Math.ceil(len / 2))
		.toString('hex')
		.slice(0, len);
}
