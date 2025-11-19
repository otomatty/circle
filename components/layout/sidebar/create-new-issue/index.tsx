import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Heart } from 'lucide-react';
import { Switch } from '~/components/ui/switch';
import { Label } from '~/components/ui/label';
import { Edit } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import type { Issue } from '~/types/issues';
import { useAtomValue, useSetAtom } from 'jotai';
import { issuesAtom, addIssueAtom } from '~/store/issues-store';
import { statusesAtom } from '~/store/status-atoms';
import { prioritiesAtom } from '~/store/priority-atoms';
import type { Status } from '~/types/status';
import type { Priority } from '~/types/priorities';
import {
  isCreateIssueModalOpenAtom,
  defaultCreateIssueStatusAtom,
  openCreateIssueModalAtom,
  closeCreateIssueModalAtom,
} from '~/store/create-issue-store';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { StatusSelector } from './status-selector';
import { PrioritySelector } from '../priority-selector';
import { AssigneeSelector } from './assignee-selector';
import { ProjectSelector } from './project-selector';
import { LabelSelector } from './label-selector';
import { CreateIssueFormSkeleton } from './create-issue-form-skeleton';
import { ranks } from '~/mock-data/issues';

/**
 * 新規課題作成コンポーネント
 * モーダルダイアログを使って新しい課題（イシュー）を作成するためのUIを提供します。
 * タイトル、説明、ステータス、優先度、担当者、プロジェクト、ラベルなどの課題情報を
 * 入力・選択できます。作成ボタンをクリックすると課題が作成されます。
 */
export function CreateNewIssue() {
  const [createMore, setCreateMore] = useState<boolean>(false);

  const isOpen = useAtomValue(isCreateIssueModalOpenAtom);
  const defaultStatus = useAtomValue(defaultCreateIssueStatusAtom);
  const openModal = useSetAtom(openCreateIssueModalAtom);
  const closeModal = useSetAtom(closeCreateIssueModalAtom);
  const addIssue = useSetAtom(addIssueAtom);
  const allIssues = useAtomValue(issuesAtom);
  const statuses = useAtomValue(statusesAtom);
  const priorities = useAtomValue(prioritiesAtom);

  // ユニークな課題ID（identifier）を生成するヘルパー関数
  const generateUniqueIdentifier = useCallback(() => {
    const identifiers = allIssues.map((issue: Issue) => issue.identifier);
    let identifier = Math.floor(Math.random() * 999)
      .toString()
      .padStart(3, '0');
    while (identifiers.includes(`LNUI-${identifier}`)) {
      identifier = Math.floor(Math.random() * 999)
        .toString()
        .padStart(3, '0');
    }
    return identifier;
  }, [allIssues]);

  // 新規課題のデフォルトデータを作成する関数
  const createDefaultData = useCallback((): Issue => {
    const identifier = generateUniqueIdentifier();
    const initialStatus: Status | undefined =
      defaultStatus || statuses.find((s) => s.id === 'to-do');
    const initialPriority: Priority | undefined = priorities.find(
      (p) => p.id === 'no-priority'
    );
    const initialRank = ranks[ranks.length - 1];

    if (!initialStatus) {
      console.error('デフォルトステータス "to-do" が見つかりません！');
      throw new Error('デフォルトステータスの設定エラー。');
    }
    if (!initialPriority) {
      console.error('デフォルト優先度 "no-priority" が見つかりません！');
      throw new Error('デフォルト優先度の設定エラー。');
    }
    if (initialRank === undefined) {
      console.error('デフォルトランクが見つかりません！');
      throw new Error('デフォルトランクの設定エラー。');
    }

    return {
      id: uuidv4(),
      identifier: `LNUI-${identifier}`,
      title: '',
      description: '',
      status: initialStatus,
      assignees: null,
      priority: initialPriority,
      labels: [],
      createdAt: new Date().toISOString(),
      cycleId: '',
      project: undefined,
      subissues: [],
      rank: initialRank,
    };
  }, [defaultStatus, generateUniqueIdentifier, statuses, priorities]);

  // Initialize form state with null
  const [addIssueForm, setAddIssueForm] = useState<Issue | null>(null);

  useEffect(() => {
    // Initialize only when modal is open and necessary atom data exists
    if (isOpen && statuses.length > 0 && priorities.length > 0) {
      try {
        const defaultData = createDefaultData();
        setAddIssueForm(defaultData);
      } catch (error) {
        console.error('課題のデフォルトデータ作成中にエラー:', error);
        toast.error('課題の初期化に失敗しました。');
        closeModal(); // Close modal on error
      }
    } else if (!isOpen) {
      // Reset form when modal closes
      setAddIssueForm(null);
    }
    // Add statuses and priorities to dependency array
  }, [isOpen, statuses, priorities, createDefaultData, closeModal]);

  // Function to create issue (add guard for null addIssueForm)
  const createIssue = () => {
    if (!addIssueForm) {
      toast.error('フォームが初期化されていません。');
      return;
    }
    if (!addIssueForm.title) {
      toast.error('タイトルは必須です');
      return;
    }
    toast.success('課題が作成されました');
    addIssue(addIssueForm);
    if (!createMore) {
      closeModal();
    } else {
      // Re-initialize if data is ready when creating more
      if (statuses.length > 0 && priorities.length > 0) {
        try {
          setAddIssueForm(createDefaultData());
        } catch (error) {
          console.error('課題の再初期化中にエラー:', error);
          toast.error('フォームの再初期化に失敗しました。');
          closeModal();
        }
      } else {
        // Set to null or show error if data is not available
        setAddIssueForm(null);
        toast.warning('ステータス情報がまだ読み込まれていません。');
        closeModal();
      }
    }
  };

  // Render part (consider addIssueForm being null)
  if (!addIssueForm && isOpen) {
    // Display loading state or similar
    return (
      <Dialog
        open={isOpen}
        onOpenChange={(value) => (value ? openModal() : closeModal())}
      >
        <DialogTrigger asChild>
          <Button className="size-8 shrink-0" variant="secondary" size="icon">
            <Edit className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full sm:max-w-[750px] p-0 shadow-xl top-[30%]">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>新規課題作成</DialogTitle>
          </DialogHeader>
          <CreateIssueFormSkeleton />
        </DialogContent>
      </Dialog>
    );
  }

  // Render only if addIssueForm is not null and modal is open
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(value) => (value ? openModal() : closeModal())}
    >
      {/* DialogTrigger is always visible */}
      <DialogTrigger asChild>
        <Button className="size-8 shrink-0" variant="secondary" size="icon">
          <Edit className="size-4" />
        </Button>
      </DialogTrigger>
      {addIssueForm && ( // Check if addIssueForm is not null
        <DialogContent className="w-full sm:max-w-[750px] p-0 shadow-xl top-[30%]">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle>新規課題作成</DialogTitle>
          </DialogHeader>
          <div className="flex items-center px-4 pt-4 gap-2">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Heart className="size-4 text-orange-500 fill-orange-500" />
              <span className="font-medium">CORE</span>
            </Button>
          </div>

          <div className="px-4 pb-0 space-y-3 w-full">
            <Input
              className="border-none w-full shadow-none outline-none text-2xl font-medium px-0 h-auto focus-visible:ring-0 overflow-hidden text-ellipsis whitespace-normal break-words"
              placeholder="課題のタイトル"
              value={addIssueForm.title} // Safe as addIssueForm is not null
              onChange={
                (e) =>
                  setAddIssueForm((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  ) // Add null check
              }
            />

            <Textarea
              className="border-none w-full shadow-none outline-none resize-none px-0 min-h-16 focus-visible:ring-0 break-words whitespace-normal overflow-wrap"
              placeholder="説明を追加..."
              value={addIssueForm.description} // Safe as addIssueForm is not null
              onChange={
                (e) =>
                  setAddIssueForm((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  ) // Add null check
              }
            />

            <div className="w-full flex items-center justify-start gap-1.5 flex-wrap">
              <StatusSelector
                status={addIssueForm.status} // Safe as addIssueForm is not null
                onChange={
                  (newStatus) =>
                    setAddIssueForm((prev) =>
                      prev ? { ...prev, status: newStatus } : null
                    ) // Add null check
                }
              />
              <PrioritySelector
                priority={addIssueForm.priority}
                onChange={
                  (newPriority) =>
                    setAddIssueForm((prev) =>
                      prev ? { ...prev, priority: newPriority } : null
                    ) // Add null check
                }
              />
              <AssigneeSelector
                assignee={addIssueForm.assignees}
                onChange={
                  (newAssignee) =>
                    setAddIssueForm((prev) =>
                      prev ? { ...prev, assignees: newAssignee } : null
                    ) // Add null check
                }
              />
              <ProjectSelector
                project={addIssueForm.project}
                onChange={
                  (newProject) =>
                    setAddIssueForm((prev) =>
                      prev ? { ...prev, project: newProject } : null
                    ) // Add null check
                }
              />
              <LabelSelector
                selectedLabels={addIssueForm.labels}
                onChange={
                  (newLabels) =>
                    setAddIssueForm((prev) =>
                      prev ? { ...prev, labels: newLabels } : null
                    ) // Add null check
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between py-2.5 px-4 w-full border-t">
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="create-more"
                  checked={createMore}
                  onCheckedChange={setCreateMore}
                />
                <Label htmlFor="create-more">続けて作成</Label>
              </div>
            </div>
            <Button
              size="sm"
              onClick={createIssue} // onClick handler already has null check
            >
              課題を作成
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
