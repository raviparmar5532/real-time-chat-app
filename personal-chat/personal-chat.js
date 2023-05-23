import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
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
const user = auth.currentUser;
const database = getDatabase(app);

// if user is not signd in / token expired
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = '../login/login.html';
    }
});

// click event listener for the logout button
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            // Redirect to index.html after successful logout
            window.location.href = '../login/login.html';
        })
        .catch((error) => {
            console.error('Logout error:', error);
        });
});

//display currently logged in user
onValue(ref(database, 'users'), snap => {
    const user = auth.currentUser;
    const userNameElement = document.getElementById('username');
    userNameElement.innerHTML = `Hi, ${user.displayName}`;
    userNameElement.style.paddingLeft = '10px';
})

let currentChat = null;


const users = ref(database, `users`);
onValue(users, snap => {
    const user = auth.currentUser;
    const chatList = document.getElementById('chatList');
    chatList.innerHTML = '';

    Object.values(snap.val()).forEach(usr => {
        if (usr.uid != user.uid) {
            const newChatEle = document.createElement('div');
            newChatEle.classList.add('user-chat');
            newChatEle.classList.add('channel-chat');

            const userChatNameEle = document.createElement('div');
            userChatNameEle.classList.add('user-chat-name');
            userChatNameEle.dataset.uid = usr.uid;
            userChatNameEle.innerHTML = usr.displayName;
            newChatEle.addEventListener('click', () => {
                currentChat = usr.uid;
                messageBar.style.display = 'flex';

                //display username of the receiver on the chat-header
                const receiverName = document.querySelector('.chat-header');
                receiverName.innerHTML = '';
                const receiverNameText = document.createElement('div');
                receiverNameText.id = 'current-chat-name';
                receiverNameText.innerHTML = user.displayName;
                receiverName.append(receiverNameText);

                //fetching messages
                const chats = ref(database, `users/${user.uid}/chats/${usr.uid}`);
                const chatBody = document.querySelector('.chat-body');
                onValue(chats, (chatSnap) => {
                    chatBody.innerHTML = '';
                    if (!chatSnap || !chatSnap.val()) return;
                    Object.values(chatSnap.val()).forEach(chat => {
                        const newMessageEle = document.createElement('div');
                        if (chat.sender === user.uid) {
                            newMessageEle.classList.add('message-outgoing');
                        } else {
                            newMessageEle.classList.add('message-incoming');
                        }
                        const msg = document.createElement('p');
                        msg.innerHTML = chat.message;
                        const timeEle = document.createElement('span');
                        timeEle.classList.add('message-time');
                        timeEle.innerHTML = chat.time;
                        newMessageEle.append(msg);
                        newMessageEle.append(timeEle);
                        chatBody.append(newMessageEle);
                    })
                })
            });


            const deleteChatBtn = document.createElement('button');
            deleteChatBtn.className = 'leave-channel-btn';
            deleteChatBtn.innerHTML = 'Delete';
            deleteChatBtn.dataset.uid = usr.uid;
            deleteChatBtn.onclick = (x) => {
                const user = auth.currentUser;
                const chats = ref(database, `users/${user.uid}/chats`);
                const entry = {};
                entry[x.target.dataset.uid] = null;
                set(chats, entry);
                //receiver side
                const chats2 = ref(database, `users/${usr.uid}/chats`);
                const entry2 = {};
                entry[user.uid] = null;
                set(chats2, entry2);
            }
            newChatEle.append(userChatNameEle);
            newChatEle.append(deleteChatBtn);

            chatList.append(newChatEle);
        }
    })
});

//message-bar is not visible before going inside any chat / channel
const messageBar = document.querySelector('.chat-footer');
if (currentChat == null) {
    messageBar.style.display = 'none';
}

//send button event
const sendBtn = document.getElementById('sendBtn');
sendBtn.onclick = () => {
    const messageBtn = document.getElementById('messageInput');
    const message = messageBtn.value;
    const user = auth.currentUser;
    if (message.length == 0) {
        return;
    }
    const now = new Date();
    const chatObj = {
        'message': message,
        'sender': user.uid,
        'time': now.toLocaleString()
    };
    const senderSide = ref(database, `users/${user.uid}/chats/${currentChat}`);
    push(senderSide, chatObj);
    const receiverSide = ref(database, `users/${currentChat}/chats/${user.uid}`);
    push(receiverSide, chatObj);
    messageBtn.value = '';
}