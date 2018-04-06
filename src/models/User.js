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
    enum: ['moderator', 'root'],
    required: true,
    default: 'moderator'
  }
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
const User = mongoose.model('User', userSchema);
export default User;
