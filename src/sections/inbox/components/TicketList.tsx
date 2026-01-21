import type { TicketListProps } from '@/../product/sections/inbox/types'
import { TicketCardCompact } from './TicketCardCompact'
import { TicketCardDetailed } from './TicketCardDetailed'
import { TicketTable } from './TicketTable'
import type { MessageInsights } from './TicketHeader'

export function TicketList({
  tickets,
  displayMode,
  selectedIds = [],
  onTicketClick,
  onSelectionChange,
  messageInsights
}: TicketListProps & { messageInsights?: MessageInsights }) {
  const handleSelect = (ticketId: string, selected: boolean) => {
    const newSelectedIds = selected
      ? [...selectedIds, ticketId]
      : selectedIds.filter(id => id !== ticketId)
    onSelectionChange?.(newSelectedIds)
  }

  if (displayMode === 'table') {
    return (
      <div className="h-full px-6 pt-6">
        <TicketTable
          tickets={tickets}
          selectedIds={selectedIds}
          onTicketClick={onTicketClick}
          onSelectionChange={handleSelect}
        />
      </div>
    )
  }

  if (displayMode === 'cards') {
    return (
      <div className="p-4 grid grid-cols-1 gap-4">
        {tickets.map(ticket => (
          <TicketCardDetailed
            key={ticket.id}
            ticket={ticket}
            isSelected={selectedIds.includes(ticket.id)}
            onClick={() => onTicketClick?.(ticket.id)}
            onSelect={(selected) => handleSelect(ticket.id, selected)}
            showInsights={messageInsights?.showInsights ?? true}
            selectedInsights={messageInsights?.selectedInsights}
          />
        ))}
      </div>
    )
  }

  // Compact list (default)
  return (
    <div>
      {tickets.map(ticket => (
        <TicketCardCompact
          key={ticket.id}
          ticket={ticket}
          isSelected={selectedIds.includes(ticket.id)}
          onClick={() => onTicketClick?.(ticket.id)}
          onSelect={(selected) => handleSelect(ticket.id, selected)}
          showInsights={messageInsights?.showInsights ?? true}
          selectedInsights={messageInsights?.selectedInsights}
        />
      ))}
    </div>
  )
}
