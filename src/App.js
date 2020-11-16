import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, StatusBar, FlatList,
  View, Text, ImageBackground, ActivityIndicator,
  TouchableOpacity, Modal, StyleSheet
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Video from 'react-native-video';

import UploadButton from './UploadButton';
import { getVideosApi, uploadNext } from './redux-store';

function App () {
  const dispatch = useDispatch();
  const [currentVideo, setVideo] = useState(null);
  const videoList = useSelector(state => state.app.videoList);
  const queue = useSelector(state => state.app.queue);

  useEffect(() => {
    dispatch(getVideosApi());
    dispatch(uploadNext(true));
  }, []);

  const renderItem = ({ item }) => {
    const isUploading = (queue || []).find(x => x.uuid === item.uuid);
    return (
      <TouchableOpacity style={styles.itemContainer} onPress={() => setVideo(item)}>
        { isUploading ? <Text>Video Uploading <ActivityIndicator size="small" color="black"/></Text> : null}
        <ImageBackground
          source={{ uri: `data:image/gif;base64,${item.thumbnail}` }}
          style={styles.imageStyle}
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
                style={styles.videoStyle}
                resizeMode="cover"
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
  },
  imageStyle: {
    width: '100%',
    height: 200
  },
  videoStyle: {
    width: 300,
    height: 300
  }
});

export default App;
