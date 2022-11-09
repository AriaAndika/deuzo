import { listen } from "./server/router.js";
import { readFile } from "fs/promises";
import { readdirRecursive, If } from "./server/utility.js";

// todo: error handling

process.error = er => `<h1>404 Not Found !</h1><p>${er}</p>` // await readFile('src/404.html').catch(()=>`<h1>404 Not Found !</h1>`);
process.template = await readFile(`src/template.html`,'utf-8');
process.meta = JSON.parse( await readFile('deuzo.json','utf-8') )

// serving public
if (process.meta.public){
	process.public = await readdirRecursive(process.meta.public);
}
// If(process.meta.public, dir => process.public = readdirRecursive(dir) )




listen(process.env.PORT, p => console.log(`listening in ${p}...`))