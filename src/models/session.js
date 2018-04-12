import {
  createPaginationMethod
} from '../helpers/mongoPagination';

var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  hash: {
    type: String,
    index: true,
    unique:true,
    required: true
  },
  metadata: {},
  count: {
    type: Number,
    default: 1
  },
  authAt: [{
    type: Date,
    default: [new Date()]
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
const Session = mongoose.model('session', schema);
export default Session;