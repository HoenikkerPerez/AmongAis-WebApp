// TODO defer che fa nel tag script?

const MODEL_PATH = '/models'

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_PATH),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_PATH),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_PATH)
]).then(startVideo)

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.log(err)
    )
}

video.addEventListener('play', () => {
    //const canvas = faceapi.createCanvasFromMedia(video);
    //document.body.append(canvas);
    // const displaySize = { width: video.width, height: video.height }
    //faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        console.log(detections);
        //const resizedDetections = faceapi.resizeResults(detections, displaySize)
        //CanvasGradient.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        //faceapi.draw.drawDetections(canvas, resizedDetections)
    }, 100)
})
