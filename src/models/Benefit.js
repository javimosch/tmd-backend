import {
  createPaginationMethod
} from '../helpers/mongoPagination';
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');
import sequential from 'promise-sequential';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description:String,
  required_fields_groups: [{
    type: String //required fields group
  }],
  required_fields: [{
    type: String //required fields
  }],
  code: {
    type: String,
    required: true,
    default: "{}"
  },
}, {
  timestamps: true,
  toObject: {}
});

userSchema.options.toObject.transform = function(doc, ret) {
  return ret;
};

userSchema.statics.migratePropertyFromJSON = async function(prop) {
  let docs = await this.find({}).exec();
  let r = await sequential(docs.map(d => {
    return async () => {
      try {
        d[prop] = (JSON.parse(d.code))[prop];
        await d.save();
        return true;
      } catch (err) {
        return false;
      }
    }
  }));
  console.log('Migration', r.filter(res => res === true).length,'from', docs.length);
};

userSchema.statics.findPaginate = createPaginationMethod()
userSchema.plugin(mongoosePaginate);
const Field = mongoose.model('benefit', userSchema);
export default Field;