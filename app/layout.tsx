
import './globals.css'

export const metadata = {
  title: 'LRU Cache Playground',
  description: 'Visualize LRU and LRU + TTL Caches interactively',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
    