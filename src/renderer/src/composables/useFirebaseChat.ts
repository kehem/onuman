// src/composables/useFirebaseChat.ts
import { ref, onUnmounted } from 'vue'
import {
    database,
    ref as dbRef,
    push,
    set,
    onValue,
    off,
    serverTimestamp,
    remove,
    query,
    orderByChild,
    limitToLast,
    get
} from '../firebaseConfig'
import type { Ref } from 'vue'

// INTERFACES
export interface Message {
    id: string
    text: string
    senderId: string
    senderName: string
    timestamp: number
    imageURL?: string
    status?: 'sending' | 'sent' | 'delivered' | 'read'
    chatId: string
    replyTo?: string
    originalMessage?: string  // Add this for reply context
    isPinned?: boolean        // Add this for pinned messages

    // FILE PROPERTIES BASED ON GOFILE RESPONSE
    fileURL?: string        // downloadPage
    fileName?: string       // name
    fileSize?: number       // size
    fileId?: string         // id
    mimeType?: string       // mimetype
    directLink?: string
    directFilePath: string
    server?: string
}
export interface User {
    id: string
    name: string
    email?: string
    avatar?: string
    isOnline?: boolean
    lastSeen?: number
}

export interface Chat {
    id: string
    participants: string[]
    lastMessage?: string
    lastMessageTime?: number
    type: 'private' | 'group'
    name?: string
    createdAt?: any
    updatedAt?: any
}

export interface UseFirebaseChatReturn {
    // STATE
    messages: Ref<Message[]>
    users: Ref<User[]>
    chats: Ref<Chat[]>
    isTyping: Ref<boolean>
    connectionStatus: Ref<'connected' | 'disconnected' | 'connecting'>

    // COMPUTED
    currentMessages: (chatId: string) => Message[]

    // METHODS
    initializeChat: (chatId: string) => void
    sendMessage: (chatId: string, message: Partial<Message>) => Promise<string | null>
    deleteMessage: (chatId: string, messageId: string) => Promise<void>
    createChat: (participants: string[], type: 'private' | 'group', name?: string) => Promise<string>
    getUserChats: (userId: string) => Promise<Chat[]>
    setTypingIndicator: (chatId: string, userId: string, isTyping: boolean) => void
    setUserOnlineStatus: (userId: string, isOnline: boolean) => void
    markMessageAsRead: (chatId: string, messageId: string) => Promise<void>
    loadMoreMessages: (chatId: string, lastMessageId?: string) => Promise<Message[]>
    pinMessage: (chatId: string, messageId: string, isPinned?: boolean) => Promise<void>
    cleanup: () => void
}

export function useFirebaseChat(currentUserId: string, orgId?: string | number): UseFirebaseChatReturn {
    // REACTIVE STATE
    const messages = ref<Message[]>([])
    const users = ref<User[]>([])
    const chats = ref<Chat[]>([])
    const isTyping = ref<boolean>(false)
    const connectionStatus = ref<'connected' | 'disconnected' | 'connecting'>('connecting')

    // ORGANIZATION ID - Convert to string for consistency
    const organizationId = orgId?.toString() || 'default'

    // ACTIVE LISTENERS
    const activeListeners = new Map<string, any>()

    // ORGANIZATION-SCOPED REFS
    const usersRef = dbRef(database, `organizations/${organizationId}/users`)
    const chatsRef = dbRef(database, `organizations/${organizationId}/chats`)

    // COMPUTED
    const currentMessages = (chatId: string): Message[] => {
        return messages.value.filter(msg => msg.chatId === chatId)
    }

    // INITIALIZE CHAT LISTENERS
    const initializeChat = (chatId: string) => {
        // CLEANUP PREVIOUS LISTENERS FOR THIS CHAT
        const existingListener = activeListeners.get(`messages-${chatId}`)
        if (existingListener) {
            off(existingListener.ref, existingListener.callback)
        }

        // MESSAGES LISTENER - ORGANIZATION SCOPED
        const messagesQuery = query(
            dbRef(database, `organizations/${organizationId}/chats/${chatId}/messages`),
            orderByChild('timestamp'),
            limitToLast(50)
        )

        const messagesCallback = (snapshot: any) => {
            const data = snapshot.val()
            if (data) {
                const messageList: Message[] = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                    chatId
                })).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))

                // UPDATE MESSAGES ARRAY
                messages.value = messages.value.filter(msg => msg.chatId !== chatId)
                messages.value.push(...messageList)
                messages.value.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
            }
        }

        onValue(messagesQuery, messagesCallback)
        activeListeners.set(`messages-${chatId}`, {
            ref: messagesQuery,
            callback: messagesCallback
        })

        // TYPING INDICATOR LISTENER - ORGANIZATION SCOPED
        const typingRef = dbRef(database, `organizations/${organizationId}/chats/${chatId}/typing`)
        const typingCallback = (snapshot: any) => {
            const typingData = snapshot.val()
            if (typingData) {
                const typingUsers = Object.keys(typingData).filter(
                    userId => userId !== currentUserId && typingData[userId]
                )
                isTyping.value = typingUsers.length > 0
            } else {
                isTyping.value = false
            }
        }

        onValue(typingRef, typingCallback)
        activeListeners.set(`typing-${chatId}`, {
            ref: typingRef,
            callback: typingCallback
        })
    }

    const pinMessage = async (chatId: string, messageId: string, isPinned: boolean = true): Promise<void> => {
        try {
            const messageRef = dbRef(database, `organizations/${organizationId}/chats/${chatId}/messages/${messageId}`)
            const snapshot = await get(messageRef)
            const messageData = snapshot.val()

            if (messageData) {
                await set(messageRef, {
                    ...messageData,
                    isPinned,
                    pinnedAt: isPinned ? serverTimestamp() : null,
                    pinnedBy: isPinned ? currentUserId : null
                })
            }
        } catch (error) {
            console.error('Error pinning message:', error)
            throw error
        }
    }

    // SEND MESSAGE - ORGANIZATION SCOPED
    const sendMessage = async (chatId: string, messageData: Partial<Message>): Promise<string | null> => {
        try {
            connectionStatus.value = 'connecting'

            const newMessage: Partial<Message> = {
                ...messageData,
                senderId: currentUserId,
                timestamp: Date.now(),
                chatId,
                status: 'sending'
            }

            // PUSH MESSAGE TO FIREBASE - ORGANIZATION SCOPED
            const chatMessagesRef = dbRef(database, `organizations/${organizationId}/chats/${chatId}/messages`)
            const newMessageRef = push(chatMessagesRef)

            await set(newMessageRef, {
                ...newMessage,
                timestamp: serverTimestamp(),
                status: 'sent'
            })

            // UPDATE CHAT'S LAST MESSAGE INFO - ORGANIZATION SCOPED
            const chatRef = dbRef(database, `organizations/${organizationId}/chats/${chatId}`)
            const chatSnapshot = await get(chatRef)
            const chatData = chatSnapshot.val()

            // FIX: PROPER LAST MESSAGE HANDLING FOR FILES
            let lastMessageText = ''
            if (messageData.text) {
                lastMessageText = messageData.text
            } else if (messageData.imageURL) {
                lastMessageText = 'Image'
            } else if (messageData.fileURL) {
                lastMessageText = messageData.fileName || 'File' // THIS WAS THE ISSUE
            }

            await set(chatRef, {
                ...chatData,
                lastMessage: lastMessageText,
                lastMessageTime: serverTimestamp(),
                updatedAt: serverTimestamp()
            })

            connectionStatus.value = 'connected'
            return newMessageRef.key

        } catch (error) {
            console.error('Error sending message:', error)
            connectionStatus.value = 'disconnected'
            throw error
        }
    }

    // DELETE MESSAGE - ORGANIZATION SCOPED
    const deleteMessage = async (chatId: string, messageId: string): Promise<void> => {
        try {
            const messageRef = dbRef(database, `organizations/${organizationId}/chats/${chatId}/messages/${messageId}`)
            await remove(messageRef)
        } catch (error) {
            console.error('Error deleting message:', error)
            throw error
        }
    }

    // CREATE NEW CHAT - ORGANIZATION SCOPED
    const createChat = async (participants: string[], type: 'private' | 'group', name?: string): Promise<string> => {
        try {
            // Don't add currentUserId if it's already in participants
            const allParticipants = participants.includes(currentUserId)
                ? participants
                : [...participants, currentUserId];

            const chatData: Partial<Chat> = {
                participants: allParticipants,
                type,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }

            if (type === 'group' && name) {
                chatData.name = name
            }

            // CREATE CHAT UNDER ORGANIZATION
            const newChatRef = push(chatsRef)
            await set(newChatRef, chatData)

            return newChatRef.key || ''
        } catch (error) {
            console.error('Error creating chat:', error)
            throw error
        }
    }

    // GET USER'S CHATS - ORGANIZATION SCOPED
    const getUserChats = async (userId: string): Promise<Chat[]> => {
        try {
            const snapshot = await get(chatsRef)
            const data = snapshot.val()

            if (!data) return []

            const userChats: Chat[] = Object.keys(data)
                .filter(chatId => {
                    const chat = data[chatId]
                    return chat.participants && chat.participants.includes(userId)
                })
                .map(chatId => ({
                    id: chatId,
                    ...data[chatId]
                }))
                .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))

            chats.value = userChats
            return userChats

        } catch (error) {
            console.error('Error getting user chats:', error)
            return []
        }
    }

    // SET TYPING INDICATOR - ORGANIZATION SCOPED
    const setTypingIndicator = (chatId: string, userId: string, isTyping: boolean) => {
        try {
            const userTypingRef = dbRef(database, `organizations/${organizationId}/chats/${chatId}/typing/${userId}`)
            set(userTypingRef, isTyping)
        } catch (error) {
            console.error('Error setting typing indicator:', error)
        }
    }

    // SET USER ONLINE STATUS - ORGANIZATION SCOPED
    const setUserOnlineStatus = (userId: string, isOnline: boolean) => {
        try {
            const userStatusRef = dbRef(database, `organizations/${organizationId}/users/${userId}`)
            set(userStatusRef, {
                id: userId,
                isOnline,
                lastSeen: serverTimestamp()
            })
        } catch (error) {
            console.error('Error setting user status:', error)
        }
    }

    // MARK MESSAGE AS READ - ORGANIZATION SCOPED
    const markMessageAsRead = async (chatId: string, messageId: string): Promise<void> => {
        try {
            const messageRef = dbRef(database, `organizations/${organizationId}/chats/${chatId}/messages/${messageId}`)
            const snapshot = await get(messageRef)
            const messageData = snapshot.val()

            if (messageData && messageData.senderId !== currentUserId) {
                await set(messageRef, {
                    ...messageData,
                    status: 'read',
                    readAt: serverTimestamp(),
                    readBy: {
                        ...messageData.readBy,
                        [currentUserId]: serverTimestamp()
                    }
                })
            }
        } catch (error) {
            console.error('Error marking message as read:', error)
        }
    }

    // LOAD MORE MESSAGES (PAGINATION) - ORGANIZATION SCOPED
    const loadMoreMessages = async (chatId: string, lastMessageId?: string): Promise<Message[]> => {
        try {
            let messagesQuery

            if (lastMessageId) {
                // LOAD MESSAGES BEFORE THE LAST MESSAGE ID
                messagesQuery = query(
                    dbRef(database, `organizations/${organizationId}/chats/${chatId}/messages`),
                    orderByChild('timestamp'),
                    limitToLast(20)
                )
            } else {
                messagesQuery = query(
                    dbRef(database, `organizations/${organizationId}/chats/${chatId}/messages`),
                    orderByChild('timestamp'),
                    limitToLast(20)
                )
            }

            const snapshot = await get(messagesQuery)
            const data = snapshot.val()

            if (data) {
                const messageList: Message[] = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                    chatId
                })).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))

                return messageList
            }

            return []
        } catch (error) {
            console.error('Error loading more messages:', error)
            return []
        }
    }

    // INITIALIZE GLOBAL LISTENERS - ORGANIZATION SCOPED
    const initializeGlobalListeners = () => {
        console.log(`🔄 Initializing Firebase for Organization: ${organizationId}`)
        console.log('🔄 Database URL:', database.app.options.databaseURL)

        // USERS LISTENER - ORGANIZATION SCOPED
        const usersCallback = (snapshot: any) => {
            const data = snapshot.val()
            if (data) {
                const userList: User[] = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }))
                users.value = userList.filter(user => user.id !== currentUserId)
            }
        }

        onValue(usersRef, usersCallback)
        activeListeners.set('users', {
            ref: usersRef,
            callback: usersCallback
        })

        // CONNECTION STATUS
        const connectedRef = dbRef(database, '.info/connected')
        const connectionCallback = (snapshot: any) => {
            console.log('Firebase connection status:', snapshot.val())
            if (snapshot.val() === true) {
                connectionStatus.value = 'connected'
            } else {
                connectionStatus.value = 'disconnected'
            }
        }

        onValue(connectedRef, connectionCallback)

        activeListeners.set('connection', {
            ref: connectedRef,
            callback: connectionCallback
        })
    }

    // CLEANUP FUNCTION
    const cleanup = () => {
        // REMOVE ALL ACTIVE LISTENERS
        activeListeners.forEach((listener, _key) => {
            if (listener.ref && listener.callback) {
                off(listener.ref, listener.callback)
            }
        })
        activeListeners.clear()

        // CLEAR STATE
        messages.value = []
        users.value = []
        chats.value = []
        isTyping.value = false
    }

    // AUTO-INITIALIZE GLOBAL LISTENERS
    initializeGlobalListeners()

    // CLEANUP ON UNMOUNT
    onUnmounted(() => {
        cleanup()
    })

    return {
        // STATE
        messages,
        users,
        chats,
        isTyping,
        connectionStatus,
        pinMessage,

        // COMPUTED
        currentMessages,

        // METHODS
        initializeChat,
        sendMessage,
        deleteMessage,
        createChat,
        getUserChats,
        setTypingIndicator,
        setUserOnlineStatus,
        markMessageAsRead,
        loadMoreMessages,
        cleanup,
    }
}