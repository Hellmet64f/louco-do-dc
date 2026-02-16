// --- COPIE A PARTIR DAQUI ---
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, updateProfile, signOut, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
        import { getDatabase, ref, set, get, update, push, onValue, serverTimestamp, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

        const firebaseConfig = {
            apiKey: "AIzaSyDLzKVUFDu9mL_38bQ65V6ATrUCyn1MmaY",
            authDomain: "chat-ba44c.firebaseapp.com",
            databaseURL: "https://chat-ba44c-default-rtdb.firebaseio.com/",
            projectId: "chat-ba44c",
            storageBucket: "chat-ba44c.firebasestorage.app",
            messagingSenderId: "802680335472",
            appId: "1:802680335472:web:bf121d0615669c17fc58b5"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getDatabase(app);

        let user = null;
        let activeChat = null;
        let currentChannel = 'general';
        let youtubePlayer = null;
        let isRemoteUpdate = false;
        let currentGroupData = null;

        const IMGBB_API_KEY = "9fbd2a11f06a3134c99c9425e158fb90";
        const GIPHY_API_KEY = "PybqU9EznuJGIe9bR5FZ9SsR1HbgEyFn";

        // AUTH & MONITORING
        onAuthStateChanged(auth, async (u) => {
            if (u) {
                user = u;
                document.getElementById('auth-screen').style.display = 'none';
                document.getElementById('app-screen').style.display = 'flex';
                
                const displayName = u.displayName || 'Herói';
                const photoURL = u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=e63946&color=fff`;
                
                document.getElementById('sidebar-name').innerText = displayName;
                document.getElementById('sidebar-avatar').src = photoURL;
                document.getElementById('settings-avatar').src = photoURL;
                
                loadChats();
            } else {
                document.getElementById('auth-screen').style.display = 'flex';
                document.getElementById('app-screen').style.display = 'none';
            }
        });

        // FIXED SEND MESSAGE SYSTEM
        window.sendMessage = async (mediaUrl = null, mediaType = null) => {
            if (!activeChat || !user) return;
            
            const input = document.getElementById('msg-input');
            const text = input.value.trim();
            
            if (!text && !mediaUrl) return;
            
            const path = activeChat.type === 'group'
                ? `groups/${activeChat.id}/channels/${currentChannel}/messages`
                : `messages/private/${activeChat.id}`;
            
            let role = 'member';
            if (activeChat.type === 'group' && currentGroupData?.members?.[user.uid]) {
                role = currentGroupData.members[user.uid].role || 'member';
            }
            
            const msgData = {
                text: text || '',
                sender: user.displayName || 'Anônimo',
                uid: user.uid,
                ts: Date.now(),
                role: role
            };
            
            if (mediaUrl) {
                msgData.mediaUrl = mediaUrl;
                msgData.mediaType = mediaType;
            }
            
            try {
                await push(ref(db, path), msgData);
                input.value = ''; // Limpa o campo após enviar
                if (mediaUrl) closeModals(); 
            } catch (e) {
                showToast("Erro ao enviar: " + e.message, "error");
            }
        };

        // FIXED FEED SYSTEM
        window.loadFeed = () => {
            onValue(ref(db, 'feed'), snap => {
                const list = document.getElementById('feed-list');
                list.innerHTML = '';
                
                if (!snap.exists()) {
                    list.innerHTML = '<p style="text-align:center; opacity:0.5;">Nenhuma postagem no universo ainda.</p>';
                    return;
                }

                const posts = [];
                snap.forEach(p => {
                    posts.push({ id: p.key, ...p.val() });
                });
                
                posts.sort((a, b) => b.ts - a.ts); // Mais recentes primeiro

                posts.forEach(post => {
                    const card = document.createElement('div');
                    card.className = 'post-card';
                    card.innerHTML = `
                        <div class="post-header">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=random" style="width:30px; border-radius:50%; border:1px solid #000;">
                            <span>${post.author}</span>
                        </div>
                        ${post.media ? `<img src="${post.media}" class="post-media">` : ''}
                        <div class="post-content">
                            <p style="margin:0;">${post.text || ''}</p>
                            <small style="opacity:0.5; font-size:10px;">${new Date(post.ts).toLocaleString()}</small>
                        </div>
                    `;
                    list.appendChild(card);
                });
            });
        };

        // HELPER PARA STORIES
        window.loadStories = () => {
            onValue(ref(db, 'stories'), snap => {
                const list = document.getElementById('stories-list');
                const addBtn = `
                    <div class="story-circle" style="display:flex; align-items:center; justify-content:center; border-color: var(--primary);" onclick="openStoryModal()">
                        <span class="material-icons" style="font-size: 30px;">add</span>
                    </div>`;
                list.innerHTML = addBtn;
                
                if (snap.exists()) {
                    snap.forEach(s => {
                        const story = s.val();
                        const div = document.createElement('div');
                        div.className = 'story-circle';
                        div.innerHTML = `<img src="${story.media}" style="width:100%; height:100%; object-fit:cover;">`;
                        list.appendChild(div);
                    });
                }
            });
        };

        // UI & NAVIGATION
        window.switchTab = (tab) => {
            document.querySelector('.chat-area').style.display = tab === 'chat' ? 'flex' : 'none';
            document.getElementById('feed-area').style.display = tab === 'feed' ? 'flex' : 'none';
            if (tab === 'feed') {
                loadFeed();
                loadStories();
            }
        };

        // (Mantenha as outras funções handleLogin, openChat, etc., que você já tem)
// --- FIM DO CÓDIGO ---
