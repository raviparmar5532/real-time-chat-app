import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue, get, update, set, push, remove } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getFirestore, doc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

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

// if user is not signd in / token expired
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'index.html';
    }
});
let channelForm = document.getElementById('channelForm');
let channelTitleInput = document.getElementById('channelTitle');
let channelUniqueNameInput = document.getElementById('channelUniqueName');
let channelDescriptionInput = document.getElementById('channelDescription');


channelForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const channelObject = {
        'title' : channelTitleInput.value,
        'uniqueName' : channelUniqueNameInput.value,
        'description' : channelDescriptionInput.value,
    };

    
    const channels = ref(database, "channels");


    const uniqueName = channelObject.uniqueName;
    get(channels).then((snap) => {
        if(uniqueName.includes(' ')) {
            alert('Invalid character in channel name')
        }
        else if(snap.val() != null && Object.keys(snap.val()).includes(uniqueName)) {
            alert('Channel name already exists');
            window.top.location.href = 'create-channel.html'; 
        } else {
            const entry = {};
            entry[uniqueName] = channelObject;
            update(channels, entry);

            const user = auth.currentUser;
            const userChannels = ref(database, `users/${user.uid}/channels`);

            const entry2 = {};
            entry2[uniqueName] = uniqueName;
            update(userChannels, entry2);

            channelTitleInput.value = '';
            channelUniqueNameInput.value = '';
            channelDescriptionInput.value = '';
            window.top.location.href = 'channel-chat.html';
        }
    });

});
