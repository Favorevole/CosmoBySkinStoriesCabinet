import prisma from './prisma.js';

export async function getDoctorExtendedStats(doctorId, period = 'month') {
  const now = new Date();
  let dateFrom = null;

  if (period === 'week') {
    dateFrom = new Date(now);
    dateFrom.setDate(dateFrom.getDate() - 7);
  } else if (period === 'month') {
    dateFrom = new Date(now);
    dateFrom.setDate(dateFrom.getDate() - 30);
  }
  // period === 'all' → no dateFrom filter

  const dateFilter = dateFrom ? { assignedAt: { gte: dateFrom } } : {};

  // Fetch all relevant applications for the doctor in the period
  const applications = await prisma.application.findMany({
    where: {
      doctorId,
      ...dateFilter
    },
    select: {
      id: true,
      status: true,
      assignedAt: true,
      completedAt: true,
      createdAt: true
    },
    orderBy: { assignedAt: 'asc' }
  });

  // Status breakdown
  const statusBreakdown = {};
  for (const app of applications) {
    statusBreakdown[app.status] = (statusBreakdown[app.status] || 0) + 1;
  }

  // Total assigned / completed
  const totalAssigned = applications.length;
  const completedStatuses = ['RESPONSE_GIVEN', 'APPROVED', 'SENT_TO_CLIENT'];
  const completedApps = applications.filter(a => completedStatuses.includes(a.status));
  const totalCompleted = completedApps.length;
  const completionRate = totalAssigned > 0 ? totalCompleted / totalAssigned : 0;

  // Average response time (assignedAt → completedAt) in hours
  let avgResponseTimeHours = null;
  const appsWithTime = completedApps.filter(a => a.assignedAt && a.completedAt);
  if (appsWithTime.length > 0) {
    const totalHours = appsWithTime.reduce((sum, a) => {
      return sum + (new Date(a.completedAt) - new Date(a.assignedAt)) / (1000 * 60 * 60);
    }, 0);
    avgResponseTimeHours = Math.round((totalHours / appsWithTime.length) * 10) / 10;
  }

  // Applications over time (group by date)
  const dateMap = new Map();
  for (const app of applications) {
    const date = (app.assignedAt || app.createdAt).toISOString().split('T')[0];
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  }

  // Fill in missing dates
  const applicationsOverTime = [];
  if (dateFrom) {
    const cursor = new Date(dateFrom);
    while (cursor <= now) {
      const key = cursor.toISOString().split('T')[0];
      applicationsOverTime.push({ date: key, count: dateMap.get(key) || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (applications.length > 0) {
    // For "all" period, show all dates with data
    const sorted = [...dateMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    for (const [date, count] of sorted) {
      applicationsOverTime.push({ date, count });
    }
  }

  return {
    applicationsOverTime,
    avgResponseTimeHours,
    completionRate: Math.round(completionRate * 100) / 100,
    statusBreakdown,
    totalCompleted,
    totalAssigned
  };
}
