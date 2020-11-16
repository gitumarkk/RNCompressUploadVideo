import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { ProcessingManager } from 'react-native-video-processing';
import storage from '@react-native-firebase/storage';
import * as mockApi from './mock-api';

const ADD_QUEUE_QUEUE = 'ADD_QUEUE_QUEUE';
const SET_CURRENT_STATE = 'SET_CURRENT_STATE';
const REMOVE_FROM_QUEUE = 'REMOVE_FROM_QUEUE';
const SET_VIDEO_LIST = 'SET_VIDEO_LIST';

const addToQueue = (data) => {
  return { type: ADD_QUEUE_QUEUE, data }
}

const setCurrent = (data) => {
  return { type: SET_CURRENT_STATE, data }
};

const removeFromQueue = (data) => {
  return { type: REMOVE_FROM_QUEUE, data }
};

const setVideoList = (data) => {
  return { type: SET_VIDEO_LIST, data }
};

const reducerInitialState = {
  queue: [],
  current: null,
  videoList: []
};

const appReducer = (state = reducerInitialState, action) => {
  switch (action.type) {
    case ADD_QUEUE_QUEUE: {
      return {
        ...state,
        queue: [...state.queue, action.data] // creating new reference
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
        queue: [...state.queue].filter(x => x.uuid !== action.data.uuid)
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

function compressVideo(path) {
  return async () => {
    console.log(`begin compressing ${path}`);
    const origin = await ProcessingManager.getVideoInfo(path);
    const result = await ProcessingManager.compress(path, {
      width: origin.size && origin.size.width / 3,
      height: origin.size && origin.size.height / 3,
      bitrateMultiplier: 7,
      minimumBitrate: 300000
    });
    const thumbnail =  await ProcessingManager.getPreviewForSecond(result.source);
    return { path: result.source, thumbnail };
  };
}

function uploadVideo(file, data) {
  return async () => {
    console.log(`begin uploading ${data.uuid}`)
    const reference = storage().ref(`/videos/${data.uuid}.mp4`);
    await reference.putFile(file.path);
    const external_path = await reference.getDownloadURL();
    await mockApi.update(data.uuid, {...data, external_path, thumbnail: file.thumbnail });
  };
}

export const uploadNext = (unlock) => {
  return async (dispatch, getState) => {
    const state = getState();
    const queue = state.app.queue;
    const current = state.app.current;

    if (queue.length === 0 || (current && !unlock)) return;
    const next = (current && unlock) ? current : queue[0];
    dispatch(setCurrent(next));
    const file = await dispatch(compressVideo(next.local_path));
    await dispatch(uploadVideo(file, next));
    dispatch(removeFromQueue(next));
    dispatch(getVideosApi());
    dispatch(uploadNext());
  };
};

export const fileUpload = (data) => {
  return async (dispatch) => {
    // await mockApi.reset(); // Uncomment this to clear async storage if full
    data.thumbnail =  await ProcessingManager.getPreviewForSecond(data.local_path);
    const resp = await mockApi.post(data);
    dispatch(addToQueue({ ...resp }));
    dispatch(uploadNext());
    dispatch(getVideosApi());
  };
};

export const getVideosApi = () => {
  return async (dispatch) => {
    const list = await mockApi.getList();
    dispatch(setVideoList(list))
  };
};

const reducer = combineReducers({ app: appReducer });
export const store = createStore(reducer, {}, applyMiddleware(thunkMiddleware));
