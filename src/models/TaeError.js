import {
  createPaginationMethod
} from '../helpers/mongoPagination';
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');
import sequential from 'promise-sequential';
import moment from 'moment'

const schema = new mongoose.Schema({
  message: {
    type: String,
    index: true,
    required: true,
    default: 'unknown'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tae_project',
    required:true,
    index:true
  },
  stack: {
    type: String,
    index: true,
    default: ''
  },
  count: {
    type: Number,
    default: 1
  },
  dates: [{
    type: Date
  }],
  metadata: {}
}, {
  timestamps: true,
  toObject: {}
});

schema.options.toObject.transform = function(doc, ret) {
  ret.lastAt = moment(ret.dates[ret.dates.length-1]).format('DD/MM/YYYY HH:mm')
  return ret;
};

schema.statics.findPaginate = createPaginationMethod()
schema.plugin(mongoosePaginate);
const FieldGroup = mongoose.model('tae_error', schema);
export default FieldGroup;