const fs = require('fs');
const path = require('path');

const replacements = [
  ['text-gray-900 ', 'text-gray-900 dark:text-white '],
  ['text-gray-800 ', 'text-gray-800 dark:text-gray-200 '],
  ['text-gray-700 ', 'text-gray-700 dark:text-gray-300 '],
  ['text-gray-600 ', 'text-gray-600 dark:text-gray-400 '],
  ['text-gray-500 ', 'text-gray-500 dark:text-gray-400 '],
  ['text-gray-400 ', 'text-gray-400 dark:text-gray-500 '],
  ['bg-white ', 'bg-white dark:bg-gray-800 '],
  ['bg-gray-50 ', 'bg-gray-50 dark:bg-gray-700/50 '],
  ['bg-gray-100 ', 'bg-gray-100 dark:bg-gray-700 '],
  ['bg-gray-200 ', 'bg-gray-200 dark:bg-gray-700 '],
  ['border-gray-200 ', 'border-gray-200 dark:border-gray-700 '],
  ['border-gray-300 ', 'border-gray-300 dark:border-gray-600 '],
  ['divide-gray-200 ', 'divide-gray-200 dark:divide-gray-700 '],
  ['hover:bg-gray-50 ', 'hover:bg-gray-50 dark:hover:bg-gray-700/50 '],
  ['hover:bg-gray-100 ', 'hover:bg-gray-100 dark:hover:bg-gray-700 '],
  ['bg-blue-50 ', 'bg-blue-50 dark:bg-blue-900/30 '],
  ['bg-blue-100 ', 'bg-blue-100 dark:bg-blue-900/30 '],
  ['text-blue-600 ', 'text-blue-600 dark:text-blue-400 '],
  ['text-blue-700 ', 'text-blue-700 dark:text-blue-400 '],
  ['hover:bg-blue-50 ', 'hover:bg-blue-50 dark:hover:bg-blue-900/30 '],
  ['hover:bg-blue-100 ', 'hover:bg-blue-100 dark:hover:bg-blue-900/50 '],
  ['hover:bg-blue-700 ', 'hover:bg-blue-700 dark:hover:bg-blue-600 '],
  ['bg-green-50 ', 'bg-green-50 dark:bg-green-900/30 '],
  ['bg-green-100 ', 'bg-green-100 dark:bg-green-900/30 '],
  ['text-green-600 ', 'text-green-600 dark:text-green-400 '],
  ['text-green-700 ', 'text-green-700 dark:text-green-400 '],
  ['bg-red-50 ', 'bg-red-50 dark:bg-red-900/30 '],
  ['bg-red-100 ', 'bg-red-100 dark:bg-red-900/30 '],
  ['text-red-600 ', 'text-red-600 dark:text-red-400 '],
  ['text-red-700 ', 'text-red-700 dark:text-red-400 '],
  ['hover:bg-red-50 ', 'hover:bg-red-50 dark:hover:bg-red-900/30 '],
  ['hover:bg-red-100 ', 'hover:bg-red-100 dark:hover:bg-red-900/50 '],
  ['bg-orange-50 ', 'bg-orange-50 dark:bg-orange-900/30 '],
  ['bg-orange-100 ', 'bg-orange-100 dark:bg-orange-900/30 '],
  ['text-orange-600 ', 'text-orange-600 dark:text-orange-400 '],
  ['text-orange-700 ', 'text-orange-700 dark:text-orange-400 '],
  ['hover:bg-orange-50 ', 'hover:bg-orange-50 dark:hover:bg-orange-900/30 '],
  ['hover:bg-orange-100 ', 'hover:bg-orange-100 dark:hover:bg-orange-900/50 '],
  ['bg-teal-50 ', 'bg-teal-50 dark:bg-teal-900/30 '],
  ['bg-teal-100 ', 'bg-teal-100 dark:bg-teal-900/30 '],
  ['text-teal-600 ', 'text-teal-600 dark:text-teal-400 '],
  ['text-teal-700 ', 'text-teal-700 dark:text-teal-400 '],
  ['hover:bg-teal-50 ', 'hover:bg-teal-50 dark:hover:bg-teal-900/30 '],
  ['hover:bg-teal-100 ', 'hover:bg-teal-100 dark:hover:bg-teal-900/50 '],
  ['bg-yellow-50 ', 'bg-yellow-50 dark:bg-yellow-900/30 '],
  ['bg-yellow-100 ', 'bg-yellow-100 dark:bg-yellow-900/30 '],
  ['text-yellow-600 ', 'text-yellow-600 dark:text-yellow-400 '],
  ['text-yellow-700 ', 'text-yellow-700 dark:text-yellow-400 '],
  ['bg-purple-50 ', 'bg-purple-50 dark:bg-purple-900/30 '],
  ['bg-purple-100 ', 'bg-purple-100 dark:bg-purple-900/30 '],
  ['text-purple-600 ', 'text-purple-600 dark:text-purple-400 '],
  ['text-purple-700 ', 'text-purple-700 dark:text-purple-400 '],
  ['bg-indigo-50 ', 'bg-indigo-50 dark:bg-indigo-900/30 '],
  ['bg-indigo-100 ', 'bg-indigo-100 dark:bg-indigo-900/30 '],
  ['text-indigo-600 ', 'text-indigo-600 dark:text-indigo-400 '],
];

const pages = [
  'DocumentsPage.tsx',
  'ClearancesPage.tsx',
  'BlotterPage.tsx',
  'FinancialPage.tsx',
  'ReportsPage.tsx',
  'SettingsPage.tsx'
];

const pagesDir = path.join(__dirname, 'src', 'app', 'pages');

let totalUpdates = 0;

pages.forEach(page => {
  const filePath = path.join(pagesDir, page);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let pageUpdates = 0;
    
    replacements.forEach(([from, to]) => {
      const count = (content.match(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      if (count > 0) {
        content = content.split(from).join(to);
        modified = true;
        pageUpdates += count;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated ${page} (${pageUpdates} replacements)`);
      totalUpdates += pageUpdates;
    } else {
      console.log(`- No changes needed for ${page}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${page}:`, error.message);
  }
});

console.log(`\n✅ Done! Made ${totalUpdates} replacements across ${pages.length} files.`);
console.log('All pages now have dark mode support!');
