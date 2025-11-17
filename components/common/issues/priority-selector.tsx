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
import { useSetAtom, useAtomValue } from 'jotai';
import { updateIssuePriorityAtom } from '~/store/issues-store';
import type { Priority } from '~/types/priorities';
import { prioritiesAtom } from '~/store/priority-atoms';
import { CheckIcon } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { getIconFromString } from '~/utils/icon-utils';

/**
 * 優先度セレクターコンポーネント
 * 課題の優先度を選択・変更するためのドロップダウンUIを提供します。
 * 優先度のアイコンを表示し、クリックすると利用可能な優先度のリストが表示されます。
 * 選択された優先度は課題のステートに反映されます。
 */
interface PrioritySelectorProps {
  priority: Priority;
  issueId?: string;
}

export function PrioritySelector({ priority, issueId }: PrioritySelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(priority.id);

  const priorities = useAtomValue(prioritiesAtom);
  const updateIssuePriority = useSetAtom(updateIssuePriorityAtom);

  useEffect(() => {
    setValue(priority.id);
  }, [priority.id]);

  const handlePriorityChange = (priorityId: string) => {
    setValue(priorityId);
    setOpen(false);

    if (issueId) {
      const newPriority = priorities.find((p) => p.id === priorityId);
      if (newPriority) {
        updateIssuePriority({ issueId: issueId, newPriority: newPriority });
      }
    }
  };

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            className="size-7 flex items-center justify-center"
            size="icon"
            variant="ghost"
            aria-expanded={open}
          >
            {(() => {
              const selectedItem = priorities.find((item) => item.id === value);
              if (selectedItem) {
                const Icon =
                  typeof selectedItem.icon === 'string'
                    ? getIconFromString(selectedItem.icon)
                    : selectedItem.icon;
                return <Icon className="text-muted-foreground size-4" />;
              }
              return null;
            })()}
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
                    onSelect={handlePriorityChange}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {(() => {
                        const Icon =
                          typeof item.icon === 'string'
                            ? getIconFromString(item.icon)
                            : item.icon;
                        return <Icon className="text-muted-foreground size-4" />;
                      })()}
                      {item.name}
                    </div>
                    {value === item.id && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
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
