import './globals.css'

import { ReactElement, ReactNode } from 'react'

/**
 * Props for the root layout component
 */
interface RootLayoutProps {
  /** Child components to render within the layout */
  children: ReactNode
}

/**
 * Root layout component for the application
 *
 * Provides the basic HTML structure and includes global styles.
 * This component wraps all pages in the application.
 *
 * @param children - Child components to render within the layout
 * @returns The root layout with children rendered inside
 */
const RootLayout = ({ children }: RootLayoutProps): ReactElement => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
export default RootLayout
