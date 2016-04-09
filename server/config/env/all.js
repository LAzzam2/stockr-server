'use strict';

var path = require( 'path' );
var os = require( 'os' );

var rootPath = path.normalize( path.join( __dirname, '/../../..' ) );

module.exports =
{
	root: rootPath,
	port: process.env.NODE_PORT,
	hostname: process.env.NODE_HOST,
	sessionSecret: process.env.SESSION_SECRET,
	dbUri: process.env.DB_URI,

	baseUrl: function(  )
	{
		var ss = 'https://';
		if( process.env.NODE_ENV === 'development' )
		{
			ss = 'http://';
		}
		return ss + this.hostname;
	},

	mongo:
	{
		uri: process.env.DB_URI,  // Setup Config (!)
		options:
		{
			db:
			{
				safe: true
			}
		}
	}
};
