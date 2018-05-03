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
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tae_user'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'wra_project'
  },
  metadata:Object,
    //functions
  lastConnection:{
    type:Date
  }
}, {
  timestamps: true,
  toObject: {}
});

schema.options.toObject.transform = function(doc, ret) {
  if (doc.user._id) ret.userName = doc.user.email
  if (doc.project._id) ret.projectName = doc.project.name
  return ret;
};

schema.statics.findPaginate = createPaginationMethod()
schema.plugin(mongoosePaginate);
const WraWorker = mongoose.model('wra_worker', schema);
export default WraWorker;