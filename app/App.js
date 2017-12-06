const Identity = require('./Identity');
const config = require('./config');
const Navigo = require('navigo');
const g3n1us_helpers = require('g3n1us_helpers');
const ElementaryModel = require('g3n1us_elementary_model');
console.log('ElementaryModel', ElementaryModel)
// const Model = App;
const Handlebars = require('handlebars');
// const views = require('./precompiled_views');
const $ = require('jquery');
const misc = require('./misc');
const path = require('path');


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
		this.navigo.hooks({
		  before: (done, params) => {
			  let handler = this.app.beforePageChangeHandler || window.beforePageChangeHandler;
			  if(typeof handler === 'function')
				  handler();
			  done();
			  
		  },
		  after: (params) => {
			  let resolved = this.navigo.lastRouteResolved();
  			if(resolved[1] === '/')  resolved = resolved.slice(1);
			  // Set active class on nav links
			  console.log(resolved);
			  if(this.app.config.auto_link_nav){
					$('nav, .nav').find('.active').removeClass('active');
					$('nav, .nav').find('[href="'+resolved.url+'"], [href="'+resolved.url+'/"]').addClass('active');				  
			  }

			  let handler = this.app.afterPageChangeHandler || window.afterPageChangeHandler;
			  if(typeof handler === 'function')
				  handler();				
		  }
		});
		
//     return new Proxy(this, this);
	}
	
	route(){
		var args = Array.from(arguments);
		
		if(args.length === 0 || typeof args[0] === 'function'){
			console.log(this.app.route_handlers);
			// it is the default route, so the first argument is a callback with the query as a single argument
			var callback = ('home' in this.app.route_handlers) ? this.app.route_handlers.home : args[0];
			this.navigo.on((query) => {
				this.data.query = parseQuery(query);
				if(typeof callback === 'function')
					callback(this);
				else{
					if('home' in this.app.templates) {
						this.app.view = {
							name: 'home',
						}
						return;
					}
				}
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
	
	navigate(arg1, arg2){
		this.navigo.navigate(arg1, arg2);					
	}
	
	link(path){
		return this.navigo.link(path);
	}
	
}

var App = function(user_config){
	for(var i in user_config)
		config[i] = user_config[i];
		
	var _this = this;
	
	_this.config = config;

	_this.identity = new Identity();
	
	_this.Model = ElementaryModel.Model;
	
	_this.router = new Router(config.root_path, config.use_hash, config.hash_prefix, _this);
	
	_this.logged_in = _this.identity.logged_in || _this.identity.user !== null;
	
	if(config.use_editor)
		_this.editor = new Editor;
		
	_this.view = {
		name: 'loading',
		data: {},
	}
	
	_this.handlebars = Handlebars;
	
	_this.jquery = $;
	
	_this.addTemplate = function(name, path){
		_this._templates = _this._templates || [];
		var tpl_promise = new Promise((resolve, reject) => {
			$.get(path).then(data => {
				resolve({name: name, data: data});
			});
		});
		_this._templates.push(tpl_promise);
		//	below won't work 
		// 	return _this.handlebars.compile(require(path.resolve(__dirname, required_path)));
	}
	
	_this.booted = false;
	
	_this.current_project = null;
	
	_this.published = false;
	
	_this.show = function(view){
		if(typeof window !== "undefined"){
			view.container = view.container || config.containing_element;
			if(!$(view.container).length){
				let el = document.createElement('div');
				el.id = config.containing_element.replace('#', '');
				var $t = $(el);
				$t.prependTo('body');
				console.warn("Heads up! The containing element for Elementary wasn't there, so I made one and prepended ", el, " to document.body.");
			}
			else
				var $t = $(view.container);
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
		_this._templates = _this._templates || [];
		Promise.all(_this._templates).then(t => {
			t.forEach(v => {
				_this.templates[v.name] = _this.handlebars.compile(v.data);
			});
			_this.router.resolve();
			if(typeof callback === 'function') callback(_this);
			return Promise.resolve(_this);
		});
	}
	
	_this.save = function(redirect){
		localStorage.redirectTo = redirect || window.location.hash;
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
	window.Elementary = App;


if(typeof module !== "undefined")
	module.exports = App;
