#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the current data
const dataPath = path.join(__dirname, '../product/sections/mentions/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Signal matching logic
function getSignalSenseMatches(mention) {
  const matches = [];
  const timestamp = mention.timestamp;

  // High Value Customer (positive + high engagement)
  if (mention.sentiment === 'Positive' && mention.engagementMetrics.reach > 10000) {
    matches.push({
      signalId: 'signal-high-value',
      signalName: 'High Value Customer',
      confidence: 0.88 + Math.random() * 0.07,
      matchedAt: new Date(new Date(timestamp).getTime() + 1000).toISOString()
    });
  }

  // Product Champion (positive + appreciation/praise intent)
  if (mention.sentiment === 'Positive' && ['Appreciation', 'praise'].includes(mention.intent)) {
    matches.push({
      signalId: 'signal-product-champion',
      signalName: 'Product Champion',
      confidence: 0.80 + Math.random() * 0.12,
      matchedAt: new Date(new Date(timestamp).getTime() + 1000).toISOString()
    });
  }

  // Escalation Risk (negative + high priority)
  if (mention.sentiment === 'Negative' && mention.priorityScore > 8.0) {
    matches.push({
      signalId: 'signal-escalation-risk',
      signalName: 'Escalation Risk',
      confidence: 0.85 + Math.random() * 0.10,
      matchedAt: new Date(new Date(timestamp).getTime() + 1000).toISOString()
    });
  }

  // Resolution Opportunity (negative + complaint)
  if (mention.sentiment === 'Negative' && mention.intent === 'Complaint') {
    matches.push({
      signalId: 'signal-resolution-opp',
      signalName: 'Resolution Opportunity',
      confidence: 0.70 + Math.random() * 0.15,
      matchedAt: new Date(new Date(timestamp).getTime() + 1000).toISOString()
    });
  }

  // Product Feedback (product entity + feedback/query intent)
  if (mention.entityType === 'PRODUCT' && ['feedback', 'Query', 'question'].includes(mention.intent)) {
    matches.push({
      signalId: 'signal-product-feedback',
      signalName: 'Product Feedback',
      confidence: 0.75 + Math.random() * 0.15,
      matchedAt: new Date(new Date(timestamp).getTime() + 1000).toISOString()
    });
  }

  // Purchase Intent (neutral/query + sales-related tags)
  if (mention.tags && mention.tags.includes('sales-opportunity')) {
    matches.push({
      signalId: 'signal-purchase-intent',
      signalName: 'Purchase Intent',
      confidence: 0.70 + Math.random() * 0.15,
      matchedAt: new Date(new Date(timestamp).getTime() + 1000).toISOString()
    });
  }

  // At-Risk Customer (negative + first-time or low engagement)
  if (mention.sentiment === 'Negative' && mention.engagementMetrics.reach < 5000) {
    matches.push({
      signalId: 'signal-at-risk',
      signalName: 'At-Risk Customer',
      confidence: 0.72 + Math.random() * 0.16,
      matchedAt: new Date(new Date(timestamp).getTime() + 1000).toISOString()
    });
  }

  // First-Time Buyer (new-customer classification)
  if (mention.classifications && mention.classifications.includes('new-customer')) {
    matches.push({
      signalId: 'signal-first-time',
      signalName: 'First-Time Buyer',
      confidence: 0.65 + Math.random() * 0.20,
      matchedAt: new Date(new Date(timestamp).getTime() + 1000).toISOString()
    });
  }

  // Limit to top 2-3 matches
  return matches.slice(0, Math.min(3, matches.length));
}

// Media generation based on platform
function getMediaForMention(mention) {
  const platform = mention.channel.platform;
  const mentionId = mention.id;

  // Instagram: 80% images
  if (platform === 'instagram') {
    if (Math.random() < 0.8) {
      return [{
        id: `media-${mentionId}-01`,
        type: 'image',
        url: `https://via.placeholder.com/1080x1080/4A90E2/FFFFFF?text=${encodeURIComponent(mention.contentSnippet.slice(0, 30))}`,
        thumbnailUrl: `https://via.placeholder.com/400x400/4A90E2/FFFFFF?text=${encodeURIComponent(mention.id)}`,
        mimeType: 'image/jpeg'
      }];
    }
  }

  // Facebook: 50% images
  if (platform === 'facebook') {
    if (Math.random() < 0.5) {
      return [{
        id: `media-${mentionId}-01`,
        type: 'image',
        url: `https://via.placeholder.com/800x600/1877F2/FFFFFF?text=${encodeURIComponent(mention.id)}`,
        thumbnailUrl: `https://via.placeholder.com/300x225/1877F2/FFFFFF?text=${encodeURIComponent(mention.id)}`,
        mimeType: 'image/jpeg'
      }];
    }
  }

  // Google Reviews: 60% images
  if (platform === 'google') {
    if (Math.random() < 0.6) {
      return [{
        id: `media-${mentionId}-01`,
        type: 'image',
        url: `https://via.placeholder.com/800x600/28A745/FFFFFF?text=Review+Photo`,
        thumbnailUrl: `https://via.placeholder.com/300x225/28A745/FFFFFF?text=Review`,
        mimeType: 'image/jpeg'
      }];
    }
  }

  // YouTube: 100% videos
  if (platform === 'youtube') {
    return [{
      id: `media-${mentionId}-01`,
      type: 'video',
      url: `https://example.com/placeholder/video-${mentionId}.mp4`,
      thumbnailUrl: `https://via.placeholder.com/640x360/FF0000/FFFFFF?text=Video+Thumbnail`,
      mimeType: 'video/mp4'
    }];
  }

  // LinkedIn: 40% images
  if (platform === 'linkedin') {
    if (Math.random() < 0.4) {
      return [{
        id: `media-${mentionId}-01`,
        type: 'image',
        url: `https://via.placeholder.com/800x600/0A66C2/FFFFFF?text=LinkedIn+Post`,
        thumbnailUrl: `https://via.placeholder.com/300x225/0A66C2/FFFFFF?text=LinkedIn`,
        mimeType: 'image/jpeg'
      }];
    }
  }

  // Twitter/X: 30% images
  if (platform === 'x') {
    if (Math.random() < 0.3) {
      return [{
        id: `media-${mentionId}-01`,
        type: 'image',
        url: `https://via.placeholder.com/800x600/000000/FFFFFF?text=Tweet+Image`,
        thumbnailUrl: `https://via.placeholder.com/300x225/000000/FFFFFF?text=Tweet`,
        mimeType: 'image/jpeg'
      }];
    }
  }

  return undefined;
}

// Transform aspects to rich objects (90%+ conversion)
function transformAspects(aspects, mention) {
  if (!aspects || aspects.length === 0) return aspects;

  return aspects.map((aspect, idx) => {
    // Keep 10% as strings for backwards compatibility
    if (idx >= Math.floor(aspects.length * 0.9)) {
      return aspect;
    }

    // Already an object? Return as-is
    if (typeof aspect === 'object') return aspect;

    // Transform string to Aspect object
    const aspectName = aspect;
    let entityName = 'General';
    let entityType = 'Feature';
    let sentiment = mention.sentiment || 'Neutral';
    let opinion = `mentioned ${aspectName}`;

    // Infer entity based on aspect name and mention context
    if (mention.productProfiles && mention.productProfiles.length > 0) {
      entityName = mention.productProfiles[0].name;
      entityType = 'Product';
      opinion = `${aspectName} quality noted`;
    } else if (mention.locationProfile) {
      entityName = mention.locationProfile.name;
      entityType = 'Location';
      opinion = `${aspectName} at ${entityName}`;
    }

    return {
      name: aspectName,
      entityName,
      entityType,
      sentiment,
      opinion
    };
  });
}

// Convert old classifications to new categorizations structure
function convertClassificationsToCategorizations(classifications, mention) {
  if (!classifications || classifications.length === 0) return [];

  const categoryMappings = {
    'detailed-review': { category: 'Product', subcategory: 'General Review', sentiment: mention.sentiment || 'Neutral' },
    'regular-customer': { category: 'Customer Type', subcategory: 'Regular Customer', sentiment: 'Positive' },
    'press-mention': { category: 'Media', subcategory: 'Press Coverage', sentiment: mention.sentiment || 'Positive' },
    'brand-awareness': { category: 'Marketing', subcategory: 'Brand Awareness', sentiment: mention.sentiment || 'Positive' },
    'competitor-comparison': { category: 'Sales', subcategory: 'Competitive Analysis', sentiment: mention.sentiment || 'Neutral' },
    'purchase-intent': { category: 'Sales', subcategory: 'Purchase Intent', sentiment: mention.sentiment || 'Neutral' },
    'product-quality': { category: 'Product', subcategory: 'Quality', sentiment: mention.sentiment || 'Positive' },
    'service-complaint': { category: 'Service', subcategory: 'Complaint', sentiment: 'Negative' },
    'pricing-feedback': { category: 'Product', subcategory: 'Pricing', sentiment: mention.sentiment || 'Neutral' },
    'location-mention': { category: 'Location', subcategory: 'General', sentiment: mention.sentiment || 'Neutral' }
  };

  return classifications.map((classification) => {
    const mapping = categoryMappings[classification] || {
      category: 'General',
      subcategory: classification.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      sentiment: mention.sentiment || 'Neutral'
    };

    return {
      category: mapping.category,
      subcategory: mapping.subcategory,
      sentiment: mapping.sentiment
    };
  });
}

// Generate aspect groups based on mention content
function generateAspectGroups(mention) {
  const aspectGroups = [];
  const content = mention.content.toLowerCase();

  // Product Quality aspects
  const qualityKeywords = ['quality', 'flavor', 'taste', 'delicious', 'excellent', 'perfect', 'smooth', 'rich', 'balanced'];
  const foundQualityKeywords = qualityKeywords.filter(kw => content.includes(kw));

  if (foundQualityKeywords.length > 0) {
    aspectGroups.push({
      name: 'Product Quality',
      icon: '⭐',
      aspects: foundQualityKeywords.slice(0, 3).map((kw, idx) => {
        // 90% as objects, 10% as strings
        if (idx < Math.floor(foundQualityKeywords.length * 0.9)) {
          return {
            name: kw,
            entityName: mention.productProfiles?.[0]?.name || 'Product',
            entityType: 'Product',
            sentiment: mention.sentiment || 'Neutral',
            opinion: `mentioned ${kw}`
          };
        }
        return kw;
      })
    });
  }

  // Service aspects
  const serviceKeywords = ['service', 'staff', 'wait', 'slow', 'fast', 'friendly', 'helpful', 'barista'];
  const foundServiceKeywords = serviceKeywords.filter(kw => content.includes(kw));

  if (foundServiceKeywords.length > 0) {
    aspectGroups.push({
      name: 'Service Experience',
      icon: '👥',
      aspects: foundServiceKeywords.slice(0, 3).map((kw, idx) => {
        if (idx < Math.floor(foundServiceKeywords.length * 0.9)) {
          return {
            name: kw,
            entityName: mention.locationProfile?.name || 'Service',
            entityType: 'Service',
            sentiment: mention.sentiment || 'Neutral',
            opinion: `${kw} experience`
          };
        }
        return kw;
      })
    });
  }

  // Pricing/Value aspects
  const valueKeywords = ['price', 'pricing', 'expensive', 'cheap', 'value', 'worth', 'cost'];
  const foundValueKeywords = valueKeywords.filter(kw => content.includes(kw));

  if (foundValueKeywords.length > 0) {
    aspectGroups.push({
      name: 'Value',
      icon: '💰',
      aspects: foundValueKeywords.slice(0, 2).map((kw, idx) => {
        if (idx === 0) {
          return {
            name: kw,
            entityName: 'Pricing',
            entityType: 'Business',
            sentiment: mention.sentiment || 'Neutral',
            opinion: `${kw} consideration`
          };
        }
        return kw;
      })
    });
  }

  return aspectGroups;
}

// Add tagging info to categorizations
function addTaggingInfo(categorizations, mention) {
  if (!categorizations || categorizations.length === 0) return categorizations;

  return categorizations.map((cat, idx) => {
    // 60% get tagging info
    if (Math.random() > 0.6) return cat;

    // 70% auto, 30% manual
    const isAuto = Math.random() < 0.7;
    const timestamp = new Date(new Date(mention.timestamp).getTime() + 1000).toISOString();

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
      const manualTimestamp = new Date(new Date(mention.timestamp).getTime() + (Math.random() * 3600000)).toISOString();

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

// Add icons to aspect groups
const aspectGroupIcons = {
  'Product Quality': '⭐',
  'Service Speed': '⏱️',
  'Staff Experience': '👥',
  'Dietary Preferences': '🌱',
  'Ambiance': '🏪',
  'Location': '📍',
  'Value': '💰',
  'Cleanliness': '✨'
};

// Process each mention
console.log('Processing mentions...');
let updatedCount = 0;
let skippedCount = 0;

data.mentions = data.mentions.map((mention, idx) => {
  console.log(`Processing ${mention.id}...`);

  // Skip if already properly structured (has categorizations AND aspectGroups)
  if (mention.categorizations && mention.aspectGroups) {
    console.log(`  ✓ ${mention.id} already properly structured, skipping`);
    skippedCount++;
    return mention;
  }

  const updated = { ...mention };

  // Convert old classifications to categorizations
  if (mention.classifications && !mention.categorizations) {
    updated.categorizations = convertClassificationsToCategorizations(mention.classifications, mention);
    console.log(`  + Converted ${mention.classifications.length} classifications to categorizations`);
    delete updated.classifications; // Remove old field
  }

  // Add tagging info to categorizations
  if (updated.categorizations) {
    updated.categorizations = addTaggingInfo(updated.categorizations, mention);
    const taggedCount = updated.categorizations.filter(c => c.taggingInfo).length;
    if (taggedCount > 0) {
      console.log(`  + Added tagging info to ${taggedCount} categorizations`);
    }
  }

  // Generate aspect groups if missing
  if (!mention.aspectGroups) {
    const generatedGroups = generateAspectGroups(mention);
    if (generatedGroups.length > 0) {
      updated.aspectGroups = generatedGroups;
      console.log(`  + Generated ${generatedGroups.length} aspect groups`);
    }
  } else {
    // Transform existing aspectGroups
    updated.aspectGroups = mention.aspectGroups.map(group => {
      const icon = aspectGroupIcons[group.name];
      return {
        ...group,
        icon: icon || undefined,
        aspects: transformAspects(group.aspects, mention)
      };
    });
    console.log(`  + Transformed ${updated.aspectGroups.length} aspect groups`);
  }

  // Transform ungrouped aspects if they exist
  if (mention.ungroupedAspects && mention.ungroupedAspects.length > 0) {
    updated.ungroupedAspects = transformAspects(mention.ungroupedAspects, mention);
    console.log(`  + Transformed ${updated.ungroupedAspects.length} ungrouped aspects`);
  }

  // Add SignalSense matches (~70% coverage) - only if not already present
  if (!mention.signalSenseMatches && (Math.random() < 0.7 || mention.priorityScore > 7.5)) {
    const matches = getSignalSenseMatches(mention);
    if (matches.length > 0) {
      updated.signalSenseMatches = matches;
      console.log(`  + Added ${matches.length} signal matches`);
    }
  }

  // Add media based on platform - only if not already present
  if (!mention.media) {
    const media = getMediaForMention(mention);
    if (media) {
      updated.media = media;
      console.log(`  + Added media (${media[0].type})`);
    }
  }

  updatedCount++;
  return updated;
});

// Write the updated data back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

console.log('\n✅ Update complete!');
console.log(`   Updated: ${updatedCount} mentions`);
console.log(`   Skipped: ${skippedCount} mentions (already updated)`);
console.log(`   Total: ${data.mentions.length} mentions`);
console.log(`\nUpdated file: ${dataPath}`);
