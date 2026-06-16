import crypto from 'crypto';
import Razorpay from 'razorpay';
import { supabase } from '../config/supabase.js';

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_nudgehq',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'nudgehq_test_secret'
});

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const isTrial = plan === 'free_trial';
    const amount = isTrial ? 1 * 100 : 2000 * 100;
    let order = null;

    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      order = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: `nudgehq_${Date.now()}`,
        notes: {
          plan: isTrial ? 'free_trial' : 'starter',
          user_id: req.user.id,
          organization_id: req.user.organization_id
        }
      });
    } else {
      order = {
        id: `order_test_${Date.now()}`,
        amount,
        currency: 'INR',
        status: 'created',
        test_mode: true
      };
    }

    return res.status(200).json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_nudgehq'
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create payment order.', error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    if (process.env.RAZORPAY_KEY_SECRET && razorpay_signature) {
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expected !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed.' });
      }
    }

    const isTrial = plan === 'free_trial';
    const activatedPlan = isTrial ? 'free_trial' : 'starter';
    const durationDays = isTrial ? 14 : 30;

    const { error } = await supabase
      .from('organizations')
      .update({ plan: activatedPlan, plan_expires_at: addDays(durationDays), trial_ends_at: isTrial ? addDays(durationDays) : null })
      .eq('id', req.user.organization_id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: isTrial ? '14-Day Free Trial activated.' : 'Starter plan activated.',
      redirect_to: '/onboarding'
    });
  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify payment.', error: error.message });
  }
};

export const activateTrial = async (req, res) => {
  try {
    const { error } = await supabase
      .from('organizations')
      .update({ plan: 'free_trial', plan_expires_at: addDays(14), trial_ends_at: addDays(14) })
      .eq('id', req.user.organization_id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: '14-Day Free Trial activated successfully.',
      redirect_to: '/onboarding'
    });
  } catch (error) {
    console.error('Activate trial error:', error);
    return res.status(500).json({ success: false, message: 'Failed to activate free trial.', error: error.message });
  }
};
