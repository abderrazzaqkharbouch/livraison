const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ destinataire: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const nonLues = await Notification.countDocuments({ destinataire: req.user._id, lu: false });
    res.json({ success: true, notifications, nonLues });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id/lu', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, destinataire: req.user._id }, { lu: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/lire-tout', protect, async (req, res) => {
  try {
    await Notification.updateMany({ destinataire: req.user._id, lu: false }, { lu: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
