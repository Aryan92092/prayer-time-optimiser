/**
 * Client-side schedule generator — matches the backend seed data structure.
 * Generates activity entries based on user profile (religion × stress × role × time).
 */

const titles = {
    hindu: ['Morning Aarti', 'Gita Reflection', 'Mantra Meditation', 'Evening Seva'],
    muslim: ['Fajr Prayer', 'Dhuhr Focus', 'Asr Gratitude', 'Isha Reflection'],
    sikh: ['Nitnem Reading', 'Simran Meditation', 'Kirtan Peace', 'Rehras Sahib'],
    christian: ['Morning Devotional', 'Bible Study', 'Prayer of Hope', 'Hymn of Calm'],
    none: ['Mindful Breathing', 'Growth Journaling', 'Nature Walk', 'Progressive Relaxation'],
};

const descriptions = [
    'Focus on your breath and find your inner center.',
    'Reflect on three things you are grateful for today.',
    'Engage in a gentle session of spiritual readings.',
    'A soft, calming practice to end your day with peace.',
    'Connecting with your purpose through silent reflection.',
];

const timesOfDay = ['morning', 'afternoon', 'evening', 'night'];

/**
 * Generate schedule entries for a program.
 * @param {Object} profile - { spiritual_preference, religion_type, stress_level, user_role }
 * @param {string} programId - UUID of the program
 * @param {string} userId - UUID of the user
 * @param {Date} startDate - start date
 * @param {number} totalDays - total number of days
 * @returns {Array} entries ready to insert into schedule_entries table
 */
export const generateScheduleEntries = (profile, programId, userId, startDate, totalDays) => {
    const relKey =
        profile.spiritual_preference === 'non-religious' ? 'none' : profile.religion_type || 'none';

    const relTitles = titles[relKey] || titles['none'];
    const entries = [];
    let descIndex = 0;

    for (let day = 1; day <= totalDays; day++) {
        for (let t = 0; t < timesOfDay.length; t++) {
            const time = timesOfDay[t];
            const stressLabel = profile.stress_level?.toUpperCase() || 'MODERATE';
            const role = profile.user_role || 'student';

            entries.push({
                program_id: programId,
                user_id: userId,
                day_number: day,
                time_of_day: time,
                activity_title: `${relTitles[t] || 'Daily Focus'} - ${stressLabel} Stress`,
                activity_description: `${descriptions[descIndex % descriptions.length]} Tailored for ${role}s.`,
                completed: false,
            });

            descIndex++;
        }
    }

    return entries;
};

/** Pure client-side: compute streak from entries array */
export const computeStreak = (entries) => {
    const days = {};
    entries.forEach((e) => {
        if (!days[e.day_number]) days[e.day_number] = [];
        days[e.day_number].push(e.completed);
    });

    let streak = 0;
    for (const day of Object.keys(days).sort((a, b) => a - b)) {
        if (days[day].every((v) => v === true)) streak++;
        else break;
    }
    return streak;
};

/** Pure client-side: compute insights */
export const computeInsights = (entries) => {
    const total = entries.length;
    const completed = entries.filter((e) => e.completed).length;
    const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    const streak = computeStreak(entries);

    let level = 'Beginner';
    let message = 'Start strong. Small steps build momentum.';
    if (completionPercentage >= 25) { level = 'Growing'; message = "You're building consistency. Keep going!"; }
    if (completionPercentage >= 50) { level = 'Consistent'; message = "You're doing great. Discipline is forming."; }
    if (completionPercentage >= 75) { level = 'Strong'; message = "Amazing progress. You're becoming unstoppable!"; }
    if (completionPercentage === 100) { level = 'Master'; message = 'You completed your program. Incredible discipline!'; }

    return { completionPercentage, streak, level, message };
};

/** Pure client-side: last 7 days weekly progress */
export const computeWeeklyProgress = (entries, startDate) => {
    const progressByDay = {};
    entries.forEach((e) => {
        if (!progressByDay[e.day_number]) progressByDay[e.day_number] = { completed: 0, total: 0 };
        progressByDay[e.day_number].total++;
        if (e.completed) progressByDay[e.day_number].completed++;
    });

    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = Math.floor((d - start) / (1000 * 60 * 60 * 24)) + 1;
        const dayData = progressByDay[dayNum] || { completed: 0, total: 0 };
        result.push({
            day: dayLabel,
            completed: dayData.completed,
            total: dayData.total,
            percentage: dayData.total > 0 ? Math.round((dayData.completed / dayData.total) * 100) : 0,
        });
    }
    return result;
};

/** Pure client-side: today's next incomplete task */
export const getTodayFocus = (entries, startDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const dayNumber = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;

    if (dayNumber < 1) return { message: "Your program hasn't started yet. Get ready!" };

    const timeOrder = { morning: 1, afternoon: 2, evening: 3, night: 4 };
    const todayEntries = entries
        .filter((e) => e.day_number === dayNumber && !e.completed)
        .sort((a, b) => (timeOrder[a.time_of_day] || 9) - (timeOrder[b.time_of_day] || 9));

    if (todayEntries.length === 0)
        return { message: "You've completed all tasks for today! Great job.", allCompleted: true };

    return todayEntries[0];
};
