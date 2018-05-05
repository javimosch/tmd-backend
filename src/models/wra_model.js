const console = require('tracer').colorConsole();
import { createPaginationMethod } from '../helpers/mongoPagination';
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  code: {
  	type:String,
  	required:true
  },
  compiledCode:{
  	type:String
  },
  compiledAt:Date
}, {
  timestamps: true,
  toObject: {}
});

schema.options.toObject.transform = function(doc, ret) {
  return ret;
};

schema.statics.findPaginate = createPaginationMethod()
schema.plugin(mongoosePaginate);
const Model = mongoose.model('wra_model', schema);
export default Model;
