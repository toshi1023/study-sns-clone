import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import postReducer from "../features/post/postSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
// TypeScriptではdispatchに対しても型を定義する必要があり、コンポーネントで利用するには必須の設定
// storeのdispatch型を受け取ってAppDispatchという型に定義してエクスポート
export type AppDispatch = typeof store.dispatch;
