import { existsSync, writeFileSync, unlinkSync } from 'fs';
var path = require('path');
import webpack from 'webpack';

import Express from 'express';
import webpackDevMiddleware from 'webpack-dev-middleware';

debugger;
const PORT = 8080;
const ROOT_PATH = process.cwd();
const SRC_PATH = 'src';
const REDIRECT_RULES = {
	"/": "/devtools.vm",
	"/devtools.html": "/devtools.vm",
	"/background.html": "/devtools-background.vm"
};
const DEV_CONFIG = {
	path: {
		root: ROOT_PATH,
		templates: path.resolve(ROOT_PATH, "network", "templates")
	}
};

const webpackConfig = require('./webpack.config.js');
const compiler = webpack(webpackConfig);
const webpackDevMiddlewareInstance = webpackDevMiddleware(compiler, {
	contentBase: SRC_PATH,
	quiet: false,
	noInfo: false,
	hot: true,
	inline: true,
	lazy: false,
	publicPath: webpackConfig.output.publicPath,
	headers: { 'Access-Control-Allow-Origin': '*' },
	stats: { colors: true }
});

const app = new Express();
app.use(webpackDevMiddlewareInstance);
// 转发html
var Engine = require('velocity').Engine;
app.use(async (req, res, next) => {
	// 设置转发
	var templateRuleNames = Object.keys(REDIRECT_RULES)
		.filter(ruleName => REDIRECT_RULES[ruleName].endsWith('.vm'));
	var ruleName = templateRuleNames.find(ruleName => {
		return ruleName === req.url;
	});
	if(ruleName) {
		var engine = new Engine({
			template: DEV_CONFIG.path.templates+ REDIRECT_RULES[ruleName]
		});
		res.end(engine.render({
			test: 'Hello World!'
		}));
		next();
	} else {
		next();
	}

});

app.listen(PORT, (err) => {
	if (err) {
	  console.error(err);
	} else {
	  console.info('==> 🚧  Listening on port %s\n', PORT);
	}
});