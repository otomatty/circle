import type {
  ProjectResponse,
  ScrapboxApiConfig,
  ScrapboxPage,
} from '~/types/scrapbox';

/**
 * Scrapbox APIクライアント
 * @description Scrapboxのプロジェクトとページ一覧を取得するためのクライアント
 */
export class ScrapboxClient {
  private readonly baseUrl: string;
  private readonly cookie?: string;

  constructor(config?: ScrapboxApiConfig) {
    this.baseUrl = config?.baseUrl ?? 'https://scrapbox.io/api';
    this.cookie = config?.cookie;
  }

  private async fetch<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: this.cookie ? { Cookie: this.cookie } : undefined,
    });

    if (!response.ok) {
      throw new Error(
        `Scrapbox API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  /**
   * プロジェクトの全ページを取得する
   * @param projectName プロジェクト名
   * @returns プロジェクトの全ページ
   */
  async getAllPages(projectName: string): Promise<ScrapboxPage[]> {
    const response = await this.fetch<{
      pages: Array<{
        id: string;
        title: string;
        views: number;
        linked: number;
        pin: number;
        updated: number;
      }>;
    }>(`/pages/${projectName}`);

    return response.pages.map((page) => ({
      id: page.id,
      title: page.title,
      views: page.views,
      linked: page.linked,
      pin: page.pin,
      updated: new Date(page.updated).getTime(),
      created: Date.now(),
      accessed: 0,
      snapshotCreated: 0,
      pageRank: 0,
      image: null,
      descriptions: [],
      user: { id: 'system' },
      commitId: 'initial',
    }));
  }

  /**
   * プロジェクトのページ一覧を取得する
   * @param projectName プロジェクト名
   * @param params 取得パラメータ
   * @returns プロジェクトのページ一覧
   */
  private async getPages(
    projectName: string,
    params: { skip: number; limit: number }
  ): Promise<ProjectResponse> {
    const url = new URL(`${this.baseUrl}/pages/${projectName}`);
    url.searchParams.set('skip', params.skip.toString());
    url.searchParams.set('limit', params.limit.toString());

    if (!this.cookie) {
      throw new Error('Scrapboxの認証情報（cookie）が設定されていません。');
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Cookie: this.cookie,
    };

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          'Scrapboxの認証に失敗しました。cookieを確認してください。'
        );
      }
      if (response.status === 404) {
        throw new Error(`プロジェクト「${projectName}」が見つかりません。`);
      }
      throw new Error(`Failed to fetch pages: ${response.statusText}`);
    }

    return response.json();
  }
}
