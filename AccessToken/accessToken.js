var ACCESS_TOKEN = null;
var LOCATION = null;

module.exports = {
	setAccessToken: function (token) {
		if (!token) throw new Error('Please provide a valid access token for Squareup');
		ACCESS_TOKEN = token;
	},
	getAccessToken: function () {
		return ACCESS_TOKEN;
	},
	isTokenSet: function () {
		if (ACCESS_TOKEN) return true;
		else return false;
	},
	setLocation: function (locationId) {
		LOCATION = locationId;
	},
	getLocation: function () {
		return LOCATION;
	}
};
