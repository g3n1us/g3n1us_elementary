const path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'Elementary.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: "umd",
		library: "Elementary"    
  },
	resolve:
		{
		alias: {
		  'handlebars' : 'handlebars/dist/handlebars.min.js'
		}
	}
};
