import React, { useState } from "react";
import Modal from "react-modal";
import styles from "./Core.module.css";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import { File } from "../types";

import {
  editNickname,
  selectProfile,
  selectOpenProfile,
  resetOpenProfile,
  fetchCredStart,
  fetchCredEnd,
  fetchAsyncUpdateProf,
} from "../auth/authSlice";

import { Button, TextField, IconButton } from "@material-ui/core";
import { MdAddAPhoto } from "react-icons/md";

// モーダルのデザインを設定
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

const EditProfile: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const openProfile = useSelector(selectOpenProfile); // モーダルの表示非表示を制御
  const profile = useSelector(selectProfile); // ログインユーザの情報を取得
  const [image, setImage] = useState<File | null>(null); // ユーザが選択した画像をstateで管理する(File型もしくはnullで初期値はnullを設定)

  // Updateボタンを押下された際の処理
  const updateProfile = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const packet = { id: profile.id, nickName: profile.nickName, img: image };

    await dispatch(fetchCredStart());
    await dispatch(fetchAsyncUpdateProf(packet));
    await dispatch(fetchCredEnd());
    await dispatch(resetOpenProfile());
  };

  // 画像投稿の処理
  const handlerEditPicture = () => {
    // imageInputのidを持つinput属性を取得
    const fileInput = document.getElementById("imageInput");
    // 上記で取得したinput属性をクリック
    fileInput?.click();
  };

  return (
    <>
      <Modal
        isOpen={openProfile}
        onRequestClose={async () => {
          // モーダル以外をクリックした際にモーダルを閉じる処理
          await dispatch(resetOpenProfile());
        }}
        style={customStyles}
      >
        <form className={styles.core_signUp}>
          <h1 className={styles.core_title}>SNS clone</h1>

          <br />
          {/* nickNameの編集用のフィールド */}
          <TextField
            placeholder="nickname"
            type="text"
            value={profile?.nickName} // profile属性のnickNameを参照(現在のユーザのニックネームを参照)
            onChange={(e) => dispatch(editNickname(e.target.value))} // storeの仲野nickNameに変更を反映
          />

          <input
            type="file"
            id="imageInput"
            hidden={true} // 非表示を設定
            // イメージは1つだけ選んで格納出来るようにするため、配列の0を設定
            onChange={(e) => setImage(e.target.files![0])}
          />
          <br />
          <IconButton onClick={handlerEditPicture}>
            <MdAddAPhoto />
          </IconButton>
          <br />
          <Button
            disabled={!profile?.nickName} // nickNameが空の時はボタンをdisabled
            variant="contained"
            color="primary"
            type="submit"
            onClick={updateProfile} // 非同期のプロフィール更新処理を実行
          >
            Update
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default EditProfile;
