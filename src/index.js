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

const express = require('express')
const app = express()
const db = require('./modules/db');

var mongo_express = require('mongo-express/lib/middleware')
var mongo_express_config = require('./config/mongoExpress');

(async () => {


	await db.connect();

	//await db.conn().model('field').migratePropertyFromJSON('group');

	await apiAction.syncActions();


	var cors = require('cors')
	app.use(cors())

	var bodyParser = require('body-parser')
	app.use(bodyParser.json())


	morganBody(app);

	app.use('/rpc/*', apiAction.handler());
	app.use('/', mongo_express(mongo_express_config))


	if (!process.env.PORT) throw new Error('PORT required');
	app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`))

})().catch(console.error);