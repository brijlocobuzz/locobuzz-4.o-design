import { DateRangePicker, type DateRange } from './DateRangePicker'
import { ChannelFilter, type Channel } from './ChannelFilter'
import { BrandFilter, type Brand } from './BrandFilter'

export interface FilterBarProps {
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange) => void
  selectedChannels?: string[]
  onChannelsChange?: (channels: string[]) => void
  channels?: Channel[]
  selectedBrands?: string[]
  onBrandsChange?: (brands: string[]) => void
  brands?: Brand[]
  showHourlyButton?: boolean
  onHourlyModeToggle?: () => void
}

export function FilterBar({
  dateRange,
  onDateRangeChange,
  selectedChannels = [],
  onChannelsChange,
  channels,
  selectedBrands = [],
  onBrandsChange,
  brands,
  showHourlyButton = true,
  onHourlyModeToggle
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
        Filters:
      </div>
      {/* Brand Filter - First */}
      <BrandFilter
        brands={brands}
        selectedBrands={selectedBrands}
        onChange={onBrandsChange || (() => {})}
      />
      {/* Date Range Picker - Second */}
      <DateRangePicker
        value={dateRange}
        onChange={onDateRangeChange}
        showHourlyButton={showHourlyButton}
        onHourlyModeToggle={onHourlyModeToggle}
      />
      {/* Channel Filter - Third */}
      <ChannelFilter
        channels={channels || []}
        selectedChannels={selectedChannels}
        onChange={onChannelsChange || (() => {})}
      />
    </div>
  )
}
