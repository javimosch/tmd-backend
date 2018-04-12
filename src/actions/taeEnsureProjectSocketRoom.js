export default async function(d){
	if(!d.project) throw new Error('PROJECT_REQUIRED')

	const {emit, getInstance} = this.modules.sockets
	var io = getInstance();

	let room = '/project/'+d.project+'';
	
	if(io.state.scopes[room]) return; //one time per instance

	var nsp = io.of('/project/'+d.project+'');
	nsp.on('connection', function(socket){
	  console.log('someone connected to',room);
	});
	
	io.state.events.on('taeSendError:'+d.project,(doc)=>{
		if(doc.project==d.project){
			nsp.emit('taeSendError',doc)
		}
	});

	io.state.scopes[room]=nsp;

}