import { createPaginationMethod } from '../helpers/mongoPagination';
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  password:{
    type: String,
  }
}, {
  timestamps: true,
  toObject: {}
});

schema.options.toObject.transform = function(doc, ret) {
  return ret;
};

schema.statics.findByEmailRegExp = function(email) {
  return TaeUser.findOne({
    email: {
      $regex: new RegExp(ethAddress),
      $options: "i"
    }
  }).exec();
};

schema.statics.findPaginate = createPaginationMethod()
schema.plugin(mongoosePaginate);
const TaeUser = mongoose.model('tae_user', schema);
export default TaeUser;
