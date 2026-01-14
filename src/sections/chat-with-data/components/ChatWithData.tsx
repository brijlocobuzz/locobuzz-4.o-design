import { useState } from 'react'
import { ConversationSidebar } from './ConversationSidebar'
import { ChatHeader } from './ChatHeader'
import { CategorySelection } from './CategorySelection'
import { StarterQuestions } from './StarterQuestions'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { ProcessingIndicator } from './ProcessingIndicator'
import type { ChatWithDataProps } from '@/../product/sections/chat-with-data/types'

export function ChatWithData({
  currentBrand,
  availableBrands,
  conversations,
  dataCategories,
  activeConversation,
  processingSteps,
  isProcessing = false,
  onBrandChange,
  onSelectConversation,
  onCreateConversation,
  onSelectCategory,
  onSendMessage,
  onDeepDive,
  onSearchConversations,
}: ChatWithDataProps) {
  const [currentStep] = useState(1)

  // Get the current category if conversation is active
  const currentCategory = activeConversation
    ? dataCategories.find((cat) => cat.id === activeConversation.category)
    : null

  // Determine what to show
  const showCategorySelection = !activeConversation
  const showStarterQuestions =
    activeConversation && activeConversation.messages.length === 0 && currentCategory
  const showConversation =
    activeConversation && (activeConversation.messages.length > 0 || isProcessing)

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversation?.id}
        onSelectConversation={onSelectConversation}
        onCreateConversation={onCreateConversation}
        onSearchConversations={onSearchConversations}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <ChatHeader
          currentBrand={currentBrand}
          availableBrands={availableBrands}
          conversationTitle={activeConversation?.title}
          onBrandChange={onBrandChange}
        />

        {/* Category Selection (new conversation) */}
        {showCategorySelection && (
          <CategorySelection categories={dataCategories} onSelectCategory={onSelectCategory} />
        )}

        {/* Starter Questions (after category selected) */}
        {showStarterQuestions && (
          <>
            <StarterQuestions
              questions={currentCategory.starterQuestions}
              onSelectQuestion={onSendMessage}
            />
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select a starter question or type your own below
              </p>
            </div>
            <MessageInput isProcessing={isProcessing} onSendMessage={onSendMessage} />
          </>
        )}

        {/* Active Conversation */}
        {showConversation && (
          <>
            {currentCategory && activeConversation.messages.length === 0 && (
              <StarterQuestions
                questions={currentCategory.starterQuestions}
                onSelectQuestion={onSendMessage}
              />
            )}

            <MessageList messages={activeConversation.messages} onDeepDive={onDeepDive} />

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="px-6 pb-4">
                <ProcessingIndicator steps={processingSteps} currentStep={currentStep} />
              </div>
            )}

            <MessageInput isProcessing={isProcessing} onSendMessage={onSendMessage} />
          </>
        )}
      </div>
    </div>
  )
}
