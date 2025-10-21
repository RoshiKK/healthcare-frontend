'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = [
    {
      title: 'Dashboard',
      href: user?.role === 'admin' ? '/admin' : '/doctor',
      icon: '📊',
    },
    ...(user?.role === 'admin'
      ? [
          {
            title: 'Doctors',
            href: '/admin/doctors',
            icon: '👨‍⚕️',
          },
        ]
      : [
          {
            title: 'Appointments',
            href: '/doctor/appointments',
            icon: '📅',
          },
          {
            title: 'Availability',
            href: '/doctor/availability',
            icon: '⏰',
          },
        ]),
  ]

  return (
    <div className={cn('pb-12', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            {navigation.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <span className="mr-2">{item.icon}</span>
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-100"
            onClick={() => logout()}
          >
            <span className="mr-2">🚪</span>
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}