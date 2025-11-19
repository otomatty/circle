-- Performance Optimization: Add Additional Indexes
-- This migration adds indexes to improve query performance

-- 日付順ソート用のインデックス
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_updated_at ON issues(updated_at DESC);

-- rankフィールド用のインデックス（ソートに使用）
CREATE INDEX IF NOT EXISTS idx_issues_rank ON issues(rank);

-- 複合インデックス（よく一緒に検索されるカラムの組み合わせ）
CREATE INDEX IF NOT EXISTS idx_issues_project_status ON issues(project_id, status_id);
CREATE INDEX IF NOT EXISTS idx_issues_status_priority ON issues(status_id, priority_id);

