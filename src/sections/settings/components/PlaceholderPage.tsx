interface PlaceholderPageProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
            <Icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
          This is a placeholder view for the screen design preview
        </p>
      </div>
    </div>
  )
}
