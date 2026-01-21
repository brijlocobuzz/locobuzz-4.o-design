// ============================================================================
// UNIFIED FILTER SYSTEM - FILTER CONFIGURATION
// ============================================================================
// This file contains the complete configuration for all filter families,
// attributes, slash commands, and their associated options.
// ============================================================================

import type {
    FilterFamily,
    FilterAttribute,
    SlashCommand,
    Operator,
    DatePreset,
} from './types';
import { OPERATORS_BY_TYPE } from './types';

// ----------------------------------------------------------------------------
// DATE PRESETS - Common date range presets
// ----------------------------------------------------------------------------

export const DATE_PRESETS: DatePreset[] = [
    { label: 'Today', value: { type: 'relative', amount: 0, unit: 'days' } },
    { label: 'Yesterday', value: { type: 'relative', amount: 1, unit: 'days' } },
    { label: 'Last 7 days', value: { type: 'relative', amount: 7, unit: 'days' } },
    { label: 'Last 14 days', value: { type: 'relative', amount: 14, unit: 'days' } },
    { label: 'Last 30 days', value: { type: 'relative', amount: 30, unit: 'days' } },
    { label: 'Last 90 days', value: { type: 'relative', amount: 90, unit: 'days' } },
    { label: 'This week', value: { type: 'relative', amount: 0, unit: 'weeks' } },
    { label: 'This month', value: { type: 'relative', amount: 0, unit: 'months' } },
    { label: 'Last month', value: { type: 'relative', amount: 1, unit: 'months' } },
];

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------------

function getDefaultOperator(operators: Operator[]): Operator {
    return operators[0];
}

// ----------------------------------------------------------------------------
// TICKETS & MENTIONS ATTRIBUTES
// ----------------------------------------------------------------------------

const ticketsMentionsAttributes: FilterAttribute[] = [
    {
        id: 'ticket_status',
        name: 'Ticket Status',
        family: 'tickets_mentions',
        dataType: 'SINGLE_SELECT',
        operators: OPERATORS_BY_TYPE.SINGLE_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.SINGLE_SELECT),
        slashCommand: '/status',
        searchable: true,
        quickFilter: true,
        valueConfig: {
            inputType: 'dropdown',
            options: [
                { value: 'open', label: 'Open', color: '#22C55E' },
                { value: 'on_hold', label: 'On Hold', color: '#F59E0B' },
                { value: 'pending', label: 'Pending', color: '#3B82F6' },
                { value: 'closed', label: 'Closed', color: '#64748B' },
            ],
            placeholder: 'Select status',
        },
    },
    {
        id: 'reply_status',
        name: 'Reply Status',
        family: 'tickets_mentions',
        dataType: 'SINGLE_SELECT',
        operators: OPERATORS_BY_TYPE.SINGLE_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.SINGLE_SELECT),
        searchable: true,
        valueConfig: {
            inputType: 'dropdown',
            options: [
                { value: 'replied', label: 'Replied', color: '#22C55E' },
                { value: 'not_replied', label: 'Not Replied', color: '#EF4444' },
                { value: 'awaiting_reply', label: 'Awaiting Reply', color: '#F59E0B' },
            ],
            placeholder: 'Select reply status',
        },
    },
    {
        id: 'sentiment',
        name: 'Sentiment',
        family: 'tickets_mentions',
        dataType: 'SINGLE_SELECT',
        operators: OPERATORS_BY_TYPE.SINGLE_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.SINGLE_SELECT),
        slashCommand: '/sentiment',
        searchable: true,
        quickFilter: true,
        valueConfig: {
            inputType: 'dropdown',
            options: [
                { value: 'positive', label: 'Positive', color: '#22C55E', icon: '😊' },
                { value: 'neutral', label: 'Neutral', color: '#F59E0B', icon: '😐' },
                { value: 'negative', label: 'Negative', color: '#EF4444', icon: '😠' },
            ],
            placeholder: 'Select sentiment',
        },
    },
    {
        id: 'priority',
        name: 'Priority',
        family: 'tickets_mentions',
        dataType: 'SINGLE_SELECT',
        operators: OPERATORS_BY_TYPE.SINGLE_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.SINGLE_SELECT),
        slashCommand: '/priority',
        searchable: true,
        quickFilter: true,
        valueConfig: {
            inputType: 'dropdown',
            options: [
                { value: 'critical', label: 'Critical', color: '#7C3AED', icon: '🔴' },
                { value: 'high', label: 'High', color: '#EF4444', icon: '🟠' },
                { value: 'medium', label: 'Medium', color: '#F59E0B', icon: '🟡' },
                { value: 'low', label: 'Low', color: '#22C55E', icon: '🟢' },
            ],
            placeholder: 'Select priority',
        },
    },
    {
        id: 'channel',
        name: 'Channel',
        family: 'tickets_mentions',
        dataType: 'MULTI_SELECT',
        operators: OPERATORS_BY_TYPE.MULTI_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.MULTI_SELECT),
        slashCommand: '/channel',
        searchable: true,
        quickFilter: true,
        valueConfig: {
            inputType: 'checkbox_list',
            searchable: true,
            allowMultiple: true,
            options: [
                { value: 'twitter', label: 'Twitter / X', icon: '𝕏' },
                { value: 'facebook', label: 'Facebook', icon: '📘' },
                { value: 'instagram', label: 'Instagram', icon: '📸' },
                { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
                { value: 'youtube', label: 'YouTube', icon: '▶️' },
                { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
                { value: 'email', label: 'Email', icon: '✉️' },
                { value: 'web', label: 'Web', icon: '🌐' },
                { value: 'app', label: 'App', icon: '📱' },
                { value: 'google_business', label: 'Google Business', icon: '🏢' },
                { value: 'tiktok', label: 'TikTok', icon: '🎵' },
            ],
            placeholder: 'Select channels',
        },
    },
    {
        id: 'assigned_to',
        name: 'Assigned To',
        family: 'tickets_mentions',
        dataType: 'USER_PICKER',
        operators: OPERATORS_BY_TYPE.USER_PICKER,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.USER_PICKER),
        slashCommand: '/assigned',
        searchable: true,
        quickFilter: true,
        valueConfig: {
            inputType: 'user_search',
            placeholder: 'Search users...',
            allowMultiple: true,
        },
    },
    {
        id: 'assigned_by',
        name: 'Assigned By',
        family: 'tickets_mentions',
        dataType: 'USER_PICKER',
        operators: OPERATORS_BY_TYPE.USER_PICKER,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.USER_PICKER),
        searchable: true,
        valueConfig: {
            inputType: 'user_search',
            placeholder: 'Search users...',
            allowMultiple: true,
        },
    },
    {
        id: 'closed_by',
        name: 'Closed By',
        family: 'tickets_mentions',
        dataType: 'USER_PICKER',
        operators: OPERATORS_BY_TYPE.USER_PICKER,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.USER_PICKER),
        searchable: true,
        valueConfig: {
            inputType: 'user_search',
            placeholder: 'Search users...',
            allowMultiple: true,
        },
    },
    {
        id: 'created_by',
        name: 'Created By',
        family: 'tickets_mentions',
        dataType: 'USER_PICKER',
        operators: OPERATORS_BY_TYPE.USER_PICKER,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.USER_PICKER),
        searchable: true,
        valueConfig: {
            inputType: 'user_search',
            placeholder: 'Search users...',
            allowMultiple: true,
        },
    },
    {
        id: 'team_name',
        name: 'Team Name',
        family: 'tickets_mentions',
        dataType: 'TEAM_PICKER',
        operators: OPERATORS_BY_TYPE.TEAM_PICKER,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.TEAM_PICKER),
        slashCommand: '/team',
        searchable: true,
        valueConfig: {
            inputType: 'team_dropdown',
            placeholder: 'Select team',
            optionsEndpoint: '/api/teams',
        },
    },
    {
        id: 'sla_breach',
        name: 'SLA Breach',
        family: 'tickets_mentions',
        dataType: 'SINGLE_SELECT',
        operators: OPERATORS_BY_TYPE.SINGLE_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.SINGLE_SELECT),
        slashCommand: '/sla',
        searchable: true,
        valueConfig: {
            inputType: 'dropdown',
            options: [
                { value: 'breached', label: 'Breached', color: '#EF4444' },
                { value: 'at_risk', label: 'At Risk', color: '#F59E0B' },
                { value: 'not_breached', label: 'Not Breached', color: '#22C55E' },
            ],
            placeholder: 'Select SLA status',
        },
    },
    {
        id: 'upper_category',
        name: 'Upper Category',
        family: 'tickets_mentions',
        dataType: 'HIERARCHICAL',
        operators: OPERATORS_BY_TYPE.HIERARCHICAL,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.HIERARCHICAL),
        searchable: true,
        valueConfig: {
            inputType: 'tree_picker',
            placeholder: 'Select category',
            optionsEndpoint: '/api/categories',
        },
    },
    {
        id: 'category',
        name: 'Category',
        family: 'tickets_mentions',
        dataType: 'HIERARCHICAL',
        operators: OPERATORS_BY_TYPE.HIERARCHICAL,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.HIERARCHICAL),
        slashCommand: '/category',
        searchable: true,
        dependencies: [{ attribute: 'upper_category', type: 'filter_options' }],
        valueConfig: {
            inputType: 'tree_picker',
            placeholder: 'Select category',
            optionsEndpoint: '/api/categories',
        },
    },
    {
        id: 'social_profile',
        name: 'Social Profile',
        family: 'tickets_mentions',
        dataType: 'MULTI_SELECT',
        operators: OPERATORS_BY_TYPE.MULTI_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.MULTI_SELECT),
        searchable: true,
        valueConfig: {
            inputType: 'checkbox_list',
            searchable: true,
            allowMultiple: true,
            optionsEndpoint: '/api/social-profiles',
            placeholder: 'Select profiles',
        },
    },
    {
        id: 'ticket_disposition',
        name: 'Ticket Disposition',
        family: 'tickets_mentions',
        dataType: 'SINGLE_SELECT',
        operators: OPERATORS_BY_TYPE.SINGLE_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.SINGLE_SELECT),
        searchable: true,
        valueConfig: {
            inputType: 'dropdown',
            options: [
                { value: 'resolved', label: 'Resolved' },
                { value: 'unresolved', label: 'Unresolved' },
                { value: 'duplicate', label: 'Duplicate' },
                { value: 'spam', label: 'Spam' },
                { value: 'not_applicable', label: 'Not Applicable' },
            ],
            placeholder: 'Select disposition',
        },
    },
    {
        id: 'skills',
        name: 'Skills',
        family: 'tickets_mentions',
        dataType: 'MULTI_SELECT',
        operators: OPERATORS_BY_TYPE.MULTI_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.MULTI_SELECT),
        searchable: true,
        valueConfig: {
            inputType: 'checkbox_list',
            searchable: true,
            allowMultiple: true,
            optionsEndpoint: '/api/skills',
            placeholder: 'Select skills',
        },
    },
    {
        id: 'auto_closure_enabled',
        name: 'Auto Closure Enabled',
        family: 'tickets_mentions',
        dataType: 'BOOLEAN',
        operators: OPERATORS_BY_TYPE.BOOLEAN,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.BOOLEAN),
        searchable: true,
        valueConfig: {
            inputType: 'toggle',
        },
    },
    {
        id: 'subscribed_ticket',
        name: 'Subscribed Ticket',
        family: 'tickets_mentions',
        dataType: 'BOOLEAN',
        operators: OPERATORS_BY_TYPE.BOOLEAN,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.BOOLEAN),
        searchable: true,
        valueConfig: {
            inputType: 'toggle',
        },
    },
    {
        id: 'media_type',
        name: 'Media Type',
        family: 'tickets_mentions',
        dataType: 'MULTI_SELECT',
        operators: OPERATORS_BY_TYPE.MULTI_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.MULTI_SELECT),
        searchable: true,
        valueConfig: {
            inputType: 'checkbox_list',
            allowMultiple: true,
            options: [
                { value: 'image', label: 'Image', icon: '🖼️' },
                { value: 'video', label: 'Video', icon: '🎬' },
                { value: 'gif', label: 'GIF', icon: '🎞️' },
                { value: 'link', label: 'Link', icon: '🔗' },
                { value: 'text_only', label: 'Text Only', icon: '📝' },
                { value: 'carousel', label: 'Carousel', icon: '🎠' },
            ],
            placeholder: 'Select media types',
        },
    },
    {
        id: 'quote_tweet',
        name: 'Quote Tweet',
        family: 'tickets_mentions',
        dataType: 'BOOLEAN',
        operators: OPERATORS_BY_TYPE.BOOLEAN,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.BOOLEAN),
        searchable: true,
        valueConfig: {
            inputType: 'toggle',
        },
    },
    {
        id: 'retweet',
        name: 'Retweet',
        family: 'tickets_mentions',
        dataType: 'BOOLEAN',
        operators: OPERATORS_BY_TYPE.BOOLEAN,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.BOOLEAN),
        searchable: true,
        valueConfig: {
            inputType: 'toggle',
        },
    },
    {
        id: 'deleted_from_social',
        name: 'Deleted from Social',
        family: 'tickets_mentions',
        dataType: 'BOOLEAN',
        operators: OPERATORS_BY_TYPE.BOOLEAN,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.BOOLEAN),
        searchable: true,
        valueConfig: {
            inputType: 'toggle',
        },
    },
    {
        id: 'hidden_from_social',
        name: 'Hidden from Social',
        family: 'tickets_mentions',
        dataType: 'BOOLEAN',
        operators: OPERATORS_BY_TYPE.BOOLEAN,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.BOOLEAN),
        searchable: true,
        valueConfig: {
            inputType: 'toggle',
        },
    },
    {
        id: 'booking_id',
        name: 'Booking ID',
        family: 'tickets_mentions',
        dataType: 'TEXT',
        operators: OPERATORS_BY_TYPE.TEXT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.TEXT),
        searchable: true,
        valueConfig: {
            inputType: 'text',
            placeholder: 'Enter booking ID',
        },
    },
    {
        id: 'customer_id',
        name: 'Customer ID',
        family: 'tickets_mentions',
        dataType: 'TEXT',
        operators: OPERATORS_BY_TYPE.TEXT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.TEXT),
        searchable: true,
        valueConfig: {
            inputType: 'text',
            placeholder: 'Enter customer ID',
        },
    },
    {
        id: 'mark_as',
        name: 'Mark As',
        family: 'tickets_mentions',
        dataType: 'MULTI_SELECT',
        operators: OPERATORS_BY_TYPE.MULTI_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.MULTI_SELECT),
        searchable: true,
        valueConfig: {
            inputType: 'checkbox_list',
            allowMultiple: true,
            options: [
                { value: 'spam', label: 'Spam', icon: '🚫' },
                { value: 'important', label: 'Important', icon: '⭐' },
                { value: 'follow_up', label: 'Follow-up', icon: '🔔' },
                { value: 'escalated', label: 'Escalated', icon: '⚠️' },
            ],
            placeholder: 'Select marks',
        },
    },
    {
        id: 'language',
        name: 'Language',
        family: 'tickets_mentions',
        dataType: 'MULTI_SELECT',
        operators: OPERATORS_BY_TYPE.MULTI_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.MULTI_SELECT),
        searchable: true,
        valueConfig: {
            inputType: 'checkbox_list',
            searchable: true,
            allowMultiple: true,
            options: [
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
                { value: 'de', label: 'German' },
                { value: 'hi', label: 'Hindi' },
                { value: 'pt', label: 'Portuguese' },
                { value: 'ar', label: 'Arabic' },
                { value: 'zh', label: 'Chinese' },
                { value: 'ja', label: 'Japanese' },
                { value: 'ko', label: 'Korean' },
            ],
            placeholder: 'Select languages',
        },
    },
    {
        id: 'created_date',
        name: 'Created Date',
        family: 'tickets_mentions',
        dataType: 'DATE',
        operators: OPERATORS_BY_TYPE.DATE,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.DATE),
        slashCommand: '/date',
        searchable: true,
        valueConfig: {
            inputType: 'date_picker',
            presets: DATE_PRESETS,
            placeholder: 'Select date',
        },
    },
    {
        id: 'closed_date',
        name: 'Closed Date',
        family: 'tickets_mentions',
        dataType: 'DATE',
        operators: OPERATORS_BY_TYPE.DATE,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.DATE),
        searchable: true,
        valueConfig: {
            inputType: 'date_picker',
            presets: DATE_PRESETS,
            placeholder: 'Select date',
        },
    },
    {
        id: 'keyword',
        name: 'Keyword',
        family: 'tickets_mentions',
        dataType: 'TEXT',
        operators: OPERATORS_BY_TYPE.TEXT,
        defaultOperator: { key: 'contains', label: 'contains', valueRequired: true },
        slashCommand: '/keyword',
        searchable: true,
        quickFilter: true,
        valueConfig: {
            inputType: 'text',
            placeholder: 'Enter keyword...',
        },
    },
];

// ----------------------------------------------------------------------------
// AI FEATURES ATTRIBUTES
// ----------------------------------------------------------------------------

const aiFeaturesAttributes: FilterAttribute[] = [
    {
        id: 'aspects',
        name: 'Aspects',
        family: 'ai_features',
        dataType: 'TAG_PICKER',
        operators: OPERATORS_BY_TYPE.TAG_PICKER,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.TAG_PICKER),
        searchable: true,
        valueConfig: {
            inputType: 'tag_input',
            searchable: true,
            optionsEndpoint: '/api/aspects',
            placeholder: 'Search aspects...',
        },
    },
    {
        id: 'signal_sense',
        name: 'SignalSense',
        family: 'ai_features',
        dataType: 'TAG_PICKER',
        operators: OPERATORS_BY_TYPE.TAG_PICKER,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.TAG_PICKER),
        searchable: true,
        valueConfig: {
            inputType: 'tag_input',
            searchable: true,
            options: [
                { value: 'travel', label: 'Travel' },
                { value: 'travel_essentials', label: 'Travel Essentials' },
                { value: 'service_experience', label: 'Service Experience' },
                { value: 'booking_issues', label: 'Booking Issues' },
                { value: 'refund_request', label: 'Refund Request' },
                { value: 'complaint', label: 'Complaint' },
                { value: 'praise', label: 'Praise' },
                { value: 'suggestion', label: 'Suggestion' },
            ],
            placeholder: 'Search SignalSense tags...',
        },
    },
    {
        id: 'ticket_summary',
        name: 'Ticket Summary',
        family: 'ai_features',
        dataType: 'TEXT',
        operators: [
            { key: 'contains', label: 'contains', valueRequired: true },
            { key: 'not_contains', label: 'does not contain', valueRequired: true },
            { key: 'is_set', label: 'is set', valueRequired: false },
            { key: 'is_not_set', label: 'is not set', valueRequired: false },
        ],
        defaultOperator: { key: 'contains', label: 'contains', valueRequired: true },
        searchable: true,
        valueConfig: {
            inputType: 'text',
            placeholder: 'Search in AI summary...',
        },
    },
    {
        id: 'response_genie',
        name: 'Response Genie',
        family: 'ai_features',
        dataType: 'SINGLE_SELECT',
        operators: OPERATORS_BY_TYPE.SINGLE_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.SINGLE_SELECT),
        searchable: true,
        valueConfig: {
            inputType: 'dropdown',
            options: [
                { value: 'suggested', label: 'Suggested', color: '#3B82F6' },
                { value: 'used', label: 'Used', color: '#22C55E' },
                { value: 'modified', label: 'Modified', color: '#F59E0B' },
                { value: 'ignored', label: 'Ignored', color: '#64748B' },
            ],
            placeholder: 'Select Response Genie status',
        },
    },
    {
        id: 'agent_iq',
        name: 'AgentIQ™',
        family: 'ai_features',
        dataType: 'SINGLE_SELECT',
        operators: OPERATORS_BY_TYPE.SINGLE_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.SINGLE_SELECT),
        searchable: true,
        valueConfig: {
            inputType: 'dropdown',
            options: [
                { value: 'passed', label: 'Passed', color: '#22C55E' },
                { value: 'failed', label: 'Failed', color: '#EF4444' },
                { value: 'pending_review', label: 'Pending Review', color: '#F59E0B' },
                { value: 'not_evaluated', label: 'Not Evaluated', color: '#64748B' },
            ],
            placeholder: 'Select AgentIQ status',
        },
    },
];

// ----------------------------------------------------------------------------
// SURVEYS & RATINGS ATTRIBUTES
// ----------------------------------------------------------------------------

const surveysRatingsAttributes: FilterAttribute[] = [
    {
        id: 'feedback_type',
        name: 'Feedback Type',
        family: 'surveys_ratings',
        dataType: 'SINGLE_SELECT',
        operators: OPERATORS_BY_TYPE.SINGLE_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.SINGLE_SELECT),
        searchable: true,
        valueConfig: {
            inputType: 'dropdown',
            options: [
                { value: 'csat', label: 'CSAT' },
                { value: 'nps', label: 'NPS' },
                { value: 'ces', label: 'CES' },
                { value: 'custom', label: 'Custom Survey' },
            ],
            placeholder: 'Select feedback type',
        },
    },
    {
        id: 'feedback_requested',
        name: 'Feedback Requested',
        family: 'surveys_ratings',
        dataType: 'BOOLEAN',
        operators: OPERATORS_BY_TYPE.BOOLEAN,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.BOOLEAN),
        searchable: true,
        valueConfig: {
            inputType: 'toggle',
        },
    },
    {
        id: 'rating',
        name: 'Rating',
        family: 'surveys_ratings',
        dataType: 'NUMBER',
        operators: OPERATORS_BY_TYPE.NUMBER,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.NUMBER),
        searchable: true,
        valueConfig: {
            inputType: 'slider',
            min: 1,
            max: 5,
            step: 1,
            placeholder: 'Select rating',
        },
    },
    {
        id: 'nps_rating',
        name: 'NPS Rating',
        family: 'surveys_ratings',
        dataType: 'NUMBER',
        operators: OPERATORS_BY_TYPE.NUMBER,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.NUMBER),
        searchable: true,
        valueConfig: {
            inputType: 'slider',
            min: 0,
            max: 10,
            step: 1,
            placeholder: 'Select NPS rating',
        },
    },
    {
        id: 'app_version',
        name: 'App Version',
        family: 'surveys_ratings',
        dataType: 'TEXT',
        operators: OPERATORS_BY_TYPE.TEXT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.TEXT),
        searchable: true,
        valueConfig: {
            inputType: 'text',
            placeholder: 'Enter app version',
        },
    },
    {
        id: 'os_version',
        name: 'OS Version',
        family: 'surveys_ratings',
        dataType: 'TEXT',
        operators: OPERATORS_BY_TYPE.TEXT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.TEXT),
        searchable: true,
        valueConfig: {
            inputType: 'text',
            placeholder: 'Enter OS version',
        },
    },
    {
        id: 'device_name',
        name: 'Device Name',
        family: 'surveys_ratings',
        dataType: 'TEXT',
        operators: OPERATORS_BY_TYPE.TEXT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.TEXT),
        searchable: true,
        valueConfig: {
            inputType: 'text',
            placeholder: 'Enter device name',
        },
    },
];

// ----------------------------------------------------------------------------
// USER CHARACTERISTICS ATTRIBUTES
// ----------------------------------------------------------------------------

const userCharacteristicsAttributes: FilterAttribute[] = [
    {
        id: 'author_name',
        name: 'Author Name',
        family: 'user_characteristics',
        dataType: 'TEXT',
        operators: OPERATORS_BY_TYPE.TEXT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.TEXT),
        searchable: true,
        valueConfig: {
            inputType: 'text',
            placeholder: 'Enter author name',
        },
    },
    {
        id: 'followers_count',
        name: 'Followers Count',
        family: 'user_characteristics',
        dataType: 'NUMBER',
        operators: OPERATORS_BY_TYPE.NUMBER,
        defaultOperator: { key: 'greater_than_or_equal', label: '≥', valueRequired: true, valueCount: 1 },
        searchable: true,
        valueConfig: {
            inputType: 'number',
            min: 0,
            max: 100000000,
            step: 100,
            placeholder: 'Enter follower count',
        },
    },
    {
        id: 'influencer_category',
        name: 'Influencer Category',
        family: 'user_characteristics',
        dataType: 'SINGLE_SELECT',
        operators: OPERATORS_BY_TYPE.SINGLE_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.SINGLE_SELECT),
        searchable: true,
        valueConfig: {
            inputType: 'dropdown',
            options: [
                { value: 'nano', label: 'Nano (1K-10K)', color: '#94A3B8' },
                { value: 'micro', label: 'Micro (10K-50K)', color: '#22C55E' },
                { value: 'mid', label: 'Mid (50K-500K)', color: '#3B82F6' },
                { value: 'macro', label: 'Macro (500K-1M)', color: '#8B5CF6' },
                { value: 'mega', label: 'Mega (1M+)', color: '#EC4899' },
            ],
            placeholder: 'Select influencer category',
        },
    },
    {
        id: 'verified_status',
        name: 'Verified / Not Verified',
        family: 'user_characteristics',
        dataType: 'BOOLEAN',
        operators: OPERATORS_BY_TYPE.BOOLEAN,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.BOOLEAN),
        searchable: true,
        valueConfig: {
            inputType: 'toggle',
        },
    },
    {
        id: 'sentiment_uplift_score',
        name: 'Sentiment Uplift Score',
        family: 'user_characteristics',
        dataType: 'NUMBER',
        operators: OPERATORS_BY_TYPE.NUMBER,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.NUMBER),
        searchable: true,
        valueConfig: {
            inputType: 'slider',
            min: -100,
            max: 100,
            step: 1,
            placeholder: 'Enter score',
        },
    },
    {
        id: 'user_with',
        name: 'User With',
        family: 'user_characteristics',
        dataType: 'MULTI_SELECT',
        operators: OPERATORS_BY_TYPE.MULTI_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.MULTI_SELECT),
        searchable: true,
        valueConfig: {
            inputType: 'checkbox_list',
            allowMultiple: true,
            options: [
                { value: 'profile_picture', label: 'Profile Picture', icon: '🖼️' },
                { value: 'bio', label: 'Bio', icon: '📝' },
                { value: 'website_link', label: 'Website Link', icon: '🔗' },
                { value: 'location', label: 'Location', icon: '📍' },
            ],
            placeholder: 'Select user characteristics',
        },
    },
];

// ----------------------------------------------------------------------------
// LOCATION INTELLIGENCE ATTRIBUTES
// ----------------------------------------------------------------------------

const locationIntelligenceAttributes: FilterAttribute[] = [
    {
        id: 'location_profiles',
        name: 'Location Profiles',
        family: 'location_intelligence',
        dataType: 'MULTI_SELECT',
        operators: OPERATORS_BY_TYPE.MULTI_SELECT,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.MULTI_SELECT),
        searchable: true,
        valueConfig: {
            inputType: 'checkbox_list',
            searchable: true,
            allowMultiple: true,
            optionsEndpoint: '/api/location-profiles',
            placeholder: 'Select location profiles',
        },
    },
    {
        id: 'location_managers',
        name: 'Location Managers',
        family: 'location_intelligence',
        dataType: 'USER_PICKER',
        operators: OPERATORS_BY_TYPE.USER_PICKER,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.USER_PICKER),
        searchable: true,
        valueConfig: {
            inputType: 'user_search',
            placeholder: 'Search managers...',
            allowMultiple: true,
        },
    },
    {
        id: 'location_tags',
        name: 'Location Tags',
        family: 'location_intelligence',
        dataType: 'TAG_PICKER',
        operators: OPERATORS_BY_TYPE.TAG_PICKER,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.TAG_PICKER),
        searchable: true,
        valueConfig: {
            inputType: 'tag_input',
            searchable: true,
            optionsEndpoint: '/api/location-tags',
            placeholder: 'Search location tags...',
        },
    },
    {
        id: 'country',
        name: 'Country',
        family: 'location_intelligence',
        dataType: 'LOCATION',
        operators: OPERATORS_BY_TYPE.LOCATION,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.LOCATION),
        searchable: true,
        valueConfig: {
            inputType: 'cascading_dropdown',
            searchable: true,
            optionsEndpoint: '/api/countries',
            placeholder: 'Select country',
        },
    },
    {
        id: 'states',
        name: 'States',
        family: 'location_intelligence',
        dataType: 'LOCATION',
        operators: OPERATORS_BY_TYPE.LOCATION,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.LOCATION),
        dependencies: [{ attribute: 'country', type: 'filter_options' }],
        searchable: true,
        valueConfig: {
            inputType: 'cascading_dropdown',
            searchable: true,
            optionsEndpoint: '/api/states',
            placeholder: 'Select state',
        },
    },
    {
        id: 'cities',
        name: 'Cities',
        family: 'location_intelligence',
        dataType: 'LOCATION',
        operators: OPERATORS_BY_TYPE.LOCATION,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.LOCATION),
        dependencies: [{ attribute: 'states', type: 'filter_options' }],
        searchable: true,
        valueConfig: {
            inputType: 'cascading_dropdown',
            searchable: true,
            optionsEndpoint: '/api/cities',
            placeholder: 'Select city',
        },
    },
];

// ----------------------------------------------------------------------------
// WORKFLOW AUTOMATION ATTRIBUTES
// ----------------------------------------------------------------------------

const workflowAutomationAttributes: FilterAttribute[] = [
    {
        id: 'saved_filter_1',
        name: 'Filter 1',
        family: 'workflow_automation',
        dataType: 'BOOLEAN',
        operators: OPERATORS_BY_TYPE.BOOLEAN,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.BOOLEAN),
        searchable: true,
        description: 'Saved filter shortcut 1',
        valueConfig: {
            inputType: 'toggle',
        },
    },
    {
        id: 'saved_filter_2',
        name: 'Filter 2',
        family: 'workflow_automation',
        dataType: 'BOOLEAN',
        operators: OPERATORS_BY_TYPE.BOOLEAN,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.BOOLEAN),
        searchable: true,
        description: 'Saved filter shortcut 2',
        valueConfig: {
            inputType: 'toggle',
        },
    },
    {
        id: 'saved_filter_3',
        name: 'Filter 3',
        family: 'workflow_automation',
        dataType: 'BOOLEAN',
        operators: OPERATORS_BY_TYPE.BOOLEAN,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.BOOLEAN),
        searchable: true,
        description: 'Saved filter shortcut 3',
        valueConfig: {
            inputType: 'toggle',
        },
    },
    {
        id: 'saved_filter_4',
        name: 'Filter 4',
        family: 'workflow_automation',
        dataType: 'BOOLEAN',
        operators: OPERATORS_BY_TYPE.BOOLEAN,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.BOOLEAN),
        searchable: true,
        description: 'Saved filter shortcut 4',
        valueConfig: {
            inputType: 'toggle',
        },
    },
    {
        id: 'saved_filter_5',
        name: 'Filter 5',
        family: 'workflow_automation',
        dataType: 'BOOLEAN',
        operators: OPERATORS_BY_TYPE.BOOLEAN,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.BOOLEAN),
        searchable: true,
        description: 'Saved filter shortcut 5',
        valueConfig: {
            inputType: 'toggle',
        },
    },
    {
        id: 'saved_filter_6',
        name: 'Filter 6',
        family: 'workflow_automation',
        dataType: 'BOOLEAN',
        operators: OPERATORS_BY_TYPE.BOOLEAN,
        defaultOperator: getDefaultOperator(OPERATORS_BY_TYPE.BOOLEAN),
        searchable: true,
        description: 'Saved filter shortcut 6',
        valueConfig: {
            inputType: 'toggle',
        },
    },
];

// ----------------------------------------------------------------------------
// FILTER FAMILIES
// ----------------------------------------------------------------------------

export const FILTER_FAMILIES: FilterFamily[] = [
    {
        id: 'tickets_mentions',
        name: 'Tickets & Mentions',
        icon: '🎫',
        description: 'Filter by ticket properties, status, and assignments',
        attributes: ticketsMentionsAttributes,
    },
    {
        id: 'ai_features',
        name: 'AI Features',
        icon: '🤖',
        description: 'Filter by AI-powered insights and analysis',
        attributes: aiFeaturesAttributes,
    },
    {
        id: 'surveys_ratings',
        name: 'Surveys & Ratings',
        icon: '📊',
        description: 'Filter by customer feedback and ratings',
        attributes: surveysRatingsAttributes,
    },
    {
        id: 'user_characteristics',
        name: 'User Characteristics',
        icon: '👤',
        description: 'Filter by user profile and influence metrics',
        attributes: userCharacteristicsAttributes,
    },
    {
        id: 'location_intelligence',
        name: 'Location Intelligence',
        icon: '📍',
        description: 'Filter by geographic location and profiles',
        attributes: locationIntelligenceAttributes,
    },
    {
        id: 'workflow_automation',
        name: 'Workflow Automation',
        icon: '⚙️',
        description: 'Quick access to saved filter shortcuts',
        attributes: workflowAutomationAttributes,
    },
];

// ----------------------------------------------------------------------------
// SLASH COMMANDS
// ----------------------------------------------------------------------------

export const SLASH_COMMANDS: SlashCommand[] = [
    {
        command: '/status',
        attributeId: 'ticket_status',
        label: 'Ticket Status',
        description: 'Filter by Open, On Hold, Pending, Closed',
        icon: '📋',
    },
    {
        command: '/sentiment',
        attributeId: 'sentiment',
        label: 'Sentiment',
        description: 'Filter by Positive, Neutral, Negative',
        icon: '😊',
    },
    {
        command: '/priority',
        attributeId: 'priority',
        label: 'Priority',
        description: 'Filter by Critical, High, Medium, Low',
        icon: '🚨',
    },
    {
        command: '/channel',
        attributeId: 'channel',
        label: 'Channel',
        description: 'Filter by Twitter, Facebook, Instagram...',
        icon: '📱',
    },
    {
        command: '/assigned',
        attributeId: 'assigned_to',
        label: 'Assigned To',
        description: 'Filter by assigned user or unassigned',
        icon: '👤',
    },
    {
        command: '/team',
        attributeId: 'team_name',
        label: 'Team',
        description: 'Filter by team assignment',
        icon: '👥',
    },
    {
        command: '/category',
        attributeId: 'category',
        label: 'Category',
        description: 'Filter by ticket category',
        icon: '🏷️',
    },
    {
        command: '/sla',
        attributeId: 'sla_breach',
        label: 'SLA Breach',
        description: 'Filter by SLA breach status',
        icon: '⏰',
    },
    {
        command: '/date',
        attributeId: 'created_date',
        label: 'Created Date',
        description: 'Filter by creation date range',
        icon: '📅',
    },
    {
        command: '/keyword',
        attributeId: 'keyword',
        label: 'Keyword',
        description: 'Search by keyword in content',
        icon: '🔍',
    },
    {
        command: '/filters',
        attributeId: '',
        label: 'Open Advanced Filters',
        description: 'Open the full filter panel',
        icon: '⚙️',
    },
];

// ----------------------------------------------------------------------------
// HELPER UTILITIES
// ----------------------------------------------------------------------------

/**
 * Get all filter attributes as a flat array.
 */
export function getAllAttributes(): FilterAttribute[] {
    return FILTER_FAMILIES.flatMap(family => family.attributes);
}

/**
 * Get a filter attribute by ID.
 */
export function getAttributeById(id: string): FilterAttribute | undefined {
    return getAllAttributes().find(attr => attr.id === id);
}

/**
 * Get a filter family by ID.
 */
export function getFamilyById(id: string): FilterFamily | undefined {
    return FILTER_FAMILIES.find(family => family.id === id);
}

/**
 * Get slash command by command string.
 */
export function getSlashCommand(command: string): SlashCommand | undefined {
    return SLASH_COMMANDS.find(sc => sc.command === command);
}

/**
 * Search filter attributes by name.
 */
export function searchAttributes(query: string): FilterAttribute[] {
    const normalizedQuery = query.toLowerCase().trim();
    return getAllAttributes().filter(attr =>
        attr.name.toLowerCase().includes(normalizedQuery) ||
        attr.slashCommand?.toLowerCase().includes(normalizedQuery)
    );
}

/**
 * Get quick filter attributes (for quick filter bar).
 */
export function getQuickFilterAttributes(): FilterAttribute[] {
    return getAllAttributes().filter(attr => attr.quickFilter);
}
