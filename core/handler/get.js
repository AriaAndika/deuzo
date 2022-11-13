import { IncomingMessage, ServerResponse } from "http";
import { readFile } from "fs/promises";
import { parser } from "../mediator.js";


/** 
 * @param {ServerResponse} res 
 * @param {Head} data
 */
export async function getHandler(res,data) {
	// console.log(data)
	
	//!================================IMPORTING================================
	// import js
	/** @type {{html?,css?}} */ 
	const js = await import(`../../pages${data.rewrite || data.path}/index.js`)
	.then( e => e.default( data ))
	.catch(()=>{});
	
	// import html and css
	/** @type {{html: string, css: string, head: string}} */
	let {html, css, head} = {
		html: await readFile(`pages${data.rewrite || data.path}/index.html`,'utf-8').catch(()=>{data.status=400;return process.error(`Page not exist. Failed read html`)}),
		css: 	await readFile(`pages${data.rewrite || data.path}/index.css`,'utf-8').catch(()=>''),
		head: ''
	}
	
	//!================================PARSING================================
	//! html preprocess
	if (js?.data) html = parser.parseHTML(html, js.data);
	
	//! embedded css and head in the html
	{
		const styleTag = html.match(/<style>[\s\S]+<\/style>/g)?.join('') || false;
		const headTag = html.match(/<head>[\s\S]+<\/head>/g)?.join('') || false;
		if (styleTag){
			css = css.concat( styleTag.replace(/<\/*style>/g,'') ).replace(/[\n\r\t]/g,'');
			html = html.replace(styleTag,'');
		}
		css = `<style>${css}</style>`;
		if (headTag){
			head = head.concat( headTag.replace(/<\/*style>/g,'') ).replace(/[\n\r\t]/g,'');
			html = html.replace( headTag, '');
		}
	}
	
	
	//!================================FINISHING================================
	res.setHeader('Content-Type',data.type);
	res.writeHead(data.status);
	res.end(
		process.template
		.replace(/<!--\s*@body\s*-->/,html)
		.replace(/<!--\s*@head\s*-->/,head.concat(css) || '')
	);
}