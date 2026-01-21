#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the current data
const dataPath = path.join(__dirname, '../product/sections/inbox/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Entity types, intents, emotions based on ticket context
const entityTypes = ['BRAND', 'PERSON', 'LOCATION', 'PRODUCT', 'ORGANIZATION'];
const intents = ['Complaint', 'Request', 'Query', 'Feedback', 'Appreciation', 'Opportunity'];
const emotions = ['Anger', 'Frustration', 'Disappointment', 'Joy', 'Gratitude', 'Trust', 'Curiosity', 'Confusion'];

// Map ticket data to appropriate classifications
function inferClassificationFields(ticket) {
  const sentiment = ticket.sentiment?.toLowerCase() || 'neutral';
  const ticketIntent = ticket.intent?.toLowerCase() || '';

  // Infer entity type based on aspects/tags
  let entityType = 'BRAND';
  if (ticket.aspects?.some(a => a.includes('product'))) entityType = 'PRODUCT';
  if (ticket.aspects?.some(a => a.includes('delivery') || a.includes('location'))) entityType = 'LOCATION';
  if (ticket.aspects?.some(a => a.includes('staff') || a.includes('service'))) entityType = 'PERSON';

  // Infer intent
  let intent = 'Feedback';
  if (ticketIntent.includes('complaint')) intent = 'Complaint';
  else if (ticketIntent.includes('request') || ticketIntent.includes('support')) intent = 'Request';
  else if (ticketIntent.includes('query') || ticketIntent.includes('question')) intent = 'Query';
  else if (ticketIntent.includes('appreciation') || ticketIntent.includes('praise')) intent = 'Appreciation';
  else if (sentiment === 'negative') intent = 'Complaint';
  else if (sentiment === 'positive') intent = 'Appreciation';

  // Infer emotion based on sentiment
  let emotion, emotionCluster;
  if (sentiment === 'negative') {
    emotionCluster = 'Negative';
    const negativeEmotions = ['Anger', 'Frustration', 'Disappointment', 'Anxiety'];
    emotion = negativeEmotions[Math.floor(Math.random() * negativeEmotions.length)];
  } else if (sentiment === 'positive') {
    emotionCluster = 'Positive';
    const positiveEmotions = ['Joy', 'Gratitude', 'Trust', 'Excitement'];
    emotion = positiveEmotions[Math.floor(Math.random() * positiveEmotions.length)];
  } else {
    emotionCluster = 'Neutral';
    const neutralEmotions = ['Curiosity', 'Confusion', 'Indifference'];
    emotion = neutralEmotions[Math.floor(Math.random() * neutralEmotions.length)];
  }

  return {
    entityType,
    sentiment: sentiment.charAt(0).toUpperCase() + sentiment.slice(1), // Capitalize
    intent,
    emotion,
    emotionCluster,
    upperCategories: ticket.aspects || []
  };
}

// Process tickets
console.log('Fixing classification fields in tickets...');
let updatedCount = 0;

data.tickets = data.tickets.map((ticket) => {
  if (!ticket.classification) {
    console.log(`  • ${ticket.id} has no classification, skipping`);
    return ticket;
  }

  const cls = ticket.classification;

  // Check if fields are missing
  const needsUpdate = !cls.entityType || !cls.intent || !cls.emotion || !cls.emotionCluster;

  if (!needsUpdate) {
    console.log(`  ✓ ${ticket.id} already has all fields`);
    return ticket;
  }

  // Infer missing fields
  const inferred = inferClassificationFields(ticket);

  const updated = {
    ...ticket,
    classification: {
      ...cls,
      entityType: cls.entityType || inferred.entityType,
      sentiment: cls.sentiment || inferred.sentiment,
      intent: cls.intent || inferred.intent,
      emotion: cls.emotion || inferred.emotion,
      emotionCluster: cls.emotionCluster || inferred.emotionCluster,
      upperCategories: cls.upperCategories || inferred.upperCategories
    }
  };

  console.log(`  + ${ticket.id} added: entity=${inferred.entityType}, intent=${inferred.intent}, emotion=${inferred.emotion}`);
  updatedCount++;

  return updated;
});

// Write the updated data back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

console.log('\n✅ Update complete!');
console.log(`   Updated: ${updatedCount} tickets`);
console.log(`   Total: ${data.tickets.length} tickets`);
