const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

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
	},
  plugins: [
    new UglifyJsPlugin()
  ],	
};
