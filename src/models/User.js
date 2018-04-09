import { createPaginationMethod } from '../helpers/mongoPagination';
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  role: {
    type: String,
    enum: ['normal', 'root'],
    required: true,
    default: 'normal'
  },
  chatMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chat_message'
  }],
  inputs: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'field_response'
  },
  orders:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order'
  }]
}, {
  timestamps: true,
  toObject: {}
});

userSchema.options.toObject.transform = function(doc, ret) {
  return ret;
};

userSchema.statics.findByEmailRegExp = function(email) {
  return User.findOne({
    email: {
      $regex: new RegExp(ethAddress),
      $options: "i"
    }
  }).exec();
};

userSchema.statics.findPaginate = createPaginationMethod()
userSchema.plugin(mongoosePaginate);
const User = mongoose.model('user', userSchema);
export default User;
