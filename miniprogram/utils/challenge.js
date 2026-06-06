const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(dateStr) {
  const [year, month, day] = String(dateStr || '').split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addDays(dateStr, days) {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

function diffDays(startDate, endDate) {
  return Math.floor((parseDate(endDate) - parseDate(startDate)) / DAY_MS);
}

function compareDates(a, b) {
  if (a === b) return 0;
  return a > b ? 1 : -1;
}

function getGoalCompletedDateSet(goal, checkins, sessions) {
  const completed = new Set();
  if (!goal) return completed;

  const goalCheckins = (checkins || []).filter(item => item.goalId === goal.id);

  if (goal.type === 'duration') {
    const totals = {};
    (sessions || [])
      .filter(item => item.goalId === goal.id)
      .forEach(item => {
        totals[item.date] = (totals[item.date] || 0) + (item.duration || 0);
      });
    Object.keys(totals).forEach(date => {
      if (totals[date] > 0) completed.add(date);
    });
    return completed;
  }

  if (goal.type === 'count') {
    const targetCount = Math.max(1, goal.targetCount || 1);
    const counts = {};
    goalCheckins.forEach(item => {
      counts[item.date] = (counts[item.date] || 0) + 1;
    });
    Object.keys(counts).forEach(date => {
      if (counts[date] >= targetCount) completed.add(date);
    });
    return completed;
  }

  goalCheckins.forEach(item => completed.add(item.date));
  return completed;
}

function getChallengeProgress(challenge, goal, checkins, sessions, today) {
  const targetDays = Math.max(1, Number(challenge.targetDays) || 1);
  let completedDays = 0;
  let status = challenge.status || 'active';

  if (status === 'completed') {
    completedDays = targetDays;
  } else {
    const startDate = challenge.startDate;
    const completedDates = getGoalCompletedDateSet(goal, checkins, sessions);
    let cursor = startDate;

    while (
      completedDays < targetDays &&
      compareDates(cursor, today) <= 0 &&
      completedDates.has(cursor)
    ) {
      completedDays++;
      cursor = addDays(startDate, completedDays);
    }

    if (status !== 'failed') {
      const elapsedBeforeToday = Math.min(targetDays, Math.max(0, diffDays(startDate, today)));
      if (completedDays >= targetDays) {
        status = 'completed';
      } else if (completedDays < elapsedBeforeToday) {
        status = 'failed';
      } else {
        status = 'active';
      }
    }
  }

  return {
    completedDays,
    remainingDays: Math.max(0, targetDays - completedDays),
    progress: Math.min(100, Math.round((completedDays / targetDays) * 100)),
    status,
    statusText: status === 'completed' ? '挑战成功' : status === 'failed' ? '已中断' : '进行中'
  };
}

module.exports = {
  getChallengeProgress
};
