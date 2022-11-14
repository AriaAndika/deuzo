
/**
 * @param {Head} data
 */
export default function({ path }) {
	
	return {
		data : {
			path,
			re : [
				{title : "Nice",description : "set"},
				{title : "Foo",description : "bar"},
				{title : "get",description : "set"}
			],
			sp : [
				1,3,5,7
			],
			ar : [
				['12','34'],
				['56','78'],
				['90','12'],
			]
		}
	}
}