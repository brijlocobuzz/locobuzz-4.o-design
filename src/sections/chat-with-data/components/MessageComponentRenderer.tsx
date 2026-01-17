import { KpiRow } from './KpiRow'
import { ChartRenderer } from './ChartRenderer'
import { TableRenderer } from './TableRenderer'
import type { MessageComponentRendererProps } from '@/../product/sections/chat-with-data/types'

export function MessageComponentRenderer({
  component,
  onDeepDive,
}: MessageComponentRendererProps) {
  switch (component.type) {
    case 'text':
      return (
        <div
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{
            __html: component.content
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n/g, '<br />'),
          }}
        />
      )

    case 'kpi-row':
      return <KpiRow kpis={component.kpis} />

    case 'chart':
      return (
        <ChartRenderer
          id={component.id}
          chartType={component.chartType}
          title={component.title}
          data={component.data}
          deepDiveEnabled={component.deepDiveEnabled}
          onDeepDive={onDeepDive}
        />
      )

    case 'table':
      return (
        <TableRenderer
          id={component.id}
          title={component.title}
          columns={component.columns}
          rows={component.rows}
          deepDiveEnabled={component.deepDiveEnabled}
          onDeepDive={onDeepDive}
        />
      )

    default:
      return null
  }
}
