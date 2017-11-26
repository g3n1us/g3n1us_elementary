# g3n1us_elementary
A super-simple frontend framework for 90% of your projects.

Most frameworks do everything, but most of the time our projects leave a lot of leftovers. If you grit your teeth every time you see a Wordpress site with only a few pages, this is for you. 

Elementary is intended to enforce the fundamentals, while turbo charging your dev team. It intends to stay simple, while allowing your team to stay productive.

## Install

via NPM
```
npm install --save g3n1us_elementary
```

or Download the compiled file [HERE](https://raw.githubusercontent.com/g3n1us/g3n1us_elementary/master/dist/Elementary.js)

## Getting Started

Add a route to your application
```javascript

// Set some options; defaults are shown below
var config = {
	development: true,
	containing_element: '#elementary_container', // this is the element that the app will load into. If it doesn't exist, it will be prepended to 'body'
	use_hash: true, // Use hash based URIs instead of popstate
	hash_prefix: '#'
}

// instantiate the application, passing the configuration as an argument
var app = new Elementary(config);

// Elementary includes jQuery and Handlebars.js, so you can use them as you normally would by adding them to the global scope
window.$ = app.jquery;
window.Handlebars = app.Handlebars;

// Add a route to your home page
app.addTemplate('home', './handlebars/home.hbs');
// Elementary uses Navigo.js as it's router. Calling route() with no arguments sets the home page. The 'home' template and/or the 'home' route handler will be used automatically along with the state taken from the url.
app.router.route();

// Adding a second route is just as easy. Again templates and handlers are derived from the url and used automatically.
app.addTemplate('birds', './handlebars/birds.hbs');
app.router.route('birds'); // responds to "/birds"

// Finally, call "run()" and your are all set.
app.run();


// You might want to handle links automatically. Here's an example of how to do this.
$(document).on('click', '[href]', function(e){
	var l = $(e.target);			
	var routestring = l.attr('href');
	app.router.navigate(routestring);
	
	e.preventDefault();
});

```

## Thanks to:
- [Navigo.js](https://github.com/krasimir/navigo)
- [Handlebars.js](http://handlebarsjs.com/)
