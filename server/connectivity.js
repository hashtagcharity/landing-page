exports.cleanSavedObject = function(obj, cleanFunc){
	if(obj)
		return exports.cleanObject( obj.toObject(), cleanFunc );
};
exports.cleanObject = function(obj, cleanFunc){
	if(obj){
		delete obj.__v; delete obj._id;

		if( cleanFunc )
			cleanFunc( obj );
	}
	return obj;
};
exports.cleanObjects = function(objs, cleanFunc){
	if(objs)
		global._.each( objs, function(element, index, list){
			exports.cleanObject(element, cleanFunc);
		});
	return objs;
};

exports.remove = function( model, selector, callback ){
	model.remove( selector, callback );
};

exports.store = function( Model, prototype, selector, options, cleanFunc, callback ){
	if( selector )
		Model.findOneAndUpdate( selector, prototype, options, function(err, obj){ callback(err, exports.cleanSavedObject(obj, cleanFunc) ); } );
	else
		new Model( prototype ).save( function(err, obj){ callback(err, exports.cleanSavedObject(obj, cleanFunc) ); } );
};

exports.cleanload = function( model, selector, callback ){
	model.findOne( selector ).exec( function (err, obj) {
		callback( err, obj );
	} );
};

exports.load = function( model, selector, mustPresent, cleanFunc, callback ){
	model.findOne( selector ).lean().exec( function (err, obj) {
		callback( (err || (mustPresent && !obj)) ? new Error('Record not found.' + JSON.stringify(selector) ) : null, exports.cleanObject(obj, cleanFunc) );
	} );
};

exports.loadAll = function( model, selector, projection, options, callback ){
	var query = model.find( selector, projection );

	if( options.limit )
		query = query.limit( options.limit );

	if( options.skip )
		query = query.skip( options.skip );

	if( options.sort )
		query = query.sort( options.sort );

	query.lean().exec( function (err, objs) {
		callback(err, exports.cleanObjects(objs, options.cleanFunc) );
	} );
};

function extend(obj, ext) {
	Object.keys( ext ).forEach( function(key) {
		obj[ key ] = ext[ key ];
	});
	return obj;
}

function buildUpSchema(db, name, model, validationRules, validator, ignoreFunction, schemagen ){
	var schema = schemagen.generate(
		extend( model, { uid: "", timestamp: 0 } ),

		validationRules,
		{ collection: name, ignoreFunction: ignoreFunction },
		{
			name: name, validator: validator, timeStamped: true, creationFunt: function(record){
				if(!record.uid)
					record.uid = global.clerobee.generate();
				return record;
			}
		}
	);
	db[ name ] = schema.model;
}

exports.buildUpSchemas = function(db, mongoose, schemagen, models, validator){
	var modelNames = [ 'Mail', 'User' ];
	global._.each( modelNames, function(name, index, list){
		buildUpSchema( db, name, models[name].dataModel, models[name].validation, validator, true, schemagen );
	});
};

exports.connectMongo = function(mongoose, options, schemagen, vindication, models, callback) {
	var host = process.env.MONGODB_DEVELOPMENT_HOST || options.host || 'localhost';
	var port = process.env.MONGODB_DEVELOPMENT_PORT || options.port || 27017;
	var poolSize = options.poolSize || 5;
	var user = process.env.MONGODB_DEVELOPMENT_USER || options.user;
	var pass = process.env.MONGODB_DEVELOPMENT_PASSWORD || options.pass;
	var dbName = process.env.MONGODB_DEVELOPMENT_DB || options.name || 'division';

	var uri = 'mongodb://' + (user ? user + ':' + pass + '@' : '' )  + host + ':' + port + '/' + dbName;

	var opts = { server: { auto_reconnect: true, poolSize: poolSize }, db:{ safe:true, fsync:true }, user: user, pass: pass };

	mongoose.connect( uri, opts );

	var db = mongoose.connection;

	db.on('error', function (err) {
		callback( err, null );
	} );
	db.on('open', function() {
		console.log('Connected to MongoDB', uri);

		exports.buildUpSchemas(db, mongoose, schemagen, models, vindication.validate);

		console.log('Schema and model created.');

		if(callback)
			callback( null, db );
	});

	exports.db = db;
};
