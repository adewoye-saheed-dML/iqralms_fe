const fs = require('fs');
const files = [
  'src/app/app/curriculum/tracks/[trackId]/edit/page.tsx',
  'src/app/app/curriculum/tracks/[trackId]/levels/[levelId]/edit/page.tsx'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/\['academy', activeAcademy\?\.id, 'curriculum', 'track', trackId\]/g, "curriculumKeys.trackDetail(activeAcademy?.id, trackId)");
  if(c.includes("curriculumKeys")) {
     c = "import { curriculumKeys } from '@/lib/api/query-keys';\n" + c;
  }
  fs.writeFileSync(f, c);
});
