importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAhMMQ4hqs8YRWeT6nyNqe1Cn4D5-D2JJg",
  authDomain: "foodcart-347f5.firebaseapp.com",
  projectId: "foodcart-347f5",
  storageBucket: "foodcart-347f5.appspot.com",
  messagingSenderId: "1020966206157",
  appId: "1:1020966206157:web:e136bb197573a1c7c68784",
  measurementId: "G-1YG13CZM4L"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
