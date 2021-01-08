// Emotion Manager with Face Recognition

// CURRENT
// + setEmotion(emotion: string)
// + getCurrent()

// TRACKING
// + startTracking()
// + stopTracking()
// + popTrack()

const MODEL_PATH = './assets/models/face-api'

const video = document.getElementById('video');

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_PATH),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_PATH),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_PATH)
]).then(startVideoForEmotionRecognition)

function startVideoForEmotionRecognition() {
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(function (stream) {
            video.srcObject = stream;
          })
          .catch(function (err0r) {
            console.log("Something went wrong!");
          });
    }
}

var EmotionManager = {
    _current: undefined,
    _recording: {},
    _isRecording: false,
    setEmotion: function(emotion) {
        console.debug("EMOTION MANAGER: Is setting " + emotion);
        this._current = emotion;
        if(this._isRecording) {
            if(this._recording[emotion])
                this._recording[emotion]++;
            else
                this._recording[emotion] = 1;
        }
    },
    getCurrent: function() {
        console.debug("EMOTION MANAGER is returning " + this._current);
        return this._current;
    },
    startTracking: function() {
        this._isRecording = true;
        console.debug("EMOTION MANAGER just started tracking the emotions.");
        console.debug("EMOTION MANAGER has _recording of length " + this._recording.length);
        console.debug("EMOTION MANAGER has _isRecording set as " + this._isRecording);
    },
    stopTracking: function() {
        this._isRecording = false;
        console.debug("EMOTION MANAGER just stopped tracking the emotions. isRecording is now " + this._isRecording)
    },
    popTrack: function() {
        console.debug("EMOTION MANAGER is returning _recording:");
        console.debug(this._recording);
        let result = "";
        Object.entries(this._recording).forEach(([key, value]) => {
            result += (key[0] + (key[1] + ",") + value + "\n");
        });
        this._recording = [];
        return result;
    },
    increase: function() {
        if(this._current)
            this._recording[this._current]++;
    }
}

video.addEventListener('play', () => {
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        console.debug(detections);
        if(detections.length > 0) {
            let expressions = detections[0].expressions;
            let emotion = { type: "none", accuracy: 0 };
            Object.entries(expressions).forEach(([key, value]) => {
                if(value > emotion.accuracy)
                    emotion = {type: key, accuracy: value};
            });
            EmotionManager.setEmotion(emotion.type);
            console.debug("EMOTION-RECOGNIZER: Current emotion is " + emotion.type);
        } else {
            EmotionManager.increase();
        }
    }, 500)
})
