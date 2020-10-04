import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import axios from "axios";
import { PROPS_NEWPOST, PROPS_LIKED, PROPS_COMMENT } from "../types";

const apiUrlPost = `${process.env.REACT_APP_DEV_API_URL}api/post/`;
const apiUrlComment = `${process.env.REACT_APP_DEV_API_URL}api/comment/`;

/**
 * 投稿一覧取得の非同期関数
 */
export const fetchAsyncGetPosts = createAsyncThunk("post/get", async () => {
  const res = await axios.get(apiUrlPost, {
    headers: {
      Authorization: `JWT ${localStorage.localJWT}`,
    },
  });
  return res.data;
});

/**
 * 新規の投稿作成の非同期関数
 */
export const fetchAsyncNewPost = createAsyncThunk(
  "post/post",
  // 引数に新規投稿の値
  async (newPost: PROPS_NEWPOST) => {
    const uploadData = new FormData();
    uploadData.append("title", newPost.title);
    // 画像データがある場合のみuploadDataに投稿した画像を追加
    newPost.img && uploadData.append("img", newPost.img, newPost.img.name);
    // uploadDataをApiで送信
    const res = await axios.post(apiUrlPost, uploadData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

/**
 * 投稿に対するいいね作成の非同期関数
 */
export const fetchAsyncPatchLiked = createAsyncThunk(
  "post/patch",
  async (liked: PROPS_LIKED) => {
    const currentLiked = liked.current; // 現在のいいね数を定数に代入
    const uploadData = new FormData();

    let isOverlapped = false; // いいね機能の設定・解除を管理するstate
    // 現在のいいねのデータを1つずつ展開
    currentLiked.forEach((current) => {
      // いいねのデータに新しくいいねしたユーザのIDがあるかを確認
      if (current === liked.new) {
        isOverlapped = true;
      } else {
        // すでにいいねされている値を省いたデータをuploadDataに追加(いいねの解除と現在のいいね数の更新を実現)
        uploadData.append("liked", String(current));
      }
    });

    // isOverlappedがfalseの場合、uploadDataに新しいいいねのユーザIDを追加
    if (!isOverlapped) {
      uploadData.append("liked", String(liked.new));
      // currentLiked.lengthが1つしかない(いいねが1つしかない)場合は、空の配列に初期化する処理を実行
    } else if (currentLiked.length === 1) {
      // putメソッドではtitleが必須のため、非同期関数で受け取ったlikedのtitleをuploadDataに追加
      uploadData.append("title", liked.title);
      // patchメソッドでは値を初期化することが出来ないため、putメソッドを使っていいねの配列を初期化
      const res = await axios.put(`${apiUrlPost}${liked.id}/`, uploadData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      });
      return res.data;
    }
    // 現時点のいいねが2つ以上ある場合で、いいねを解除した時の非同期処理を設定
    const res = await axios.patch(`${apiUrlPost}${liked.id}/`, uploadData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

/**
 * コメントの一覧を取得する非同期関数
 */
export const fetchAsyncGetComments = createAsyncThunk(
  "comment/get",
  async () => {
    const res = await axios.get(apiUrlComment, {
      headers: {
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

/**
 * コメントの新規作成の非同期関数
 */
export const fetchAsyncPostComment = createAsyncThunk(
  "comment/post",
  async (comment: PROPS_COMMENT) => {
    const res = await axios.post(apiUrlComment, comment, {
      headers: {
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

/**
 * postSliceの作成
 *
 */
export const postSlice = createSlice({
  name: "post",
  initialState: {
    isLoadingPost: false,
    openNewPost: false, // 新規投稿用のボタンを押した際のモーダル表示設定
    // 投稿の一覧を格納
    posts: [
      {
        id: 0,
        title: "",
        userPost: 0,
        created_on: "",
        img: "",
        liked: [0],
      },
    ],
    // コメントの一覧を格納
    comments: [
      {
        id: 0,
        text: "",
        userComment: 0,
        post: 0,
      },
    ],
  },
  reducers: {
    // ローディングのstate変更
    fetchPostStart(state) {
      state.isLoadingPost = true;
    },
    fetchPostEnd(state) {
      state.isLoadingPost = false;
    },
    // 投稿用モーダルのstate変更
    setOpenNewPost(state) {
      state.openNewPost = true;
    },
    resetOpenNewPost(state) {
      state.openNewPost = false;
    },
  },
  extraReducers: (builder) => {
    // 投稿一覧の取得が正常に完了した際の処理
    builder.addCase(fetchAsyncGetPosts.fulfilled, (state, action) => {
      return {
        ...state,
        posts: action.payload,
      };
    });
    // 新規投稿が正常に完了した際の処理
    builder.addCase(fetchAsyncNewPost.fulfilled, (state, action) => {
      return {
        ...state,
        posts: [...state.posts, action.payload], // スプレッド関数でstateを展開して、最後の要素に新しい値を追加
      };
    });
    // コメントの一覧の取得が正常に完了した際の処理
    builder.addCase(fetchAsyncGetComments.fulfilled, (state, action) => {
      return {
        ...state,
        comments: action.payload,
      };
    });
    // 新規でコメント作成が正常に完了した際の処理
    builder.addCase(fetchAsyncPostComment.fulfilled, (state, action) => {
      return {
        ...state,
        comments: [...state.comments, action.payload],
      };
    });
    // いいねの更新が正常に完了した際の処理
    builder.addCase(fetchAsyncPatchLiked.fulfilled, (state, action) => {
      return {
        ...state,
        posts: state.posts.map((post) =>
          // 現在のpostsに更新した値のIDがある場合のみ新しい値に書き換え
          post.id === action.payload.id ? action.payload : post
        ),
      };
    });
  },
});

export const {
  fetchPostStart,
  fetchPostEnd,
  setOpenNewPost,
  resetOpenNewPost,
} = postSlice.actions;

export const selectIsLoadingPost = (state: RootState) =>
  state.post.isLoadingPost;
export const selectOpenNewPost = (state: RootState) => state.post.openNewPost;
export const selectPosts = (state: RootState) => state.post.posts;
export const selectComments = (state: RootState) => state.post.comments;

export default postSlice.reducer;
