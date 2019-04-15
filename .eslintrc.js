module.exports = {
	extends : 'airbnb-base',
	env     : {
		browser : true,
		node    : true
	},
	rules   : {
		'linebreak-style'      : 0, // <----------
		'prefer-const'         : [
			'error',
			{
				destructuring          : 'any',
				ignoreReadBeforeAssign : false
			}
		],
		'comma-dangle'         : [ 'error', 'never' ],
		indent                 : [ 2, 'tab' ],
		'key-spacing'          : [
			2,
			{
				singleLine : {
					beforeColon : false,
					afterColon  : true
				},
				multiLine  : {
					beforeColon : true,
					afterColon  : true,
					align       : 'colon'
				}
			}
		],
		'no-tabs'              : [ 'error', { allowIndentationTabs: true } ],
		'one-var'              : [ 'error', 'consecutive' ],
		'no-underscore-dangle' : [ 'error', { allow: [ '_id' ] } ],
		'arrow-parens'         : [ 'error', 'as-needed' ],
		'max-len'              : [ 'error', { code: 125 } ],
		'no-plusplus'          : [ 'error', { allowForLoopAfterthoughts: true } ],
		'object-curly-newline' : [
			'error',
			{
				ImportDeclaration : 'never',
				ExportDeclaration : { multiline: true, minProperties: 3 }
			}
		]
	}
};
