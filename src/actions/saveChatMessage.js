export default async function(data) {
	const {
		db
	} = this;
	const ChatMessage = await db.conn().model('chat_message');
	const Field = await db.conn().model('field');


	let field = await Field.findById(data.field._id || data.field).exec();

	let lastMessage = await ChatMessage.findOne({}, {}, {
		sort: {
			'created_at': -1
		}
	}).exec();

	if (lastMessage && lastMessage.field.toString() == field._id.toString()) {
		return null;
	}

	let doc = await ChatMessage.create({
		message: data.message,
		isUser: data.isUser,
		field: data.field
	});
	db.conn().model('user').update({
		_id: data.user
	}, {
		$push: {
			chatMessages: doc
		}
	}).exec();
	return doc;
}