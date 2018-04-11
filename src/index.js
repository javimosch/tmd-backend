const console = require('tracer').colorConsole();
require('dotenv').config({
	silent: true
});



import "babel-polyfill";
import {
	IS_PRODUCTION
} from './config';
import apiAction from './modules/apiAction';
import morganBody from 'morgan-body';

import configureFacebookMenssengerWebhook from './modules/fbMenssengerWebhook';
import dbStartHook from './modules/dbStartHook';

const express = require('express')
const app = express()
const db = require('./modules/db');

var mongo_express = require('mongo-express/lib/middleware')
var mongo_express_config = require('./config/mongoExpress');

(async () => {

	var server = require('http').Server(app);

	require('./modules/sockets').default(server);
		
	
	
	await db.connect(app);

	//await db.conn().model('field').migratePropertyFromJSON('group');
	await dbStartHook();
	await apiAction.sync();

	

	const bearerToken = require('express-bearer-token');
	app.use(bearerToken({
		bodyKey: 'access_token',
		queryKey: 'access_token',
		headerKey: 'Bearer',
		reqKey: 'token'
	}));

	var cors = require('cors')
	app.use(cors())

	var bodyParser = require('body-parser')
	app.use(bodyParser.json())

	

	morganBody(app);
	
	require('./modules/expressMonitor').default(app);
	

	configureFacebookMenssengerWebhook(app);

	app.use('/rpc/*', apiAction.handler());
	app.use('/', mongo_express(mongo_express_config))


	if (!process.env.PORT) throw new Error('PORT required');
	server.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`))

})().catch(console.error);