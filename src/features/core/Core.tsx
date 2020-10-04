import React, { useEffect } from "react";
import Auth from "../auth/Auth";

import styles from "./Core.module.css";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import { withStyles } from "@material-ui/core/styles";
import {
  Button,
  Grid,
  Avatar,
  Badge,
  CircularProgress,
} from "@material-ui/core";

import { MdAddAPhoto } from "react-icons/md"; // カメラマークのアイコン

import {
  editNickname,
  selectProfile,
  selectIsLoadingAuth,
  setOpenSignIn,
  resetOpenSignIn,
  setOpenSignUp,
  resetOpenSignUp,
  setOpenProfile,
  resetOpenProfile,
  fetchAsyncGetMyProf,
  fetchAsyncGetProfs,
} from "../auth/authSlice";

import {
  selectPosts,
  selectIsLoadingPost,
  setOpenNewPost,
  resetOpenNewPost,
  fetchAsyncGetPosts,
  fetchAsyncGetComments,
} from "../post/postSlice";

import Post from "../post/Post";
import EditProfile from "./EditProfile";
import NewPost from "./NewPost";

/**
 * ログインユーザのバッヂアイコン(material-ui転載)
 */
const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "$ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}))(Badge);

const Core: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const posts = useSelector(selectPosts);
  const isLoadingPost = useSelector(selectIsLoadingPost);
  const isLoadingAuth = useSelector(selectIsLoadingAuth);

  // ブラウザが起動した際に最初に処理される
  useEffect(() => {
    const fetchBootLoader = async () => {
      // ログインが出来ている場合
      if (localStorage.localJWT) {
        // デフォルトで立ち上がるログインモーダルをクローズ
        dispatch(resetOpenSignIn());
        // ログインしているユーザのプロフィール情報を取得
        const result = await dispatch(fetchAsyncGetMyProf());
        // JWTのTokenの有効期限が切れている場合(fetchAsyncGetMyProfの処理が失敗した場合)
        if (fetchAsyncGetMyProf.rejected.match(result)) {
          // ログインモーダルを表示
          dispatch(setOpenSignIn());
          return null;
        }
        await dispatch(fetchAsyncGetPosts());
        await dispatch(fetchAsyncGetProfs());
        await dispatch(fetchAsyncGetComments());
      }
    };
    // fetchBootLoader関数を実行
    fetchBootLoader();
  }, [dispatch]);

  return (
    <div>
      <Auth />
      <EditProfile />
      <NewPost />
      {/* 
          上部バーのデザイン
      */}
      <div className={styles.core_header}>
        <h1 className={styles.core_title}>SNS clone</h1>
        {profile?.nickName ? (
          // ②myprofileのニックネームが存在するとき(※①profile?.nickName → profileが存在するときにnickNameの有無を確認)
          <>
            <button
              className={styles.core_btnModal}
              onClick={() => {
                // 新規投稿用のモーダルをオープン
                dispatch(setOpenNewPost());
                dispatch(resetOpenProfile());
              }}
            >
              <MdAddAPhoto />
            </button>
            <div className={styles.core_logout}>
              {/* Loading中の設定 */}
              {(isLoadingPost || isLoadingAuth) && <CircularProgress />}
              <Button
                onClick={() => {
                  // localStorageのJWT Tokenを削除(ログアウト処理)
                  localStorage.removeItem("localJWT");
                  // ログインユーザのnickNameを空にする
                  dispatch(editNickname(""));
                  dispatch(resetOpenProfile()); // Profileの作成・編集モーダルを閉じる
                  dispatch(resetOpenNewPost()); // 投稿用の作成・編集モーダルを閉じる
                  dispatch(setOpenSignIn()); // ログイン用のモーダルを表示
                }}
              >
                Logout
              </Button>
              <button
                className={styles.core_btnModal}
                onClick={() => {
                  // Profile編集用のモーダルをオープン
                  dispatch(setOpenProfile());
                  // 投稿用のモーダルをクローズ
                  dispatch(resetOpenNewPost());
                }}
              >
                {/* ログインユーザのバッヂアイコン */}
                <StyledBadge
                  overlap="circle"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  variant="dot"
                >
                  <Avatar alt="who?" src={profile.img} />{" "}
                </StyledBadge>
              </button>
            </div>
          </>
        ) : (
          // myprofileのニックネームが存在しないとき
          <div>
            <Button
              onClick={() => {
                // ログイン用のモーダルをオープン
                dispatch(setOpenSignIn());
                // サインアップ用のモーダルをクローズ
                dispatch(resetOpenSignUp());
              }}
            >
              LogIn
            </Button>
            <Button
              onClick={() => {
                // サインアップ用のモーダルをオープン
                dispatch(setOpenSignUp());
                // ログイン用のモーダルをクローズ
                dispatch(resetOpenSignIn());
              }}
            >
              SignUp
            </Button>
          </div>
        )}
      </div>

      {profile?.nickName && (
        // myprofileのニックネームが存在するときのみ
        <>
          {/* 
              投稿一覧を表示 
          */}
          <div className={styles.core_posts}>
            <Grid container spacing={4}>
              {posts // posts: 投稿一覧のデータ
                .slice(0)
                .reverse() // 一番最後に表示したものを一番はじめに持ってくる
                .map((post) => (
                  <Grid key={post.id} item xs={12} md={4}>
                    <Post
                      // 以下、types.tsで指定したPROPS_POSTの型に合うようにしなければならない
                      postId={post.id}
                      title={post.title}
                      loginId={profile.userProfile}
                      userPost={post.userPost}
                      imageUrl={post.img}
                      liked={post.liked}
                    />
                  </Grid>
                ))}
            </Grid>
          </div>
        </>
      )}
    </div>
  );
};

export default Core;
