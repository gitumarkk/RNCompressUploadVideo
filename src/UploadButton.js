import React from 'react';
import { Button, Platform } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { useDispatch } from 'react-redux';
import { fileUpload } from './redux-store';

export default function SelectFile () {
  const dispatch = useDispatch();

  const pickVideo = () => {
    const options = {
      title: 'Upload Video',
      takePhotoButtonTitle: 'Record video',
      chooseFromLibraryButtonTitle: 'Choose From Library',
      mediaType: 'video',
      storageOptions: {
        skipBackup: true,
        waitUntilSaved: true,
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      if (!response.didCancel && !response.error) {
        const path = Platform.select({
            android: { "value": response.path },
            ios: { "value": response.uri }
        }).value;
        dispatch(fileUpload({ local_path: path }));
      }
    });
  };

  return (
    <Button
      onPress={pickVideo}
      title="Upload"
    />
  )
};
