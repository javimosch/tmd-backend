const console = require('tracer').colorConsole();
var errToJSON = require('error-to-json')
export const middlewares = [{
	name: 'authenticate',
	params: [{
		model: 'tae_user',
		roleIs: 'root'
	}]
}];
export default async function(d) {
	const self = this;

	const {
		emit,
		getInstance
	} = this.modules.sockets
	var io = getInstance();

	let room = '/api_actions';

	if (io.state.scopes[room]) return; //one time per instance

	var nsp = io.of(room);
	nsp.on('connection', function(socket) {

		socket.on('syncAction', async (params) => {

			try {
				let doc = await self.model('api_action').findById(params._id).exec();
				if (doc) {
					await self.modules.apiAction.updateActions([doc])
				} else {
					throw new Error('api_action not found by id '+params._id)
				}
			} catch (err) {
				console.error(err);
				self.modules.analytics.recordEvent('error', errToJSON(err)).catch(console.error);
			}

		});

	});


	io.state.scopes[room] = nsp;

}