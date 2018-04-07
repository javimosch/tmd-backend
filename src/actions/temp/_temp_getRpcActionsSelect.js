'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = _asyncToGenerator(function* () {
	const db = this.db;

	let ApiAction = db.conn().model('api_action');
	return (yield ApiAction.find({}).exec()).map(function (d) {
		return {
			text: d.name,
			value: d._id
		};
	});
});