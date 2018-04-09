import {
  createPaginationMethod
} from '../helpers/mongoPagination';
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');
import sequential from 'promise-sequential';

const schema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'field',
    required: true
  },
  isUser: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toObject: {}
});

schema.options.toObject.transform = function(doc, ret) {
  return ret;
};

schema.statics.findPaginate = createPaginationMethod()
schema.plugin(mongoosePaginate);
const FieldGroup = mongoose.model('chat_message', schema);
export default FieldGroup;