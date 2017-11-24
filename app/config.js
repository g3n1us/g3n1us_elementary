var config = {
	development: true,
	use_auth: false,
	use_editor: false,
	root_path: typeof window !== "undefined" ? window.location.protocol + '//' + window.location.host : null,
	bucket: null,
	domain: typeof window !== "undefined" ? window.location.host : null,
	url: typeof window !== "undefined" ? window.location.href : null,
	resolved_domain: typeof window !== "undefined" ? window.location.href : null,
	google: {
		client_id: '11111111111-xxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com',
	},
	aws: {
		identity_pool_id: 'us-east-1:xx111111111-1111-1111-1111-111111111111',
	},
	iframely_key: 'xxx11111111111',
}

if(typeof window !== "undefined")
	window.config = config;

module.exports = config;
