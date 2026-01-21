#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the current data
const dataPath = path.join(__dirname, '../product/sections/inbox/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Additional categorizations to add to tickets
const additionalCategories = [
  // 1-level categories
  {
    category: 'Billing',
    sentiment: 'Negative'
  },
  {
    category: 'Product',
    sentiment: 'Positive'
  },
  {
    category: 'Support',
    sentiment: 'Neutral'
  },

  // 2-level categories
  {
    category: 'Customer Feedback',
    subcategory: 'Product Reviews',
    sentiment: 'Positive'
  },
  {
    category: 'Sales',
    subcategory: 'Pricing Inquiry',
    sentiment: 'Neutral'
  },
  {
    category: 'Technical Support',
    subcategory: 'Bug Report',
    sentiment: 'Negative'
  },

  // 3-level categories
  {
    category: 'Product',
    subcategory: 'Feature Requests',
    subSubcategory: 'UI Improvements',
    sentiment: 'Neutral'
  },
  {
    category: 'Operations',
    subcategory: 'Process Improvement',
    subSubcategory: 'Workflow Optimization',
    sentiment: 'Positive'
  }
];

// Add tagging info helper
function addTaggingInfo(cat, ticket) {
  const isAuto = Math.random() < 0.7;
  const timestamp = new Date(new Date(ticket.createdAt).getTime() + 2000).toISOString();

  if (isAuto) {
    return {
      type: 'auto',
      keyword: (cat.subSubcategory || cat.subcategory || cat.category).toLowerCase(),
      taggedAt: timestamp
    };
  } else {
    const users = ['Sarah Chen', 'Alex Martinez', 'Jordan Lee', 'Taylor Kim'];
    const taggedBy = users[Math.floor(Math.random() * users.length)];
    return {
      type: 'manual',
      taggedBy,
      taggedAt: timestamp
    };
  }
}

// Process tickets
console.log('Adding multiple categorizations to tickets...');
let updatedCount = 0;

data.tickets = data.tickets.map((ticket, idx) => {
  if (!ticket.classification || !ticket.classification.categorizations) {
    return ticket;
  }

  const currentCategories = ticket.classification.categorizations;

  // Skip if already has 2+ categories
  if (currentCategories.length >= 2) {
    console.log(`  ✓ ${ticket.id} already has ${currentCategories.length} categories`);
    return ticket;
  }

  // Add 1-2 additional categories to different tickets
  let additionalCount = 0;

  // Add varying numbers of categories:
  // - 30% get no additional (single category)
  // - 40% get 1 additional (2 categories total)
  // - 30% get 2 additional (3 categories total)
  const rand = Math.random();
  if (rand < 0.3) {
    additionalCount = 0; // Keep single category
  } else if (rand < 0.7) {
    additionalCount = 1; // Add 1 more
  } else {
    additionalCount = 2; // Add 2 more
  }

  if (additionalCount === 0) {
    console.log(`  • ${ticket.id} keeping single category`);
    return ticket;
  }

  // Select random additional categories with varying levels
  const selectedCategories = [];
  const availableCategories = [...additionalCategories];

  for (let i = 0; i < additionalCount && availableCategories.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableCategories.length);
    const cat = availableCategories.splice(randomIndex, 1)[0];

    // Add tagging info
    const taggingInfo = Math.random() < 0.6 ? addTaggingInfo(cat, ticket) : undefined;

    selectedCategories.push({
      ...cat,
      ...(taggingInfo && { taggingInfo })
    });
  }

  const updated = {
    ...ticket,
    classification: {
      ...ticket.classification,
      categorizations: [...currentCategories, ...selectedCategories]
    }
  };

  const levels = selectedCategories.map(c => {
    if (c.subSubcategory) return '3';
    if (c.subcategory) return '2';
    return '1';
  }).join(', ');

  console.log(`  + ${ticket.id} added ${additionalCount} categories (levels: ${levels})`);
  updatedCount++;

  return updated;
});

// Write the updated data back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

console.log('\n✅ Update complete!');
console.log(`   Updated: ${updatedCount} tickets with additional categories`);
console.log(`   Total: ${data.tickets.length} tickets`);
console.log(`\nUpdated file: ${dataPath}`);
