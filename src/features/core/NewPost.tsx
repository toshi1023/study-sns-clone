import React, { useState } from "react";
import Modal from "react-modal";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import styles from "./Core.module.css";

import { File } from "../types";

import {
  selectOpenNewPost,
  resetOpenNewPost,
  fetchPostStart,
  fetchPostEnd,
  fetchAsyncNewPost,
} from "../post/postSlice";

import { Button, TextField, IconButton } from "@material-ui/core";
import { MdAddAPhoto } from "react-icons/md";

const customStyles = {
  content: {
    top: "55%",
    left: "50%",

    width: 280,
    height: 220,
    padding: "50px",

    transform: "translate(-50%, -50%)",
  },
};

const NewPost: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const openNewPost = useSelector(selectOpenNewPost);

  const [image, setImage] = useState<File | null>(null); // 投稿のイメージをstate管理
  const [title, setTitle] = useState(""); // 投稿のイメージに対するタイトルをstate管理

  // イメージの設定用input属性を開く処理
  const handlerEditPicture = () => {
    const fileInput = document.getElementById("imageInput");
    fileInput?.click();
  };

  // Submitボタン押下後の実行関数
  const newPost = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    // ユーザの入力したタイトルと画像を定数に代入
    const packet = { title: title, img: image };
    await dispatch(fetchPostStart());
    await dispatch(fetchAsyncNewPost(packet)); // 新規投稿用の非同期処理
    await dispatch(fetchPostEnd());
    // stateを初期化
    setTitle("");
    setImage(null);
    // 新規投稿用のモーダルをクローズ
    dispatch(resetOpenNewPost());
  };

  return (
    <>
      <Modal
        isOpen={openNewPost}
        onRequestClose={async () => {
          await dispatch(resetOpenNewPost());
        }}
        style={customStyles}
      >
        <form className={styles.core_signUp}>
          <h1 className={styles.core_title}>SNS clone</h1>

          <br />
          <TextField
            placeholder="Please enter caption"
            type="text"
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="file"
            id="imageInput"
            hidden={true}
            onChange={(e) => setImage(e.target.files![0])}
          />
          <br />
          <IconButton onClick={handlerEditPicture}>
            <MdAddAPhoto />
          </IconButton>
          <br />
          <Button
            disabled={!title || !image}
            variant="contained"
            color="primary"
            onClick={newPost}
          >
            New post
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default NewPost;
