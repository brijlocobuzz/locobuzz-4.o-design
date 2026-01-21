import { useState } from 'react'
import { AgentIQModal } from './components/AgentIQModal'
import { AgentIQCheckingIndicator } from './components/AgentIQCheckingIndicator'

type DemoScenario = 'approved' | 'warning' | 'blocked' | 'checking' | 'timeout' | 'error'

export default function AgentIQDemo() {
  const [currentScenario, setCurrentScenario] = useState<DemoScenario>('blocked')
  const [showModal, setShowModal] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)

  const scenarios = {
    approved: {
      outcome: 'approved' as const,
      currentResponse: 'Thank you for reaching out! I understand your concern and I\'m here to help. Let me check on the status of your order right away and get back to you with a solution within the next 2 hours.',
      csatImpact: {
        current: 8.1,
        predicted: 8.3,
        delta: 0.2,
        trend: 'improving' as const,
      },
      empathyScore: {
        score: 8,
        reasons: [
          'Acknowledges customer concern',
          'Provides clear next steps',
          'Sets realistic expectations',
        ],
      },
      complianceChecks: [
        { name: 'Brand Guidelines', status: 'passed' as const },
        { name: 'Content Policy', status: 'passed' as const },
        { name: 'Fact Check', status: 'verified' as const },
      ],
      issues: [],
      suggestions: [],
    },
    warning: {
      outcome: 'warning' as const,
      currentResponse: 'I cannot assist with that. Please check our documentation for more information.',
      csatImpact: {
        current: 8.1,
        predicted: 6.5,
        delta: -1.6,
        trend: 'declining' as const,
      },
      empathyScore: {
        score: 4,
        reasons: [
          'Response lacks empathy',
          'No personalized acknowledgment',
          'Doesn\'t address customer emotion',
        ],
      },
      complianceChecks: [
        { name: 'Brand Guidelines', status: 'flagged' as const },
        { name: 'Content Policy', status: 'passed' as const },
        { name: 'Fact Check', status: 'verified' as const },
      ],
      issues: [
        {
          severity: 'warning' as const,
          title: 'Low Empathy',
          description: 'Response lacks emotional connection with customer',
          impact: 'May reduce customer trust',
        },
        {
          severity: 'warning' as const,
          title: 'Missing Next Steps',
          description: 'No clear guidance on what customer should do',
          impact: 'Could lead to follow-up tickets',
        },
      ],
      suggestions: [
        {
          id: 'sug-1',
          title: 'Empathetic + Actionable',
          content: 'I understand how frustrating this must be for you, and I genuinely want to help resolve this. While this specific request falls outside our current capabilities, I\'d love to explore alternative approaches that could help you achieve your goal. Let me suggest a few options that might work for you...',
          preview: 'I understand how frustrating this must be for you, and I genuinely want to help resolve this. While this specific request falls outside our current capabilities...',
          isWithinKB: true,
          csatImprovement: 1.8,
          tags: ['Empathetic', 'Solution-focused'],
        },
      ],
      isLoadingSuggestions: false,
    },
    blocked: {
      outcome: 'blocked' as const,
      currentResponse: 'We cannot help with this request. This is not something we support. Please check our documentation.',
      csatImpact: {
        current: 8.1,
        predicted: 4.7,
        delta: -3.4,
        trend: 'declining' as const,
      },
      empathyScore: {
        score: 2,
        reasons: [
          'Dismissive tone',
          'No acknowledgment of customer effort',
          'Lacks any helpful guidance',
        ],
      },
      complianceChecks: [
        { name: 'Brand Guidelines', status: 'failed' as const },
        { name: 'Content Policy', status: 'flagged' as const },
        { name: 'Fact Check', status: 'verified' as const },
      ],
      issues: [
        {
          severity: 'critical' as const,
          title: 'Too Direct',
          description: 'Tone is abrupt and dismissive',
          impact: 'High risk of escalation',
        },
        {
          severity: 'critical' as const,
          title: 'No Empathy',
          description: 'Completely lacks emotional connection',
          impact: 'Severely damages customer relationship',
        },
        {
          severity: 'critical' as const,
          title: 'Incomplete Resolution',
          description: 'Customer question not addressed',
          impact: 'Will require follow-up',
        },
      ],
      suggestions: [
        {
          id: 'sug-1',
          title: 'Empathetic + Complete',
          content: 'I understand this is important to you, and I appreciate you reaching out. While this specific request falls outside our current capabilities, I\'d love to explore alternative approaches that could help achieve your goal. Let me suggest a few options that might work for you: [Option 1 details], [Option 2 details]. Would either of these work for you? I\'m here to help find the best solution.',
          preview: 'I understand this is important to you, and I appreciate you reaching out. While this specific request falls outside our current capabilities, I\'d love to explore alternative approaches...',
          isWithinKB: true,
          csatImprovement: 4.8,
          tags: ['Empathetic', 'Solution-focused'],
        },
      ],
      isLoadingSuggestions: false,
    },
  }

  const currentData = scenarios[currentScenario === 'checking' || currentScenario === 'timeout' || currentScenario === 'error' ? 'blocked' : currentScenario]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          AgentIQ Quality Gate Demo
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          AI-powered quality intervention for agent responses
        </p>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        {/* Scenario Selector */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Select Scenario
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {(['approved', 'warning', 'blocked', 'checking', 'timeout', 'error'] as DemoScenario[]).map((scenario) => (
              <button
                key={scenario}
                onClick={() => {
                  setCurrentScenario(scenario)
                  setShowModal(true)
                  setElapsedTime(scenario === 'checking' ? 2.5 : 0)
                }}
                className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                  currentScenario === scenario
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Checking Indicator Demo */}
        {(currentScenario === 'checking' || currentScenario === 'timeout' || currentScenario === 'error') && (
          <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Inline Checking Indicator
            </h2>
            <AgentIQCheckingIndicator
              status={currentScenario}
              elapsedTime={elapsedTime}
              onKeepWaiting={() => alert('Keep waiting clicked')}
              onSendWithoutCheck={() => alert('Send without check clicked')}
              onCancel={() => alert('Cancel clicked')}
              onRetry={() => alert('Retry clicked')}
            />
          </div>
        )}

        {/* Current Response Preview */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Agent's Draft Response
          </h2>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {currentData.currentResponse}
            </p>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Trigger Quality Check
            </button>
          </div>
        </div>

        {/* Modal */}
        {showModal && currentScenario !== 'checking' && currentScenario !== 'timeout' && currentScenario !== 'error' && (
          <AgentIQModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            outcome={currentData.outcome}
            currentResponse={currentData.currentResponse}
            csatImpact={currentData.csatImpact}
            empathyScore={currentData.empathyScore}
            complianceChecks={currentData.complianceChecks}
            issues={currentData.issues}
            suggestions={currentData.suggestions}
            isLoadingSuggestions={false}
            canOverride={currentData.outcome === 'warning'}
            onEditManually={() => {
              alert('Edit manually clicked')
              setShowModal(false)
            }}
            onSendAnyway={(justification) => {
              alert(`Send anyway with justification: ${justification}`)
              setShowModal(false)
            }}
            onApplySuggestion={(id) => {
              alert(`Apply suggestion: ${id}`)
              setShowModal(false)
            }}
            onRequestSupervisorOverride={() => {
              alert('Request supervisor override clicked')
            }}
          />
        )}
      </div>
    </div>
  )
}
