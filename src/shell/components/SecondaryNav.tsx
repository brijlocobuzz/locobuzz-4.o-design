import type { SecondaryNavSection } from './AppShell'

interface SecondaryNavProps {
  sections: SecondaryNavSection[]
  onSelect?: (itemId: string) => void
}

export function SecondaryNav({ sections, onSelect }: SecondaryNavProps) {
  return (
    <nav className="w-56 flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-white py-4 dark:border-slate-800 dark:bg-slate-900">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-4">
          {section.title && (
            <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {section.title}
            </h3>
          )}
          <ul className="space-y-0.5 px-2">
            {section.items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onSelect?.(item.id)}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                    item.isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.isActive
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export type { SecondaryNavProps }
