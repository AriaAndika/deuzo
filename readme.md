# Routing 🚄
Routing are based on file system, url will point to a folder.
- Create index.html to serve a page
- Create index.css to add css to the corresponding page
- Create index.js to execute server side code

Public folder are prioritized over pages.
Redirect and rewrite can be configured in deuzo.json
{
	"rewrite" : [
		["/", "/home"],
		["/feedback/**", "/feedback"]		// will rewrite any link after '/feedback'
	],
	"redirect" : []		// same format as rewrite
}

# Folder rule 📂

## public
Put all public files in public folder in the root directory.
Public files are prioritized over pages.
You can custom the public folder name in deuzo.json config with "public" key.

## src
This is a folder to store misc files. 
In this folder, there is restriction name:
- index.js
this file will executed at server startup
- 404.html
will be served when an error occur
- template.html
template will be merged with the served html before send as response

# Pages rule 📃
The files inside pages directory have a specific rules to follow.

## JS
Javascript must have a default export function and could have a return of object with following schema:
{
	"data" : {
		"counter" : "10"					// datas that will replace corresponding name in html processing
	},
	"dependencies" : ["client"]	// a client side dependencies from public directory
}

## HTML