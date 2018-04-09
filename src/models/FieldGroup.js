import {
  createPaginationMethod
} from '../helpers/mongoPagination';
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');
import sequential from 'promise-sequential';

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  fields:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'field',
  }]
}, {
  timestamps: true,
  toObject: {}
});

schema.options.toObject.transform = function(doc, ret) {
  return ret;
};

schema.statics.findPaginate = createPaginationMethod()
schema.plugin(mongoosePaginate);
const FieldGroup = mongoose.model('field_group', schema);
export default FieldGroup;