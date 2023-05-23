import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBjyJK4Gpb68Vp22BrqUICLkx_Z-FZl_HY",
    authDomain: "real-time-chat-app-2002.firebaseapp.com",
    databaseURL: "https://real-time-chat-app-2002-default-rtdb.firebaseio.com",
    projectId: "real-time-chat-app-2002",
    storageBucket: "real-time-chat-app-2002.appspot.com",
    messagingSenderId: "636678075026",
    appId: "1:636678075026:web:b81264399ee219a48cac4b",
    measurementId: "G-XP7XD7JJ8F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase(app);

// Get a reference to the Google provider object
const provider = new GoogleAuthProvider();

// Get reference to the login button
const loginBtn = document.getElementById('loginBtn');
const usersRef = ref(database, 'users');

// Attach click event listener to the login button
loginBtn.addEventListener('click', () => {
    // Sign in with Google popup
    signInWithPopup(auth, provider)
        .then((result) => {
            // Google authentication successful
            const user = result.user;
            const users = ref(database, 'users');
            get(users).then(snap => {

                if(snap.val()!=null && Object.keys(snap.val()).includes(user.uid)) {
                    window.location.href = "channel-chat.html"
                    return;
                }
                const userObj = {
                    'displayName' : user.displayName,
                    'email' : user.email,
                    'uid' : user.uid
                };
                const entry = {};
                entry[user.uid] = userObj;
                console.log(entry);
                update(usersRef, entry);
                window.location.href = "personal-chat.html"
            })
        })
        .catch((error) => {
            // An error occurred during Google authentication
            console.error('Authentication error:', error);
        });
});