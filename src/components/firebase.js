// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getMessaging,getToken } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkznQLiY3sBuX2gHuNHkkpERVYIDY8yWA",
  authDomain: "foodorderingapp-f2115.firebaseapp.com",
  projectId: "foodorderingapp-f2115",
  storageBucket: "foodorderingapp-f2115.firebasestorage.app",
  messagingSenderId: "27918561404",
  appId: "1:27918561404:web:6745d446c2560910a119f9",
  measurementId: "G-HNCSTM7SLG"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);


export const generateToken = async () =>{
  const permission = await Notification.requestPermission();
  console.log(permission);
  if(permission === "granted"){
    const token = await getToken(messaging,{
      vapidKey:"BCsk24Aa-_9Hshus6bvmQwP7qliamWO_V9fnPowv3ftdbCk1yM6ob7Ia9xnnliiuypFO22gjOxg9B7juktN8xT0",
    
    });
    console.log(token);
    return token;
  }

 
}