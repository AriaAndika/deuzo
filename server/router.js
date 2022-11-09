import { createReadStream } from "fs";
import { readFile } from "fs/promises";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { parseUrl, If } from "./utility.js";
import { parseHTML } from "./parser.js";


export function listen(port = 4040, callback){
	createServer((req,res) => {
		if (req.method == 'GET') 
			get(req,res)
	}).listen(port, callback?.(port))
}

/**
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 */
async function get(req,res) {
	if (req.url == "/favicon.ico") {res.end("eat this");return;}
	
	let isDone = false;
	let status = 200;
	let rewrite = ''
	
	// parsing url
	let {query,path} = parseUrl(req.url);
	
	// config`s rewrite
	process.meta.rewrite.every( ([from,to]) => {
		let b = false;
		if (from.match(/(\*\*|:)/) && path.match( RegExp( from.replace('**','.+') )))
			b = true;
		else
			b = path == from;
		rewrite = b ? to : '';
		return !b;
	})
	console.log(path)
	If( process.public?.find( e => e == path), e =>{
		isDone = true;
		async function _get() {
			var s = createReadStream(`${process.meta.public}${path}`);
			s.on('open', function () {
				res.setHeader('Content-Type', `image/jpeg`);
				s.pipe(res);
			});
			// res.setHeader(`Content-Type`,`image/jpeg`);
			// res.end( await readFile(`${process.meta.public}${path}`) )
		}
		_get(path);
	})
	
	//!================================IMPORTING================================
	if (isDone) return;
	
	// import js
	/** @type {{html?,css?}} */ 
	const js = await import(`../pages${rewrite || path}/index.js`).then( e => e.default({query,path}) ).catch(()=>{});
	
	// import html and css
	/** @type {{html: string, css: string}} */
	let {html, css} = {
		html: await readFile(js?.html || `pages${rewrite || path}/index.html`,'utf-8').catch(()=>{status=400;return process.error(`Page not exist`)}),
		css: 	await readFile(js?.css || `pages${rewrite || path}/index.css`,'utf-8').catch(()=>'')
	}
	
	//!================================PARSING================================
	// html preprocess
	if (js?.data){
		html = parseHTML(html, js.data);
	}
	
	// embedded css in the html
	{
		const styleTag = html.match(/<style>[\s\S]+<\/style>/g)?.join('') || false;
		if (styleTag){
			css = css.concat( styleTag.replace(/<\/*style>/g,'') ).replace(/[\n\r\t]/g,'')
			html = html.replace(styleTag,'')
		}
	}
	
	
	//!================================FINISHING================================
	res.writeHead(status);
	res.end(
		process.template.replace(/\/\*\s*@head\s*\*\//,css || '').replace(/<!--\s*@body\s*-->/,html)
	);
}