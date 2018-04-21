import {
  createPaginationMethod
} from '../helpers/mongoPagination';
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');
import sequential from 'promise-sequential';
import moment from 'moment'
import {schema as fieldSchema} from './wra_collection_field'

const schema = new mongoose.Schema({
  name: {
    type: String,
    index: true,
    required: true,
  },
  fields:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'wra_collection_field'
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tae_user'
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'wra_project'
  }]
}, {
  timestamps: true,
  toObject: {}
});

schema.options.toObject.transform = function(doc, ret) {
  return Object.assign(ret,{projectNames:doc.projects.map(p=>p.name).join(', ')})
};

schema.statics.findPaginate = createPaginationMethod()
schema.plugin(mongoosePaginate);
const WraCollection = mongoose.model('wra_collection', schema);
export default WraCollection;