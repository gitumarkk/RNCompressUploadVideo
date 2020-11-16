import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { ProcessingManager } from 'react-native-video-processing';
import storage from '@react-native-firebase/storage';
import * as mockApi from './mock-api';

const ADD_QUEUE_QUEUE = 'ADD_QUEUE_QUEUE';
const SET_CURRENT_STATE = 'SET_CURRENT_STATE';
const REMOVE_FROM_QUEUE = 'REMOVE_FROM_QUEUE';
const SET_VIDEO_LIST = 'SET_VIDEO_LIST';

const action_1_addToQueue = (data) => {
  return { type: ADD_QUEUE_QUEUE, data }
}

const action_2_getNextProcessing = (data) => {
  return { type: SET_CURRENT_STATE, data }
};

const action_3_removeFromQueue = (data) => {
  return { type: REMOVE_FROM_QUEUE, data }
};

export const action_4_setVideoList = (data) => {
  return { type: SET_VIDEO_LIST, data }
};

const reducerInitialState = {
  pendingList: [],
  current: null,
  videoList: []
};

const appReducer = (state = reducerInitialState, action) => {
  switch (action.type) {
    case ADD_QUEUE_QUEUE: {
      return {
        ...state,
        pendingList: [...state.pendingList, action.data] // creating new reference
      };
    }

    case SET_CURRENT_STATE: {
      return {
        ...state,
        current: action.data
      };
    }

    case REMOVE_FROM_QUEUE: {
      return {
        ...state,
        current: null,
        pendingList: [...state.pendingList].filter(x => x.uuid !== action.data.uuid)
      };
    }

    case SET_VIDEO_LIST: {
      return {
        ...state,
        videoList: action.data
      };
    }

    default: {
      return state;
    }
  }
};

function step_1_compressVideo(path) {
  return async () => {
    console.log(`begin compressing ${path}`);
    const origin = await ProcessingManager.getVideoInfo(item.local_path)
    const result = await ProcessingManager.compress(path, {
      width: origin.size && origin.size.width / 3,
      height: origin.size && origin.size.height / 3,
      bitrateMultiplier: 7,
      minimumBitrate: 300000
    });
    const thumbnail =  await ProcessingManager.getPreviewForSecond(path);
    return { path: result.source, thumbnail };
  };
}

function step_2_uploadVideo(file, data) {
  return async () => {
    console.log(`begin uploading ${data.uuid}`)
    const reference = storage().ref(`/videos/${data.uuid}.mp4`);
    await reference.putFile(file.path);
    const external_path = await reference.getDownloadURL();
    await mockApi.update(data.uuid, {...data, external_path, thumbnail: file.thumbnail });
  };
}

export const step_2_uploadNext = () => {
  return async (dispatch, getState) => {
    const state = getState();
    const pendingList = state.app.pendingList;
    const current = state.app.current;

    if(current || pendingList.length === 0) return ;
    const next = pendingList[0];
    dispatch(action_2_getNextProcessing(next));
    await new Promise(resolve => setTimeout(resolve, 2000));
    const file = await dispatch(step_1_compressVideo(next.local_path));
    await dispatch(step_2_uploadVideo(file, next));
    dispatch(action_3_removeFromQueue(next));
    dispatch(getVideosApi());
    dispatch(step_2_uploadNext());

  };
};

export const fileUpload = (data) => {
  return async (dispatch) => {
    // await mockApi.reset();
    // const thumbnail =  await ProcessingManager.getPreviewForSecond(data.local_path);
    // data.thumbnail = thumbnail;
    const resp = await mockApi.post(data);
    dispatch(action_1_addToQueue({ ...resp }));
    dispatch(step_2_uploadNext());
    dispatch(getVideosApi());
  };
};

export const getVideosApi = () => {
  return async (dispatch) => {
    const list = await mockApi.getList();
    dispatch(action_4_setVideoList(list))
  };
};

const reducer = combineReducers({ app: appReducer });
export const store = createStore(reducer, {}, applyMiddleware(thunkMiddleware));
