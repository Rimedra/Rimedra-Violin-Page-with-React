const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Admin rolünü kullanıcılara eklemek için fonksiyon
exports.addAdminRole = functions.https.onCall((data, context) => {
  // Kullanıcının email'ine göre admin rolü ekleme
  return admin.auth().getUserByEmail(data.email).then((user) => {
    return admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
    });
  }).then(() => {
    return { message: `Success! ${data.email} now has admin rights.` };
  }).catch(err => {
    return err;
  });
});
