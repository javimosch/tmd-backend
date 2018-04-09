import {
  createPaginationMethod
} from '../helpers/mongoPagination';
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');
const db = require('../modules/db');
import sequential from 'promise-sequential';

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'field',
    required: true
  },
  completed:{
    type:Boolean,
    default:true
  },
  value:{},
}, {
  timestamps: true,
  toObject: {}
});

schema.options.toObject.transform = function(doc, ret) {
  return ret;
};

schema.statics.findPaginate = createPaginationMethod()
schema.plugin(mongoosePaginate);
const Field = mongoose.model('field_response', schema);
export default Field;