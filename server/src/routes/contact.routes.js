import Router from 'express';
import { sendContactQueryEmail } from '../utils/mailer.js';

const router = Router();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

router.post('/', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const queryType = String(req.body.query_type || req.body.queryType || 'General query').trim();
    const message = String(req.body.message || '').trim();

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and query details are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (message.length < 10) {
      return res.status(400).json({ success: false, message: 'Please add a little more detail to your query.' });
    }

    await sendContactQueryEmail({ name, email, queryType, message });

    return res.status(200).json({
      success: true,
      message: 'Thanks for reaching out. NudgeHQ will get back to you soon.'
    });
  } catch (error) {
    console.error('Contact query failed:', error.message);
    return res.status(500).json({ success: false, message: 'Could not send your query right now. Please try again later.' });
  }
});

export default router;
