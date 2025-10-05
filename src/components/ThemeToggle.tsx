import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/use-theme'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <Button
      type="button"
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className={cn(
        'relative h-10 w-10 overflow-hidden rounded-full border border-border bg-background/80 backdrop-blur transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        className,
      )}
      aria-label="Toggle theme"
    >
      <Sun
        className={cn(
          'h-5 w-5 transition-all duration-300',
          isDark ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
        )}
      />
      <Moon
        className={cn(
          'absolute h-5 w-5 transition-all duration-300',
          isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0',
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
