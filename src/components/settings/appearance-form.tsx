'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

const themes = [
  {
    value: 'light',
    label: 'Light',
    icon: Sun,
    description: 'Light mode for daytime use',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: Moon,
    description: 'Dark mode for nighttime use',
  },
  {
    value: 'system',
    label: 'System',
    icon: Monitor,
    description: 'Automatically match your system settings',
  },
]

export function AppearanceForm() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the dashboard looks on your device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how the dashboard looks on your device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Label>Theme</Label>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid grid-cols-3 gap-4"
          >
            {themes.map((item) => {
              const Icon = item.icon
              return (
                <Label
                  key={item.value}
                  htmlFor={item.value}
                  className={cn(
                    'flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all',
                    theme === item.value && 'border-primary'
                  )}
                >
                  <RadioGroupItem
                    value={item.value}
                    id={item.value}
                    className="sr-only"
                  />
                  <Icon className="mb-3 h-6 w-6" />
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    {item.description}
                  </span>
                </Label>
              )
            })}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  )
}
