// Typescriptのデータ型を定義

// Fileオブジェクトのデータ型を設定
export interface File extends Blob {
  readonly lastModified: number;
  readonly name: string;
}

/**
 * @1 authSlice.ts用のデータ型定義
 */
// 認証情報のデータ型を設定
export interface PROPS_AUTHEN {
  email: string;
  password: string;
}

// プロフィール情報のデータ型を設定
export interface PROPS_PROFILE {
  id: number;
  nickName: string;
  img: File | null; // 上で定義したFileオブジェクト型もしくはnull型
}

// ニックネームのデータ型を設定
export interface PROPS_NICKNAME {
  nickName: string;
}
/**
 * /@1
 */

/**
 * postSlice.ts
 */
export interface PROPS_NEWPOST {
  title: string;
  img: File | null;
}
// いいねデータの型
export interface PROPS_LIKED {
  id: number;
  title: string;
  current: number[]; // 現時点でいいねしたユーザIDの配列
  new: number; // 新規でいいねしたユーザのID数
}

export interface PROPS_COMMENT {
  text: string;
  post: number;
}

/**
 * Post.tsx
 */
export interface PROPS_POST {
  postId: number;
  loginId: number;
  userPost: number; // 投稿したユーザのID
  title: string;
  imageUrl: string;
  liked: number[];
}
