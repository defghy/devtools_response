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
	"/background.html": "/devtools-background.vm",

	"/api$": "http://smarthotel.beta.qunar.com/api",
	'^/bind/(.*)$':  `http://smarthotel.beta.qunar.com/bind/$1`,
	'^/push/(.*)$':  "http://smarthotel.beta.qunar.com/push/$1"
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

// 转发api
var httpProxy = require('http-proxy').createProxyServer({});
var _url = require('url');
app.use(async (req, res, next) => {
	// 设置转发
	var ruleNames = Object.keys(REDIRECT_RULES)
		.filter(ruleName => !REDIRECT_RULES[ruleName].endsWith('.vm'));
	var ruleName = ruleNames.find(ruleName => {
		return ruleName === req.url || new RegExp(ruleName).test(req.url);
	});
	if(ruleName) {
		var target = REDIRECT_RULES[ruleName];
		target = target.replace('$1', new RegExp(ruleName).exec(req.url)[1] || '');
		target = _url.parse(target);
		req.url = target.path;
		httpProxy.web(req, res, {
          target: `${target.protocol}//${target.host}`,
          changeOrigin: true
        }, function (e) {
          // 连接服务器错误
          res.writeHead(502, { 'Content-Type': 'text/html' });
          res.end(e.toString());
        });
		//next();
	} else {
		next();
	}

});


var server = require('http').createServer(app);
server.on('upgrade', function (req, socket, head) {
  debugger;
  httpProxy.ws(req, socket, head, {
  	target: 'ws://smarthotel.beta.qunar.com',
  	changeOrigin: true
  });
});
server.listen(PORT, (err) => {
	if (err) {
	  console.error(err);
	} else {
	  console.info('==> 🚧  Listening on port %s\n', PORT);
	}
});