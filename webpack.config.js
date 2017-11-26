module.exports = {
  entry: './index.js',
  output: {
    filename: 'dist/Elementary.js'
  },
	resolve:
		{
		alias: {
		  'handlebars' : 'handlebars/dist/handlebars.min.js'
		}
	}
};
