const cron = require("node-cron");
const ReportSettings = require("../models/ReportSettings");
const Report = require("../models/Report");
const { buildReport } = require("./reportBuilder");
const { sendReportEmail } = require("../mailer/reportMailer");

// Map interval → cron expression
const CRON_MAP = {
  daily: "0 7 * * *",          // Every day at 07:00
  weekly: "0 7 * * 1",         // Every Monday at 07:00
  monthly: "0 7 1 * *",        // 1st of every month at 07:00
};

let activeJob = null;

async function runReport() {
  try {
    const settings = await ReportSettings.findOne({ key: "global" });

    if (!settings || !settings.enabled) {
      console.log("Scheduler: reporting is disabled or not configured");
      return;
    }

    console.log(`Scheduler: generating ${settings.interval} report...`);

    const reportData = await buildReport(settings.interval);
    const saved = await Report.create(reportData);

    await sendReportEmail(reportData, settings.recipientEmail);

    settings.lastRunAt = new Date();
    await settings.save();

    console.log(`Scheduler: report complete — ${saved._id}`);
  } catch (err) {
    console.error("Scheduler: report run failed:", err.message);
  }
}

async function startScheduler() {
  // Seed default settings if none exist
  const existing = await ReportSettings.findOne({ key: "global" });
  if (!existing) {
    await ReportSettings.create({
      key: "global",
      interval: process.env.DEFAULT_REPORT_INTERVAL || "monthly",
      recipientEmail: process.env.ADMIN_EMAIL || "admin@sportsstore.com",
      enabled: true,
    });
    console.log("Scheduler: default report settings seeded");
  }

  const settings = await ReportSettings.findOne({ key: "global" });
  const cronExpr = CRON_MAP[settings.interval] || CRON_MAP.monthly;

  if (activeJob) activeJob.stop();

  activeJob = cron.schedule(cronExpr, runReport, { timezone: "UTC" });
  console.log(`Scheduler: job set for "${settings.interval}" (${cronExpr})`);
}

// Allow the admin API to update interval at runtime
async function updateInterval(newInterval) {
  if (!CRON_MAP[newInterval]) throw new Error(`Invalid interval: ${newInterval}`);

  await ReportSettings.findOneAndUpdate(
    { key: "global" },
    { interval: newInterval },
    { new: true }
  );

  // Restart the cron job with the new expression
  await startScheduler();
  console.log(`Scheduler: interval updated to "${newInterval}"`);
}

module.exports = { startScheduler, runReport, updateInterval };