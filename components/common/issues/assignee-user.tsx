'use client';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import type { User } from '~/types/users';
import { statusUserColors } from '~/data/status';
import { usersAtom } from '~/store/user-atoms';
import { useAtomValue } from 'jotai';
import { CheckIcon, CircleUserRound, Send, UserIcon } from 'lucide-react';
import { useState } from 'react';

/**
 * 担当者ユーザーコンポーネント
 * 課題の担当者を表示・変更するためのドロップダウンUIを提供します。
 * ユーザーのアバターとステータスを表示し、クリックすると担当者を変更できます。
 * 担当者なし、チームメンバーへの割り当て、新規ユーザーへの招待と割り当てが可能です。
 */
interface AssigneeUserProps {
  user: User | null;
}

export function AssigneeUser({ user }: AssigneeUserProps) {
  const [open, setOpen] = useState(false);
  const [currentAssignee, setCurrentAssignee] = useState<User | null>(user);
  const users = useAtomValue(usersAtom);

  const renderAvatar = () => {
    if (currentAssignee) {
      return (
        <Avatar className="size-6 shrink-0">
          <AvatarImage
            src={currentAssignee.avatarUrl ?? undefined}
            alt={currentAssignee.name}
          />
          <AvatarFallback>{currentAssignee.name[0]}</AvatarFallback>
        </Avatar>
      );
    }

    return (
      <div className="size-6 flex items-center justify-center">
        <CircleUserRound className="size-5 text-zinc-600" />
      </div>
    );
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button type="button" className="relative w-fit focus:outline-none">
          {renderAvatar()}
          {currentAssignee?.status && (
            <span
              className="absolute -end-0.5 -bottom-0.5 size-2.5 rounded-full border-2"
              style={{
                backgroundColor:
                  statusUserColors[currentAssignee.status] ?? '#969696',
              }}
            >
              <span className="sr-only">{currentAssignee.status}</span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[206px]">
        <DropdownMenuLabel>割り当て先...</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            setCurrentAssignee(null);
            setOpen(false);
          }}
        >
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            <span>担当者なし</span>
          </div>
          {!currentAssignee && <CheckIcon className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {users
          .filter((u) => u.teamIds?.includes('CORE'))
          .map((u) => (
            <DropdownMenuItem
              key={u.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentAssignee(u);
                setOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={u.avatarUrl ?? undefined} alt={u.name} />
                  <AvatarFallback>{u.name[0]}</AvatarFallback>
                </Avatar>
                <span>{u.name}</span>
              </div>
              {currentAssignee?.id === u.id && (
                <CheckIcon className="ml-auto h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>新規ユーザー</DropdownMenuLabel>
        <DropdownMenuItem>
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span>招待して割り当て...</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
