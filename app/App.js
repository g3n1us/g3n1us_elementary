const Identity = require('./Identity');
const config = require('./config');
const Navigo = require('navigo');
const g3n1us_helpers = require('g3n1us_helpers');
const Handlebars = require('handlebars');
// const views = require('./precompiled_views');
const $ = require('jquery');
const misc = require('./misc');

/*
if(!window.location.hash.length)
	window.location.hash = '';
*/


class Router{
	constructor(root, useHash, hash, app){
		this.navigo = new Navigo(root, useHash, hash, app);
		this.app = app;
		this.data = {
			query: {},
			params: {},
		}
		this.query = this.data.query;
		this.params = this.data.params;
//     return new Proxy(this, this);
	}
	
	route(){
		var args = Array.from(arguments);
		
		if(args.length === 0 || typeof args[0] === 'function'){
			// it is the default route, so the first argument is a callback with the query as a single argument
			var callback = ('home' in this.app.route_handlers) ? this.app.route_handlers.home : args[0];
			this.navigo.on((query) => {
				this.data.query = parseQuery(query);
				callback(this);
			});				
		}
		else if(args.length === 1){
			if(typeof args[0] === 'string'){
				// it is a static route, so the first argument is the name of the path. Derive the rest automatically
				this.navigo.on(args[0], (params, query) => {
					this.data.query = parseQuery(query);
					this.data.params = params || {};
					let routestring = args[0].replace(/\/?:.*\/?/g, '.').split('.').filter(function(v){
						return v.length;
					}).join('.');
					
// 					let template = (routestring in this.app.templates) ? this.app.templates[routestring] : this.app.templates.default;
					let handler = (routestring in this.app.route_handlers) ? this.app.route_handlers[routestring] : false;
					console.log(this.app.route_handlers)
					if(handler) return handler(this);
					
					if(routestring in this.app.templates) {
						this.app.view = {
							name: routestring,
						}
						return;
					}
				});
			}
		}
		else if(args.length === 2){
			// it is a normal route, so the first argument is a callback with the query as a single argument
			this.navigo.on(args[0], (params, query) => {
				this.data.query = parseQuery(query);
				this.data.params = params || {};
				args[1](this);
			})
		}
	}
	
	resolve(){
		this.navigo.resolve();
	}
	
	notFound(handler){
		this.navigo.notFound(handler);
	}
	
}

var App = function(){
	var _this = this;

	_this.identity = new Identity();
	
	_this.router = new Router(config.root_path, true, '#', _this);
	
	_this.logged_in = _this.identity.logged_in || _this.identity.user !== null;
	
	if(config.use_editor)
		_this.editor = new Editor;
		
	_this.view = {
		name: 'loading',
		data: {},
	}
	
	_this.handlebars = Handlebars;
	
	_this.booted = false;
	
	_this.current_project = null;
	
	_this.published = false;
	
	_this.show = function(view){
		if(typeof window !== "undefined"){
			var $t = view.container ? $(view.container) : $('#main');
			var $v = _this.templates[view.name](view.data);
	
			$t.html($v);
		}
		else return false;
	}
	
	_this.signOut = function(){
		_this.identity.signOut();
		_this.view = {name: 'login'}
	}
	
	_this.g3n1us_watch('view', function(prop, oldval, newval){
		if(_this.booted)
			_this.show(newval);
	});
	
	_this.templates = {};
	
	_this.route_handlers = {};
	
/*
	_this.getTemplates = function(){
		_this.templates = _this.templates || {};
		for(var i in _this.templates){
			if(!_this.templates[i.replace('.hbs', '')])
				_this.templates[i.replace('.hbs', '')] = _this.templates[i];
		}
	}
	
	_this.getTemplates();
*/
	
	_this.g3n1us_watch('templates', function(prop, oldval, newval){
		console.log(prop, oldval, newval);
// 		_this.getTemplates()
	});
		
	_this.run = function(callback){
		_this.identity.startApp(_this, callback || function(){});
		return _this;
	}
	
	_this.save = function(redirect){
		localStorage.redirectTo = redirect ? redirect : window.location.hash;
		$('form').submit();
	}
	
	_this.not_found = function(query){
		alert('Not Found');
	}
	
	_this.user_path = 'u/' + _this.identity.user_unique_id;
	
	if(typeof document !== "undefined"){
		$(document).on('click', '.signout', function(){
			_this.identity.signOut(); 
			_this.signOut();
		});
		
/*
		$(document).on('submit', 'form', function(e){
			e.preventDefault();
			var method = $(this).attr('method');
	
			var formdata = g3n1us_helpers.form2Object($(this));
	
			if(app.currentroute.formCallback){
				app.currentroute.formCallback(formdata);
			}
		});		
*/
	}

if(typeof window !== "undefined"){
	for(var i in misc){
		window[i] = misc[i];
	}
}
	
	// Set up default routes for application, these can be overridden, but serve as a minimum starting point.
/*
	_this.router.on(':hello', function(params, query){
		console.log(params, query);
		_this.show({name: 'default', data: {query: misc.parseQuery('?'+query) || {}, params: params}});
	});
	
	_this.router.on(function(query){
		console.log(query);
		_this.show({name: 'home', data: {query: misc.parseQuery('?'+query) || {}, params: {}}});
	});
*/
	
/*
	_this.router.notFound(function (query) {
		alert('not found');
	});	


	var resolved = _this.router.resolve();
	console.log(resolved);
	
*/
}

if(typeof window !== "undefined")
	window.App = App;


if(typeof module !== "undefined")
	module.exports = App;
