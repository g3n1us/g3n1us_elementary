const config = require('./config');


function Identity(){
	var _this = this;
	
	_this.user = null;
	
	_this.logins = {};
	
	_this.app = null; // set in startApp

	_this.callback = null; // set in startApp
	
	_this.params = {
        IdentityPoolId : config.aws.identity_pool_id,
        Logins : {},
    }

    _this.logged_in_buttons = function(){
	    if(!$('#controls .google-button-outer .avatar').length)
			$('#controls .google-button-outer').append('<img class="avatar hidden-md-down" style="width: 38px; margin-right: 5px;" src="'+ _this.user.getBasicProfile().getImageUrl() +'">');
		if(!$('#controls .signout').length)
			$('#controls .google-button-outer').after('<button type="button" class="btn-link text-muted signout"><i class="fa fa-sign-out"></i> <span class="hidden-sm-down">Sign Out</span></button>');
		$('html').removeClass('logged-out');
    }
    _this.logged_out_buttons = function(){
		$('html').addClass('logged-out');
		if($('#controls .signout').length)$('#controls .signout').remove();
		if($('#controls .google-button-outer .avatar').length)$('#controls .google-button-outer .avatar').remove();
    }
    _this.login_listener_set = false;
    
    _this.setLoginListener = function(){
	    if(_this.login_listener_set) return;
	    
		_this.googleAuth.isSignedIn.listen(function(val){
			if(val == false) {
				_this.logged_out_buttons();
				_this.app.view = {name: 'login', data: {}};
				
			}
			else {
				_this.logged_in_buttons();
				_this.app.view = {name: 'projects', data: _this.app};
			}
		});	  
		_this.login_listener_set = true;  
    }
	
	
	_this.signOut = function() {
		var auth2 = gapi.auth2.getAuthInstance();
		_this.googleAuth.signOut();
		auth2.signOut().then(function () {
			AWS.config.credentials.clearCachedId();
			//console.log('User signed out.');
			_this.app.view = {name: 'login', data: {}}				
		});
	}
	
	
	
	
	_this.googleUser = {};
	_this.signedIn = false;
	
	
	_this.startApp = function(app, callback) {
		_this.app = app;
		
		// If auth is turned off, send right back
		if(!config.use_auth && callback){
			_this.app.booted = true;
			callback();
			return;
		}
			
			
		_this.callback = callback;
		if(!isset('gapi'))_this.callback();

		gapi.load('auth2', function(){
			// Retrieve the singleton for the GoogleAuth library and set up the client.
			_this.googleAuth = gapi.auth2.init({
				client_id: config.google.client_id,
				cookiepolicy: 'single_host_origin',
				// Request scopes in addition to 'profile' and 'email'
				//scope: 'additional_scope'
			});
			_this.googleAuth.then(function(){
				_this.init_fns();
				gapi.signin2.render('my-signin2', {
					'scope': 'profile email',
					'width': 120,
					'height': 38,
					'longtitle': false,
					'theme': 'dark',
					'onsuccess': _this.onSuccess,
					'onfailure': _this.onFailure
				});
				
			})
		});
	}
	
	_this.init_fns = function(){
		
		_this.setLoginListener();
	
		if (_this.googleAuth.isSignedIn.get() == false){
			_this.logged_out_buttons();		
			_this.app.show({name: 'login', data: {}});
		}
				
	}
    _this.onSuccess = function(googleUser) {
// 	    console.log('onSuccess called');
		var profile = googleUser.getBasicProfile();
		var user_profile = {};
		user_profile.email = profile.getEmail();
		user_profile.full_name = profile.getName();
		user_profile.first_name = profile.getGivenName();
		user_profile.last_name = profile.getFamilyName();
		user_profile.image_url = profile.getImageUrl();
		_this.user = googleUser;
		_this.signedIn = true;
		_this.logged_in_buttons();
/*
		console.log('Logged in as: ' + profile.getName());
        console.log("ID: " + profile.getId()); // Don't send this directly to your server!
        console.log('Full Name: ' + profile.getName());
        console.log('Given Name: ' + profile.getGivenName());
        console.log('Family Name: ' + profile.getFamilyName());
        console.log("Image URL: " + profile.getImageUrl());
        console.log("Email: " + profile.getEmail());
*/
        
        // The ID token you need to pass to your backend:
        var id_token = googleUser.getAuthResponse().id_token;
//        console.log("ID Token: " + id_token);

		_this.logins['accounts.google.com'] = googleUser.getAuthResponse().id_token;
		_this.params.Logins = _this.logins;
        AWS.config.region = 'us-east-1';
		
        AWS.config.credentials  = new AWS.CognitoIdentityCredentials(_this.params);
        
		AWS.config.credentials.get(function(err) {
			if (err) {
				console.log("Error: "+err);
				return;
			}
			_this.user_unique_id = AWS.config.credentials.identityId;
			user_profile.identity_id = _this.user_unique_id;
			
	        _this.app.s3 = new AWS.S3({
	            params: {
	                Bucket: config.bucket
	            }
	        });
	        _this.app.sync = new Sync;
	        
        	_this.app.user_path = 'u/' + _this.user_unique_id;

			_this.app.sync.put('dataset', 'profile', user_profile, function(error, data, newRecords){
				if(error){
					localStorage.error = "Your login identity has not been verified. Please contact support. Include the identity id: <pre class='mt-1'>" + _this.user_unique_id + "</pre>with your request to be added.";
					_this.app.booted = true;
					
					app.identity.signOut();
					return false;
				}
				else{
					_this.app.booted = true;
		        	
					_this.callback();
					
				}
				
			});
			
		});
		
        
        
    }

	_this.onFailure = function(error) {

		_this.logged_out_buttons();	

    	_this.app.booted = true;
    	
		_this.app.show( {name: 'login', data: {}});
	}

	
}
if(typeof module !== "undefined")
	module.exports = Identity;

