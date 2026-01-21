import {
  Mail,
  Phone,
  MessageCircle,
  CheckCircle2,
  Instagram,
  User as UserIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

interface CustomerInfoSidebarProps {
  ticket: any
}

const platformIcons = {
  instagram: Instagram,
  facebook: MessageCircle,
  twitter: MessageCircle,
  linkedin: MessageCircle,
}

export function CustomerInfoSidebar({ ticket }: CustomerInfoSidebarProps) {
  const { author, contact, impactScore } = ticket
  const PlatformIcon = platformIcons[author.platform as keyof typeof platformIcons] || MessageCircle

  return (
    <div className="w-80 border-l border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="p-6">
        {/* Customer Avatar & Name */}
        <div className="text-center">
          {author.avatarUrl ? (
            <img
              src={author.avatarUrl}
              alt={author.name}
              className="mx-auto h-20 w-20 rounded-full"
            />
          ) : (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
              <UserIcon className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
          <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{author.name}</h3>
          <div className="mt-1 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <PlatformIcon className="h-4 w-4" />
            <span>{author.username}</span>
            {author.isVerified && (
              <CheckCircle2 className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            )}
          </div>
        </div>

        {/* Impact Score */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Impact Score
            </span>
            <span
              className={`text-2xl font-bold ${impactScore.tier === 'high'
                ? 'text-red-600 dark:text-red-400'
                : impactScore.tier === 'medium'
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-green-600 dark:text-green-400'
                }`}
            >
              {impactScore.score}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {Object.entries(impactScore.factors).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="capitalize text-slate-600 dark:text-slate-400">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="font-medium text-slate-900 dark:text-white">{value as ReactNode}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Details */}
        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Contact Information
          </h4>

          {contact.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">{contact.email}</span>
            </div>
          )}

          {contact.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">{contact.phone}</span>
            </div>
          )}
        </div>

        {/* Social Stats */}
        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Social Presence
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Followers</div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                {(author.followerCount / 1000).toFixed(1)}K
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400">Engagement</div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                {author.engagementRate}%
              </div>
            </div>
          </div>
        </div>

        {/* Previous Interactions */}
        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            History
          </h4>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Previous Interactions</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {contact.previousInteractions}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Resolution Rate</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {contact.resolutionRate}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Last Contact</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(contact.lastContactDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned To */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Assigned To
          </div>
          <div className="mt-2 flex items-center gap-3">
            {ticket.assignedTo.avatarUrl ? (
              <img
                src={ticket.assignedTo.avatarUrl}
                alt={ticket.assignedTo.name}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                <UserIcon className="h-4 w-4 text-slate-500" />
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {ticket.assignedTo.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{ticket.team.name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
