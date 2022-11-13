import { createServer } from "http";
import { createReadStream } from "fs";
import { handler } from "./mediator.js";
import { If, parseUrl } from "./utility.js";

export function listen(port = 4040, callback){
	const app = createServer((req,res) => {
		let isDone = false;
		
		//! storing data
		/** @type {Head} */
		const data = {status: 200, rewrite: '', type: 'text/html',...parseUrl(req.url)};
		
		//! config`s rewrite
		process.meta.rewrite?.every(([ rewriteFrom,rewriteTo ]) => {
			const isReg = If(rewriteFrom.match(/\*\*/));
			const isrewrites = If(data.path.match( RegExp( rewriteFrom.replace('**','[^\/\s]+?') )));
			// if rewrite contain regex
			if (isReg && isrewrites) data.rewrite = rewriteTo;
			// if regular rewrite
			else data.rewrite = data.path == rewriteFrom ? rewriteTo : '';
			// if isRewrite, set rewrite
			return data.path != rewriteFrom;
		})
		
		//! serve public
		If( process.public?.find( e => e == data.path), e =>{
			isDone = true;
			async function _get() {
				var s = createReadStream(`${process.meta.public}${data.path}`);
				s.on('open', function () {
					let format = data.path.split('.');
					res.setHeader('Content-Type', mediaTypes[format[format.length-1]]);
					s.pipe(res);
				});
			}
			_get(data.path);
		});
		
		if (isDone) return;
		//! get request
		else if (req.method == 'GET') 
			handler.getHandler(res,data);
			
		// post request
			
	});
	
	app.listen(port, callback?.(port));
}

export const mediaTypes = {
	// app
	js : `application/javascript`,
	json : `application/json`,
	urlencoded : `application/x-www-form-urlencoded`,
	// img
	gif : `	image/gif`,
	jpg :  `image/jpeg`,
	png : `image/png`,
	ico : 'image/vnd',
	// txt
	css : `text/css`,
	csv : `text/csv`,
	html : `text/html`,
	plain : `text/plain`,
	xml : `text/xml`,
	// vid
	mpeg : `video/mpeg`,
	mp4 : `video/mp4`
}