import { Dirent } from "fs";
import { readdir } from "fs/promises";


/** @param {string} url */
export function parseUrl(url) {
	url = url != '/' && url.endsWith('/') ? url.substring(0,url.length-1) : url;	
	const path = url.match(/.+(?=\?)/)?.[0] || url;
	const query = {};
	const parseQuery = q => {
		const [k,v] = q.split('=');
		query[k] = v;
	}
	
	url.match(/(?<=\?).+/)?.[0].split('&').forEach( parseQuery );
	return {url,path,query}
}


/** @param {boolean} condition @param {Function?} calltrue @param {Function?} callfalse */
export function If(condition,calltrue,callfalse) {
	if (condition) 
		return calltrue?.(condition) ?? true;
	else 
		return callfalse?.() ?? false;
}
/** if async will always return void 
 * @param {boolean} condition 
 * @param {Function} calltrue 
 * @param {Function?} callfalse */
export async function IfAsync(condition,calltrue,callfalse) {
	if (condition) 
		return await calltrue(condition);
	else 
		return await callfalse?.();
}


/** @param {string} dir */
export async function readdirRecursive(dir) {
	
	let out = []
	const roots = await readdir(dir,{withFileTypes:true});
	
	for (let i = 0; i < roots.length; i++) {
		await isdir(roots[i],`${dir}/`);
	}
	
	
	/** @param {Dirent} file */
	async function isdir(file,append = '') {
		const fulldir = `${append}${file.name}`
		out.push(fulldir.replace(`${dir}`,''));
		
		if (!file.isDirectory()) return;
		
		const roots2 = await readdir(fulldir,{withFileTypes:true});
		for (let i = 0; i < roots2.length; i++) {
			await isdir(roots2[i],`${fulldir}/`);
		}
	}
	
	return out;
}

/** @param {Array} ar */
export function arLast(ar) {
	return ar[ar.length-1];
}