import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, StatusBar, FlatList,
  View, Text, ImageBackground, ActivityIndicator,
  TouchableOpacity, Modal, StyleSheet
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Video from 'react-native-video';

import UploadButton from './UploadButton';
import { getVideosApi, step_2_uploadNext } from './redux-store';

const App: () => React$Node = () => {
  const dispatch = useDispatch();
  const [currentVideo, setVideo] = useState(null);
  const videoList = useSelector(state => state.app.videoList);
  const pendingList = useSelector(state => state.app.pendingList);
  const current = useSelector(state => state.app.current);

  useEffect(() => {
    dispatch(getVideosApi());
    dispatch(step_2_uploadNext());
  }, []);

  const renderItem = ({ item }) => {
    const isUploading = (pendingList || []).find(x => x.uuid === item.uuid);
    let renderStatus;
    if (current && current.uuid === item.uuid) {
      renderStatus = "Uploading Processing";
    } else if (isUploading) {
      renderStatus = "Upload Pending";
    }

    return (
      <TouchableOpacity style={styles.itemContainer} onPress={() => setVideo(item)}>
        { renderStatus ? <Text>{renderStatus} <ActivityIndicator size="small" color="black"/></Text> : null}
        <ImageBackground
          source={{ uri: `data:image/gif;base64,${item.thumbnail}` }}
          style={{ width: '100%', height: 200 }}
          poster={item.thumbnail}
        />
      </TouchableOpacity>
    )
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <UploadButton />

        <FlatList
          data={videoList || []}
          renderItem={renderItem}
          keyExtractor={item => item.uuid}
        />
      </SafeAreaView>

      {
      currentVideo ? (
        <Modal visible onDismiss={() => setVideo(null)} transparent>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Video
                source={{ uri: currentVideo.external_path || currentVideo.local_path }}
                style={{
                  width: 300,
                  height: 300
                }}
              />
              <TouchableOpacity onPress={() => setVideo(null)}><Text>Close</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : null
    }
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalView: {
    display: 'flex',
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'white',
    padding: 10
    // borderRadius: 20,
  },
  itemContainer: {
    marginVertical: 10,
    display: 'flex',
    alignItems: 'center'
  }
});

export default App;
