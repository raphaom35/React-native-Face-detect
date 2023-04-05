import { ImageSourcePropType, SafeAreaView, View } from "react-native";
import { styles } from "./styles";
import { Camera, CameraType, FaceDetectionResult } from "expo-camera";
import { useEffect, useState } from "react";
import * as FaceDetector from "expo-face-detector";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import neutralImg from "../assets/neutral.png";
import smileImg from "../assets/smile.png";
import winkingImg from "../assets/winking.png";
export function Home() {
  const [faceDetected, setFaceDetected] = useState(false);
  const [permissions, requestpermissions] = Camera.useCameraPermissions();
  const [emoji, setEmoji] = useState<ImageSourcePropType>(neutralImg);
  const faceValues = useSharedValue({
    with: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    zIndex: 1,
    width: faceValues.value.with,
    height: faceValues.value.height,
    transform: [{ translateX: 100 }, { translateY: 100 }],
  }));
  function handleFaceDetected({ faces }: FaceDetectionResult) {
    const face = faces[0] as any;

    if (face) {
      const { size, origin } = face.bounds;

      faceValues.value = {
        with: size.with,
        height: size.height,
        x: origin.x,
        y: origin.y,
      };
      if (face.smilingProbability > 0.5) {
        setEmoji(smileImg);
      } else if (
        face.leftEyeOpenProbability < 0.5 &&
        face.rightEyeOpenProbability > 0.5
      ) {
        setEmoji(winkingImg);
      } else {
        setEmoji(neutralImg);
      }
      setFaceDetected(true);
    } else {
      setFaceDetected(false);
    }
  }

  useEffect(() => {
    requestpermissions();
  });
  if (!permissions?.granted) {
    return;
  }
  return (
    <View style={styles.container}>
      {faceDetected && (
        <Animated.Image
          source={emoji}
          style={{
            width: 200,
            height: 200,
            zIndex: 1,
            position: "absolute",
            transform: [
              { translateX: faceValues.value.x },
              { translateY: faceValues.value.y + 300 },
            ],
          }}
        />
      )}
      <Camera
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFaceDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.accurate,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
    </View>
  );
}
