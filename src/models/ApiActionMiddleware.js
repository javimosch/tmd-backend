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
  type:{
    type:String,
    enum:['pre','post'],
    default:'pre',
    required:true
  },
  protected:{//local file
    type:Boolean,
    default:false
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
const ApiActionMiddleware = mongoose.model('api_action_middleware', schema);
export default ApiActionMiddleware;
