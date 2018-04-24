import {
  createPaginationMethod
} from '../helpers/mongoPagination';
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');
import sequential from 'promise-sequential';
import moment from 'moment'

export const schema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  description:String,
  type:{
    type:String,
    enum:['Number','String','Boolean','Date','Ref','Object'],
    default:String,
    required:true
  },
  ref:String,
  index:Boolean,
  required:Boolean,
  unique:Boolean,
  enum:[String],
  public:{
    type:Boolean,
    requied:true,
    default:true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tae_user'
  }
}, {
  timestamps: true,
  toObject: {}
});


schema.options.toObject.transform = function(doc, ret) {
  if(doc.owner.name){
    ret.creatorName = doc.owner.name
  }
  return ret;
};

schema.statics.findPaginate = createPaginationMethod()
schema.plugin(mongoosePaginate);
const WraCollectionField = mongoose.model('wra_collection_field', schema);
export default WraCollectionField;
