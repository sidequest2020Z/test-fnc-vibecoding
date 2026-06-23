'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, BarChart3, FileText } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/', label: 'Log', icon: BookOpen },
  { href: '/weekly', label: 'Weekly', icon: LayoutDashboard },
  { href: '/impact', label: 'Impact', icon: BarChart3 },
  { href: '/apa', label: 'APA', icon: FileText },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">W</span>
          </div>
          <span className="font-bold text-slate-800 text-sm">WorkLog</span>
        </div>

        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                )}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
