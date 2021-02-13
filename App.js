import * as tf from '@tensorflow/tfjs';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import { cameraWithTensors, bundleResourceIO} from '@tensorflow/tfjs-react-native';
import { Camera } from 'expo-camera';

class App extends React.Component {
  state = {
    isTfReady: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      isTfReady: false,
    };
  }
 
  async componentDidMount() {
    // Wait for tf to be ready.
    await tf.ready();
    // Signal to the app that tensorflow.js can now be used.
    this.setState({
      isTfReady: true,
    });
  }

  render () {
    console.log(this.state.isTfReady)
    return <Classification></Classification>
  }
}

function Classification(props) {
  const [hasPermission, setHasPermission] = useState(null);
  const [type] = useState(Camera.Constants.Type.back);
  const TensorCamera = cameraWithTensors(Camera);
  // const [cameraRef, setCameraRef] = useState(null);
  const [pressed] = useState(null);

  const handleCameraStream = (images, updatePreview, gl) => {
    const loop = async () => {
      const nextImageTensor = images.next().value
      const modelJson = require('./model-export/icn/tf_js-gt_medicine_model_1-2020-10-17T22\:41\:22.002Z/model.json');
      const modelWeights = require('./model-export/icn/tf_js-gt_medicine_model_1-2020-10-17T22\:41\:22.002Z/group.bin');
      const model = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeights));
      console.log(nextImageTensor.shape)
      model.predict(tf.cast(nextImageTensor.reshape([1,224,224,3]), 'float32')).print();
      requestAnimationFrame(loop);
    }
    loop();
  }

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  let textureDims;
  if (Platform.OS === 'ios') {
    textureDims = {
      height: 1920,
      width: 1080,
    };
  } else {
    textureDims = {
      height: 1200,
      width: 1600,
    };
  }

  return (
    <View style={styles.container}>
      <TensorCamera
        // Standard Camera props
        style={styles.camera}
        type={type}
        // Tensor related props
        cameraTextureHeight={textureDims.height}
        cameraTextureWidth={textureDims.width}
        resizeHeight={224}
        resizeWidth={224}
        resizeDepth={3}
        onReady={handleCameraStream}
        autorender={true}>
      </TensorCamera>
      {/* <TouchableOpacity
        style={{
          alignSelf: 'flex-end',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress = {async() => {
          pressed = true
        }}> */}
      {/* <Image style={{width: 100, height: 100, backgroundColor: 'transparent', alignSelf: 'flex-end', alignItems: 'center', justifyContent: 'center',}} source={require('./img/circle.png')}/>  */}
      {/* </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});

export default App