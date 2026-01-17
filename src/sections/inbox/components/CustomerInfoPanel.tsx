import {
  User as UserIcon,
  Instagram,
  MessageCircle,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Users,
  Link2,
  ExternalLink,
} from 'lucide-react'

interface CustomerInfoPanelProps {
  ticket: any
  crmConnected?: boolean
}

const platformIcons = {
  instagram: Instagram,
  facebook: MessageCircle,
  twitter: MessageCircle,
  linkedin: MessageCircle,
}

export function CustomerInfoPanel({ ticket, crmConnected = false }: CustomerInfoPanelProps) {
  const { author, contact } = ticket
  const PlatformIcon = platformIcons[author.platform as keyof typeof platformIcons] || MessageCircle

  // Mock CRM match data
  const crmMatch = crmConnected
    ? {
        matched: true,
        crmId: 'CRM-45678',
        crmName: 'Jessica Martinez',
        matchConfidence: 95,
      }
    : null

  // Mock contact record data
  const contactRecord = contact
    ? {
        id: contact.id,
        linkedAuthors: [
          { platform: 'instagram', handle: '@jessicam_designs', verified: false },
          { platform: 'facebook', handle: 'Jessica Martinez', verified: false },
          { platform: 'twitter', handle: '@jessicamart', verified: true },
        ],
        firstSeen: '2023-08-15T10:00:00Z',
        totalInteractions: contact.previousInteractions + 1,
      }
    : null

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-slate-50 p-6 dark:bg-slate-900/50">
      {/* Customer Header */}
      <div className="text-center">
        {author.avatarUrl ? (
          <img
            src={author.avatarUrl}
            alt={author.name}
            className="mx-auto h-20 w-20 rounded-full ring-4 ring-white dark:ring-slate-800"
          />
        ) : (
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 ring-4 ring-white dark:bg-indigo-950 dark:ring-slate-800">
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

      {/* Bio (if available) */}
      {author.bio && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">{author.bio}</p>
        </div>
      )}

      {/* Social Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <TrendingUp className="h-3 w-3" />
            Followers
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
            {(author.followerCount / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <TrendingUp className="h-3 w-3" />
            Engagement
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
            {author.engagementRate}%
          </div>
        </div>
      </div>

      {/* Follows Brand? */}
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <UserCheck className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-400">Follows your brand</span>
          </div>
          {author.followsBrand ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <span className="text-xs text-slate-400">No</span>
          )}
        </div>
      </div>

      {/* CRM Match */}
      {crmConnected && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            CRM Match
          </h4>
          {crmMatch && crmMatch.matched ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <div>
                    <div className="text-sm font-medium text-green-900 dark:text-green-100">
                      Matched
                    </div>
                    <div className="mt-0.5 text-xs text-green-700 dark:text-green-300">
                      {crmMatch.crmName}
                    </div>
                    <div className="mt-0.5 text-xs text-green-600 dark:text-green-400">
                      ID: {crmMatch.crmId}
                    </div>
                  </div>
                </div>
                <button className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-green-200 dark:bg-green-900">
                  <div
                    className="h-full rounded-full bg-green-600 dark:bg-green-500"
                    style={{ width: `${crmMatch.matchConfidence}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  {crmMatch.matchConfidence}%
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                No CRM match found
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contact Record */}
      {contactRecord && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Contact Record
          </h4>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="font-medium text-slate-900 dark:text-white">
                {contactRecord.linkedAuthors.length} linked social accounts
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {contactRecord.linkedAuthors.map((linkedAuthor, idx) => {
                const Icon =
                  platformIcons[linkedAuthor.platform as keyof typeof platformIcons] ||
                  MessageCircle
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-400" />
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        {linkedAuthor.handle}
                      </span>
                    </div>
                    {linkedAuthor.verified && (
                      <CheckCircle2 className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">First seen</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {new Date(contactRecord.firstSeen).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total interactions</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {contactRecord.totalInteractions}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
