const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { faker } = require('@faker-js/faker');
const serviceAccount = require('./service-account.json');

initializeApp({ credential: cert(serviceAccount) });

function createUser(id) {
  faker.seed(42 + id);

  let isDetected = faker.datatype.boolean(0.8)

  return {
    "_seed": id,
    "filename": faker.string.uuid(),
    "email": faker.internet.email().toLowerCase(),
    "fileURL": faker.image.urlLoremFlickr({ category: 'nature' }),
    "isDetected": isDetected,
    "label": isDetected ? faker.helpers.arrayElement(["Healthy", "Phoma", "Miner", "Rust"]) : "",
    "inferenceTime": isDetected ? faker.number.int({ min: 2_000, max: 10_000 }) : 0,
    "confidence": isDetected ? faker.number.float({ min: 0.5, max: 1, precision: 0.1 }) : 0,
    "createdAt": (1685572000 - id * 3600) * 1000,
    "detectedAt": isDetected ? (1685572000 - id * 3600) * 1000 : 0,
  }
}

const db = getFirestore();
const userRef = db.collection('data').doc('myxzlpltk@gmail.com')
const userImagesRef = userRef.collection('images')

for (let i = 0; i < 100; i++) {
  let data = createUser(i)
  let imagesRef = userImagesRef.doc(data.filename)
  imagesRef.set(data)
}