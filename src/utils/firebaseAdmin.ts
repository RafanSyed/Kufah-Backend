// src/firebaseAdmin.ts
import admin from "firebase-admin";
import path from "path";

// Path to your service account key file
const serviceAccountPath = path.join(
  __dirname,
  "..",
  "kufah-81fd8-firebase-adminsdk-fbsvc-bdf42ae4b6.json"
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

export default admin;
