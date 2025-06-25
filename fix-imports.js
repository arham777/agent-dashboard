const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src', 'common', 'components', 'ui', 'promptUi');
console.log(`Looking in directory: ${directory}`);

try {
  const files = fs.readdirSync(directory);
  console.log(`Found ${files.length} files`);

  let fixedCount = 0;

  files.forEach(file => {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) return;
    
    const filePath = path.join(directory, file);
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('import { cn } from "@/lib/utils"')) {
        const newContent = content.replace(
          'import { cn } from "@/lib/utils"',
          'import { cn } from "../../../../../libs/utils"'
        );
        
        fs.writeFileSync(filePath, newContent, 'utf8');
        fixedCount++;
        console.log(`Fixed import in ${file}`);
      }
    } catch (err) {
      console.error(`Error processing file ${file}:`, err);
    }
  });

  console.log(`\nFixed imports in ${fixedCount} files.`);
} catch (err) {
  console.error('Error:', err);
} 