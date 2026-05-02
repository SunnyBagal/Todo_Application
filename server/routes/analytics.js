const router = require('express').Router();
const mongoose = require('mongoose');
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');

function ymdInTz(date, timeZone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function decrementYmd(ymd, daysBack) {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - daysBack);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

router.get('/', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const days = parseInt(req.query.days) || 30;

    let tz = typeof req.query.tz === 'string' && req.query.tz ? req.query.tz : 'UTC';
    try {
      new Intl.DateTimeFormat('en-CA', { timeZone: tz });
    } catch {
      tz = 'UTC';
    }

    const todayKey = ymdInTz(new Date(), tz);

    const keys = [];
    for (let i = days - 1; i >= 0; i--) {
      keys.push(decrementYmd(todayKey, i));
    }
    const firstKey = keys[0];

    const [fy, fm, fd] = firstKey.split('-').map(Number);
    const startInstant = new Date(Date.UTC(fy, fm - 1, fd) - 86400000);

    const groupByDate = (field, extraMatch = {}) => ([
      {
        $match: {
          userId,
          [field]: { $gte: startInstant },
          ...extraMatch,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: `$${field}`, timezone: tz },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const [creations, completions] = await Promise.all([
      Todo.aggregate(groupByDate('createdAt')),
      Todo.aggregate(groupByDate('completedAt', { done: true })),
    ]);

    const seriesByDate = new Map();
    for (const k of keys) {
      seriesByDate.set(k, { date: k, created: 0, completed: 0 });
    }
    creations.forEach(({ _id, count }) => {
      if (seriesByDate.has(_id)) seriesByDate.get(_id).created = count;
    });
    completions.forEach(({ _id, count }) => {
      if (seriesByDate.has(_id)) seriesByDate.get(_id).completed = count;
    });
    const dailySeries = Array.from(seriesByDate.values());

    const totalTodos = await Todo.countDocuments({ userId });
    const completedTodos = await Todo.countDocuments({ userId, done: true });
    const completionRate = totalTodos > 0
      ? Math.round((completedTodos / totalTodos) * 100)
      : 0;

    const streakAgg = await Todo.aggregate([
      {
        $match: {
          userId,
          done: true,
          completedAt: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt', timezone: tz },
          },
        },
      },
    ]);
    const completionDates = new Set(streakAgg.map((d) => d._id));

    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const k = decrementYmd(todayKey, i);
      if (completionDates.has(k)) {
        streak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }

    res.json({
      dailySeries,
      windowDays: days,
      totalTodos,
      completedTodos,
      completionRate,
      currentStreak: streak,
    });
  } catch (e) {
    console.error('Analytics error:', e);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
