import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import axios from "axios";
import { PROPS_AUTHEN, PROPS_PROFILE, PROPS_NICKNAME } from "../types";

// DjangoのURLを.envに設定して利用
const apiUrl = process.env.REACT_APP_DEV_API_URL;

/**
 * Login時のToken取得用非同期関数
 */
export const fetchAsyncLogin = createAsyncThunk(
  "auth/post", // 非同期関数の名前
  // authen: reactコンポーネントから設定される引数(PROPS_AUTHEN: types.tsで設定した型)
  // ユーザの入力したemailとpasswordが引数に入る
  async (authen: PROPS_AUTHEN) => {
    // 第1引数: api通信のURL
    // 第2引数: ユーザの入力したemailとpassword
    const res = await axios.post(`${apiUrl}authen/jwt/create`, authen, {
      headers: {
        "Content-Type": "application/json", // postメソッド指定時に必要なパラメータ
      },
    });
    // JWTのTokenをresに代入しているため、そのデータをリターン
    return res.data;
  }
);

/**
 * User新規作成用の非同期関数
 */
export const fetchAsyncRegister = createAsyncThunk(
  "auth/register",
  async (auth: PROPS_AUTHEN) => {
    const res = await axios.post(`${apiUrl}api/register/`, auth, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data;
  }
);

/**
 * Profile作成用の非同期関数
 */
export const fetchAsyncCreateProf = createAsyncThunk(
  "profile/post",
  async (nickName: PROPS_NICKNAME) => {
    // ここではnickNameはnickNameデータしか渡さないため、イメージは作成しない設定になっている
    // →新規作成時はイメージのデータは作成しない仕様としている
    const res = await axios.post(`${apiUrl}api/profile/`, nickName, {
      headers: {
        "Content-Type": "application/json",
        // Profileの作成・更新時にはアクセスTokenが必須のためパラメータに設定
        Authorization: `JWT ${localStorage.localJWT}`,
      },
    });
    return res.data;
  }
);

/**
 * Profile更新用の非同期関数
 */
export const fetchAsyncUpdateProf = createAsyncThunk(
  "profile/put",
  // こちらのprofileはidとnickNameとimgデータを渡す
  async (profile: PROPS_PROFILE) => {
    const uploadData = new FormData();
    // 引数で受け取ったnickNameをuploadDataのnickNameという属性に追加する
    uploadData.append("nickName", profile.nickName);
    // 引数にimgデータがあるときのみuploadDataのimgという属性に追加する
    profile.img && uploadData.append("img", profile.img, profile.img.name);
    const res = await axios.put(
      `${apiUrl}api/profile/${profile.id}/`,
      uploadData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.localJWT}`,
        },
      }
    );
    return res.data;
  }
);

/**
 * Loginしているユーザのプロフィール取得用の非同期関数
 */
export const fetchAsyncGetMyProf = createAsyncThunk("profile/get", async () => {
  const res = await axios.get(`${apiUrl}api/myprofile/`, {
    headers: {
      Authorization: `JWT ${localStorage.localJWT}`,
    },
  });
  // djangoのMyProfileListViewメソッドでfileterメソッドを使用しているため、
  // 返り値が配列となってしまうことからresのdataも配列で指定しなくてはならない
  return res.data[0];
});

/**
 * 全プロフィールデータ取得用の非同期関数
 */
export const fetchAsyncGetProfs = createAsyncThunk("profiles/get", async () => {
  const res = await axios.get(`${apiUrl}api/profile/`, {
    headers: {
      Authorization: `JWT ${localStorage.localJWT}`,
    },
  });
  return res.data;
});

/**
 * authSliceの作成
 *
 */
export const authSlice = createSlice({
  name: "auth",
  initialState: {
    openSignIn: true, // loginモーダルの表示設定
    openSignUp: false, // ユーザ作成用のモーダルの表示設定
    openProfile: false, // プロフィール編集用のモーダルの表示設定
    isLoadingAuth: false, // Apiにアクセスして処理をしている最中(Loding最中)の表示設定
    // Loginしているユーザを管理
    myprofile: {
      id: 0,
      nickName: "",
      userProfile: 0,
      created_on: "",
      img: "",
    },
    // 存在する全プロフィールを管理
    profiles: [
      {
        id: 0,
        nickName: "",
        userProfile: 0,
        created_on: "",
        img: "",
      },
    ],
  },
  reducers: {
    // Lodingの開始
    fetchCredStart(state) {
      state.isLoadingAuth = true;
    },
    // Lodingの終了
    fetchCredEnd(state) {
      state.isLoadingAuth = false;
    },
    // ログインモーダルの表示
    setOpenSignIn(state) {
      state.openSignIn = true;
    },
    // ログインモーダルの終了
    resetOpenSignIn(state) {
      state.openSignIn = false;
    },
    // register用のモーダル表示
    setOpenSignUp(state) {
      state.openSignUp = true;
    },
    // register用のモーダル終了
    resetOpenSignUp(state) {
      state.openSignUp = false;
    },
    // Profile用モーダルの表示
    setOpenProfile(state) {
      state.openProfile = true;
    },
    // Profile用モーダルの終了
    resetOpenProfile(state) {
      state.openProfile = false;
    },
    // Profileのニックネームを編集する処理
    editNickname(state, action) {
      // ユーザの入力したニックネームにstateを更新
      state.myprofile.nickName = action.payload;
    },
  },
  // 非同期関数の後処理を設定
  extraReducers: (builder) => {
    // fulfilled: 非同期処理が成功した場合を指す
    // ログインが完了した直後に自動でlocalStorageにJWT Tokenを格納するため、
    // 後続の処理(プロフィール作成などTokenが必要な処理)がスムーズに行える
    builder.addCase(fetchAsyncLogin.fulfilled, (state, action) => {
      // JWTのTokenをlocalStorageに格納
      // action.payload: 非同期関数のリターンされたres.data
      // access: JWTはrefreshとaccessとでデータは2つあるため、そのaccessを指定している
      localStorage.setItem("localJWT", action.payload.access);
    });
    // extraReducersはaddCaseメソッドで追加することが出来る
    builder.addCase(fetchAsyncCreateProf.fulfilled, (state, action) => {
      // fetchAsyncCreateProfでリターンされたデータをstateのmyprofileに格納
      state.myprofile = action.payload;
    });
    builder.addCase(fetchAsyncGetMyProf.fulfilled, (state, action) => {
      state.myprofile = action.payload;
    });
    // 存在する全プロフィールの取得・stateのprofilesへの格納処理
    builder.addCase(fetchAsyncGetProfs.fulfilled, (state, action) => {
      state.profiles = action.payload;
    });
    // Profileの更新時処理を設定
    builder.addCase(fetchAsyncUpdateProf.fulfilled, (state, action) => {
      state.myprofile = action.payload; // 更新後のprofileをstateのmyprofileに格納
      // 更新したprofileの情報を反映させて、再度全プロフィール情報を更新して表示する処理
      state.profiles = state.profiles.map((prof) =>
        prof.id === action.payload.id ? action.payload : prof
      );
    });
  },
});

export const {
  fetchCredStart,
  fetchCredEnd,
  setOpenSignIn,
  resetOpenSignIn,
  setOpenSignUp,
  resetOpenSignUp,
  setOpenProfile,
  resetOpenProfile,
  editNickname,
} = authSlice.actions;

/**
 * authSliceで作成したstateをexport
 * stateのauthはstore.tsで設定したキーと一致させる必要がある
 * ※RootState型は全Sliceのstateをひとまとめにした型(全Sliceのstateデータ型を持つ)
 * @param state
 */
export const selectIsLoadingAuth = (state: RootState) =>
  state.auth.isLoadingAuth;
export const selectOpenSignIn = (state: RootState) => state.auth.openSignIn;
export const selectOpenSignUp = (state: RootState) => state.auth.openSignUp;
export const selectOpenProfile = (state: RootState) => state.auth.openProfile;
export const selectProfile = (state: RootState) => state.auth.myprofile;
export const selectProfiles = (state: RootState) => state.auth.profiles;

export default authSlice.reducer;
