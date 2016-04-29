'use strict';

var mongoose  = require( 'mongoose' );
var User      = mongoose.model( 'User' );
var WatchlistItems = mongoose.model( 'WatchlistItems' );
var Promise   = require( 'bluebird' );
// Promise.promisifyAll( mongoose );
// Promise.promisifyAll( User );
// Promise.promisifyAll( User.prototype );

var config    = require( '../config/config.js' );
var validator = require( 'validator' );
var _ = require('lodash');
var util = require('util');
var yahooFinance = require('yahoo-finance');;



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

			var FIELDS = _.flatten([
				// Pricing
				['a', 'b', 'b2', 'b3', 'p', 'o'],
				// Dividends
				['y', 'd', 'r1', 'q'],
				// Date
				['c1', 'c', 'c6', 'k2', 'p2', 'd1', 'd2', 't1'],
				// Averages
				['c8', 'c3', 'g', 'h', 'k1', 'l', 'l1', 't8', 'm5', 'm6', 'm7', 'm8', 'm3', 'm4'],
				// Misc
				['w1', 'w4', 'p1', 'm', 'm2', 'g1', 'g3', 'g4', 'g5', 'g6'],
				// 52 Week Pricing
				['k', 'j', 'j5', 'k4', 'j6', 'k5', 'w'],
				// System Info
				['i', 'j1', 'j3', 'f6', 'n', 'n4', 's1', 'x', 'j2'],
				// Volume
				['v', 'a5', 'b6', 'k3', 'a2'],
				// Ratio
				['e', 'e7', 'e8', 'e9', 'b4', 'j4', 'p5', 'p6', 'r', 'r2', 'r5', 'r6', 'r7', 's7'],
				// Misc
				['t7', 't6', 'i5', 'l2', 'l3', 'v1', 'v7', 's6', 'e1']
			]);

			var SYMBOLS = [
			];

			function buildSymbolArray(element, index, array) {
			  SYMBOLS.push(element.ticker);
			}

			// Notice that index 2 is skipped since there is no item at
			// that position in the array.
			watchlistItems.forEach(buildSymbolArray);
		
			yahooFinance.snapshot({
			  fields: FIELDS,
			  symbols: SYMBOLS
			}).then(function (result) {
			  _.each(result, function (snapshot, symbol) {
			    // console.log(util.format('=== %s ===', symbol).cyan);
			    // console.log(watchlistItems);

				function setTickerPrice(element, index, array) {
					if(element.ticker == snapshot.symbol){
						element.quote.push( snapshot );
					}
				}

				watchlistItems.forEach(setTickerPrice)
			  });
			}).then(function (result) {
				resolve( watchlistItems );
			});

			
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
			var FIELDS = _.flatten([
				// Pricing
				['a', 'b', 'b2', 'b3', 'p', 'o'],
				// Dividends
				['y', 'd', 'r1', 'q'],
				// Date
				['c1', 'c', 'c6', 'k2', 'p2', 'd1', 'd2', 't1'],
				// Averages
				['c8', 'c3', 'g', 'h', 'k1', 'l', 'l1', 't8', 'm5', 'm6', 'm7', 'm8', 'm3', 'm4'],
				// Misc
				['w1', 'w4', 'p1', 'm', 'm2', 'g1', 'g3', 'g4', 'g5', 'g6'],
				// 52 Week Pricing
				['k', 'j', 'j5', 'k4', 'j6', 'k5', 'w'],
				// System Info
				['i', 'j1', 'j3', 'f6', 'n', 'n4', 's1', 'x', 'j2'],
				// Volume
				['v', 'a5', 'b6', 'k3', 'a2'],
				// Ratio
				['e', 'e7', 'e8', 'e9', 'b4', 'j4', 'p5', 'p6', 'r', 'r2', 'r5', 'r6', 'r7', 's7'],
				// Misc
				['t7', 't6', 'i5', 'l2', 'l3', 'v1', 'v7', 's6', 'e1']
			]);

			var SYMBOLS = [
			];

			function buildSymbolArray(element, index, array) {
			  SYMBOLS.push(element.ticker);
			}

			// Notice that index 2 is skipped since there is no item at
			// that position in the array.
			watchlistItems.forEach(buildSymbolArray);
		
			yahooFinance.snapshot({
			  fields: FIELDS,
			  symbols: SYMBOLS
			}).then(function (result) {
			  _.each(result, function (snapshot, symbol) {
			    // console.log(util.format('=== %s ===', symbol).cyan);
			    // console.log(watchlistItems);

				function setTickerPrice(element, index, array) {
					if(element.ticker == snapshot.symbol){
						element.quote.push( snapshot );
					}
				}

				watchlistItems.forEach(setTickerPrice)
			  });
			}).then(function (result) {
				resolve( watchlistItems );
			});

		} );
	} );
};
