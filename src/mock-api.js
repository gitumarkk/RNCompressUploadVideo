import AsyncStorage from '@react-native-async-storage/async-storage';

export const getItem = async (uuid) => {
  const data = await AsyncStorage.getItem(uuid);
  if (data) return JSON.parse(data);
  return {}
}

export const getList = async () => {
  const keys = await AsyncStorage.getAllKeys()
  const list = await AsyncStorage.multiGet(keys)
  return (list || []).map(x => x[1] ? JSON.parse(x[1]) : {});
}

export const post = async (data) => {
  const entry = {
    ...data,
    uuid: Math.random().toString(36).substring(7)
  }
  await AsyncStorage.setItem(entry.uuid, JSON.stringify(entry));
  return entry;
}

export const update = async (uuid, data) => {
  await AsyncStorage.mergeItem(uuid, JSON.stringify(data));
  return data
}

export const reset = async () => {
  await AsyncStorage.clear();
  return { success: true }
}
