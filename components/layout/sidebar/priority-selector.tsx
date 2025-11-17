'use client';

import { Button } from '~/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { useAtomValue } from 'jotai';
import { priorityCountsAtom } from '~/store/issues-store';
import { prioritiesAtom } from '~/store/priority-atoms';
import type { Priority } from '~/types/priorities';
import { CheckIcon } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

interface PrioritySelectorProps {
  priority: Priority;
  onChange: (priority: Priority) => void;
  priorityCounts?: Record<string, number>;
}

export function PrioritySelector({
  priority,
  onChange,
  priorityCounts: propPriorityCounts,
}: PrioritySelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(priority.id);

  // Jotaiのatomからデータを取得
  const priorities = useAtomValue(prioritiesAtom);

  // フォールバックとしてatomの値も使用
  const atomPriorityCounts = useAtomValue(priorityCountsAtom);
  const counts = propPriorityCounts || atomPriorityCounts || {};

  useEffect(() => {
    setValue(priority.id);
  }, [priority.id]);

  const handlePriorityChange = (priorityId: string) => {
    setValue(priorityId);
    setOpen(false);

    const newPriority = priorities.find((p) => p.id === priorityId);
    if (newPriority) {
      onChange(newPriority);
    }
  };

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            className="flex items-center justify-center"
            size="sm"
            variant="secondary"
            aria-expanded={open}
          >
            {(() => {
              const selectedItem = priorities.find((item) => item.id === value);
              if (selectedItem) {
                const Icon = selectedItem.icon;
                return <Icon className="text-muted-foreground size-4" />;
              }
              return null;
            })()}
            <span>
              {value
                ? priorities.find((p) => p.id === value)?.name
                : '優先度なし'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="優先度を設定..." />
            <CommandList>
              <CommandEmpty>優先度が見つかりません。</CommandEmpty>
              <CommandGroup>
                {priorities.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handlePriorityChange(item.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="text-muted-foreground size-4" />
                      {item.name}
                    </div>
                    {value === item.id && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                    <span className="text-muted-foreground text-xs">
                      {counts[item.id] ?? 0}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
