#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the current data
const dataPath = path.join(__dirname, '../product/sections/inbox/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Signal matching logic for tickets
function getSignalSenseMatches(ticket) {
  const matches = [];
  const timestamp = ticket.createdAt;
  const sentiment = ticket.sentiment; // Use ticket-level sentiment
  const priority = ticket.priority;

  // High Value Customer (VIP tier + positive/neutral)
  if (ticket.author?.followerCount > 10000 && ['Positive', 'Neutral'].includes(sentiment)) {
    matches.push({
      signalId: 'signal-high-value',
      signalName: 'High Value Customer',
      confidence: 0.88 + Math.random() * 0.07,
      matchedAt: new Date(new Date(timestamp).getTime() + 1000).toISOString()
    });
  }

  // Escalation Risk (negative + high priority + high follower count)
  if (sentiment === 'Negative' && (priority === 'high' || priority === 'critical') && ticket.author?.followerCount > 5000) {
    matches.push({
      signalId: 'signal-escalation-risk',
      signalName: 'Escalation Risk',
      confidence: 0.85 + Math.random() * 0.10,
      matchedAt: new Date(new Date(timestamp).getTime() + 1000).toISOString()
    });
  }

  // Resolution Opportunity (negative + open/pending status)
  if (sentiment === 'Negative' && ['open', 'pending'].includes(ticket.status)) {
    matches.push({
      signalId: 'signal-resolution-opp',
      signalName: 'Resolution Opportunity',
      confidence: 0.70 + Math.random() * 0.15,
      matchedAt: new Date(new Date(timestamp).getTime() + 1000).toISOString()
    });
  }

  // Purchase Intent (sales-related category or intent)
  if (ticket.intent?.includes('purchase') || ticket.intent?.includes('sales') || ticket.aspects?.includes('pricing')) {
    matches.push({
      signalId: 'signal-purchase-intent',
      signalName: 'Purchase Intent',
      confidence: 0.70 + Math.random() * 0.15,
      matchedAt: new Date(new Date(timestamp).getTime() + 1000).toISOString()
    });
  }

  // Product Feedback (technical or product-related aspects)
  if (ticket.aspects?.some(a => a.includes('product') || a.includes('technical') || a.includes('platform') || a.includes('feature'))) {
    matches.push({
      signalId: 'signal-product-feedback',
      signalName: 'Product Feedback',
      confidence: 0.75 + Math.random() * 0.15,
      matchedAt: new Date(new Date(timestamp).getTime() + 1000).toISOString()
    });
  }

  // At-Risk Customer (negative + VIP)
  if (sentiment === 'Negative' && ticket.author?.followerCount > 10000) {
    matches.push({
      signalId: 'signal-at-risk',
      signalName: 'At-Risk Customer',
      confidence: 0.72 + Math.random() * 0.16,
      matchedAt: new Date(new Date(timestamp).getTime() + 1000).toISOString()
    });
  }

  // Product Champion (positive + high engagement)
  if (sentiment === 'Positive' && ticket.author?.engagementRate > 3.0) {
    matches.push({
      signalId: 'signal-product-champion',
      signalName: 'Product Champion',
      confidence: 0.80 + Math.random() * 0.12,
      matchedAt: new Date(new Date(timestamp).getTime() + 1000).toISOString()
    });
  }

  // Limit to top 3 matches
  return matches.slice(0, Math.min(3, matches.length));
}

// Transform categoryMap to categorizations array
function transformCategoryMap(categoryMap, sentiment) {
  if (!categoryMap) return [];

  const categorizations = [];

  // Main categorization from categoryMap
  categorizations.push({
    category: categoryMap.category || 'General',
    subcategory: categoryMap.subcategory,
    subSubcategory: categoryMap.subSubcategory,
    sentiment: sentiment || 'Neutral'
  });

  return categorizations;
}

// Transform old aspectGroups to new AspectGroup structure
function transformAspectGroups(aspectGroups, sentiment) {
  if (!aspectGroups || aspectGroups.length === 0) return [];

  const aspectGroupIcons = {
    'Product Quality': '⭐',
    'Delivery Experience': '🚚',
    'Service Speed': '⏱️',
    'Staff Experience': '👥',
    'Platform Reliability': '⚙️',
    'Customer Support': '💬',
    'Pricing': '💰',
    'User Experience': '✨'
  };

  return aspectGroups.map(group => {
    const name = group.groupName || group.name;
    const icon = aspectGroupIcons[name];

    // Transform aspects to new format (90% as objects, 10% as strings)
    const transformedAspects = (group.aspects || []).map((aspect, idx) => {
      // Keep 10% as strings for backwards compatibility
      if (idx >= Math.floor(group.aspects.length * 0.9)) {
        return aspect.name || aspect;
      }

      // Transform to Aspect object
      return {
        name: aspect.name,
        entityName: aspect.entity?.value || 'General',
        entityType: aspect.entity?.type || 'Feature',
        sentiment: aspect.sentiment || sentiment || 'Neutral',
        opinion: aspect.customerOpinion || `mentioned ${aspect.name}`
      };
    });

    return {
      name,
      icon,
      aspects: transformedAspects
    };
  });
}

// Add tagging info to categorizations
function addTaggingInfo(categorizations, ticket) {
  if (!categorizations || categorizations.length === 0) return categorizations;

  return categorizations.map((cat) => {
    // 60% get tagging info
    if (Math.random() > 0.6) return cat;

    // 70% auto, 30% manual
    const isAuto = Math.random() < 0.7;
    const timestamp = new Date(new Date(ticket.createdAt).getTime() + 1000).toISOString();

    if (isAuto) {
      // Auto-tagged
      const keyword = cat.subSubcategory || cat.subcategory || cat.category;
      return {
        ...cat,
        taggingInfo: {
          type: 'auto',
          keyword: keyword.toLowerCase(),
          taggedAt: timestamp
        }
      };
    } else {
      // Manual-tagged
      const users = ['Sarah Chen', 'Alex Martinez', 'Jordan Lee', 'Taylor Kim'];
      const taggedBy = users[Math.floor(Math.random() * users.length)];
      const manualTimestamp = new Date(new Date(ticket.createdAt).getTime() + (Math.random() * 3600000)).toISOString();

      return {
        ...cat,
        taggingInfo: {
          type: 'manual',
          taggedBy,
          taggedAt: manualTimestamp
        }
      };
    }
  });
}

// Add media to conversation thread mentions
function addMediaToConversation(conversation, author) {
  if (!conversation || conversation.length === 0) return conversation;

  const platform = author?.platform;

  return conversation.map(message => {
    // Skip if already has media
    if (message.media) return message;

    // Only add to customer messages (not replies)
    if (message.type === 'reply') return message;

    // Platform-based media generation
    let shouldAddMedia = false;
    let mediaType = 'image';

    if (platform === 'instagram') {
      shouldAddMedia = Math.random() < 0.6;
    } else if (platform === 'whatsapp') {
      shouldAddMedia = Math.random() < 0.4;
    } else if (platform === 'facebook') {
      shouldAddMedia = Math.random() < 0.3;
    }

    if (shouldAddMedia) {
      return {
        ...message,
        media: [{
          id: `media-${message.id || Date.now()}-01`,
          type: mediaType,
          url: `https://via.placeholder.com/800x600/${platform === 'instagram' ? '4A90E2' : platform === 'whatsapp' ? '25D366' : '1877F2'}/FFFFFF?text=Message+Image`,
          thumbnailUrl: `https://via.placeholder.com/300x225/4A90E2/FFFFFF?text=Thumbnail`,
          mimeType: 'image/jpeg'
        }]
      };
    }

    return message;
  });
}

// Add emailContent for email interaction types
function addEmailContent(ticket) {
  // Check if this is an email ticket
  const isEmail = ticket.interactionType === 'email' ||
                  ticket.channel?.name?.toLowerCase().includes('email') ||
                  ticket.author?.platform === 'email';

  if (!isEmail || ticket.emailContent) return null;

  // Get the main message content
  const mainContent = ticket.conversation?.[0]?.content || ticket.summary || '';

  // 30% should have document attachments
  const hasAttachment = Math.random() < 0.3;
  const attachments = hasAttachment ? [{
    id: `attach-${ticket.id}-001`,
    type: 'document',
    url: `https://example.com/placeholder/document-${ticket.id}.pdf`,
    fileName: `receipt-${ticket.ticketNumber}.pdf`,
    fileSize: 156000 + Math.floor(Math.random() * 500000),
    mimeType: 'application/pdf'
  }] : [];

  return {
    htmlBody: `<div style="font-family: Arial, sans-serif;">${mainContent}</div>`,
    simplifiedText: mainContent,
    attachments
  };
}

// Process each ticket
console.log('Processing tickets...');
let updatedCount = 0;
let skippedCount = 0;

data.tickets = data.tickets.map((ticket) => {
  console.log(`Processing ${ticket.id}...`);

  // Skip if already has categorizations AND signalSenseMatches (fully updated)
  if (ticket.classification?.categorizations && ticket.classification?.signalSenseMatches) {
    console.log(`  ✓ ${ticket.id} already fully updated, skipping`);
    skippedCount++;
    return ticket;
  }

  const updated = { ...ticket };

  // Transform classification structure
  if (ticket.classification) {
    const oldClassification = ticket.classification;

    // Convert categoryMap to categorizations (only if not already done)
    let categorizations = oldClassification.categorizations;
    if (!categorizations || categorizations.length === 0) {
      categorizations = transformCategoryMap(
        oldClassification.categoryMap,
        ticket.sentiment // Use ticket-level sentiment
      );
      // Add tagging info
      categorizations = addTaggingInfo(categorizations, ticket);
    }

    // Transform aspectGroups (only if not already done)
    let aspectGroups = oldClassification.aspectGroups;
    if (aspectGroups && aspectGroups.length > 0 && aspectGroups[0].groupName) {
      // Has old structure with groupName, needs transformation
      aspectGroups = transformAspectGroups(
        oldClassification.aspectGroups,
        ticket.sentiment
      );
    } else if (!aspectGroups || aspectGroups.length === 0) {
      // No aspect groups, keep empty
      aspectGroups = [];
    }

    // Build new classification object
    updated.classification = {
      ...oldClassification,
      categorizations,
      aspectGroups,
      ungroupedAspects: oldClassification.ungroupedAspects || [],
    };

    // Remove old categoryMap field if it exists
    const hadCategoryMap = !!updated.classification.categoryMap;
    if (updated.classification.categoryMap) {
      delete updated.classification.categoryMap;
    }

    if (hadCategoryMap) {
      console.log(`  + Converted categoryMap to categorizations`);
    }
    if (aspectGroups.length > 0 && hadCategoryMap) {
      console.log(`  + Transformed ${aspectGroups.length} aspect groups`);
    }

    const taggedCount = categorizations.filter(c => c.taggingInfo).length;
    if (taggedCount > 0 && hadCategoryMap) {
      console.log(`  + Added tagging info to ${taggedCount} categorizations`);
    }
  }

  // Add SignalSense matches (~70% coverage) - only if classification exists
  if (updated.classification && !updated.classification.signalSenseMatches && (Math.random() < 0.7 || ticket.priority === 'high' || ticket.priority === 'critical')) {
    const matches = getSignalSenseMatches(ticket);
    if (matches.length > 0) {
      updated.classification.signalSenseMatches = matches;
      console.log(`  + Added ${matches.length} signal matches`);
    }
  }

  // Add media to conversation thread
  if (ticket.conversation) {
    const originalLength = ticket.conversation.length;
    updated.conversation = addMediaToConversation(ticket.conversation, ticket.author);
    const mediaAdded = updated.conversation.filter(m => m.media).length - ticket.conversation.filter(m => m.media).length;
    if (mediaAdded > 0) {
      console.log(`  + Added media to ${mediaAdded} conversation messages`);
    }
  }

  // Add emailContent for email tickets
  const emailContent = addEmailContent(ticket);
  if (emailContent) {
    updated.emailContent = emailContent;
    console.log(`  + Added emailContent with ${emailContent.attachments.length} attachments`);
  }

  updatedCount++;
  return updated;
});

// Write the updated data back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

console.log('\n✅ Update complete!');
console.log(`   Updated: ${updatedCount} tickets`);
console.log(`   Skipped: ${skippedCount} tickets (already updated)`);
console.log(`   Total: ${data.tickets.length} tickets`);
console.log(`\nUpdated file: ${dataPath}`);
