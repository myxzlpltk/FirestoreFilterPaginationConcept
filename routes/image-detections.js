require('dotenv').config({path: './.env'});
var express = require('express');
var router = express.Router();

// Firebase init
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT)
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

/* GET image detections list. */
router.get('/', async function (req, res) {
  // Get data and query parameters
  var { after, perPage, startDate, endDate, labels } = req.query

  // Get reference after auth
  const userRef = db.collection('data').doc('myxzlpltk@gmail.com')
  const userSnapshot = await userRef.get()
  if (!userSnapshot.exists) {
    return res.status(401).json({
      "status": "Error",
      "message": "User does not exist"
    })
  }

  // Get references to user's images collection
  const userImagesRef = userRef.collection('images')

  // Base query
  let ref = userImagesRef.orderBy('createdAt', 'desc')

  // Labels filter
  if (labels) {
    console.log(`Filtering labels: ${labels}`)

    labels = Array.isArray(labels) ? labels : labels.split(',')
    ref = ref.where('label', 'in', labels.concat(""))
  }

  // Date filter
  if (startDate && endDate && startDate <= endDate) {
    console.log(`Filtering date: ${startDate} - ${endDate}`)

    ref = ref.where('createdAt', '>=', Number(startDate)).where('createdAt', '<=', Number(endDate))
  }

  // After filter
  if (after) {
    console.log(`Filtering after: ${after}`)

    previousDocRef = db.doc(`data/myxzlpltk@gmail.com/images/${after}`)
    previousDocSnapshot = await previousDocRef.get()
    if (!previousDocSnapshot.exists) {
      return res.json({
        status: "Success",
        data: []
      })
    }

    ref = ref.startAfter(previousDocSnapshot)
  }

  // Limit result
  perPage = parseInt(perPage) ?? 15
  perPage = Math.max(15, perPage)
  perPage = Math.min(30, perPage)
  ref = ref.limit(perPage)
  console.log(`Limit result to ${perPage}`)

  // Get result
  const snapshot = await ref.get()
  const data = snapshot.docs.map(doc => doc.data())

  // Return result
  res.json({
    message: "Success",
    data: data
  })
});

module.exports = router;
