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
import { useParams } from 'next/navigation';
import type { Issue } from '~/types/issues';
import { useAtomValue, useSetAtom } from 'jotai';
import { addIssueAtom } from '~/store/issues-store';
import { createIssue as createIssueAction } from '~/actions/issues';
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
  const statuses = useAtomValue(statusesAtom);
  const priorities = useAtomValue(prioritiesAtom);

  // Team slug comes from the route (/[orgId]/team/[teamId]/all). The identifier
  // and rank are minted server-side, so they are not generated here.
  const params = useParams();
  const teamId =
    typeof params?.teamId === 'string' ? params.teamId : undefined;

  // Build the default form data for a new issue. The identifier and rank are
  // finalized on the server, so placeholders are used here.
  const createDefaultData = useCallback((): Issue => {
    const initialStatus: Status | undefined =
      defaultStatus || statuses.find((s) => s.id === 'to-do');
    const initialPriority: Priority | undefined = priorities.find(
      (p) => p.id === 'no-priority'
    );

    if (!initialStatus) {
      console.error('デフォルトステータス "to-do" が見つかりません！');
      throw new Error('デフォルトステータスの設定エラー。');
    }
    if (!initialPriority) {
      console.error('デフォルト優先度 "no-priority" が見つかりません！');
      throw new Error('デフォルト優先度の設定エラー。');
    }

    return {
      id: uuidv4(),
      identifier: '',
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
      rank: '',
    };
  }, [defaultStatus, statuses, priorities]);

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to create issue (add guard for null addIssueForm)
  const createIssue = async () => {
    if (!addIssueForm) {
      toast.error('フォームが初期化されていません。');
      return;
    }
    if (!addIssueForm.title) {
      toast.error('タイトルは必須です');
      return;
    }

    setIsSubmitting(true);
    let createdIssue: Issue;
    try {
      // Persist to D1 (identifier / rank minted server-side) and get the
      // confirmed issue back.
      const dto = await createIssueAction({
        title: addIssueForm.title,
        description: addIssueForm.description,
        statusId: addIssueForm.status.id,
        priorityId: addIssueForm.priority.id,
        assigneeId: addIssueForm.assignees?.id ?? null,
        labelIds: addIssueForm.labels.map((label) => label.id),
        projectId: addIssueForm.project?.id ?? null,
        teamId,
      });
      createdIssue = dto as unknown as Issue;
    } catch (error) {
      console.error('Failed to create issue', error);
      toast.error('課題の作成に失敗しました');
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);

    toast.success('課題が作成されました');
    addIssue(createdIssue);
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
        <DialogContent className="w-full sm:max-w-[750px] p-4 shadow-xl top-[30%]">
          <DialogHeader>
            <DialogTitle>新規課題作成</DialogTitle>
          </DialogHeader>
          <div>データの読み込み中...</div>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? '作成中...' : '課題を作成'}
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
