import mongoose from 'mongoose';

const whaleSchema = new mongoose.Schema({
    symbol: {
        type: String
    },
    orders: {
        type: [{
            price: Number,
            amount: Number,
           totalAmount: Number
        }],
        default: []
    },
   quoteAsset: String,
    type: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model('whale', whaleSchema);
