import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '../lib/utils.js'

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger

export function PopoverContent({ className, align = 'center', sideOffset = 8, ...props }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn('popover-content', className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}
