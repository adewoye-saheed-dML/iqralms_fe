const fs = require('fs');
const glob = require('glob');

const replacements = [
  { from: /\['academy', activeAcademy\?\.id, 'students'\]/g, to: "studentKeys.all(activeAcademy?.id)" },
  { from: /\['academy', activeAcademy\?\.id, 'student', ([\w.]+)\]/g, to: "studentKeys.detail(activeAcademy?.id, $1)" },
  { from: /\['academy', activeAcademy\?\.id, 'staff'\]/g, to: "staffKeys.all(activeAcademy?.id)" },
  { from: /\['academy', activeAcademy\?\.id, 'staff', ([\w.]+)\]/g, to: "staffKeys.detail(activeAcademy?.id, $1)" },
  { from: /\['academy', activeAcademy\?\.id, 'curriculum', 'tracks'\]/g, to: "curriculumKeys.tracks(activeAcademy?.id)" },
  { from: /\['academy', activeAcademy\?\.id, 'tracks'\]/g, to: "curriculumKeys.tracks(activeAcademy?.id)" },
  { from: /\['academy', activeAcademy\?\.id, 'curriculum', 'track', ([\w.]+)\]/g, to: "curriculumKeys.trackDetail(activeAcademy?.id, $1)" },
  { from: /\['academy', activeAcademy\?\.id, 'scheduling', 'bookings'\]/g, to: "schedulingKeys.bookings(activeAcademy?.id)" },
  { from: /\['academy', activeAcademy\?\.id, 'scheduling', 'bookings', type\]/g, to: "schedulingKeys.bookingsByType(activeAcademy?.id, type)" },
  { from: /\['academy', activeAcademy\?\.id, 'scheduling', 'waitlist'\]/g, to: "schedulingKeys.waitlist(activeAcademy?.id)" },
  { from: /\['academy', activeAcademy\?\.id, 'notifications', 'mine', unreadOnly\]/g, to: "notificationKeys.mine(activeAcademy?.id, unreadOnly)" },
  { from: /\['academy', activeAcademy\?\.id, 'notifications', 'mine'\]/g, to: "notificationKeys.mine(activeAcademy?.id)" },
  { from: /\['academy', activeAcademy\?\.id, 'notifications', 'deliveries'\]/g, to: "notificationKeys.deliveries(activeAcademy?.id)" },
  { from: /\['academy', activeAcademy\?\.id, 'notifications', 'admin'\]/g, to: "notificationKeys.admin(activeAcademy?.id)" },
  { from: /\['academy', activeAcademy\?\.id, 'payouts', 'my-statement', searchParams\?\.start, searchParams\?\.end\]/g, to: "payoutsKeys.myStatement(activeAcademy?.id, searchParams?.start, searchParams?.end)" },
  { from: /\['academy', activeAcademy\?\.id, 'payouts', 'lead'\]/g, to: "payoutsKeys.lead(activeAcademy?.id)" },
  { from: /\['academy', activeAcademy\?\.id, 'payouts'\]/g, to: "payoutsKeys.all(activeAcademy?.id)" },
  { from: /\['academy', activeAcademy\?\.id, 'progress', type\]/g, to: "progressKeys.list(activeAcademy?.id, type)" },
  { from: /\['academy', activeAcademy\?\.id, 'assessment', 'review-queue'\]/g, to: "assessmentKeys.reviewQueue(activeAcademy?.id)" },
  { from: /\['academy', activeAcademy\?\.id, 'assessment', type\]/g, to: "assessmentKeys.list(activeAcademy?.id, type)" },
  { from: /\['academy', activeAcademy\?\.id, 'pricing', type === 'mine' \? 'mine' : 'agreements'\]/g, to: "type === 'mine' ? pricingKeys.mine(activeAcademy?.id) : pricingKeys.agreements(activeAcademy?.id)" },
  { from: /\['academy', activeAcademy\?\.id, 'pricing'\]/g, to: "pricingKeys.all(activeAcademy?.id)" },
  { from: /\['academy', activeAcademy\?\.id\]/g, to: "academyKeys.tenant(activeAcademy?.id)" },
  { from: /queryKeyMine/g, to: "schedulingKeys.waitlistMine(activeAcademy?.id)" }
];

const files = glob.sync('src/features/**/*.{ts,tsx}');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  replacements.forEach(rep => {
    content = content.replace(rep.from, rep.to);
  });

  if (content !== originalContent) {
    // Determine which keys to import
    const usedKeys = [];
    if (content.includes('academyKeys')) usedKeys.push('academyKeys');
    if (content.includes('staffKeys')) usedKeys.push('staffKeys');
    if (content.includes('studentKeys')) usedKeys.push('studentKeys');
    if (content.includes('curriculumKeys')) usedKeys.push('curriculumKeys');
    if (content.includes('schedulingKeys')) usedKeys.push('schedulingKeys');
    if (content.includes('assessmentKeys')) usedKeys.push('assessmentKeys');
    if (content.includes('progressKeys')) usedKeys.push('progressKeys');
    if (content.includes('pricingKeys')) usedKeys.push('pricingKeys');
    if (content.includes('payoutsKeys')) usedKeys.push('payoutsKeys');
    if (content.includes('notificationKeys')) usedKeys.push('notificationKeys');

    if (usedKeys.length > 0) {
      const importStatement = `import { ${usedKeys.join(', ')} } from '@/lib/api/query-keys';\n`;
      content = importStatement + content;
    }
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
