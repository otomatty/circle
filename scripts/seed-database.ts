// apps/circle/scripts/seed-database.ts
import { createClient } from '@supabase/supabase-js';
import { priorities } from '../mock-data/priorities';
import { labels } from '../mock-data/labels';
import { status } from '../mock-data/status';
import { users } from '../mock-data/users';
import { teams } from '../mock-data/teams';
import { projects } from '../mock-data/projects';
import { issues } from '../mock-data/issues';
import { cycles } from '../mock-data/cycles';
import dotenv from 'dotenv';

// コマンドライン引数の処理
const args = process.argv.slice(2);
const shouldClearTables = args.includes('--clear') || args.includes('-c');
const isVerbose = args.includes('--verbose') || args.includes('-v');

if (shouldClearTables) {
  console.log(
    '⚠️ 警告: --clear フラグが指定されました。データベーステーブルの内容が削除されます。'
  );
}

// 環境変数を読み込み
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('必要な環境変数が設定されていません。');
  console.error(
    'NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください。'
  );
  process.exit(1);
}

// サービスロールキーでクライアントを初期化（RLSをバイパスするため）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// UUIDとスラグの対応を保存する辞書
const idMappings: Record<string, Record<string, string>> = {
  users: {},
  statuses: {},
  priorities: {},
  labels: {},
  teams: {},
  projects: {},
  cycles: {},
  issues: {},
};

// 共通の型定義
type Entity = {
  id: string;
  // biome-ignore lint/suspicious/noExplicitAny: 汎用的なデータ型のため any は許容
  [key: string]: any;
};

// テーブルデータの型
type TableData = {
  id: string;
  [key: string]: unknown;
};

// ログ出力関数
function log(message: string, isVerboseMessage = false) {
  if (!isVerboseMessage || isVerbose) {
    console.log(message);
  }
}

// データ挿入の前にテーブルをクリアする共通関数
async function clearTable(table: string): Promise<void> {
  if (!shouldClearTables) {
    log(
      `テーブル ${table} のクリアはスキップされました (--clear フラグが未指定)`,
      true
    );
    return;
  }

  log(`テーブル ${table} のデータをクリア中...`);
  const { error } = await supabase
    .schema('circle')
    .from(`${table}`)
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.warn(`テーブル ${table} のクリア中にエラーが発生しました:`, error);
  }
}

// テーブルの存在確認と既存データ取得の関数を追加
async function getExistingData<T extends TableData>(
  tableName: string,
  slugField = 'slug'
): Promise<Record<string, string>> {
  console.log(`既存の ${tableName} データを確認中...`);
  const { data, error } = await supabase
    .schema('circle')
    .from(tableName)
    .select(`id, ${slugField}`);

  if (error) {
    console.warn(`${tableName} データの取得中にエラーが発生:`, error);
    return {};
  }

  // slug/idのマッピングを返す
  const mapping: Record<string, string> = {};
  if (data) {
    for (const item of data) {
      // 二段階の型アサーションを使用して安全に変換
      const dbItem = item as unknown as { id: string; [key: string]: string };
      const key = dbItem[slugField];
      if (key && dbItem.id) {
        mapping[key.toString()] = dbItem.id;
      }
    }
  }

  return mapping;
}

// データを挿入して IDマッピングを更新する共通関数 (UPSERT対応)
async function insertDataAndMapIds<T extends Entity>(
  tableName: string,
  mappingKey: keyof typeof idMappings,
  data: T[],
  // biome-ignore lint/suspicious/noExplicitAny: 変換関数の戻り値は多様なため any を許容
  transformFn: (item: T) => Record<string, any>,
  slugField = 'slug'
): Promise<void> {
  try {
    console.log(`${tableName}データを挿入中...`);

    // 既存データの取得 (クリアの代わりに既存データとマージする)
    const existingData = await getExistingData(tableName, slugField);

    for (const item of data) {
      const transformedData = transformFn(item);
      const slugValue = transformedData[slugField];

      // 既に同じslugのデータが存在する場合はそのIDを使用
      if (slugValue && existingData[slugValue]) {
        // マッピングキーが存在することを確認
        if (!idMappings[mappingKey as string]) {
          idMappings[mappingKey as string] = {};
        }

        const mapping = idMappings[mappingKey as string] as Record<
          string,
          string
        >;
        mapping[item.id] = existingData[slugValue];
        continue; // 既存データを使用するので挿入はスキップ
      }

      // 新しいデータを挿入
      const { data: insertedData, error } = await supabase
        .schema('circle')
        .from(`${tableName}`)
        .insert(transformedData)
        .select();

      if (error) {
        // 一意性制約違反の場合は既存データを取得して再マッピング
        if (error.code === '23505' && slugValue) {
          console.warn(
            `${tableName} で重複キー (${slugValue}) が検出されました。既存データを使用します。`
          );
          const { data: existingItem, error: selectError } = await supabase
            .schema('circle')
            .from(`${tableName}`)
            .select('id')
            .eq(slugField, slugValue)
            .limit(1);

          if (!selectError && existingItem && existingItem.length > 0) {
            if (!idMappings[mappingKey as string]) {
              idMappings[mappingKey as string] = {};
            }
            const mapping = idMappings[mappingKey as string] as Record<
              string,
              string
            >;
            const firstItem = existingItem[0] as unknown as { id: string };
            if (firstItem?.id) {
              mapping[item.id] = firstItem.id;
            }
          } else {
            console.error(
              `${tableName} で既存データの取得に失敗:`,
              selectError || '該当データなし'
            );
          }
        } else {
          console.error(
            `${tableName}データの挿入中にエラーが発生しました:`,
            error
          );
        }
        continue;
      }

      // 挿入されたデータのIDをマッピングに保存
      if (insertedData?.[0]) {
        // マッピングキーが存在することを確認
        if (!idMappings[mappingKey as string]) {
          idMappings[mappingKey as string] = {};
        }
        // ローカル変数に代入して型安全性を確保
        const mapping = idMappings[mappingKey as string] as Record<
          string,
          string
        >;
        const firstInserted = insertedData[0] as unknown as { id: string };
        if (firstInserted?.id) {
          mapping[item.id] = firstInserted.id;
        }
      }
    }

    console.log(`${tableName}データが正常に挿入されました。`);
  } catch (error) {
    console.error(`${tableName}データの挿入中にエラーが発生しました:`, error);
    throw error;
  }
}

// テーブルのカラム存在確認関数を修正
async function checkTableColumn(
  tableName: string,
  columnName: string
): Promise<boolean> {
  try {
    // 直接テーブルに対して NULLIF を使って列の存在をチェック
    const { data: fallbackData, error: fallbackError } = await supabase
      .schema('circle')
      .from(tableName)
      .select(`id, ${columnName}`)
      .limit(1);

    if (!fallbackError) {
      console.log(
        `カラム ${columnName} の存在を確認しました: テーブル ${tableName}`
      );
      return true;
    }

    if (fallbackError.message.includes('does not exist')) {
      console.log(
        `カラム ${columnName} はテーブル ${tableName} に存在しません`
      );
      return false;
    }

    // それ以外のエラー
    console.warn('カラム確認中にエラー:', fallbackError);

    // 再試行: 単純なクエリ
    try {
      const { error: simpleError } = await supabase
        .schema('circle')
        .from(tableName)
        .select('id')
        .limit(1);

      if (!simpleError) {
        // テーブルは存在するが、特定のカラムが存在しない可能性が高い
        return false;
      }

      console.warn('テーブルへのアクセス中にエラー:', simpleError);
      return false;
    } catch (retryError) {
      console.warn('再試行中にエラー:', retryError);
      return false;
    }
  } catch (error) {
    console.warn(`テーブル ${tableName} のカラム確認中に例外が発生:`, error);

    // エラーの場合はfalseを返す (カラムが存在しないと仮定)
    return false;
  }
}

// RPC関数が存在しない場合に備えて、セットアップ関数を追加
async function setupDatabaseHelpers(): Promise<void> {
  try {
    // check_column_exists 関数を作成する
    const { error } = await supabase.rpc('check_column_exists', {
      table_name: 'users',
      column_name: 'id',
      schema_name: 'circle',
    });

    // 関数がまだ存在しない場合は作成を試みる
    if (
      error?.message?.includes('function') &&
      error?.message?.includes('does not exist')
    ) {
      console.log('データベースヘルパー関数をセットアップしています...');

      // 管理者権限がある場合のみ実行可能
      const { error: createError } = await supabase.rpc(
        'create_check_column_function'
      );

      if (createError) {
        console.warn(
          'ヘルパー関数の作成に失敗しました。代替方法を使用します:',
          createError
        );
      } else {
        console.log('ヘルパー関数が正常に作成されました');
      }
    }
  } catch (error) {
    console.warn(
      'データベースヘルパー関数のセットアップ中にエラーが発生:',
      error
    );
  }
}

// ステータスデータを挿入
async function seedStatuses(): Promise<void> {
  // statusesのマッピングを確認
  const statusMapping = idMappings.statuses;
  if (!statusMapping || Object.keys(statusMapping).length === 0) {
    // ステータスIDがマッピングされていない場合は、現在のステータスIDを取得する
    const { data: statusData, error: statusError } = await supabase
      .schema('circle')
      .from('statuses')
      .select('id, slug');

    if (statusError) {
      console.error('ステータスデータ取得エラー:', statusError);
    } else if (statusData) {
      // idMappings.statusesの初期化
      idMappings.statuses = idMappings.statuses || {};

      for (const status of statusData) {
        // モックデータのIDをキーとして、実際のDBのIDを値として保存
        const mockStatusId = status.slug; // slugがモックデータのIDに対応
        if (idMappings.statuses && mockStatusId) {
          const statusItem = status as unknown as { id: string; slug: string };
          idMappings.statuses[mockStatusId] = statusItem.id;
        }
      }
    }
  }

  await insertDataAndMapIds('statuses', 'statuses', status, (s) => ({
    slug: s.id,
    name: s.name,
    color: s.color,
    icon: s.id, // アイコンは識別子として保存
  }));
}

// 優先度データを挿入
async function seedPriorities(): Promise<void> {
  await insertDataAndMapIds('priorities', 'priorities', priorities, (p) => ({
    slug: p.id,
    name: p.name,
    icon: p.id, // アイコンは識別子として保存
  }));
}

// ラベルデータを挿入
async function seedLabels(): Promise<void> {
  await insertDataAndMapIds('labels', 'labels', labels, (l) => ({
    slug: l.id,
    name: l.name,
    color: l.color,
  }));
}

// ユーザーデータを挿入
async function seedUsers(): Promise<void> {
  await insertDataAndMapIds(
    'users',
    'users',
    users,
    (u) => ({
      // IDはデータベースで自動生成させる（idフィールドは含めない）
      name: u.name,
      email: u.email,
      avatar_url: u.avatarUrl,
      status: u.status,
      role: u.role,
      joined_date: u.joinedDate,
      // mock_idは保存せず、idMappingsだけで対応を管理
    }),
    'email' // ユーザーはemailでユニークに識別
  );
}

// チームデータを挿入
async function seedTeams(): Promise<void> {
  try {
    console.log('teamsデータを挿入中...');

    // 既存のデータを取得して確認
    console.log('既存の teams データを確認中...');
    const { data, error } = await supabase
      .schema('circle')
      .from('teams')
      .select('id, name, slug');

    if (error) {
      console.error('既存のteamsデータ取得エラー:', error);
      throw error;
    }

    // マッピングの構築（スラッグベース）
    if (data) {
      // idMappings.teamsの初期化
      idMappings.teams = {};

      console.log(`既存のチーム数: ${data.length}`);
      for (const team of data) {
        // slugとidのマッピングを作成
        if (team.slug) {
          console.log(`チームマッピング: ${team.slug} => ${team.id}`);
          idMappings.teams[team.slug] = team.id;
        } else if (team.name) {
          // slugがない場合はnameを使用（バックアップ）
          const generatedSlug = team.name.toLowerCase().replace(/\s+/g, '-');
          console.log(
            `チームマッピング(名前から): ${generatedSlug} => ${team.id}`
          );
          idMappings.teams[generatedSlug] = team.id;
        }
      }
    }

    // 既存データとの重複を避けるため、未挿入のチームだけを抽出
    const teamsToInsert = teams.filter((team) => {
      const slug = team.id; // モックデータではidがスラッグとして使用されている
      return !idMappings.teams || !idMappings.teams[slug];
    });

    if (teamsToInsert.length === 0) {
      console.log(
        '挿入する新しいチームがありません。既存のチームを使用します。'
      );
      return;
    }

    // 新しいチームを挿入
    for (const team of teamsToInsert) {
      const teamData = {
        name: team.name,
        slug: team.id, // モックデータのidをスラッグとして使用
        icon: team.icon,
      };

      const { data: insertedTeam, error: insertError } = await supabase
        .schema('circle')
        .from('teams')
        .insert(teamData)
        .select('id');

      if (insertError) {
        console.error(
          `チーム "${team.name}" の挿入中にエラーが発生:`,
          insertError
        );
        continue;
      }

      if (insertedTeam && insertedTeam.length > 0) {
        // 挿入されたチームのIDをマッピング
        if (!idMappings.teams) {
          idMappings.teams = {};
        }
        idMappings.teams[team.id] = insertedTeam[0]?.id || '';
        console.log(
          `新しいチーム挿入: ${team.id} => ${insertedTeam[0]?.id || ''}`
        );
      }
    }

    // マッピングの確認ログ
    console.log('チームIDマッピング:');
    for (const [mockId, dbId] of Object.entries(idMappings.teams || {})) {
      console.log(`  ${mockId} => ${dbId}`);
    }

    console.log('teamsデータが正常に挿入されました。');
  } catch (error) {
    console.error('チームデータの挿入中にエラーが発生しました:', error);
    throw error;
  }
}

// チームメンバーシップデータを挿入（ユーザーのteamIdsフィールドを使用）
async function seedTeamMembers(): Promise<void> {
  try {
    console.log('チームメンバーシップデータを挿入中...');

    // 既存のチームメンバーシップデータを取得
    const { data: existingMembers, error: membersError } = await supabase
      .schema('circle')
      .from('team_members')
      .select('team_id, user_id');

    if (membersError) {
      console.warn(
        '既存チームメンバーシップデータの取得中にエラー:',
        membersError
      );
    }

    // 既存の組み合わせを記録
    const existingMemberships = new Set<string>();
    if (existingMembers) {
      for (const m of existingMembers) {
        existingMemberships.add(`${m.team_id}:${m.user_id}`);
      }
    }

    for (const user of users) {
      // ユーザーのモックIDからデータベースIDへのマッピングを取得
      const userMapping = idMappings.users || {};
      const userId = userMapping[user.id];

      if (!userId) {
        console.warn(
          `ユーザー "${user.id}" のIDが見つかりません。このユーザーのチームメンバーシップはスキップします。`
        );
        continue;
      }

      // ユーザーが所属するチームを処理
      for (const teamId of user.teamIds) {
        // チームのモックIDからデータベースIDへのマッピングを取得
        const teamMapping = idMappings.teams || {};
        const dbTeamId = teamMapping[teamId];

        if (!dbTeamId) {
          console.warn(
            `チーム "${teamId}" のIDが見つかりません。このチームメンバーシップはスキップします。`
          );
          continue;
        }

        // 既に存在するメンバーシップはスキップ
        if (existingMemberships.has(`${dbTeamId}:${userId}`)) {
          console.log(
            `ユーザー "${user.id}" は既にチーム "${teamId}" のメンバーです。スキップします。`
          );
          continue;
        }

        const { error } = await supabase
          .schema('circle')
          .from('team_members')
          .insert({
            team_id: dbTeamId,
            user_id: userId,
          });

        if (error) {
          console.warn(
            `ユーザー "${user.id}" をチーム "${teamId}" に追加中にエラーが発生しました:`,
            error
          );
        }
      }
    }

    console.log('チームメンバーシップデータが正常に挿入されました。');
  } catch (error) {
    console.error(
      'チームメンバーシップデータの挿入中にエラーが発生しました:',
      error
    );
    throw error;
  }
}

// プロジェクトデータを挿入
async function seedProjects(): Promise<void> {
  try {
    // statusesのマッピングを確認
    const statusMapping = idMappings.statuses;
    if (!statusMapping || Object.keys(statusMapping).length === 0) {
      // ステータスIDがマッピングされていない場合は、現在のステータスIDを取得する
      const { data: statusData, error: statusError } = await supabase
        .schema('circle')
        .from('statuses')
        .select('id, slug');

      if (statusError) {
        console.error('ステータスデータ取得エラー:', statusError);
      } else if (statusData) {
        // idMappings.statusesの初期化
        idMappings.statuses = idMappings.statuses || {};

        for (const status of statusData) {
          // モックデータのIDをキーとして、実際のDBのIDを値として保存
          const mockStatusId = status.slug; // slugがモックデータのIDに対応
          if (idMappings.statuses && mockStatusId) {
            const statusItem = status as unknown as {
              id: string;
              slug: string;
            };
            idMappings.statuses[mockStatusId] = statusItem.id;
          }
        }
      }
    }

    // プロジェクステーブルにslugカラムがあるか確認
    const hasSlugColumn = await checkTableColumn('projects', 'slug');

    // 有効なステータスIDを持つプロジェクトだけをフィルタリング
    const validProjects = projects.filter((p) => {
      const statusMapping = idMappings.statuses || {};
      const statusId = statusMapping[p.status.id];
      if (!statusId) {
        console.warn(
          `ステータス "${p.status.id}" のIDが見つかりません。プロジェクト "${p.name}" はスキップします。`
        );
        return false;
      }
      return true;
    });

    if (validProjects.length === 0) {
      console.warn(
        '有効なプロジェクトがありません。すべてのプロジェクトはスキップされます。'
      );
      return;
    }

    // カラム構造に応じてデータ変換
    const transformProject = (p: (typeof projects)[0]) => {
      const statusMapping = idMappings.statuses || {};
      const statusId = statusMapping[p.status.id];

      const baseData = {
        name: p.name,
        icon: p.icon.name, // Lucideアイコン名を文字列として保存
        status_id: statusId,
        percent_complete: p.percentComplete,
        start_date: p.startDate,
      };

      // slugカラムがある場合のみ追加
      if (hasSlugColumn) {
        return {
          ...baseData,
          slug: `project-${p.id}`,
        };
      }

      return baseData;
    };

    // 既存の projects 取得時に正しいフィールドを選択する
    const selectFields = hasSlugColumn ? 'id, slug' : 'id, name';

    // 既存データの取得 (クリアの代わりに既存データとマージする)
    const { data, error } = await supabase
      .schema('circle')
      .from('projects')
      .select(selectFields);

    if (error) {
      console.warn('projects データの取得中にエラーが発生:', error);
    }

    // マッピングの構築
    const mapping: Record<string, string> = {};
    if (data) {
      for (const item of data) {
        const dbItem = item as unknown as {
          id: string;
          name?: string;
          slug?: string;
        };
        const key = hasSlugColumn ? dbItem.slug : dbItem.name;
        if (key && dbItem.id) {
          mapping[key] = dbItem.id;
        }
      }
    }

    // 既存データをマッピングに追加
    for (const project of validProjects) {
      const slugValue = hasSlugColumn ? `project-${project.id}` : project.name;

      if (slugValue && mapping[slugValue]) {
        if (!idMappings.projects) {
          idMappings.projects = {};
        }
        idMappings.projects[project.id] = mapping[slugValue];
        console.log(`既存のプロジェクト "${slugValue}" を使用します。`);
        continue;
      }

      // 新規挿入
      const transformedData = transformProject(project);

      const { data: insertedData, error: insertError } = await supabase
        .schema('circle')
        .from('projects')
        .insert(transformedData)
        .select('id');

      if (insertError) {
        console.error(
          `プロジェクト "${project.name}" の挿入中にエラーが発生:`,
          insertError
        );
        continue;
      }

      if (insertedData && insertedData.length > 0) {
        if (!idMappings.projects) {
          idMappings.projects = {};
        }
        const firstInserted = insertedData[0] as unknown as { id: string };
        if (firstInserted?.id) {
          idMappings.projects[project.id] = firstInserted.id;
        }
      }
    }

    console.log('projectsデータが正常に挿入されました。');
  } catch (error) {
    console.error('プロジェクトデータの挿入中にエラーが発生しました:', error);
    throw error;
  }
}

// チーム・プロジェクト関連データを挿入
async function seedTeamProjects(): Promise<void> {
  try {
    console.log('チーム・プロジェクト関連データを挿入中...');

    // 既存の関連を取得
    const { data: existingRelations, error: relationsError } = await supabase
      .schema('circle')
      .from('team_projects')
      .select('team_id, project_id');

    if (relationsError) {
      console.warn(
        '既存チーム・プロジェクト関連の取得中にエラー:',
        relationsError
      );
    }

    // 既存の組み合わせを記録
    const existingRelationships = new Set<string>();
    if (existingRelations) {
      for (const r of existingRelations) {
        existingRelationships.add(`${r.team_id}:${r.project_id}`);
      }
    }

    for (const team of teams) {
      // idMappings.teamsが存在することを確認
      const teamMapping = idMappings.teams || {};
      const teamId = teamMapping[team.id];

      if (!teamId) {
        console.warn(
          `チーム "${team.id}" のIDが見つかりません。このチームのプロジェクト関連はスキップします。`
        );
        continue;
      }

      for (const project of team.projects) {
        // idMappings.projectsが存在することを確認
        const projectMapping = idMappings.projects || {};
        const projectId = projectMapping[project.id];

        if (!projectId) {
          console.warn(
            `プロジェクト "${project.id}" のIDが見つかりません。この関連はスキップします。`
          );
          continue;
        }

        // 既に存在する関連はスキップ
        if (existingRelationships.has(`${teamId}:${projectId}`)) {
          console.log(
            `チーム "${team.id}" とプロジェクト "${project.id}" の関連は既に存在します。スキップします。`
          );
          continue;
        }

        const { error } = await supabase
          .schema('circle')
          .from('team_projects')
          .insert({
            team_id: teamId,
            project_id: projectId,
          });

        if (error) {
          console.warn(
            `チーム "${team.id}" とプロジェクト "${project.id}" の関連付け中にエラーが発生しました:`,
            error
          );
        }
      }
    }

    console.log('チーム・プロジェクト関連データが正常に挿入されました。');
  } catch (error) {
    console.error(
      'チーム・プロジェクト関連データの挿入中にエラーが発生しました:',
      error
    );
    throw error;
  }
}

// サイクル（スプリント）データを挿入
async function seedCycles(): Promise<void> {
  try {
    console.log('cyclesデータを挿入中...');

    // チームスラッグの特殊なマッピングを手動で作成
    // モックデータのチームIDとDBのチームスラッグを手動で対応付ける
    const specialTeamMappings: Record<string, string> = {
      'design-system': 'DESIGN', // デザインシステムのスラッグをDESIGNに対応
      'performance-lab': 'PERF', // パフォーマンスラボのスラッグをPERFに対応
      'lndev-core': 'CORE', // LNDevコアチームのスラッグをCOREに対応
    };

    // teamsのマッピングを確認
    const teamMapping = idMappings.teams;
    if (!teamMapping || Object.keys(teamMapping).length === 0) {
      console.error(
        'チームIDマッピングが空です。チームの挿入が正しく行われたか確認してください。'
      );
      console.log('利用可能なマッピング:', idMappings);
      return;
    }

    // チームIDマッピングのログ
    console.log('サイクル挿入に使用するチームIDマッピング:');
    for (const [mockId, dbId] of Object.entries(teamMapping)) {
      console.log(`  ${mockId} => ${dbId}`);
    }

    // サイクルテーブルにslugカラムがあるか確認
    const hasSlugColumn = await checkTableColumn('cycles', 'slug');
    console.log(`cyclesテーブルにslugカラムが存在: ${hasSlugColumn}`);

    // 有効なチームIDを持つサイクルだけをフィルタリング
    const validCycles = cycles.filter((c) => {
      // 特殊マッピングを使用してチームIDを変換
      const mappedTeamId = specialTeamMappings[c.teamId];

      // マッピングされたIDでチームを探す
      const teamId = mappedTeamId ? teamMapping[mappedTeamId] : null;

      if (!teamId) {
        console.warn(
          `チーム "${c.teamId}" のIDが見つかりません。サイクル "${c.name}" はスキップします。`
        );
        console.log('利用可能なチームID:', Object.keys(teamMapping));
        console.log(`特殊マッピング試行: ${c.teamId} -> ${mappedTeamId}`);
        return false;
      }

      // 一時的にマッピングIDを保存(後で使用するため)
      c.teamId = mappedTeamId || c.teamId;
      return true;
    });

    console.log(`有効なサイクル数: ${validCycles.length}/${cycles.length}`);

    if (validCycles.length === 0) {
      console.warn(
        '有効なサイクルがありません。すべてのサイクルはスキップされます。'
      );
      return;
    }

    // カラム構造に応じてデータ変換
    const transformCycle = (c: (typeof cycles)[0]) => {
      const teamMapping = idMappings.teams || {};
      const teamId = teamMapping[c.teamId];

      const baseData = {
        number: c.number,
        name: c.name,
        team_id: teamId,
        start_date: c.startDate,
        end_date: c.endDate,
        progress: c.progress,
      };

      // slugカラムがある場合のみ追加
      if (hasSlugColumn) {
        return {
          ...baseData,
          slug: `cycle-${c.number}`,
        };
      }

      return baseData;
    };

    // 既存の cycles 取得時に正しいフィールドを選択する
    const selectFields = hasSlugColumn ? 'id, slug' : 'id, name';

    // 既存データの取得 (クリアの代わりに既存データとマージする)
    const { data, error } = await supabase
      .schema('circle')
      .from('cycles')
      .select(selectFields);

    if (error) {
      console.warn('cycles データの取得中にエラーが発生:', error);
    }

    // マッピングの構築
    const mapping: Record<string, string> = {};
    if (data) {
      for (const item of data) {
        const dbItem = item as unknown as {
          id: string;
          name?: string;
          slug?: string;
        };
        const key = hasSlugColumn ? dbItem.slug : dbItem.name;
        if (key && dbItem.id) {
          mapping[key] = dbItem.id;
        }
      }
    }

    // 既存データをマッピングに追加
    for (const cycle of validCycles) {
      const slugValue = hasSlugColumn ? `cycle-${cycle.number}` : cycle.name;

      if (slugValue && mapping[slugValue]) {
        if (!idMappings.cycles) {
          idMappings.cycles = {};
        }
        idMappings.cycles[cycle.id] = mapping[slugValue];
        console.log(`既存のサイクル "${slugValue}" を使用します。`);
        continue;
      }

      // 新規挿入
      const transformedData = transformCycle(cycle);

      const { data: insertedData, error: insertError } = await supabase
        .schema('circle')
        .from('cycles')
        .insert(transformedData)
        .select('id');

      if (insertError) {
        console.error(
          `サイクル "${cycle.name}" の挿入中にエラーが発生:`,
          insertError
        );
        continue;
      }

      if (insertedData && insertedData.length > 0) {
        if (!idMappings.cycles) {
          idMappings.cycles = {};
        }
        const firstInserted = insertedData[0] as unknown as { id: string };
        if (firstInserted?.id) {
          idMappings.cycles[cycle.id] = firstInserted.id;
          console.log(`新規サイクル挿入: ${cycle.id} => ${firstInserted.id}`);
        }
      }
    }

    // マッピングの確認ログ
    console.log('サイクルIDマッピング:');
    for (const [mockId, dbId] of Object.entries(idMappings.cycles || {})) {
      console.log(`  ${mockId} => ${dbId}`);
    }

    console.log('cyclesデータが正常に挿入されました。');
  } catch (error) {
    console.error('サイクルデータの挿入中にエラーが発生しました:', error);
    throw error;
  }
}

// タスク（Issue）データを挿入
async function seedIssues(): Promise<void> {
  try {
    console.log('issuesデータを挿入中...');

    // issues テーブルに slug カラムはないので、identifier を使用する
    console.log(
      '注意: issuesテーブルには slug カラムがないため identifier を使用します'
    );

    // 基本的なエンティティのマッピングを確認
    const entities = [
      { name: 'statuses' as keyof typeof idMappings, field: 'slug' },
      { name: 'priorities' as keyof typeof idMappings, field: 'slug' },
      { name: 'cycles' as keyof typeof idMappings, field: 'slug' },
    ];

    for (const entity of entities) {
      const mapping = idMappings[entity.name];
      if (!mapping || Object.keys(mapping).length === 0) {
        // IDがマッピングされていない場合は、現在のIDを取得する
        const { data: entityData, error: entityError } = await supabase
          .schema('circle')
          .from(entity.name)
          .select(`id, ${entity.field}`);

        if (entityError) {
          console.error(`${entity.name}データ取得エラー:`, entityError);
        } else if (entityData) {
          // idMappings初期化
          idMappings[entity.name] = idMappings[entity.name] || {};

          // データベースのエンティティをマッピング
          for (const item of entityData) {
            // 二段階の型アサーションを使用して安全に変換
            const dbItem = item as unknown as {
              id: string;
              [key: string]: string;
            };
            // slugフィールドの値をキーとして、実際のDBのIDを値として保存
            const field = entity.field as keyof typeof dbItem;
            const fieldValue = dbItem[field];
            const entityMapping = idMappings[entity.name];
            if (entityMapping && fieldValue) {
              entityMapping[fieldValue.toString()] = dbItem.id;
            }
          }
        }
      }
    }

    // 有効な参照を持つタスクだけをフィルタリング
    const validIssues = issues.filter((issue) => {
      const statusMapping = idMappings.statuses || {};
      const statusId = statusMapping[issue.status.id];
      if (!statusId) {
        console.warn(
          `ステータス "${issue.status.id}" のIDが見つかりません。タスク "${issue.title}" はスキップします。`
        );
        return false;
      }

      const priorityMapping = idMappings.priorities || {};
      const priorityId = priorityMapping[issue.priority.id];
      if (!priorityId) {
        console.warn(
          `優先度 "${issue.priority.id}" のIDが見つかりません。タスク "${issue.title}" はスキップします。`
        );
        return false;
      }

      const cycleMapping = idMappings.cycles || {};
      const cycleId = cycleMapping[issue.cycleId];
      if (!cycleId) {
        console.warn(
          `サイクル "${issue.cycleId}" のIDが見つかりません。タスク "${issue.title}" はスキップします。`
        );
        return false;
      }

      return true;
    });

    if (validIssues.length === 0) {
      console.warn(
        '有効なタスクがありません。すべてのタスクはスキップされます。'
      );
      return;
    }

    // 既存の issues 取得時には identifier を使用
    const selectFields = 'id, identifier';

    // 既存データの取得 (クリアの代わりに既存データとマージする)
    const { data, error } = await supabase
      .schema('circle')
      .from('issues')
      .select(selectFields);

    if (error) {
      console.warn('issues データの取得中にエラーが発生:', error);
    }

    // マッピングの構築
    const mapping: Record<string, string> = {};
    if (data) {
      for (const item of data) {
        const dbItem = item as unknown as {
          id: string;
          identifier: string;
        };
        // identifierをキーとして使用
        if (dbItem.identifier && dbItem.id) {
          mapping[dbItem.identifier] = dbItem.id;
        }
      }
    }

    // 既存データをマッピングに追加し、新しいデータを挿入
    for (const issue of validIssues) {
      // IDマッピング用のキーを生成（identifierを使用）
      const identifierValue = issue.identifier;

      // 既存データがあればマッピングを更新
      if (identifierValue && mapping[identifierValue]) {
        if (!idMappings.issues) {
          idMappings.issues = {};
        }
        idMappings.issues[issue.id] = mapping[identifierValue];
        console.log(`既存のタスク "${identifierValue}" を使用します。`);
        continue;
      }

      // 新規データ挿入
      // idMappings.statusesが存在することを確認
      const statusMapping = idMappings.statuses || {};
      const statusId = statusMapping[issue.status.id];

      // idMappings.prioritiesが存在することを確認
      const priorityMapping = idMappings.priorities || {};
      const priorityId = priorityMapping[issue.priority.id];

      // idMappings.cyclesが存在することを確認
      const cycleMapping = idMappings.cycles || {};
      const cycleId = cycleMapping[issue.cycleId];

      let projectId = null;

      if (issue.project) {
        // idMappings.projectsが存在することを確認
        const projectMapping = idMappings.projects || {};
        projectId = projectMapping[issue.project.id];
      }

      // issuesテーブルには slug カラムがないので除外
      const issueData = {
        identifier: issue.identifier,
        title: issue.title,
        description: issue.description,
        status_id: statusId,
        priority_id: priorityId,
        cycle_id: cycleId,
        project_id: projectId,
        rank: issue.rank,
        created_at: issue.createdAt,
      };

      try {
        const { data: insertedData, error: insertError } = await supabase
          .schema('circle')
          .from('issues')
          .insert(issueData)
          .select('id');

        if (insertError) {
          console.error(
            `タスク "${issue.title}" の挿入中にエラーが発生:`,
            insertError
          );
          continue;
        }

        // 挿入されたデータのIDをマッピングに保存
        if (insertedData?.[0]) {
          if (!idMappings.issues) {
            idMappings.issues = {};
          }
          const firstInserted = insertedData[0] as unknown as { id: string };
          if (firstInserted?.id) {
            idMappings.issues[issue.id] = firstInserted.id;
            console.log(`新規タスク挿入: ${issue.id} => ${firstInserted.id}`);
          }
        }
      } catch (err) {
        console.error(
          `タスク "${issue.identifier}" の挿入中に例外が発生:`,
          err
        );
      }
    }

    console.log('issuesデータが正常に挿入されました。');
  } catch (error) {
    console.error('タスクデータの挿入中にエラーが発生しました:', error);
    throw error;
  }
}

// タスクのアサインデータを挿入
async function seedIssueAssignees(): Promise<void> {
  try {
    console.log('タスクのアサインデータを挿入中...');

    // マッピングが空の場合は先にタスクデータを取得
    if (!idMappings.issues || Object.keys(idMappings.issues).length === 0) {
      const { data: issuesData, error: issuesError } = await supabase
        .schema('circle')
        .from('issues')
        .select('id, identifier');

      if (issuesError) {
        console.warn('issues データの取得中にエラーが発生:', issuesError);
      } else if (issuesData) {
        idMappings.issues = idMappings.issues || {};
        // identifier を元のタスクID に紐づける逆マッピング
        for (const issue of issuesData) {
          const mockIssue = issues.find(
            (i) => i.identifier === issue.identifier
          );
          if (mockIssue) {
            idMappings.issues[mockIssue.id] = issue.id;
          }
        }
      }
    }

    // 既存のアサインデータを取得
    const { data: existingAssignees, error: assigneesError } = await supabase
      .schema('circle')
      .from('issue_assignees')
      .select('issue_id, user_id');

    if (assigneesError) {
      console.warn('既存タスクアサインデータの取得中にエラー:', assigneesError);
    }

    // 既存の組み合わせを記録
    const existingAssignments = new Set<string>();
    if (existingAssignees) {
      for (const a of existingAssignees) {
        existingAssignments.add(`${a.issue_id}:${a.user_id}`);
      }
    }

    // アサイン情報を持つタスクだけを処理
    for (const issue of issues.filter((i) => i.assignees !== undefined)) {
      // idMappings.issuesが存在することを確認
      const issueMapping = idMappings.issues || {};
      const issueId = issueMapping[issue.id];

      if (!issueId) {
        console.warn(
          `タスク "${issue.id}" のIDが見つかりません。このタスクのアサインはスキップします。`
        );
        continue;
      }

      if (!issue.assignees) continue;

      // idMappings.usersが存在することを確認
      const userMapping = idMappings.users || {};
      const userId = userMapping[issue.assignees.id];

      if (!userId) {
        console.warn(
          `ユーザー "${issue.assignees.id}" のIDが見つかりません。このアサインはスキップします。`
        );
        continue;
      }

      // 既に存在するアサインはスキップ
      if (existingAssignments.has(`${issueId}:${userId}`)) {
        console.log(
          `タスク "${issue.id}" へのユーザー "${issue.assignees.id}" のアサインは既に存在します。スキップします。`
        );
        continue;
      }

      const { error } = await supabase
        .schema('circle')
        .from('issue_assignees')
        .insert({
          issue_id: issueId,
          user_id: userId,
        });

      if (error) {
        console.warn(
          `タスク "${issue.id}" にユーザー "${issue.assignees.id}" をアサイン中にエラーが発生しました:`,
          error
        );
      }
    }

    console.log('タスクのアサインデータが正常に挿入されました。');
  } catch (error) {
    console.error(
      'タスクのアサインデータの挿入中にエラーが発生しました:',
      error
    );
    throw error;
  }
}

// タスクのラベルデータを挿入
async function seedIssueLabels(): Promise<void> {
  try {
    console.log('タスクのラベルデータを挿入中...');

    // マッピングが空の場合は先にタスクデータを取得
    if (!idMappings.issues || Object.keys(idMappings.issues).length === 0) {
      const { data: issuesData, error: issuesError } = await supabase
        .schema('circle')
        .from('issues')
        .select('id, identifier');

      if (issuesError) {
        console.warn('issues データの取得中にエラーが発生:', issuesError);
      } else if (issuesData) {
        idMappings.issues = idMappings.issues || {};
        // identifier を元のタスクID に紐づける逆マッピング
        for (const issue of issuesData) {
          const mockIssue = issues.find(
            (i) => i.identifier === issue.identifier
          );
          if (mockIssue) {
            idMappings.issues[mockIssue.id] = issue.id;
          }
        }
      }
    }

    // 既存のタスクラベルデータを取得
    const { data: existingLabels, error: labelsError } = await supabase
      .schema('circle')
      .from('issue_labels')
      .select('issue_id, label_id');

    if (labelsError) {
      console.warn('既存タスクラベルデータの取得中にエラー:', labelsError);
    }

    // 既存の組み合わせを記録
    const existingLabelLinks = new Set<string>();
    if (existingLabels) {
      for (const l of existingLabels) {
        existingLabelLinks.add(`${l.issue_id}:${l.label_id}`);
      }
    }

    for (const issue of issues) {
      // idMappings.issuesが存在することを確認
      const issueMapping = idMappings.issues || {};
      const issueId = issueMapping[issue.id];

      if (!issueId) {
        console.warn(
          `タスク "${issue.id}" のIDが見つかりません。このタスクのラベルはスキップします。`
        );
        continue;
      }

      for (const label of issue.labels) {
        // idMappings.labelsが存在することを確認
        const labelMapping = idMappings.labels || {};
        const labelId = labelMapping[label.id];

        if (!labelId) {
          console.warn(
            `ラベル "${label.id}" のIDが見つかりません。このラベルはスキップします。`
          );
          continue;
        }

        // 既に存在するラベル関連はスキップ
        if (existingLabelLinks.has(`${issueId}:${labelId}`)) {
          console.log(
            `タスク "${issue.id}" へのラベル "${label.id}" の関連付けは既に存在します。スキップします。`
          );
          continue;
        }

        const { error } = await supabase
          .schema('circle')
          .from('issue_labels')
          .insert({
            issue_id: issueId,
            label_id: labelId,
          });

        if (error) {
          console.warn(
            `タスク "${issue.id}" にラベル "${label.id}" を追加中にエラーが発生しました:`,
            error
          );
        }
      }
    }

    console.log('タスクのラベルデータが正常に挿入されました。');
  } catch (error) {
    console.error('タスクのラベルデータの挿入中にエラーが発生しました:', error);
    throw error;
  }
}

// サブタスク関係データを挿入
async function seedIssueRelations(): Promise<void> {
  try {
    console.log('サブタスク関係データを挿入中...');

    // マッピングが空の場合は先にタスクデータを取得
    if (!idMappings.issues || Object.keys(idMappings.issues).length === 0) {
      const { data: issuesData, error: issuesError } = await supabase
        .schema('circle')
        .from('issues')
        .select('id, identifier');

      if (issuesError) {
        console.warn('issues データの取得中にエラーが発生:', issuesError);
      } else if (issuesData) {
        idMappings.issues = idMappings.issues || {};
        // identifier を元のタスクID に紐づける逆マッピング
        for (const issue of issuesData) {
          const mockIssue = issues.find(
            (i) => i.identifier === issue.identifier
          );
          if (mockIssue) {
            idMappings.issues[mockIssue.id] = issue.id;
          }
        }
      }
    }

    // 既存のサブタスク関係データを取得
    const { data: existingRelations, error: relationsError } = await supabase
      .schema('circle')
      .from('issue_relations')
      .select('parent_issue_id, child_issue_id');

    if (relationsError) {
      console.warn('既存サブタスク関係データの取得中にエラー:', relationsError);
    }

    // 既存の組み合わせを記録
    const existingRelationships = new Set<string>();
    if (existingRelations) {
      for (const r of existingRelations) {
        existingRelationships.add(`${r.parent_issue_id}:${r.child_issue_id}`);
      }
    }

    // サブタスクを持つタスクだけを処理
    const issuesWithSubissues = issues.filter(
      (issue) => issue.subissues && issue.subissues.length > 0
    );

    for (const issue of issuesWithSubissues) {
      // idMappings.issuesが存在することを確認
      const issueMapping = idMappings.issues || {};
      const parentIssueId = issueMapping[issue.id];

      if (!parentIssueId) {
        console.warn(
          `親タスク "${issue.id}" のIDが見つかりません。このサブタスク関係はスキップします。`
        );
        continue;
      }

      for (const subissueId of issue.subissues || []) {
        const childIssueId = issueMapping[subissueId];

        if (!childIssueId) {
          console.warn(
            `子タスク "${subissueId}" のIDが見つかりません。この関係はスキップします。`
          );
          continue;
        }

        // 既に存在する関係はスキップ
        if (existingRelationships.has(`${parentIssueId}:${childIssueId}`)) {
          console.log(
            `親タスク "${issue.id}" と子タスク "${subissueId}" の関係は既に存在します。スキップします。`
          );
          continue;
        }

        const { error } = await supabase
          .schema('circle')
          .from('issue_relations')
          .insert({
            parent_issue_id: parentIssueId,
            child_issue_id: childIssueId,
          });

        if (error) {
          console.warn(
            `親タスク "${issue.id}" と子タスク "${subissueId}" の関係を追加中にエラーが発生しました:`,
            error
          );
        }
      }
    }

    console.log('サブタスク関係データが正常に挿入されました。');
  } catch (error) {
    console.error('サブタスク関係データの挿入中にエラーが発生しました:', error);
    throw error;
  }
}

// メイン関数
async function seedAll(): Promise<void> {
  try {
    // RPC関数のセットアップ（必要ならば）
    await setupDatabaseHelpers();

    if (shouldClearTables) {
      console.log(
        '指定されたフラグに基づき、依存関係を考慮してテーブルをクリアします...'
      );

      // 依存関係の逆順でデータを削除
      try {
        // 子テーブルから順に削除
        await clearTable('issue_relations');
        await clearTable('issue_labels');
        await clearTable('issue_assignees');
        await clearTable('issues');
        await clearTable('cycles');
        await clearTable('team_projects');
        await clearTable('projects');
        await clearTable('team_members');
        await clearTable('teams');
        await clearTable('users');
        await clearTable('labels');
        await clearTable('priorities');
        await clearTable('statuses');
      } catch (error) {
        console.error('テーブルクリア処理中にエラーが発生しました:', error);
        console.log(
          '既存のデータと衝突する可能性があります。処理を続行します...'
        );
      }
    }

    let hasErrors = false;

    try {
      await seedStatuses();
    } catch (error) {
      console.error('ステータスのシード処理中にエラーが発生しました:', error);
      hasErrors = true;
    }

    try {
      await seedPriorities();
    } catch (error) {
      console.error('優先度のシード処理中にエラーが発生しました:', error);
      hasErrors = true;
    }

    try {
      await seedLabels();
    } catch (error) {
      console.error('ラベルのシード処理中にエラーが発生しました:', error);
      hasErrors = true;
    }

    try {
      await seedUsers();
    } catch (error) {
      console.error('ユーザーのシード処理中にエラーが発生しました:', error);
      hasErrors = true;
    }

    try {
      await seedTeams();
    } catch (error) {
      console.error('チームのシード処理中にエラーが発生しました:', error);
      hasErrors = true;
    }

    try {
      await seedTeamMembers();
    } catch (error) {
      console.error(
        'チームメンバーシップのシード処理中にエラーが発生しました:',
        error
      );
      hasErrors = true;
    }

    try {
      await seedProjects();
    } catch (error) {
      console.error('プロジェクトのシード処理中にエラーが発生しました:', error);
      hasErrors = true;
    }

    try {
      await seedTeamProjects();
    } catch (error) {
      console.error(
        'チーム・プロジェクト関連のシード処理中にエラーが発生しました:',
        error
      );
      hasErrors = true;
    }

    try {
      await seedCycles();
    } catch (error) {
      console.error('サイクルのシード処理中にエラーが発生しました:', error);
      hasErrors = true;
    }

    try {
      await seedIssues();
    } catch (error) {
      console.error('タスクのシード処理中にエラーが発生しました:', error);
      hasErrors = true;
    }

    try {
      await seedIssueAssignees();
    } catch (error) {
      console.error(
        'タスクアサインのシード処理中にエラーが発生しました:',
        error
      );
      hasErrors = true;
    }

    try {
      await seedIssueLabels();
    } catch (error) {
      console.error('タスクラベルのシード処理中にエラーが発生しました:', error);
      hasErrors = true;
    }

    try {
      await seedIssueRelations();
    } catch (error) {
      console.error(
        'サブタスク関係のシード処理中にエラーが発生しました:',
        error
      );
      hasErrors = true;
    }

    if (hasErrors) {
      console.log(
        'データベースのシード処理が完了しましたが、いくつかのエラーが発生しました。'
      );
      console.log('各エンティティのマッピングを確認してください。');
    } else {
      console.log('データベースのシード処理が正常に完了しました！');
    }
  } catch (error) {
    console.error('シード処理全体でエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトの使用方法を表示
function printUsage() {
  console.log('使用法: bun run seed:database [options]');
  console.log('');
  console.log('オプション:');
  console.log('  --clear, -c     全テーブルのデータをクリアしてから挿入');
  console.log('  --verbose, -v   詳細なログを出力');
  console.log('  --help, -h      このヘルプを表示');
  console.log('');
  console.log('例:');
  console.log(
    '  bun run seed:database             既存データを維持しながらシード'
  );
  console.log(
    '  bun run seed:database --clear    全データを削除してからシード'
  );
  process.exit(0);
}

// ヘルプオプションの処理
if (args.includes('--help') || args.includes('-h')) {
  printUsage();
}

// スクリプトを実行
seedAll();
