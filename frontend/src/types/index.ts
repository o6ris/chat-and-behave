export interface User {
    id: string;
    username: string;
}

export interface Message {
    id: string;
    text: string;
    sender: string;
    senderName: string;
    groupId: string;
    timestamp: string;
}

export interface Group {
    id: string;
    name: string;
    members: string[];
    created: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}

export interface ChatState {
    currentGroup: Group | null;
    messages: { [groupId: string]: Message[] };
    groups: Group[];
}
