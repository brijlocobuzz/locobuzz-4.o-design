import data from '@/../product/sections/chat-with-data/data.json'
import { ChatWithData } from './components/ChatWithData'
import type { ChatWithDataData } from '@/../product/sections/chat-with-data/types'

export default function ChatWithDataPreview() {
  const chatData = data as unknown as ChatWithDataData

  return (
    <ChatWithData
      currentUser={chatData.currentUser}
      currentBrand={chatData.currentBrand}
      availableBrands={chatData.availableBrands}
      conversations={chatData.conversations}
      dataCategories={chatData.dataCategories}
      activeConversation={chatData.activeConversation}
      processingSteps={chatData.processingSteps}
      isProcessing={false}
      onBrandChange={(brandId) => console.log('Brand changed:', brandId)}
      onSelectConversation={(conversationId) =>
        console.log('Conversation selected:', conversationId)
      }
      onCreateConversation={() => console.log('Create new conversation')}
      onSelectCategory={(categoryId) => console.log('Category selected:', categoryId)}
      onSendMessage={(message) => console.log('Message sent:', message)}
      onDeepDive={(componentId) => console.log('Deep dive:', componentId)}
      onSearchConversations={(query) => console.log('Search:', query)}
    />
  )
}
