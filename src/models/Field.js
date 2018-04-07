import { createPaginationMethod } from '../helpers/mongoPagination';
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  code: {
  	type:String,
  	required:true,
  	default:"{}"
  },
}, {
  timestamps: true,
  toObject: {}
});

userSchema.options.toObject.transform = function(doc, ret) {
  return ret;
};



userSchema.statics.findPaginate = createPaginationMethod()
userSchema.plugin(mongoosePaginate);
const Field = mongoose.model('field', userSchema);
export default Field;
