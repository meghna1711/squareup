var accessToken = require('../AccessToken/accessToken');
var request = require('request');
var Joi = require('joi');
var crypto = require('crypto');

module.exports = exports = {
	locationId: "",
	setLocationId: function (id) {
		if (id) this.locationId = id;
	},
	getLocationId: function () {
		return this.locationId;
	},
	init: function () {
		if (!accessToken.isTokenSet()) return new Error('Please set you access token');
		let self = this;
		request({
			url: 'https://connect.squareup.com/v2/locations',
			method: 'GET',
			headers: {
				'Authorization': "Bearer " + accessToken.getAccessToken()
			}
		}, function (err, resp, body) {
			if (err) new Error('Unable to fetch location');
			else {
				if (typeof body == 'string') body = JSON.parse(body);
				if (body.locations && body.locations.length) var locations = body.locations.find(function (loc) {
					console.log(loc.capabilities, loc.capabilities && typeof loc.capabilities[0]);
					return loc.capabilities && loc.capabilities[0] == 'CREDIT_CARD_PROCESSING';
				});
				accessToken.setLocation(locations.id);
			}
		})
	},
	charge: function (details, callback) {
		var self = this;
		if (!accessToken.isTokenSet()) return new Error('Please set you access token');
		var schema = {
			"shipping_address": Joi.object().keys({
				"address_line_1": Joi.string(),
				"address_line_2": Joi.string(),
				"administrative_district_level_1": Joi.string(),
				"locality": Joi.string(),
				"postal_code": Joi.string(),
				"country": Joi.string()
			}).optional(),
			"billing_address": Joi.object().keys({
				"address_line_1": Joi.string(),
				"address_line_2": Joi.string(),
				"administrative_district_level_1": Joi.string(),
				"locality": Joi.string(),
				"postal_code": Joi.string(),
				"country": Joi.string()
			}).optional(),
			"amount_money": Joi.object().keys({
				"amount": Joi.number().required(),
				"currency": Joi.string().required()
			}),
			"customer_card_id": Joi.string().required(),
			"customer_id": Joi.string().required(),
			"note": Joi.string(),
			"delay_capture": false
		};

		var isValid = Joi.validate(details, schema);
		if (!isValid) return callback(new Error('Details invalid for charging card'));

		details['idempotency_key'] = randomValueHex(32);
		details['reference_id'] = randomValueHex(16);

		console.log("location", accessToken.getLocation());
		request({
			url: 'https://connect.squareup.com/v2/locations/' + accessToken.getLocation() + '/transactions',
			method: 'POST',
			headers: {
				'Content-Type': "application/json",
				'Authorization': "Bearer " + accessToken.getAccessToken()
			},
			json: details
		}, function (err, resp, body) {
			if (err || body.errors) return callback(err || body.errors[0].detail);
			else {
				if (typeof body == 'string') body = JSON.parse(body);
				body['idempotency_key'] = details['idempotency_key'];
				body['reference_id'] = details['reference_id'];
				callback(null, body);
			}
		})
	},
	refund: function (transactionId, details, callback) {
		if (!accessToken.isTokenSet()) return new Error('Please set you access token');
		if (!transactionId) return callback(new Error('Transaction ID is required'));
		var schema = {
			"idempotency_key": Joi.string().required(),
			"tender_id": Joi.string().required(),
			"reason": Joi.string(),
			"amount_money": Joi.number().required()
		};

		var isValid = Joi.validate(details, schema);
		if (!isValid) return callback(new Error('Details invalid for charging card'));

		request({
			url: 'https://connect.squareup.com/v2/locations/' + accessToken.getLocation() + '/transactions/' + transactionId + '/refund',
			method: 'POST',
			headers: {
				'Content-Type': "application/json",
				'Authorization': "Bearer " + accessToken.getAccessToken()
			},
			json: details
		}, function (err, resp, body) {
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
