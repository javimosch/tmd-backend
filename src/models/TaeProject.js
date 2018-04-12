import {
  createPaginationMethod
} from '../helpers/mongoPagination';
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');
import sequential from 'promise-sequential';
import moment from 'moment'

const schema = new mongoose.Schema({
  name: {
    type: String,
    index: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'session'
  },
}, {
  timestamps: true,
  toObject: {}
});

schema.options.toObject.transform = function(doc, ret) {
  
  return ret;
};

schema.statics.findPaginate = createPaginationMethod()
schema.plugin(mongoosePaginate);
const TaeProject = mongoose.model('tae_project', schema);
export default TaeProject;