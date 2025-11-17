// apps/circle/utils/lexRank.ts

/**
 * 辞書順 (lexicographical) ランキング値を表現し、操作するためのクラス。
 * 値は `bucket` (0, 1, または 2) と英数字の `value` で構成され、`bucket|value` の形式で表される。
 * 主にリスト内のアイテムの順序を管理するために使用される。
 */
export default class LexRank {
  /**
   * 新しい `LexRank` インスタンスを生成する。
   * @param value ランキング値。英数字で構成され、末尾は数字以外である必要がある。`LexRank.isValidLexValue` で検証される。
   * @param bucket ランキングバケット。'0', '1', '2' のいずれか。デフォルトは '0'。`LexRank.isValidLexBucket` で検証される。
   * @throws {Error} `value` または `bucket` が無効な場合にエラーをスローする。
   */
  constructor(
    public readonly value: string,
    public readonly bucket = '0'
  ) {
    if (!LexRank.isValidLexValue(value)) {
      throw new Error(`Invalid lex value "${value}"`);
    }
    if (!LexRank.isValidLexBucket(bucket)) {
      throw new Error(`Invalid lex bucket "${bucket}"`);
    }
  }

  /**
   * `LexRank` インスタンスまたは lex 文字列から新しい `LexRank` インスタンスを生成するファクトリメソッド。
   * @param lex - `LexRank` インスタンスまたは `bucket|value` 形式の lex 文字列。
   * @returns 新しい `LexRank` インスタンス。
   * @throws {Error} `lex` 文字列が無効な場合にエラーをスローする。
   */
  static from(lex: LexRankInput): LexRank {
    if (lex instanceof LexRank) {
      // すでに LexRank インスタンスの場合はそのまま返す（コピーが必要なら new LexRank(lex.value, lex.bucket)）
      return lex;
    }
    if (typeof lex === 'string') {
      const parsed = LexRank.parse(lex);
      return new LexRank(parsed.value, parsed.bucket);
    }
    // ここに来ることは型定義上ないはずだが、念のためエラー処理
    throw new Error('Invalid input type for LexRank.from');
  }

  /**
   * lex 文字列 (`bucket|value`) をパースして `bucket` と `value` を抽出する。
   * @param lex - パースする lex 文字列。
   * @returns パースされた `value` と `bucket` を含むオブジェクト。
   * @throws {Error} `lex` 文字列が無効な形式の場合にエラーをスローする。
   * @private
   */
  private static parse(lex: string): { value: string; bucket: string } {
    const regex = /^(?<bucket>[0-2])\|(?<value>[0-9a-z]*[1-9a-z])$/;
    const match = regex.exec(lex);
    if (!match?.groups?.value || !match?.groups?.bucket) {
      throw new Error(`Invalid lex string format: "${lex}"`);
    }
    return { value: match.groups.value, bucket: match.groups.bucket };
  }

  /**
   * `LexRank` インスタンスを `bucket|value` 形式の文字列に変換する。
   * @returns lex 文字列。
   */
  toString(): string {
    return `${this.bucket}|${this.value}`;
  }

  /**
   * 指定されたバケットの次のバケットを返す (0 -> 1, 1 -> 2, 2 -> 0)。
   * @param bucket - 現在のバケット ('0', '1', '2')。
   * @returns 次のバケット。
   * @throws {Error} `bucket` が無効な場合にエラーをスローする。
   */
  static nextBucket(bucket: string): string {
    if (!LexRank.isValidLexBucket(bucket)) {
      throw new Error(`Invalid lex bucket "${bucket}"`);
    }

    if (bucket === '2') return '0';
    return String.fromCharCode(bucket.charCodeAt(0) + 1);
  }

  /**
   * 指定されたバケットの前のバケットを返す (0 -> 2, 1 -> 0, 2 -> 1)。
   * @param bucket - 現在のバケット ('0', '1', '2')。
   * @returns 前のバケット。
   * @throws {Error} `bucket` が無効な場合にエラーをスローする。
   */
  static prevBucket(bucket: string): string {
    if (!LexRank.isValidLexBucket(bucket)) {
      throw new Error(`Invalid lex bucket "${bucket}"`);
    }

    if (bucket === '0') return '2';
    return String.fromCharCode(bucket.charCodeAt(0) - 1);
  }

  /**
   * lex 値が有効な形式（英数字で末尾が数字以外）か検証する。
   * @param value - 検証する値。
   * @returns 値が有効な場合は `true`、そうでない場合は `false`。
   * @private
   */
  private static isValidLexValue(value: string): boolean {
    // 空文字列も許可しない
    if (!value) return false;
    const regex = /^[0-9a-z]*[1-9a-z]$/;
    return regex.test(value);
  }

  /**
   * lex バケットが有効な形式（'0', '1', '2'）か検証する。
   * @param bucket - 検証するバケット。
   * @returns バケットが有効な場合は `true`、そうでない場合は `false`。
   * @private
   */
  private static isValidLexBucket(bucket: string): boolean {
    const regex = /^[0-2]$/;
    return regex.test(bucket);
  }

  /**
   * 現在の `LexRank` が指定された `lex` 値より辞書順で小さいかどうかを比較する。
   * @param lex - 比較対象の `LexRank` インスタンスまたは lex 文字列。
   * @returns 現在の `LexRank` が `lex` より小さい場合は `true`、そうでない場合は `false`。
   */
  lessThan(lex: LexRankInput): boolean {
    const other = LexRank.from(lex);
    // バケットが異なる場合は比較できない（エラーにするか、仕様に応じて挙動を決める）
    // ここでは false を返すことにする（あるいはエラーを throw する）
    if (this.bucket !== other.bucket) {
      // throw new Error(`Cannot compare LexRanks with different buckets: ${this.bucket} and ${other.bucket}`);
      console.warn(
        `Comparing LexRanks with different buckets: ${this.toString()} and ${other.toString()}`
      );
      return false; // または適切な比較ロジック
    }

    const len = Math.max(this.value.length, other.value.length);

    for (let idx = 0; idx < len; idx++) {
      const charA = this.value[idx];
      const charB = other.value[idx];

      // B が短い場合 (A='a1', B='a') -> A は B より大きく、A < B は false
      if (!charB) return false;
      // A が短い場合 (A='a', B='a1') -> A は B より小さく、A < B は true
      if (!charA) return true;

      if (charA < charB) return true;
      if (charA > charB) return false;
    }
    // 全く同じ文字列の場合 (A='a', B='a') -> A < B は false
    return false;
  }

  /**
   * 現在の `LexRank` の `value` をインクリメントした新しい `LexRank` インスタンスを返す。
   * @returns インクリメントされた新しい `LexRank` インスタンス。
   * @throws {Error} インクリメントできない場合（非常に稀なケースだが）。
   */
  increment(): LexRank {
    for (let idx = this.value.length - 1; idx >= 0; idx--) {
      const char = this.value[idx];
      // char が undefined になる可能性はループ条件により排除されるはずだが、型アサーションで明示
      const incrementedChar = LexRank.incrementChar(char as string);
      // incrementChar が null を返すのは 'z' の場合のみ
      if (incrementedChar !== null) {
        const incrementResult = this.value.slice(0, idx) + incrementedChar;
        return new LexRank(incrementResult, this.bucket);
      }
      // char が 'z' だった場合、ループを継続して前の桁へ
    }

    // 全ての文字が 'z' だった場合（または value が空の場合）、末尾に '1' を追加
    // ※ isValidLexValue で空文字列は弾かれるため、通常ここには来ないはずだが念のため
    // ※ LexRank の仕様上、'z'だけで構成されるvalueは存在しないはず ('z'の次がないため)
    //    しかし、ロジックとしては末尾に'1'を追加する。
    const newVal = `${this.value}1`;
    // 新しい値が有効かチェック (理論上不要だが念のため)
    if (!LexRank.isValidLexValue(newVal)) {
      throw new Error(
        `Failed to increment value "${this.value}" to a valid state.`
      );
    }
    return new LexRank(newVal, this.bucket);
  }

  /**
   * 現在の `LexRank` の `value` をデクリメントした新しい `LexRank` インスタンスを返す。
   * @returns デクリメントされた新しい `LexRank` インスタンス。
   * @throws {Error} デクリメントできない場合（例: "1" をデクリメントしようとした場合）。
   */
  decrement(): LexRank {
    const length = this.value.length;
    if (length === 0) {
      // isValidLexValue で弾かれるはずだが念のため
      throw new Error('Cannot decrement an empty value.');
    }
    const lastChar = this.value[length - 1];
    // lastChar が undefined になる可能性は length チェックにより排除されるはずだが、型アサーションで明示
    const decrementedChar = LexRank.decrementChar(lastChar as string);

    if (decrementedChar !== null) {
      // 末尾文字をデクリメントできれば、それで完了
      const decrementResult = this.value.slice(0, length - 1) + decrementedChar;
      return new LexRank(decrementResult, this.bucket);
    }

    // 末尾文字が '1' または '0' でデクリメントできなかった場合
    if (lastChar === '1') {
      // '1'で終わる場合
      const prefix = this.value.slice(0, length - 1);
      // "0" や "00" のようなプレフィックスでないことを確認
      if (prefix.length > 0 && !/^[0]+$/.test(prefix)) {
        // "a1" -> "a", "b91" -> "b9"
        // cleanTrailingZeros は 'a0' のような末尾の'0'を考慮するが、
        // '1'で終わる場合、基本的には不要のはず。prefix をそのまま使う。
        // ただし、元の cleanTrailingZeros のロジックを尊重する場合は以下を使用
        const cleanedPrefix = LexRank.cleanTrailingZeros(prefix);
        if (cleanedPrefix === null) {
          // cleanTrailingZeros が失敗するケース (例: prefix が "00")
          throw new Error(
            `Failed to clean prefix "${prefix}" during decrement.`
          );
        }
        return new LexRank(cleanedPrefix, this.bucket);
      }
      // 上記 if の条件を満たさなかった場合 (prefix が空か "0...0") (else を削除)
      // "1" -> "01", "01" -> "001", "001" -> "0001"
      const newVal = `0${this.value}`;
      // 有効性チェックは不要（'0'を前置しても形式は保たれる）
      return new LexRank(newVal, this.bucket);
    }

    // lastChar が '1' でなかった場合 (すなわち '0') (else を削除)
    // isValidLexValue により、'0' で終わる value は基本的に存在しないはず。
    // もし存在した場合、decrementChar('0') は null を返す。
    // このケースの処理をどうするかは仕様による。ここではエラーとする。
    throw new Error(`Cannot decrement value ending in '0': "${this.value}"`);
  }

  /**
   * 文字列の末尾にある連続した '0' を削除し、有効な value 部分を返す。
   * 注意: このメソッドは `decrement` 内で使用されるが、`isValidLexValue` の制約により
   * 末尾が '0' の value は通常生成されないため、ユースケースが限定的かもしれない。
   * @param str - 処理対象の文字列。
   * @returns 末尾の '0' が削除された有効な value 文字列。有効な部分がない場合は `null` を返す。
   * @private
   */
  private static cleanTrailingZeros(str: string): string | null {
    if (!str) return null; // 空文字列の場合
    const regex = /^(?<value>[0-9a-z]*[1-9a-z])?0*$/; // ? を追加して、全体が0の場合も考慮
    const match = regex.exec(str);
    // '000' のような場合、match.groups.value は undefined になる
    if (!match?.groups?.value) {
      // 元の文字列が '0' だけで構成されていた場合、何を返すべきか？
      // LexRank の仕様上、これは不正な状態に近い。null を返すか、エラーにするか。
      // '0' は有効なvalueではないため null を返すのが妥当か。
      return null;
    }
    return match.groups.value;
  }

  /**
   * 指定された文字列を現在の `value` の末尾に追加した新しい `LexRank` インスタンスを返す。
   * 追加後の値が `isValidLexValue` に違反する場合はエラーをスローする可能性がある。
   * @param str - 追加する文字列。
   * @returns 新しい `LexRank` インスタンス。
   * @throws {Error} 追加後の値が無効な場合にエラーをスローする。
   * @private
   */
  private append(str: string): LexRank {
    const newVal = `${this.value}${str}`;
    // append後の値の有効性チェック
    if (!LexRank.isValidLexValue(newVal)) {
      throw new Error(
        `Appending "${str}" to "${this.value}" results in an invalid value: "${newVal}"`
      );
    }
    return new LexRank(newVal, this.bucket);
  }

  /**
   * 1文字をインクリメントする ('0'...'9', 'a'...'z')。
   * '9' の次は 'a' になる。'z' はインクリメントできない（`null` を返す）。
   * @param char - インクリメントする文字。
   * @returns インクリメントされた文字、またはインクリメントできない場合は `null`。
   * @private
   */
  private static incrementChar(char: string): string | null {
    if (char === 'z') return null; // 'z' はインクリメント不可
    if (char === '9') return 'a';
    // '0'-'8', 'a'-'y' の場合
    if ((char >= '0' && char < '9') || (char >= 'a' && char < 'z')) {
      return String.fromCharCode(char.charCodeAt(0) + 1);
    }
    // 上記以外（不正な文字）の場合も null を返す
    return null;
  }

  /**
   * 1文字をデクリメントする ('0'...'9', 'a'...'z')。
   * 'a' の次は '9' になる。'0', '1' はデクリメントできない（`null` を返す）。
   * @param char - デクリメントする文字。
   * @returns デクリメントされた文字、またはデクリメントできない場合は `null`。
   * @private
   */
  private static decrementChar(char: string): string | null {
    if (char === '0' || char === '1') return null; // '0', '1' はデクリメント不可
    if (char === 'a') return '9';
    // '2'-'9', 'b'-'z' の場合
    if ((char > '1' && char <= '9') || (char > 'a' && char <= 'z')) {
      return String.fromCharCode(char.charCodeAt(0) - 1);
    }
    // 上記以外（不正な文字）の場合も null を返す
    return null;
  }

  /**
   * 2つの lex 値 (`before` と `after`) の間に入る新しい lex 値を計算する。
   * `before` または `after` のいずれか一方は `null` または `undefined` である可能性がある。
   * 主に、順序付けられたリストに新しいアイテムを挿入する際の位置を決定するために使用される。
   *
   * @param beforeInput - 前の lex 値 (nullish 可)。
   * @param afterInput - 後の lex 値 (nullish 可)。
   * @returns `before` と `after` の間に入る新しい `LexRank` インスタンス。
   * @throws {Error} 引数が両方 nullish の場合、バケットが異なる場合、または `before` >= `after` の場合にエラーをスローする。
   */
  static between(
    beforeInput: LexRankInput | null | undefined,
    afterInput: LexRankInput | null | undefined
  ): LexRank {
    if (beforeInput == null && afterInput == null) {
      // next/prev が定義されていないので、中央値 '0|h' などを返すか、エラーにする。ここではエラー。
      throw new Error('Cannot generate rank between two null values.');
    }

    // after がない場合: before をインクリメント
    if (afterInput == null) {
      if (beforeInput == null)
        throw new Error('Cannot generate rank between two null values.'); // 到達不能なはず
      const before = LexRank.from(beforeInput);
      return before.increment();
    }

    // before がない場合: after をデクリメント
    if (beforeInput == null) {
      const after = LexRank.from(afterInput);
      return after.decrement();
    }

    // before と after の両方がある場合
    const before = LexRank.from(beforeInput);
    const after = LexRank.from(afterInput);

    if (before.bucket !== after.bucket) {
      throw new Error(
        `LexRank buckets must be the same for 'between': ${before.bucket} vs ${after.bucket}`
      );
    }

    // before >= after の場合、間に入れる値は存在しない
    if (!before.lessThan(after)) {
      throw new Error(
        `'before' value (${before.toString()}) must be strictly less than 'after' value (${after.toString()})`
      );
    }

    // 1. before をインクリメントしてみる
    //    increment は Error を throw する可能性があるので try-catch も検討できるが、
    //    before < after が保証されていれば、通常は成功するはず。
    try {
      const incrementedBefore = before.increment();
      if (incrementedBefore.lessThan(after)) {
        return incrementedBefore;
      }
    } catch (e) {
      // increment が失敗するケース (例: 'z' の連続) は稀だが、ログを残すなど検討
      console.error(
        `Incrementing ${before.toString()} failed unexpectedly in 'between'`,
        e
      );
      // この場合、後続の append ロジックに進む
    }

    // 2. before の末尾に '1' を追加してみる
    //    append は Error を throw する可能性がある
    try {
      const plus1 = before.append('1');
      if (plus1.lessThan(after)) {
        return plus1;
      }
    } catch (e) {
      // append が失敗するケース（例: value が長すぎるなど、現状の実装では考えにくい）
      console.error(
        `Appending '1' to ${before.toString()} failed unexpectedly in 'between'`,
        e
      );
      // エラーを再スローするか、代替手段を試みるか。ここでは再スロー。
      throw new Error(
        `Failed to append '1' during 'between' calculation: ${e instanceof Error ? e.message : e}`
      );
    }

    // 3. before の末尾に "0", "00", ... , "0...01" を追加していく
    let prefixZeros = '0';
    while (true) {
      try {
        const plus01 = before.append(`${prefixZeros}1`);
        if (plus01.lessThan(after)) {
          return plus01;
        }
        // 限界までゼロを追加しても after より小さくならない場合、
        // 桁数を増やす (理論上無限に続けられるが、実用上は限界がある)
        if (prefixZeros.length > 10) {
          // 適当なループ上限
          throw new Error(
            `Could not find a rank between ${before.toString()} and ${after.toString()} within reasonable limits.`
          );
        }
        prefixZeros += '0';
      } catch (e) {
        console.error(
          `Appending '${prefixZeros}1' to ${before.toString()} failed unexpectedly in 'between'`,
          e
        );
        throw new Error(
          `Failed to append '${prefixZeros}1' during 'between' calculation: ${e instanceof Error ? e.message : e}`
        );
      }
    }
  }
}

/**
 * `LexRank.from` や `LexRank.between` の入力として受け付け可能な型。
 * `LexRank` インスタンスまたは `bucket|value` 形式の文字列。
 */
export type LexRankInput = LexRank | string;
