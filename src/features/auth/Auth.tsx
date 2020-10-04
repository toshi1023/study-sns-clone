import React from "react";
import { AppDispatch } from "../../app/store";
import { useSelector, useDispatch } from "react-redux";
import styles from "./Auth.module.css";
import Modal from "react-modal";
import { Formik } from "formik"; // 入力フォームのバリデーション設定に利用
import * as Yup from "yup"; // 入力フォームのバリデーション設定に利用
import { TextField, Button, CircularProgress } from "@material-ui/core";

import { fetchAsyncGetPosts, fetchAsyncGetComments } from "../post/postSlice";

import {
  // useSelectorで使用するstate
  selectIsLoadingAuth,
  selectOpenSignIn,
  selectOpenSignUp,
  // useDispatchで使用するaction(reducer)
  setOpenSignIn,
  resetOpenSignIn,
  setOpenSignUp,
  resetOpenSignUp,
  // 非同期関数
  fetchCredStart,
  fetchCredEnd,
  fetchAsyncLogin,
  fetchAsyncRegister,
  fetchAsyncGetMyProf,
  fetchAsyncGetProfs,
  fetchAsyncCreateProf,
} from "./authSlice";

/**
 * モーダルのデザインを設定
 */
const customStyles = {
  // モーダル以外の背景色を設定
  overlay: {
    backgroundColor: "#777777",
  },
  // モーダルの設定
  content: {
    // モーダルの左上の端の配置設定
    top: "55%",
    left: "50%",

    // モーダルの大きさ設定
    width: 280,
    height: 350,
    padding: "50px",

    // モーダルの配置を正確に真ん中に表示するための調整を設定
    transform: "translate(-50%, -50%)",
  },
};

// TypeScriptの場合はfunctionalコンポーネントにReact.FCという型をつける必要がある
const Auth: React.FC = () => {
  // モーダルの利用(#root: index.tsxで設定されているDOMのid)
  Modal.setAppElement("#root");
  // Reduxのstoreの中のstateを取得
  const openSignIn = useSelector(selectOpenSignIn);
  const openSignUp = useSelector(selectOpenSignUp);
  const isLoadingAuth = useSelector(selectIsLoadingAuth);
  // AppDispatch: store.tsでエクスポートしたdispatch型
  const dispatch: AppDispatch = useDispatch();

  return (
    <>
      {/* 
          サインアップ用のモーダルを設定
       */}
      <Modal
        isOpen={openSignUp} // isOpen: 表示非表示の制御
        // モーダル以外の場所をクリックしたときにモーダルをクローズする
        onRequestClose={async () => {
          // openSignUpの値をfalseに変更
          await dispatch(resetOpenSignUp());
        }}
        style={customStyles}
      >
        <Formik
          // initialErrors: 初期状態のエラーのstateを設定
          initialErrors={{ email: "required" }}
          // 入力フォームで制御するvalueを設定(validation対象のvalueを設定)
          initialValues={{ email: "", password: "" }}
          // onSubmit: submitボタンが押された際の処理を記述
          onSubmit={async (values) => {
            // fetchCredStart: Loading処理のstateをtrueにする
            await dispatch(fetchCredStart());
            // User新規作成用の非同期関数を実行
            const resultReg = await dispatch(fetchAsyncRegister(values));

            // 新規ユーザの作成が無事に完了した場合(resultRegの結果とfetchAsyncRegisterのfulfilledがマッチした場合)
            if (fetchAsyncRegister.fulfilled.match(resultReg)) {
              // 作成したユーザでログインを実行
              await dispatch(fetchAsyncLogin(values));
              // nickNameをデフォルトの'anonymous'という値でプロフィールを作成
              await dispatch(fetchAsyncCreateProf({ nickName: "anonymous" }));

              // プロフィール一覧データを取得
              await dispatch(fetchAsyncGetProfs());
              await dispatch(fetchAsyncGetPosts());
              await dispatch(fetchAsyncGetComments());
              // ログインしているユーザのプロフィール情報を取得
              await dispatch(fetchAsyncGetMyProf());
            }
            // fetchCredEnd: Loading処理のstateをfalseにする
            await dispatch(fetchCredEnd());
            // サインアップモーダルを閉じる
            await dispatch(resetOpenSignUp());
          }}
          // validationの設定
          validationSchema={Yup.object().shape({
            // 書き方例)
            // バリデーションしたいカラム: Yup.string().バリデーション内容1('メッセージ1').バリデーション内容2('メッセージ2')
            email: Yup.string()
              .email("email format is wrong")
              .required("email is must"),
            password: Yup.string().required("password is must").min(4),
          })}
        >
          {/* 
              実際のフォーム内容(アロー関数で設定) 
          */}
          {({
            // Formikで用意されている関数やプロパティ
            handleSubmit,
            handleChange,
            handleBlur,
            values, // ユーザが入力している値を取得するオブジェクト
            errors, // バリデーション結果のエラーメッセージを取得するオブジェクト
            touched, // 入力フォームに1度でもフォーカスが当たった場合にtrueを返すオブジェクト
            isValid, // バリデーション結果が問題なかった場合にtrueを返すオブジェクト
          }) => (
            <div>
              <form onSubmit={handleSubmit}>
                <div className={styles.auth_signUp}>
                  <h1 className={styles.auth_title}>SNS clone</h1>
                  <br />
                  <div className={styles.auth_progress}>
                    {/* 
                        CircularProgress: ロード中のアイコン
                        ※isLoadingAuthがtrueの場合に表示される
                    */}
                    {isLoadingAuth && <CircularProgress />}
                  </div>
                  <br />

                  <TextField
                    placeholder="email"
                    type="input"
                    name="email"
                    onChange={handleChange} // ユーザが入力する度にFormikのバリデーションを実行
                    onBlur={handleBlur} // 入力フォームからフォーカスが外れた時にFormikのバリデーションを実行
                    value={values.email}
                  />
                  <br />
                  {/*
                      エラーメッセージを表示させる処理
                   */}
                  {touched.email && errors.email ? (
                    <div className={styles.auth_error}>{errors.email}</div>
                  ) : null}

                  <TextField
                    placeholder="password"
                    type="password"
                    name="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  {touched.password && errors.password ? (
                    <div className={styles.auth_error}>{errors.password}</div>
                  ) : null}
                  <br />
                  <br />

                  {/* 
                      Submit用のボタン設定 
                  */}
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!isValid} // バリデーションの結果が引っかかった場合にtrue
                    type="submit"
                  >
                    Register
                  </Button>
                  <br />
                  <br />
                  {/* 
                      ログインページへのリンク
                   */}
                  <span
                    className={styles.auth_text}
                    onClick={async () => {
                      // ログイン用のモーダルをオープン
                      await dispatch(setOpenSignIn());
                      // サインアップ用のモーダルをクローズ
                      await dispatch(resetOpenSignUp());
                    }}
                  >
                    You already have a account ?
                  </span>
                </div>
              </form>
            </div>
          )}
        </Formik>
      </Modal>

      {/* 
          ログイン用のモーダルを設定
       */}
      <Modal
        isOpen={openSignIn}
        onRequestClose={async () => {
          // ログイン用のモーダルをオープン
          await dispatch(resetOpenSignIn());
        }}
        style={customStyles}
      >
        <Formik
          initialErrors={{ email: "required" }}
          initialValues={{ email: "", password: "" }}
          onSubmit={async (values) => {
            await dispatch(fetchCredStart());
            const result = await dispatch(fetchAsyncLogin(values));
            if (fetchAsyncLogin.fulfilled.match(result)) {
              // プロフィール一覧を取得
              await dispatch(fetchAsyncGetProfs());
              await dispatch(fetchAsyncGetPosts());
              await dispatch(fetchAsyncGetComments());
              // ログインユーザのプロフィールを取得
              await dispatch(fetchAsyncGetMyProf());
            }
            await dispatch(fetchCredEnd());
            await dispatch(resetOpenSignIn());
          }}
          validationSchema={Yup.object().shape({
            email: Yup.string()
              .email("email format is wrong")
              .required("email is must"),
            password: Yup.string().required("password is must").min(4),
          })}
        >
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            errors,
            touched,
            isValid,
          }) => (
            <div>
              <form onSubmit={handleSubmit}>
                <div className={styles.auth_signUp}>
                  <h1 className={styles.auth_title}>SNS clone</h1>
                  <br />
                  <div className={styles.auth_progress}>
                    {isLoadingAuth && <CircularProgress />}
                  </div>
                  <br />

                  <TextField
                    placeholder="email"
                    type="input"
                    name="email"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                  />

                  {touched.email && errors.email ? (
                    <div className={styles.auth_error}>{errors.email}</div>
                  ) : null}
                  <br />

                  <TextField
                    placeholder="password"
                    type="password"
                    name="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                  {touched.password && errors.password ? (
                    <div className={styles.auth_error}>{errors.password}</div>
                  ) : null}
                  <br />
                  <br />
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!isValid}
                    type="submit"
                  >
                    Login
                  </Button>
                  <br />
                  <br />
                  <span
                    className={styles.auth_text}
                    onClick={async () => {
                      // ログイン用のモーダルをクローズ
                      await dispatch(resetOpenSignIn());
                      // サインアップ用のモーダルをオープン
                      await dispatch(setOpenSignUp());
                    }}
                  >
                    You don't have a account ?
                  </span>
                </div>
              </form>
            </div>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default Auth;
