const video = document.getElementById("video");

function startVideo() {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.log(err)
  );
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(startVideo);

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  // Gestionar el tamaño
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      /* .withAgeAndGender() */
      .withFaceDescriptors()
      .withFaceExpressions();
    /* .withFaceDescriptors(); */

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    /* const minProbability = 0.05; */
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    /* faceapi.draw.drawAgeAndGender(canvas, resizedDetections); */
    /* faceapi.draw.drawFaceExpressions(canvas, resizedDetections); */
    /* faceapi.draw.drawFaceDescriptors(canvas, resizedDetections); */
    /* console.log(detections); */
  }, 100);
});
