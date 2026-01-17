import { useState, useRef, useEffect } from 'react'
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react'

export interface DateRange {
  startDate: Date
  endDate: Date
  label?: string
}

export interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange) => void
  showHourlyButton?: boolean
  onHourlyModeToggle?: () => void
}

type QuickOption = {
  label: string
  getValue: () => DateRange
}

const quickOptions: QuickOption[] = [
  {
    label: 'Today',
    getValue: () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const endOfDay = new Date(today)
      endOfDay.setHours(23, 59, 59, 999)
      return { startDate: today, endDate: endOfDay, label: 'Today' }
    }
  },
  {
    label: 'Yesterday',
    getValue: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      const endOfYesterday = new Date(yesterday)
      endOfYesterday.setHours(23, 59, 59, 999)
      return { startDate: yesterday, endDate: endOfYesterday, label: 'Yesterday' }
    }
  },
  {
    label: 'Last 2 days',
    getValue: () => {
      const start = new Date()
      start.setDate(start.getDate() - 1)
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      return { startDate: start, endDate: end, label: 'Last 2 days' }
    }
  },
  {
    label: 'Last 7 days',
    getValue: () => {
      const start = new Date()
      start.setDate(start.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      return { startDate: start, endDate: end, label: 'Last 7 days' }
    }
  },
  {
    label: 'This week so far',
    getValue: () => {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const start = new Date(today)
      start.setDate(today.getDate() - dayOfWeek)
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      return { startDate: start, endDate: end, label: 'This week so far' }
    }
  },
  {
    label: 'This month so far',
    getValue: () => {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      return { startDate: start, endDate: end, label: 'This month so far' }
    }
  },
  {
    label: 'Last 30 days',
    getValue: () => {
      const start = new Date()
      start.setDate(start.getDate() - 29)
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      return { startDate: start, endDate: end, label: 'Last 30 days' }
    }
  }
]

export function DateRangePicker({
  value,
  onChange,
  showHourlyButton = true,
  onHourlyModeToggle
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState<DateRange | null>(value || null)
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null)
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null)
  const [viewingMonth, setViewingMonth] = useState(new Date())
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleQuickSelect = (option: QuickOption) => {
    const range = option.getValue()
    setSelectedRange(range)
    onChange?.(range)
    setIsOpen(false)
  }

  const handleCustomDateSelect = (date: Date) => {
    if (!customStartDate || (customStartDate && customEndDate)) {
      // Start new selection
      setCustomStartDate(date)
      setCustomEndDate(null)
    } else {
      // Complete the range
      if (date < customStartDate) {
        setCustomEndDate(customStartDate)
        setCustomStartDate(date)
      } else {
        setCustomEndDate(date)
      }
    }
  }

  const applyCustomRange = () => {
    if (customStartDate && customEndDate) {
      const range: DateRange = {
        startDate: customStartDate,
        endDate: customEndDate,
        label: 'Custom'
      }
      setSelectedRange(range)
      onChange?.(range)
      setIsOpen(false)
      setCustomStartDate(null)
      setCustomEndDate(null)
    }
  }

  const formatDateRange = (range: DateRange | null) => {
    if (!range) return 'Select date range'

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    if (range.label && range.label !== 'Custom') {
      return range.label
    }

    return `${formatDate(range.startDate)} - ${formatDate(range.endDate)}`
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(viewingMonth)
    const days = []

    // Empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-8" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewingMonth.getFullYear(), viewingMonth.getMonth(), day)
      const isStart = customStartDate && date.toDateString() === customStartDate.toDateString()
      const isEnd = customEndDate && date.toDateString() === customEndDate.toDateString()
      const isInRange = customStartDate && customEndDate && date > customStartDate && date < customEndDate
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <button
          key={day}
          onClick={() => handleCustomDateSelect(date)}
          className={`h-8 w-8 rounded text-sm transition-colors ${
            isStart || isEnd
              ? 'bg-indigo-600 text-white'
              : isInRange
                ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100'
                : isToday
                  ? 'border border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          {day}
        </button>
      )
    }

    return days
  }

  const previousMonth = () => {
    setViewingMonth(new Date(viewingMonth.getFullYear(), viewingMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setViewingMonth(new Date(viewingMonth.getFullYear(), viewingMonth.getMonth() + 1))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
      >
        <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <span className="text-slate-700 dark:text-slate-300">
          {formatDateRange(selectedRange)}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-[600px] rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <div className="flex">
              {/* Quick Options */}
              <div className="w-48 border-r border-slate-200 p-3 dark:border-slate-700">
                <div className="mb-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Quick Select
                </div>
                <div className="space-y-1">
                  {quickOptions.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => handleQuickSelect(option)}
                      className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                        selectedRange?.label === option.label
                          ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-100'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {showHourlyButton && (
                  <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700">
                    <button
                      onClick={() => {
                        onHourlyModeToggle?.()
                        setIsOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Clock className="h-4 w-4" />
                      Hourly (Today)
                    </button>
                  </div>
                )}
              </div>

              {/* Calendar */}
              <div className="flex-1 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    onClick={previousMonth}
                    className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {viewingMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <button
                    onClick={nextMonth}
                    className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Day headers */}
                <div className="mb-2 grid grid-cols-7 gap-1">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>

                {/* Custom range info */}
                {(customStartDate || customEndDate) && (
                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {customStartDate && !customEndDate && 'Select end date'}
                      {customStartDate && customEndDate && (
                        <span>
                          {customStartDate.toLocaleDateString()} - {customEndDate.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCustomStartDate(null)
                          setCustomEndDate(null)
                        }}
                        className="rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                      >
                        Clear
                      </button>
                      <button
                        onClick={applyCustomRange}
                        disabled={!customStartDate || !customEndDate}
                        className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
