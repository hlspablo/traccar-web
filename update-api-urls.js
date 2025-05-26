#!/usr/bin/env node

const fs = require('fs');

// List of files that need updating based on the grep search results
const filesToUpdate = [
  'src/login/RegisterPage.jsx',
  'src/reports/ScheduledPage.jsx',
  'src/map/draw/MapGeofenceEdit.js',
  'src/reports/common/scheduleReport.js',
  'src/reports/EventReportPage.jsx',
  'src/main/DeviceList.jsx',
  'src/login/ResetPasswordPage.jsx',
  'src/common/components/SelectUserField.jsx',
  'src/common/components/LinkField.jsx',
  'src/other/GeofencesList.jsx',
  'src/common/components/StatusCard.jsx',
  'src/other/GeofencesPage.jsx',
  'src/settings/CalendarsPage.jsx',
  'src/settings/GroupsPage.jsx',
  'src/settings/NotificationsPage.jsx',
  'src/settings/PreferencesPage.jsx',
  'src/settings/CommandsPage.jsx',
  'src/settings/UsersPage.jsx',
  'src/settings/MaintenancesPage.jsx',
  'src/settings/GroupPage.jsx',
  'src/settings/DriversPage.jsx',
  'src/settings/UserPage.jsx',
  'src/settings/CalendarPage.jsx',
  'src/settings/CommandDevicePage.jsx',
  'src/settings/SharePage.jsx',
  'src/settings/ComputedAttributesPage.jsx',
  'src/settings/ServerPage.jsx',
];

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Check if buildApiUrl import already exists
  const hasImport = content.includes('buildApiUrl');

  // Add import if not present
  if (!hasImport && content.includes("fetch('/api")) {
    // Find a good place to add the import
    if (content.includes("from '../config/")) {
      // Add after existing config imports
      content = content.replace(
        /(from ['"]\.\.\/config\/[^'"]+['"];?\n)/,
        '$1import { buildApiUrl } from \'../config/apiConfig\';\n',
      );
    } else if (content.includes("from './config/")) {
      content = content.replace(
        /(from ['"]\.\/config\/[^'"]+['"];?\n)/,
        '$1import { buildApiUrl } from \'./config/apiConfig\';\n',
      );
    } else {
      // Add at the end of imports
      const lastImportMatch = content.match(/^import .+;$/gm);
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        const importPath = filePath.split('/').length > 2 ? '../config/apiConfig' : './config/apiConfig';
        content = content.replace(lastImport, `${lastImport}\nimport { buildApiUrl } from '${importPath}';`);
      }
    }
    updated = true;
  }

  // Replace fetch('/api' with fetch(buildApiUrl('
  const newContent = content.replace(/fetch\('\/api([^']*)'/, "fetch(buildApiUrl('$1')");

  if (newContent !== content) {
    updated = true;
    content = newContent;
  }

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

// Update all files
filesToUpdate.forEach(updateFile);

console.log('Update complete!');
