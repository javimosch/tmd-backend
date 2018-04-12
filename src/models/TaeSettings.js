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
    default: 'default'
  },
  script: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toObject: {}
});

schema.options.toObject.transform = function(doc, ret) {
  return ret;
};

schema.statics.fetchSingleton = async function fetchSingleton() {
  let d = await this.findOne({
    name: 'default'
  }).exec();
  if (!d) {
    d = await this.create({
      name: 'default',
      script: ''
    })
  }
  return d;
};

schema.statics.findPaginate = createPaginationMethod()
schema.plugin(mongoosePaginate);
const TaeSetting = mongoose.model('tae_setting', schema);
export default TaeSetting;