// ================================================================
// Core Types
// ================================================================

export type UserRole = 'agent' | 'marketer' | 'analyst' | 'admin' | 'team-lead'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string | null
}

export interface Brand {
  id: string
  name: string
  logoUrl?: string | null
}

// ================================================================
// Data Category Types
// ================================================================

export type DataCategoryId = 'mentions' | 'posts' | 'competition' | 'tickets'

export type DataCategoryIcon = 'MessageSquare' | 'FileText' | 'BarChart3' | 'Inbox'

export interface DataCategory {
  id: DataCategoryId
  name: string
  description: string
  icon: DataCategoryIcon
  starterQuestions: string[]
}

// ================================================================
// Conversation Types
// ================================================================

export interface ConversationSummary {
  id: string
  title: string
  brandId: string
  category: DataCategoryId
  createdAt: string
  updatedAt: string
  messageCount: number
  preview: string
}

export interface Conversation {
  id: string
  title: string
  brandId: string
  category: DataCategoryId
  createdAt: string
  updatedAt: string
  messages: Message[]
}

// ================================================================
// Message Types
// ================================================================

export type MessageType = 'user' | 'ai'

export interface UserMessage {
  id: string
  type: 'user'
  content: string
  timestamp: string
}

export interface AIMessage {
  id: string
  type: 'ai'
  timestamp: string
  components: MessageComponent[]
}

export type Message = UserMessage | AIMessage

// ================================================================
// AI Message Component Types
// ================================================================

export type MessageComponentType = 'text' | 'kpi-row' | 'chart' | 'table'

export interface TextComponent {
  id: string
  type: 'text'
  content: string // Supports markdown
}

export interface KpiRowComponent {
  id: string
  type: 'kpi-row'
  kpis: KpiCard[]
}

export interface ChartComponent {
  id: string
  type: 'chart'
  chartType: ChartType
  title: string
  data: ChartData
  deepDiveEnabled: boolean
}

export interface TableComponent {
  id: string
  type: 'table'
  title: string
  columns: string[]
  rows: string[][]
  deepDiveEnabled: boolean
}

export type MessageComponent =
  | TextComponent
  | KpiRowComponent
  | ChartComponent
  | TableComponent

// ================================================================
// Chart Types
// ================================================================

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'area'

export type TrendDirection = 'up' | 'down' | 'neutral'

export interface KpiCard {
  label: string
  value: string
  subtitle: string
  trend?: TrendDirection
  trendValue?: string
}

export interface ChartDataset {
  label: string
  values: number[]
  color: string
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

// ================================================================
// Processing Types
// ================================================================

export interface ProcessingStep {
  step: number
  label: string
  duration: number // milliseconds
}

// ================================================================
// Component Props
// ================================================================

export interface ChatWithDataProps {
  currentUser: User
  currentBrand: Brand
  availableBrands: Brand[]
  conversations: ConversationSummary[]
  dataCategories: DataCategory[]
  activeConversation?: Conversation
  processingSteps: ProcessingStep[]
  isProcessing?: boolean

  // Callbacks
  onBrandChange?: (brandId: string) => void
  onSelectConversation?: (conversationId: string) => void
  onCreateConversation?: () => void
  onSelectCategory?: (categoryId: DataCategoryId) => void
  onSendMessage?: (message: string) => void
  onDeepDive?: (componentId: string) => void
  onCloseConversation?: (conversationId: string) => void
  onSearchConversations?: (query: string) => void
}

export interface ConversationSidebarProps {
  conversations: ConversationSummary[]
  activeConversationId?: string
  onSelectConversation?: (conversationId: string) => void
  onCreateConversation?: () => void
  onSearchConversations?: (query: string) => void
}

export interface ChatHeaderProps {
  currentBrand: Brand
  availableBrands: Brand[]
  conversationTitle?: string
  onBrandChange?: (brandId: string) => void
}

export interface CategorySelectionProps {
  categories: DataCategory[]
  onSelectCategory?: (categoryId: DataCategoryId) => void
}

export interface StarterQuestionsProps {
  questions: string[]
  onSelectQuestion?: (question: string) => void
}

export interface MessageListProps {
  messages: Message[]
  onDeepDive?: (componentId: string) => void
}

export interface MessageInputProps {
  isProcessing?: boolean
  onSendMessage?: (message: string) => void
}

export interface ProcessingIndicatorProps {
  steps: ProcessingStep[]
  currentStep: number
}

export interface MessageComponentRendererProps {
  component: MessageComponent
  onDeepDive?: (componentId: string) => void
}

export interface KpiRowProps {
  kpis: KpiCard[]
}

export interface ChartRendererProps {
  id: string
  chartType: ChartType
  title: string
  data: ChartData
  deepDiveEnabled: boolean
  onDeepDive?: (id: string) => void
}

export interface TableRendererProps {
  id: string
  title: string
  columns: string[]
  rows: string[][]
  deepDiveEnabled: boolean
  onDeepDive?: (id: string) => void
}

// ================================================================
// Data Types
// ================================================================

export interface ChatWithDataData {
  _meta: {
    models: Record<string, string>
  }
  currentUser: User
  currentBrand: Brand
  availableBrands: Brand[]
  dataCategories: DataCategory[]
  conversations: ConversationSummary[]
  activeConversation?: Conversation
  processingSteps: ProcessingStep[]
}
