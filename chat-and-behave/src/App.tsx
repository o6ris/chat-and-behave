import React, { useState, useEffect } from 'react';
import { AuthState, ChatState, User, Group, Message } from './types';
import './styles/App.css';

const App: React.FC = () => {
    const [auth, setAuth] = useState<AuthState>({
        user: null,
        isAuthenticated: false
    });

    const [chat, setChat] = useState<ChatState>({
        currentGroup: null,
        messages: {},
        groups: []
    });

    const [view, setView] = useState<'auth' | 'groups' | 'chat'>('auth');
    const [isRegister, setIsRegister] = useState(false);

    // Load data from localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            setAuth({ user, isAuthenticated: true });
            setView('groups');
        }
    }, []);

    const handleLogin = (username: string, password: string) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find((u: User & { password: string }) => 
            u.username === username && u.password === password
        );

        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            setAuth({ user: userWithoutPassword, isAuthenticated: true });
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
            setView('groups');
            loadGroups();
        } else {
            alert('Invalid username or password');
        }
    };

    const handleRegister = (username: string, password: string) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some((u: User) => u.username === username)) {
            alert('Username already exists');
            return;
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            password
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        handleLogin(username, password);
    };

    const loadGroups = () => {
        const groups = JSON.parse(localStorage.getItem('groups') || '[]');
        const messages = JSON.parse(localStorage.getItem('messages') || '{}');
        setChat(prev => ({ ...prev, groups, messages }));
    };

    const createGroup = (name: string) => {
        const group: Group = {
            id: Date.now().toString(),
            name,
            members: [auth.user!.id],
            created: new Date().toISOString()
        };

        const updatedGroups = [...chat.groups, group];
        localStorage.setItem('groups', JSON.stringify(updatedGroups));
        
        const updatedMessages = { ...chat.messages, [group.id]: [] };
        localStorage.setItem('messages', JSON.stringify(updatedMessages));
        
        setChat(prev => ({
            ...prev,
            groups: updatedGroups,
            messages: updatedMessages
        }));
    };

    const joinGroup = (groupId: string) => {
        const updatedGroups = chat.groups.map(group => {
            if (group.id === groupId && !group.members.includes(auth.user!.id)) {
                return {
                    ...group,
                    members: [...group.members, auth.user!.id]
                };
            }
            return group;
        });

        localStorage.setItem('groups', JSON.stringify(updatedGroups));
        setChat(prev => ({ ...prev, groups: updatedGroups }));
    };

    const sendMessage = (text: string) => {
        if (!chat.currentGroup) return;

        const message: Message = {
            id: Date.now().toString(),
            text,
            sender: auth.user!.id,
            senderName: auth.user!.username,
            groupId: chat.currentGroup.id,
            timestamp: new Date().toISOString()
        };

        const updatedMessages = {
            ...chat.messages,
            [chat.currentGroup.id]: [
                ...(chat.messages[chat.currentGroup.id] || []),
                message
            ]
        };

        localStorage.setItem('messages', JSON.stringify(updatedMessages));
        setChat(prev => ({ ...prev, messages: updatedMessages }));
    };

    const renderAuth = () => (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Welcome to Group Chat</h2>
                <div className="auth-tabs">
                    <button 
                        className={`auth-tab ${!isRegister ? 'active' : ''}`}
                        onClick={() => setIsRegister(false)}
                    >
                        Login
                    </button>
                    <button 
                        className={`auth-tab ${isRegister ? 'active' : ''}`}
                        onClick={() => setIsRegister(true)}
                    >
                        Register
                    </button>
                </div>
                
                {isRegister ? (
                    <form className="auth-form" onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const username = (form.elements.namedItem('username') as HTMLInputElement).value;
                        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
                        const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value;
                        
                        if (password !== confirm) {
                            alert('Passwords do not match');
                            return;
                        }
                        handleRegister(username, password);
                    }}>
                        <input type="text" name="username" placeholder="Username" required />
                        <input type="password" name="password" placeholder="Password" required />
                        <input type="password" name="confirm" placeholder="Confirm Password" required />
                        <button type="submit">Register</button>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const username = (form.elements.namedItem('username') as HTMLInputElement).value;
                        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
                        handleLogin(username, password);
                    }}>
                        <input type="text" name="username" placeholder="Username" required />
                        <input type="password" name="password" placeholder="Password" required />
                        <button type="submit">Login</button>
                    </form>
                )}
            </div>
        </div>
    );

    const renderGroups = () => (
        <div className="groups-container">
            <div className="groups-box">
                <h2>Chat Groups</h2>
                <div className="groups-list">
                    {chat.groups.filter(group => 
                        group.members.includes(auth.user!.id)
                    ).map(group => (
                        <div 
                            key={group.id}
                            className="group-item"
                            onClick={() => {
                                setChat(prev => ({ ...prev, currentGroup: group }));
                                setView('chat');
                            }}
                        >
                            {group.name}
                        </div>
                    ))}
                </div>
                <div className="groups-actions">
                    <button onClick={() => {
                        const name = prompt('Enter group name:');
                        if (name) createGroup(name);
                    }}>Create New Group</button>
                    <button onClick={() => {
                        const id = prompt('Enter group ID:');
                        if (id) joinGroup(id);
                    }}>Join Group</button>
                </div>
            </div>
        </div>
    );

    const renderChat = () => (
        <div className="chat-container">
            <div className="chat-header">
                <button className="back-button" onClick={() => {
                    setChat(prev => ({ ...prev, currentGroup: null }));
                    setView('groups');
                }}>← Back to Groups</button>
                <h1>{chat.currentGroup?.name}</h1>
                <div className="group-info">
                    <span>{chat.currentGroup?.members.length} members</span>
                </div>
            </div>
            <div className="chat-messages">
                {chat.currentGroup && chat.messages[chat.currentGroup.id]?.map(message => (
                    <div 
                        key={message.id}
                        className={`message ${message.sender === auth.user?.id ? 'sent' : 'received'}`}
                    >
                        <div className="sender">
                            {message.sender === auth.user?.id ? 'You' : message.senderName}
                        </div>
                        <div className="text">{message.text}</div>
                    </div>
                ))}
            </div>
            <form className="chat-input" onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem('message') as HTMLInputElement;
                if (input.value.trim()) {
                    sendMessage(input.value);
                    input.value = '';
                }
            }}>
                <input 
                    type="text" 
                    name="message"
                    placeholder="Type your message..." 
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );

    return (
        <div className="app">
            {view === 'auth' && renderAuth()}
            {view === 'groups' && renderGroups()}
            {view === 'chat' && renderChat()}
        </div>
    );
};

export default App;
