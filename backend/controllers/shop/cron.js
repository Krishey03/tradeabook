import cron from 'node-cron';
import mongoose from 'mongoose';

cron.schedule('0 0 * * *', async () => {
    try {
        await mongoose.model('Product').updateMany({
            paymentStatus: 'pending',
            paymentExpiresAt: { $lt: new Date() }
        }, {
            paymentStatus: 'failed'
        });

        await mongoose.model('eProduct').updateMany({
            paymentStatus: 'pending',
            paymentExpiresAt: { $lt: new Date() }
        }, {
            paymentStatus: 'failed'
        });

        console.log('Expired payments cleaned up');
    } catch (error) {
        console.error('Error in payment expiration cron job:', error);
    }
});