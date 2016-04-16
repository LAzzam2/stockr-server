'use strict';

var mongoose  = require( 'mongoose' );
var User      = mongoose.model( 'User' );
var WatchlistItems = mongoose.model( 'WatchlistItems' );
var Promise   = require( 'bluebird' );
Promise.promisifyAll( mongoose );
Promise.promisifyAll( User );
Promise.promisifyAll( User.prototype );

var config    = require( '../config/config.js' );
var validator = require( 'validator' );


var createNewWatchlistItem = function( userId, watchlistItem, watchlistItemLevels )
{
	return new Promise( function( resolve, reject )
	{
		WatchlistItems.createWatchlistItem( userId, watchlistItem, watchlistItemLevels )
		.then( function( newWatchlistItem )
		{
			User.findByIdAndUpdate(
			{
				'_id': userId
			},
			{
				$push:
				{
					'list': newWatchlistItem._id
				}
			},
			function( error, user )
			{
				if( error )
				{
					console.log( error );
					reject( error );
				}
				else
				{
					if( user )
					{
						resolve( { 'newWatchlistItem': newWatchlistItem } );
					}
					else
					{
						console.log( error );
						reject( { 'message': 'No user found.' } );
					}
				}
			} );
		} );
	} );
};

var updateWatchlistItem = function( watchlistItemId, watchlistItemValue, watchlistItemLevels )
{
	// console.log( 'updateListItem', listItemId, listItemValue );

	return new Promise( function( resolve, reject )
	{
		WatchlistItems.findOneAndUpdate(
		{
			_id: watchlistItemId
		},
		{
			$set:
			{
				ticker: watchlistItemValue,
				levels: watchlistItemLevels
			}
		},
		{
			new: true
		},
		function( error, watchlistItem )
		{
			if( error )
			{
				console.log( error );
				reject( error );
			}
			else
			{
				console.log( watchlistItem );
				if( watchlistItem )
				{
					resolve( { 'updatedListItem': watchlistItem } );
				}
				else
				{
					reject( { 'message': 'No listItem found.' } );
				}
			}
		} );
	} );
};

exports.upsertWatchlistItem = function( userId, watchlistItem, watchlistItemValue, watchlistItemId, watchlistItemLevels )
{
	// console.log( 'upsertListItem', listItemId, listItemValue );

	return new Promise( function( resolve, reject )
	{
		if( watchlistItemId )
		{
			// Update an existing list item.
			updateWatchlistItem( watchlistItemId, watchlistItemValue, watchlistItemLevels )
			.then( function( updatedWatchlistItem )
			{
				resolve( updatedWatchlistItem );
			} )
			.catch( function( error )
			{
				reject( error );
			} );
		}
		else
		{
			// Create a new list item.
			createNewWatchlistItem( userId, watchlistItemValue, watchlistItemLevels )
			.then( function( newWatchlistItem )
			{
				resolve( newWatchlistItem );
			} )
			.catch( function( error )
			{
				reject( error );
			} );
		}
	} );
};

exports.deleteWatchlistItem = function( req, res, next )
{
	var watchlistItem      = req.body.watchlistItem;
	var watchlistItemValue = watchlistItem.ticker;
	var watchlistItemId    = watchlistItem._id;
	var watchlistItemLevels    = watchlistItem.levels;

	return new Promise( function( resolve, reject )
	{
		WatchlistItems.findOneAndRemove(
		{
			'_id': watchlistItemId
		},
		function( error )
		{
			if( error )
			{
				console.log( error );
				reject( error );
			}
			else
			{
				resolve(  );
			}
		} );
	} );
};

exports.getWatchlist = function( userId )
{
	return new Promise( function( resolve, reject )
	{
		WatchlistItems.find(
		{
			user: userId
		},
		function( error, watchlistItems )
		{
			if( error )
			{
				console.log( error );
				reject( error );
			}

			resolve( watchlistItems );
		} );
	} );
};

exports.getCommunityWatchlist = function( )
{
	return new Promise( function( resolve, reject )
	{
		WatchlistItems.find(
		{
		},
		function( error, watchlistItems )
		{
			if( error )
			{
				console.log( error );
				reject( error );
			}

			resolve( watchlistItems );
		} );
	} );
};
