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
import type { Project } from '~/types/projects';
import { Box, CheckIcon, FolderIcon } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useAtomValue } from 'jotai';
import { projectCountsAtom, projectsAtom } from '~/store/project-atoms';

/**
 * プロジェクトセレクターコンポーネント
 * 課題に関連付けるプロジェクトを選択するためのドロップダウンUIを提供します。
 * プロジェクトなしの選択肢も含まれています。
 */
interface ProjectSelectorProps {
  project: Project | undefined;
  onChange: (project: Project | undefined) => void;
}

export function ProjectSelector({ project, onChange }: ProjectSelectorProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string | undefined>(project?.id);

  // Jotaiのatomからデータを取得
  const projects = useAtomValue(projectsAtom);
  const projectCounts = useAtomValue(projectCountsAtom);

  useEffect(() => {
    setValue(project?.id);
  }, [project]);

  const handleProjectChange = (projectId: string) => {
    if (projectId === 'no-project') {
      setValue(undefined);
      onChange(undefined);
    } else {
      setValue(projectId);
      const newProject = projects.find((p) => p.id === projectId);
      if (newProject) {
        onChange(newProject);
      }
    }
    setOpen(false);
  };

  return (
    <div className="*:not-first:mt-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            className="flex items-center justify-center gap-1"
            size="sm"
            variant="secondary"
            aria-expanded={open}
          >
            {value ? (
              (() => {
                const selectedProject = projects.find((p) => p.id === value);
                if (selectedProject) {
                  const Icon = selectedProject.icon;
                  return <Icon className="size-4" />;
                }
                return <Box className="size-4" />;
              })()
            ) : (
              <Box className="size-4" />
            )}
            <span>
              {value
                ? projects.find((p) => p.id === value)?.name
                : 'プロジェクトなし'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="プロジェクトを設定..." />
            <CommandList>
              <CommandEmpty>プロジェクトが見つかりません。</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="no-project"
                  onSelect={() => handleProjectChange('no-project')}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FolderIcon className="size-4" />
                    プロジェクトなし
                  </div>
                  {value === undefined && (
                    <CheckIcon size={16} className="ml-auto" />
                  )}
                  <span className="text-muted-foreground text-xs">
                    {projectCounts ? (projectCounts['no-project'] ?? 0) : 0}
                  </span>
                </CommandItem>
                {projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={project.id}
                    onSelect={() => handleProjectChange(project.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <project.icon className="size-4" />
                      {project.name}
                    </div>
                    {value === project.id && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                    <span className="text-muted-foreground text-xs">
                      {projectCounts ? (projectCounts[project.id] ?? 0) : 0}
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
