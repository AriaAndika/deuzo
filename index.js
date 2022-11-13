import { listen } from "./core/router.js";
import { readFile } from "fs/promises";
import { readdirRecursive } from "./core/utility.js";

// todo: error handling

process.error = er => `<h1>404 Not Found !</h1><p>${er}</p>` // await readFile('src/404.html').catch(()=>`<h1>404 Not Found !</h1>`);
process.template = await readFile(`src/template.html`,'utf-8');
process.meta = JSON.parse( await readFile('deuzo.json','utf-8') )

// serving public
if (process.meta.public){
	process.public = await readdirRecursive(process.meta.public);
}




listen(process.env.PORT, p => console.log(`listening in ${p}...`))