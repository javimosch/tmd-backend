import {
  createPaginationMethod
} from '../helpers/mongoPagination';
var mongoosePaginate = require('mongoose-paginate');
const mongoose = require('mongoose');
import sequential from 'promise-sequential';
import db from '../modules/db';

const schema = new mongoose.Schema({
  state: {
    type: String,
    enum: ['draft', 'active', 'archived', 'completed'],
    default: 'draft'
  },
  number: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  benefits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'benefit'
  }],
  priceNet: {
    type: Number
  },
  priceGross: {
    type: Number
  },
  vatRate: {
    type: Number,
    default: 21
  },
  paidAt: Date,
  archivedAt: Date,
  activedAt: Date
}, {
  timestamps: true,
  toObject: {}
});

schema.options.toObject.transform = function(doc, ret) {
  return ret;
};

schema.statics.fromUser = async function(fromUser, options = {}) {
  let user = await db.conn().model('user').findOne({
    _id: fromUser._id || fromUser
  }).populate('orders').exec()
  return user.orders.filter(o => {
    if (options.state) {
      if (typeof options.state === 'string') {
        return o.state == options.state;
      } else {
        return options.state.includes(o.state);
      }
    }
    return o;
  });
};

schema.statics.findPaginate = createPaginationMethod()
schema.plugin(mongoosePaginate);
const FieldGroup = mongoose.model('order', schema);
export default FieldGroup;