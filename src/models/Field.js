import {
  createPaginationMethod
} from '../helpers/mongoPagination';
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');
const db = require('../modules/db');
import sequential from 'promise-sequential';

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'field_group',
    required: true
  },
  code: {
    type: String,
    required: true,
    default: "{}"
  },
  order: {
    type: Number
  },
}, {
  timestamps: true,
  toObject: {}
});

schema.options.toObject.transform = function(doc, ret) {
  if (doc && doc.group && doc.group._id) {
    ret.groupName = doc.group.name;
  } else {
    ret.groupName = '(missing)'
  }
  return ret;
};

schema.post('remove', function(doc, next) {
  const FieldGroup = db.conn().model('field_group');

  FieldGroup.update({
    _id: doc.group
  }, {
    $pull: {
      fields: doc._id
    }
  }).exec().then(next).catch(err => {
    console.error('Removing field reference from field_group', err);
    throw err;
  });

});

schema.statics.migratePropertyFromJSON = async function(prop) {
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
  console.log('Migration', r.filter(res => res === true).length, 'from', docs.length);
};

schema.statics.findPaginate = createPaginationMethod()
schema.plugin(mongoosePaginate);
const Field = mongoose.model('field', schema);
export default Field;