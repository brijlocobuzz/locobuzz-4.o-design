import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from '@/lib/router'
import { UnifiedFilter } from '@/components/UnifiedFilter'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UnifiedFilter>
      <RouterProvider router={router} />
    </UnifiedFilter>
  </StrictMode>,
)
