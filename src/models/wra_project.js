import {
  createPaginationMethod
} from '../helpers/mongoPagination';
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');
import sequential from 'promise-sequential';
import moment from 'moment'

const schema = new mongoose.Schema({
  appName: {
    type: String,
    index: true,
    required: true,
    unique:true
  },
  name: {
    type: String,
    index: true,
    required: true,
  },
  dbURI: {
    type: String,
    required: true,
  },
  dependencies: [{
    type: String,
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tae_user'
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tae_user'
  }],
  apiKey:{
    type:String,
    index:true,
    unique:true
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
const WraProject = mongoose.model('wra_project', schema);
export default WraProject;