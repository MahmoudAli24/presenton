import React from 'react'
import { ConfigurationInitializer } from '../ConfigurationInitializer'
import { EmbedGuard } from '../EmbedGuard'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <EmbedGuard>
        <ConfigurationInitializer>
          {children}
        </ConfigurationInitializer>
      </EmbedGuard>
    </div>
  )
}

export default layout
