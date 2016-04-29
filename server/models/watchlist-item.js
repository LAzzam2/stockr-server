'use strict';

var mongoose  = require( 'mongoose' );
var Schema    = mongoose.Schema;
var utilities = require( '../utilities/utilities' );



// -------------------+
// Watchlist Item Schema.  |
// -------------------+

var WatchlistItemSchema = new Schema( {

	_id: String,
	user: String,
	ticker: String,
	levels: Array,
	quote: Array,

} );


var saveWithPromise = function( watchlistItem )
{
	var promise = new mongoose.Promise( );

	watchlistItem.save( function( error, savedWatchlistItem )
	{
		if( error )
		{
			promise.reject( error );
		}
		else
		{
			promise.fulfill( savedWatchlistItem );
		}
	} );

	return promise;
};




// ---------+
// Methods  |
// ---------+

WatchlistItemSchema.statics =
{
	blankWatchlistItem: function(  )
	{
		console.log( 'watchlistItem.newWatchlistItem(  )' );

		var newWatchlistItem = new this(  );

		// Encrypt user ID.
		newWatchlistItem._id = utilities.newEncryptedId(  );

		return newWatchlistItem;
	},

	createWatchlistItem: function( user, tickerName, levels )
	{
		console.log( 'User.register(  );', levels );

		var newWatchlistItem = this.blankWatchlistItem(  );

		newWatchlistItem.user = user;
		newWatchlistItem.ticker = tickerName;
		newWatchlistItem.levels = levels;
		newWatchlistItem.quote = [];

		return saveWithPromise( newWatchlistItem );
	}
};

WatchlistItemSchema.methods =
{

};

module.exports = mongoose.model( 'WatchlistItems', WatchlistItemSchema );
