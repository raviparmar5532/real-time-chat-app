import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
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

// click event listener for the logout button
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', () => {
    auth.signOut()
    .then(() => {
        // Redirect to index.html after successful logout
        window.location.href = 'index.html';
    })
    .catch((error) => {
        console.error('Logout error:', error);
    });
});

//display currently logged in user
const usersRef = ref(database, 'users');
get(usersRef).then(snap => {
    const user = auth.currentUser;
    const userNameElement = document.getElementById('username');
    userNameElement.innerHTML = `Hi, ${user.displayName}`;
    userNameElement.style.paddingLeft = '10px';
})

let currentChannel = null;

//fetches channels list
const channelsRef = ref(database, 'channels');
onValue(channelsRef, snap => {
    const user = auth.currentUser;
    if (!snap || !snap.val()) return;
    let channelsArray = Object.values(snap.val());
    const chatList = document.getElementById('chatList');
    chatList.innerHTML = '';

    channelsArray.forEach(x => {
        const newChatEle = document.createElement('div');
        newChatEle.classList.add('user-chat');
        newChatEle.classList.add('channel-chat');
        const userChatNameEle = document.createElement('div');
        const leaveChannelBtn = document.createElement('button');
        userChatNameEle.addEventListener('click', () => {
            const userChannelRef = ref(database, `users/${user.uid}/channels`);
            let chatSnap;
            onValue(userChannelRef, (snap) => {
                chatSnap = JSON.parse(JSON.stringify(snap));
            })
            if (!chatSnap || !chatSnap.val() || !Object.values(chatSnap.val()).includes(x.uniqueName)) {
                showChannelJoinPage(x.title, x.uniqueName);
            } else {
                fetchChatHistory(x.title, x.uniqueName);
            }
        });

        userChatNameEle.classList.add('user-chat-name');
        userChatNameEle.dataset.uniquename = x.uniqueName;
        userChatNameEle.innerHTML = x.title;

        leaveChannelBtn.className = 'leave-channel-btn';
        leaveChannelBtn.innerHTML = 'Leave';
        leaveChannelBtn.dataset.uniquename = x.uniqueName;
        leaveChannelBtn.onclick = (x) => {
            messageBar.style.display = 'none';
            const userOrChatName = document.querySelector('.chat-header');
            userOrChatName.innerHTML = '';
            const user = auth.currentUser;
            const userChannels = ref(database, `users/${user.uid}/channels`);
            const entry = {};
            entry[x.target.dataset.uniquename] = null;
            set(userChannels, entry);
            const chatBody = document.querySelector('.chat-body');
            chatBody.innerHTML = '';
        }
        newChatEle.append(userChatNameEle);
        newChatEle.append(leaveChannelBtn);

        chatList.append(newChatEle);
    });
});

//in case of user has not joined the channel
const showChannelJoinPage = function (title, channelName) {
    // const answer = confirm(`You are not a member of this channel. Click 'OK' to join the channel`);
    // if (answer) {
        const user = auth.currentUser;
        const userChannelsRef = ref(database, `users/${user.uid}/channels`);
        push(userChannelsRef, channelName);
        fetchChatHistory(title, channelName);
    // }
}

//fetches channel chat history
function fetchChatHistory(channelTitle, channelName) {
    const userOrChatName = document.querySelector('.chat-header');
    userOrChatName.innerHTML = '';
    const currentUserOrChatText = document.createElement('div');
    currentUserOrChatText.id = 'current-chat-name';
    currentUserOrChatText.innerHTML = channelTitle;
    userOrChatName.append(currentUserOrChatText);

    const channelChats = ref(database, `channels/${channelName}/chats`);
    const users = ref(database, `users`);

    onValue(channelChats, snap => {

        currentChannel = channelName;
        messageBar.style.display = 'flex';

        if (!snap || !snap.val()) return;
        const user = auth.currentUser;
        const chatBody = document.querySelector('.chat-body');
        chatBody.innerHTML = '';
        Object.values(snap.val()).forEach(chat => {
            const newMessageEle = document.createElement('div');
            const sentBy = document.createElement('span');
            sentBy.classList.add('message-time');
            get(users).then(snap => {
                Object.entries(snap.val()).forEach(usr => {
                    if (usr[0] === chat.sender) {
                        sentBy.innerHTML = usr[1].displayName;
                        newMessageEle.dataset.sentby = chat.sender;
                        return;
                    }
                })
            })
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
            newMessageEle.append(document.createElement('br'));
            newMessageEle.append(sentBy);

            chatBody.append(newMessageEle);
        });
    })
}
//message-bar is not visible before going inside any chat / channel
const messageBar = document.querySelector('.chat-footer');
if (currentChannel == null) {
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
    const channelChats = ref(database, `channels/${currentChannel}/chats`);
    push(channelChats, chatObj); 
    messageBtn.value = '';
}