const console = require('tracer').colorConsole();
import { createPaginationMethod } from '../helpers/mongoPagination';
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  root: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'wra_model'
  },
  code: {
  	type:String,
  	required:true
  }
}, {
  timestamps: true,
  toObject: {}
});

schema.options.toObject.transform = function(doc, ret) {
  ret.codeLength = doc.code.length;
  return ret;
};

schema.statics.findPaginate = createPaginationMethod()
schema.plugin(mongoosePaginate);
const Model = mongoose.model('wra_model_history', schema);
export default Model;
