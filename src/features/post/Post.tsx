import React, { useState } from "react";
import styles from "./Post.module.css";

import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Divider, Checkbox } from "@material-ui/core";
import { Favorite, FavoriteBorder } from "@material-ui/icons";

// いいね直下のアバターをグループ化して表示する機能
import AvatarGroup from "@material-ui/lab/AvatarGroup";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import { selectProfiles } from "../auth/authSlice";

import {
  selectComments,
  fetchPostStart,
  fetchPostEnd,
  fetchAsyncPostComment,
  fetchAsyncPatchLiked,
} from "./postSlice";

import { PROPS_POST } from "../types";

const useStyles = makeStyles((theme) => ({
  // アバターのサイズを縮小化するデザイン
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));

// React.FC<ジェネリクス> : ジェネリクスのところに型を入れることでpropsの型を設定することが出来る
const Post: React.FC<PROPS_POST> = ({
  postId,
  loginId,
  userPost,
  title,
  imageUrl,
  liked,
}) => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const profiles = useSelector(selectProfiles);
  const comments = useSelector(selectComments);
  const [text, setText] = useState(""); // コメント欄で入力したコメントの内容をstateで管理

  // reduxから得た全コメントを条件に沿ってフィルターをかける(条件：propsで渡されたpostId)
  // →コメントしたい投稿を抽出
  const commentsOnPost = comments.filter((com) => {
    return com.post === postId;
  });

  // 投稿したユーザプロフィールを抽出
  const prof = profiles.filter((prof) => {
    return prof.userProfile === userPost;
  });

  // コメント欄のpostボタンがクリックされたときに実行する関数(e: イベントオブジェクト)
  const postComment = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    // 定数packetにユーザが入力したコメントと対象の投稿を格納
    // text: stateの値, postId: propsで渡された投稿のID
    const packet = { text: text, post: postId };
    await dispatch(fetchPostStart());
    await dispatch(fetchAsyncPostComment(packet)); // コメントの投稿処理
    await dispatch(fetchPostEnd());
    setText(""); // 投稿後にstateで管理しているコメントを初期化
  };

  // いいねボタンをクリックしたときの処理
  const handlerLiked = async () => {
    const packet = {
      id: postId, // propsで受け取ったpostId
      title: title, // propsで受け取ったtitle
      current: liked, // propsで受け取ったliked
      new: loginId, // propsで受け取ったloginId(いいねボタンを新しく押したログインユーザのID)
    };
    await dispatch(fetchPostStart());
    await dispatch(fetchAsyncPatchLiked(packet)); // いいねの投稿処理
    await dispatch(fetchPostEnd());
  };

  if (title) {
    return (
      <div className={styles.post}>
        {/* 
            上部バーのデザイン 
        */}
        <div className={styles.post_header}>
          {/* 投稿したユーザのアバターとニックネームが表示される */}
          <Avatar className={styles.post_avatar} src={prof[0]?.img} />
          <h3>{prof[0]?.nickName}</h3>
        </div>
        {/* 実際に投稿されたイメージ(imageUrl: propsで受け取ったimageUrl) */}
        <img className={styles.post_image} src={imageUrl} alt="" />

        {/* 
            いいね欄のデザイン 
        */}
        <h4 className={styles.post_text}>
          {/* いいねのチェックボックス */}
          <Checkbox
            className={styles.post_checkBox}
            icon={<FavoriteBorder />}
            checkedIcon={<Favorite />}
            // liked: 投稿に対していいねしたユーザIDの配列が入っている
            // ログインしているユーザのIDと一致したときにtrueを返す
            checked={liked.some((like) => like === loginId)}
            onChange={handlerLiked}
          />
          <strong> {prof[0]?.nickName}</strong> {title}
          <AvatarGroup max={7}>
            {/* likedに入っているユーザIDのアバターを表示 */}
            {liked.map((like) => (
              <Avatar
                className={styles.post_avatarGroup}
                key={like} // likedのユーザIDをキーに設定
                // profilesを展開して、likedに一致するユーザIDのプロフィールから画像を取得
                src={profiles.find((prof) => prof.userProfile === like)?.img}
              />
            ))}
          </AvatarGroup>
        </h4>

        {/* 
            コメント欄のデザイン 
        */}
        <Divider />
        <div className={styles.post_comments}>
          {/* commentsOnPost: 1つの投稿に対する全コメントを格納 */}
          {commentsOnPost.map((comment) => (
            <div key={comment.id} className={styles.post_comment}>
              <Avatar
                src={
                  // コメントしたユーザのイメージを取得
                  profiles.find(
                    // userComment: コメントしたユーザID
                    (prof) => prof.userProfile === comment.userComment
                  )?.img
                }
                className={classes.small}
              />
              <p>
                <strong className={styles.post_strong}>
                  {
                    // コメントしたユーザのニックネームを取得
                    profiles.find(
                      (prof) => prof.userProfile === comment.userComment
                    )?.nickName
                  }
                </strong>
                {comment.text}
              </p>
            </div>
          ))}
        </div>

        {/* 
            コメントの投稿フォームのデザイン 
        */}
        <form className={styles.post_commentBox}>
          <input
            className={styles.post_input}
            type="text"
            placeholder="add a comment"
            value={text}
            onChange={(e) => setText(e.target.value)} // ユーザの入力した内容をtextのstateに反映
          />
          <button
            disabled={!text.length} // 入力がない場合はボタンを押せないように設定
            className={styles.post_button}
            type="submit"
            onClick={postComment}
          >
            Post
          </button>
        </form>
      </div>
    );
  }
  return null;
};

export default Post;
