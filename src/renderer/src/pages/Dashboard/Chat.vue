<!-- pages/Dashboard/Chat.vue -->

<template>
  <!-- ====================================== -->
  <!-- MAIN LAYOUT WRAPPER -->
  <!-- ====================================== -->
  <DefaultLayouts class="d-block relative">
    <section class="f-center h-100">
      <div class="main-screen w-95">
        <br>

        <!-- ================================== -->
        <!-- CONNECTION STATUS INDICATOR -->
        <!-- ================================== -->
        <div v-if="connectionStatus !== 'connected'" class="connection-status" :class="connectionStatus">
          <i class="m-wifi" v-if="connectionStatus === 'connecting'"></i>
          <i class="m-wifi-off" v-else></i>
          {{ connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected' }}
        </div>

        <!-- ================================== -->
        <!-- MAIN CHAT CONTAINER -->
        <!-- ================================== -->
        <section class="chat">

          <!-- ============================== -->
          <!-- LEFT SIDEBAR - CHAT LIST -->
          <!-- ============================== -->
          <aside class="left-column">

            <!-- SEARCH INPUT SECTION -->
            <div v-if="isLoading || isLoadingMessages" class="skeleton-loader skeleton-search"></div>
            <div v-else class="search-container">
              <input type="text" placeholder="Search chats..." class="onuman-input3 asd23-asgertjuyt" name="chat-search"
                id="chat-search" v-model="searchText">
            </div>
            <hr>

            <!-- LOADING SKELETON FOR CHAT LIST -->
            <div v-if="isLoading || isLoadingMessages" class="list">
              <div v-for="index in filteredUsers.length + 1" :key="'skeleton-' + index" class="skeleton-chat-item">
                <div class="skeleton-loader skeleton-avatar"></div>
                <div class="skeleton-text">
                  <div class="skeleton-loader skeleton-name"></div>
                  <div class="skeleton-loader skeleton-message"></div>
                </div>
              </div>
            </div>

            <!-- ACTUAL CHAT LIST -->
            <ul v-else class="list onuman-insider-scrollbar">

              <!-- GROUP CHAT ITEM -->
              <li class="item group" :class="{ active: selectedChat === 'group' }" @click="selectChat('group')">
                <div class="chat-avatar">
                  <i class="m-group2"></i>
                </div>
                <div class="chat-info">
                  <h4>{{ org?.companyName }}</h4>
                  <p class="last-message text-dotted-1">{{ getLastMessage('group') }}</p>
                </div>
                <div class="chat-meta">
                  <span class="time">{{ getLastMessageTime('group') }}</span>
                  <span v-if="getUnreadCount('group') > 0" class="unread-badge">
                    {{ getUnreadCount('group') }}
                  </span>
                </div>
              </li>

              <!-- INDIVIDUAL USER CHAT ITEMS -->
              <li v-for="user in filteredUsers" :key="user.id" class="item"
                :class="{ active: selectedChat === user.id }" @click="selectChat(user.id)">
                <div class="chat-avatar">
                  <img :src="user.photo || '../../assets/images/Onuman-logo.svg'" :alt="user.name">
                  <span class="online-indicator" :class="{ online: user.isOnline }"></span>
                </div>
                <div class="chat-info">
                  <h4>{{ user.name }}</h4>
                  <p class="last-message text-dotted-1">{{ getLastMessageForUser(user.id) }}</p>
                </div>
                <div class="chat-meta">
                  <span class="time">{{ getLastMessageTimeForUser(user.id) }}</span>
                  <span v-if="getUnreadCount(user.id) > 0" class="unread-badge">
                    {{ getUnreadCount(user.id) }}
                  </span>
                </div>
              </li>

            </ul>
          </aside>

          <!-- ============================== -->
          <!-- RIGHT COLUMN - MAIN CHAT AREA -->
          <!-- ============================== -->
          <aside class="right-column">

            <!-- ========================== -->
            <!-- CHAT HEADER -->
            <!-- ========================== -->
            <div class="selected-person">

              <!-- LOADING SKELETON FOR HEADER -->
              <div v-if="isLoading" class="skeleton-header">
                <div class="skeleton-loader skeleton-header-avatar"></div>
                <div class="skeleton-loader skeleton-header-name"></div>
              </div>

              <!-- ACTUAL HEADER CONTENT -->
              <span v-else class="navigator-chat">
                <img v-if="selectedChat === 'group'" src="../../assets/images/Onuman-logo.svg" alt="Group">
                <img v-else :src="getCurrentChatAvatar()" :alt="currentChatName" :title="currentChatName">
                <div class="chat-header-info">
                  <p class="chat-name">{{ currentChatName }}</p>
                  <p v-if="isTyping" class="typing-status">
                    Typing <img src="../../assets/SVGs/sending.svg" alt="">
                  </p>
                  <p v-else-if="selectedChat !== 'group'" class="online-status">
                    {{ getChatOnlineStatus() }}
                  </p>
                  <p v-else class="low-char-text">All members</p>
                </div>
              </span>

              <!-- HEADER ACTION MENU -->
              <div class="header-actions">
                <div class="modalBox-Action customized-get-chat">
                  <i class="m-dots-three-vertical dasun-isama" @click="toggleModal('header-modal')"></i>

                  <!-- HEADER DROPDOWN MODAL -->
                  <ul class="modalBox" v-if="isModalVisible('header-modal')">
                    <li @click="viewChatMedia">
                      <i class="m-image"></i> Media
                    </li>
                    <li @click="clearChat" class="danger">
                      <i class="m-trash1"></i> Clear Chats
                    </li>
                  </ul>
                </div>
              </div>


              <!-- =================== -->
              <!-- PINNED MESSAGE BANNER -->
              <!-- =================== -->
              <div class="pinned-message" v-if="currentPinnedMessage">
                <div class="pinned-content">
                  <div class="pinned-header">
                    <i class="m-pin5"></i>
                    <span class="pinned-label">Pinned Message</span>
                  </div>

                  <div class="pinned-body">
                    <div class="pinned-sender">{{ currentPinnedMessage.senderName }}</div>

                    <!-- PINNED TEXT MESSAGE -->
                    <div v-if="currentPinnedMessage.text" class="pinned-text">
                      {{ currentPinnedMessage.text }}
                    </div>

                    <!-- PINNED IMAGE MESSAGE -->
                    <div v-if="currentPinnedMessage.imageURL" class="pinned-image">
                      <i class="m-image"></i>
                      <span>Image</span>
                    </div>

                    <!-- PINNED REPLY CONTEXT -->
                    <div v-if="currentPinnedMessage.replyTo" class="pinned-reply-context">
                      <i class="m-share6"></i>
                      <span>Reply to {{ getOriginalMessageSender(currentPinnedMessage.replyTo) }}</span>
                    </div>
                  </div>
                </div>

                <span @click="unpinMessage" class="cancel-reply" title="Unpin message">
                  <i class="m-cross1"></i>
                </span>
              </div>
            </div>

            <!-- ========================== -->
            <!-- CHAT MESSAGES CONTAINER -->
            <!-- ========================== -->
            <main class="main-chat-body" ref="chatContainer">

              <!-- LOADING SKELETON FOR MESSAGES -->
              <div v-if="isLoading || isLoadingMessages" style="width: 100%;">
                <div v-for="index in 4" :key="'msg-skeleton-' + index" class="skeleton-message-container"
                  :class="index % 2 === 0 ? 'received' : 'sent'">
                  <div class="skeleton-message-bubble skeleton-loader" :class="index % 2 === 0 ? 'received' : 'sent'">
                    <div class="skeleton-message-text"></div>
                    <div class="skeleton-message-text"></div>
                  </div>
                </div>
              </div>

              <!-- NO CHAT SELECTED STATE -->
              <div v-else-if="!selectedChat" class="no-chat-selected">
                <p>Select a chat to start messaging</p>
              </div>

              <!-- ACTUAL MESSAGES SECTION -->
              <section v-else class="chat-mode onuman-insider-scrollbar">

                <!-- =================== -->
                <!-- LOAD MORE MESSAGES INDICATOR -->
                <!-- =================== -->
                <div v-if="isLoadingPrevious" class="loading-previous">
                  <div v-for="index in 3" :key="'prev-skeleton-' + index" class="skeleton-message-container received">
                    <div class="skeleton-message-bubble skeleton-loader received">
                      <div class="skeleton-message-text"></div>
                    </div>
                  </div>
                </div>

                <!-- NO MESSAGES STATE -->
                <div v-if="displayedMessages.length === 0" class="no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>

                <!-- =================== -->
                <!-- MESSAGE LIST -->
                <!-- =================== -->
                <template v-for="message in displayedMessages" :key="message.id">

                  <!-- =============== -->
                  <!-- RECEIVED MESSAGE -->
                  <!-- =============== -->
                  <aside v-if="message.senderId !== currentUserId"
                    style="position: relative; width: 100%; display: flex; justify-content: flex-start;">
                    <section class="get-chat" :class="{ 'add-margin-top': isMessageReplay(message) }">

                      <!-- SENDER PROFILE IMAGE -->
                      <span class="profile">
                        <img class="prof" :src="getUserPhoto(message.senderId) ?? '../../assets/images/Onuman-logo.svg'"
                          :alt="message.senderName">
                      </span>

                      <!-- MESSAGE CONTENT WRAPPER -->
                      <div class="message-wrapper">

                        <!-- REPLY CONTEXT -->
                        <span v-if="message.replyTo" class="message-reply-context">
                          Replying to {{ getOriginalMessageSender(message.replyTo) }}
                          <p class="text-dotted-1">{{ message.originalMessage || 'Message not found' }}</p>
                        </span>

                        <!-- MESSAGE CONTENT -->
                        <div class="message-content">
                          <p v-if="message.text" class="message">{{ message.text }}</p>
                          <img v-if="message.imageURL" :src="message.imageURL" alt="Shared image"
                            class="shared-image" />

                          <!-- ADD FILE DISPLAY -->
                          <div v-if="message.fileURL" class="shared-file" @click="openFile(message.fileURL)">
                            <div class="file-icon">
                              <i class="m-attachment"></i>
                            </div>
                            <div class="file-info">
                              <p class="file-name">{{ message.fileName }}</p>
                              <p class="file-size">{{ formatFileSize(message.fileSize) }}</p>
                            </div>
                            <div class="download-icon">
                              <i class="m-download"></i>
                            </div>
                          </div>
                        </div>

                        <!-- MESSAGE TIMESTAMP -->
                        <p class="message-time">
                          {{ formatTimestamp(message.timestamp) }}
                        </p>

                      </div>

                      <!-- MESSAGE ACTIONS DROPDOWN -->
                      <div class="modalBox-Action customized-get-chat">
                        <i class="m-dots-three-vertical dasun-isama" @click="toggleModal('msg-' + message.id)"></i>
                        <ul class="modalBox" v-if="isModalVisible('msg-' + message.id)">
                          <li @click="replyToMessage(message)" class="reply">
                            <i class="m-share6"></i> Reply
                          </li>
                          <li @click="pinToMessage(message)" class="pinup">
                            <i class="m-pin5"></i> Pin
                          </li>
                          <li @click="deleteMessage(message.id)" class="del">
                            <i class="m-trash1"></i> Delete
                          </li>
                        </ul>
                      </div>

                    </section>
                  </aside>

                  <!-- =============== -->
                  <!-- SENT MESSAGE -->
                  <!-- =============== -->
                  <aside v-else style="position: relative; width: 100%; display: flex; justify-content: flex-end;">

                    <section class="my-chat" :class="{ 'add-margin-top': isMessageReplay(message) }">

                      <!-- MESSAGE ACTIONS DROPDOWN -->
                      <div class="modalBox-Action customized-my-chat">
                        <i class="m-dots-three-vertical dasun-isama" @click="toggleModal('my-msg-' + message.id)"></i>
                        <ul class="modalBox" v-if="isModalVisible('my-msg-' + message.id)">
                          <li @click="replyToMessage(message)" class="reply">
                            <i class="m-share6"></i> Reply
                          </li>
                          <li @click="pinToMessage(message)" class="pinup">
                            <i class="m-pin5"></i> Pin
                          </li>
                          <li @click="deleteMessage(message.id)" class="del">
                            <i class="m-trash1"></i> Delete
                          </li>
                        </ul>
                      </div>

                      <!-- MESSAGE CONTENT WRAPPER -->
                      <div class="message-wrapper">

                        <!-- REPLY CONTEXT -->
                        <span v-if="message.replyTo" class="message-reply-context">
                          Replying to {{ getOriginalMessageSender(message.replyTo) }}
                          <p class="text-dotted-1">{{ message.originalMessage || 'Message not found' }}</p>
                        </span>

                        <!-- MESSAGE CONTENT -->
                        <div class="message-content">
                          <p v-if="message.text" class="message">{{ message.text }}</p>
                          <img v-if="message.imageURL" :src="message.imageURL" alt="Shared image"
                            class="shared-image" />

                          <!-- ADD FILE DISPLAY -->
                          <div v-if="message.fileURL" class="shared-file" @click="openFile(message.directLink)">
                            <div class="file-icon">
                              <i class="m-attachment"></i>
                            </div>
                            <div class="file-info">
                              <p class="file-name">{{ message.fileName }}</p>
                              <p class="file-size">{{ formatFileSize(message.fileSize) }}</p>
                            </div>
                            <div class="download-icon">
                              <i class="m-download"></i>
                            </div>
                          </div>
                        </div>

                        <!-- MESSAGE TIMESTAMP -->
                        <p class="message-time">
                          {{ formatTimestamp(message.timestamp) }}
                        </p>

                      </div>

                      <!-- SENDER PROFILE IMAGE -->
                      <span class="profile">
                        <img class="prof" :src="currentUser?.photo || '../../assets/images/Onuman-logo.svg'"
                          :alt="currentUserName">

                        <!-- MESSAGE STATUS INDICATOR -->
                        <span class="message-status">
                          <img class="sending" v-if="message.status === 'sending'"
                            src="../../assets/images/Onuman-logo.svg" alt="">
                          <p v-else-if="message.status === 'sent'">sent</p>
                          <p v-else-if="message.status === 'delivered'">delivered</p>
                          <p v-else-if="message.status === 'read'">read</p>
                        </span>
                      </span>

                    </section>
                  </aside>

                </template>
              </section>

            </main>

            <!-- ========================== -->
            <!-- MESSAGE INPUT AREA -->
            <!-- ========================== -->
            <div class="editor-box">

              <!-- =================== -->
              <!-- REPLY PREVIEW -->
              <!-- =================== -->
              <div v-if="replyingTo" class="reply-preview">
                <span @click="cancelReply" class="cancel-reply">
                  <i class="m-cross1"></i>
                </span>
                <div class="reply-content">
                  <p class="reply-to">Replying to <strong>{{ replyingTo.senderName }}</strong></p>
                  <p class="reply-message text-dotted-2">{{ replyingTo.text }}</p>
                </div>
              </div>

              <!-- =================== -->
              <!-- FILE UPLOAD PREVIEW -->
              <!-- =================== -->
              <div class="attached-files">
                <!-- UPLOADING INDICATOR -->
                <div v-if="isUploading || isGofileUploading" class="uploading-indicator">
                  <div class="uploading-spinner"></div>
                  <span>{{ isGofileUploading ? 'Uploading file...' : 'Uploading...' }}</span>
                </div>

                <!-- IMAGE PREVIEW (Keep existing) -->
                <span class="isImage" v-if="imageURL">
                  <img :src="imageURL" alt="Preview">
                  <i class="m-cross1" @click="removeImage"></i>
                </span>

                <!-- FILE PREVIEW (Update this) -->
                <span class="isFile" v-if="gofileData">
                  <div class="fileShortcut">{{ getFileExtension(gofileData.fileName) }}</div>
                  <span class="file-name">{{ gofileData.fileName }}</span>
                  <span class="file-size">{{ formatFileSize(gofileData.fileSize) }}</span>
                  <i class="m-cross1" @click="removeGofile"></i>
                </span>
              </div>

              <!-- =================== -->
              <!-- INPUT CONTROLS -->
              <!-- =================== -->
              <div class="text-edit">

                <!-- ATTACHMENT BUTTONS -->
                <span class="attachments">

                  <!-- IMAGE UPLOAD -->
                  <div class="file">
                    <i class="m-image"></i>
                    <input type="file" class="file-input" accept="image/*" @change="handleFileChange" ref="fileInput">
                  </div>

                  <!-- FILE UPLOAD -->
                  <div class="file">
                    <i class="m-attachment"></i>
                    <input type="file" class="file-input" @change="handleGofileChange" ref="gofileInput"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar">
                  </div>

                </span>

                <!-- TEXT INPUT AREA -->
                <textarea name="text-edit" id="text-edit" class="onuman-input2" v-model="textResponse"
                  @input="handleTextInput" @keydown.enter.exact.prevent="sendMessage"
                  @keydown.shift.enter.prevent="addNewLine"
                  placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                  :disabled="!selectedChat"></textarea>

                <!-- SEND BUTTON -->
                <div class="chatbox-submit">
                  <i v-if="isSending" class="m-loading spinning"></i>
                  <input v-else type="submit" @click="sendMessage" :disabled="!canSendMessage || isSending"
                    class="onuman-input2">
                </div>

              </div>
            </div>

          </aside>
        </section>
      </div>
    </section>

    <!-- ================================== -->
    <!-- CONTEXT MENU -->
    <!-- ================================== -->
    <!-- <div v-if="contextMenu.show" class="context-menu" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click.stop> -->
    <!-- IMAGE CONTEXT MENU -->
    <!-- <template v-if="contextMenu.type === 'image'">
        <div class="context-menu-item" @click="previewImage">
          <i class="m-eye"></i>
          <span>Preview</span>
        </div>
        <div class="context-menu-item" @click="downloadImage">
          <i class="m-download"></i>
          <span>Download</span>
        </div>
        <div class="context-menu-item" @click="openImageInBrowser">
          <i class="m-external-link"></i>
          <span>Open in Browser</span>
        </div>
      </template> -->

    <!-- FILE CONTEXT MENU -->
    <!-- <template v-if="contextMenu.type === 'file'">
        <div class="context-menu-item" @click="previewFile">
          <i class="m-eye"></i>
          <span>Preview</span>
        </div>
        <div class="context-menu-item" @click="downloadFile">
          <i class="m-download"></i>
          <span>Download</span>
        </div>
        <div class="context-menu-item" @click="openFileInBrowser">
          <i class="m-external-link"></i>
          <span>Open in Browser</span>
        </div>
      </template>
    </div> -->

    <!-- ================================== -->
    <!-- BOTTOM BAR COMPONENT -->
    <!-- ================================== -->
    <BottomBar />

  </DefaultLayouts>
</template>

<script setup lang="ts">
// =================================
// IMPORTS AND DEPENDENCIES
// =================================
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useToast } from '../../composables/Toast'
import { useFirebaseChat } from '../../composables/useFirebaseChat'
import DefaultLayouts from '../../layouts/DefaultLayouts.vue'
import BottomBar from '../../components/Dashboard/BottomBar.vue'
import type { Message } from '../../composables/useFirebaseChat'
import { useApi } from '../../composables/useApi'
import { useGofileUploader } from '../../composables/useGofileUploader'
import { useImgBBUploader } from '../../composables/useImgBBUploader'

// =================================
// TYPE DEFINITIONS AND INTERFACES
// =================================
interface UserList {
  name: string
  serialId: string
  photo: string | null
  active: boolean
}

interface User {
  id: string
  name: string
  photo: string | null
  isOnline: boolean
  lastSeen?: number
}

interface CompanyInfo {
  id: number
  companyName: string
  Logo: string | null
  country: string
  state: string
  city: string
  addressLine: string
  zipCode: string
  tradeLicense: string
  phoneNumber: string
  emailAddress: string
  created_at: string // ISO DATE STRING
  license_key: number
}

// =================================
// COMPOSABLES INITIALIZATION
// =================================
const { get } = useApi()
const { showToast } = useToast()
const { handleFileChange, isUploading, imageURL, reset } = useImgBBUploader()
const {
  handleFileChange: handleGofileChange,
  isUploading: isGofileUploading,
  fileData: gofileData,
  reset: resetGofile,
} = useGofileUploader()

// ADD THIS REF FOR GOFILE INPUT
const gofileInput = ref<HTMLInputElement | null>(null)

// UPDATE YOUR removeImage FUNCTION AND ADD removeGofile
const removeImage = () => {
  reset()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeGofile = () => {
  resetGofile()
  if (gofileInput.value) {
    gofileInput.value.value = ''
  }
}

// UPDATE YOUR canSendMessage COMPUTED
const canSendMessage = computed(() => {
  return (textResponse.value.trim() || imageURL.value || gofileData.value) && selectedChat.value && !isSending.value
})

// UPDATE YOUR clearChatState FUNCTION
const clearChatState = () => {
  textResponse.value = ''
  reset() // RESET IMAGE UPLOADER
  resetGofile() // RESET GOFILE UPLOADER
  replyingTo.value = null

  // RESET TEXTAREA HEIGHT
  const textarea = document.getElementById('text-edit') as HTMLTextAreaElement
  if (textarea) {
    textarea.style.height = 'auto'
  }
}
// ADD THESE UTILITY FUNCTIONS TO YOUR SCRIPT

const getFileExtension = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toUpperCase()

  // RETURN APPROPRIATE SHORTCODE
  switch (extension) {
    case 'PDF': return 'PDF'
    case 'DOC':
    case 'DOCX': return 'DOC'
    case 'XLS':
    case 'XLSX': return 'XLS'
    case 'PPT':
    case 'PPTX': return 'PPT'
    case 'ZIP':
    case 'RAR': return 'ZIP'
    case 'TXT': return 'TXT'
    case 'JSON': return 'JSON'
    default: return extension || 'FILE'
  }
}

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const openFile = (fileURL: string) => {
  window.open(fileURL, '_blank')
}

const fileInput = ref<HTMLInputElement | null>(null)

// =================================
// REACTIVE STATE VARIABLES
// =================================

// USER AND AUTHENTICATION STATE
const currentUserId = ref<string>('')
const currentUserName = ref<string>('')
const currentUser = ref<UserList | null>(null)

// USERS AND ORGANIZATION DATA
const userList = ref<UserList[]>([])
const org = ref<CompanyInfo | null>(null)
const otherUsers = ref<User[]>([])

// FIREBASE CHAT COMPOSABLE
const firebaseChatComposable = ref<any>(null)

// COMPONENT UI STATE
const isLoading = ref(true)
const isSending = ref(false)
const isLoadingPrevious = ref(false)
const isLoadingMessages = ref(false)
const hasMoreMessages = ref(true)

// MODAL AND UI INTERACTIONS
const activeModals = ref<Set<string>>(new Set())

// INPUT AND MESSAGING STATE
const textResponse = ref<string>('')
const searchText = ref<string>('')
const selectedChat = ref<string>('')
const replyingTo = ref<Message | null>(null)

// DOM REFERENCES
const chatContainer = ref<HTMLElement | null>(null)

// TIMER REFERENCES
const typingTimeout = ref<NodeJS.Timeout | null>(null)

// PINNED MESSAGES STATE
const currentPinnedMessage = ref<Message | null>(null)

// =================================
// COMPUTED PROPERTIES
// =================================

// CHAT MESSAGES COMPUTED PROPERTIES
const displayedMessages = computed(() => {
  console.log(selectedChat.value)
  if (!firebaseChatComposable.value || !selectedChat.value) return []

  let chatId = selectedChat.value

  // FOR PRIVATE CHATS, CONSTRUCT THE PROPER FIREBASE CHAT ID
  if (selectedChat.value !== 'group') {
    const sortedIds = [selectedChat.value, currentUserId.value].sort()
    chatId = `${sortedIds[0]}_${sortedIds[1]}`
  }

  const messages = firebaseChatComposable.value.currentMessages(chatId) || []
  console.log(`Displaying ${messages.length} messages for chat: ${selectedChat.value} (Firebase ID: ${chatId})`)
  return messages
})

// PINNED MESSAGES COMPUTED PROPERTIES
const pinnedMessages = computed(() => {
  if (!firebaseChatComposable.value || !selectedChat.value) return []

  let chatId = selectedChat.value
  if (selectedChat.value !== 'group') {
    const sortedIds = [selectedChat.value, currentUserId.value].sort()
    chatId = `${sortedIds[0]}_${sortedIds[1]}`
  }

  const messages = firebaseChatComposable.value.currentMessages(chatId) || []
  return messages.filter((msg: Message) => msg.isPinned)
})

// UI COMPUTED PROPERTIES
const currentChatName = computed(() => {
  if (selectedChat.value === 'group') {
    return org?.value?.companyName + ' Group Chat'
  }
  const user = otherUsers.value.find(u => u.id === selectedChat.value)
  return user?.name || 'Unknown'
})

const filteredUsers = computed(() => {
  if (!searchText.value) return otherUsers.value
  return otherUsers.value.filter(user =>
    user.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

const isMessageReplay = computed(() => (message: Message) => {
  return !!message.replyTo
})

// CONNECTION STATUS COMPUTED PROPERTIES
const connectionStatus = computed(() => {
  return firebaseChatComposable.value?.connectionStatus || 'disconnected'
})

const isTyping = computed(() => {
  return firebaseChatComposable.value?.isTyping || false
})

// =================================
// WATCHERS
// =================================

// STOP LOADING WHEN MESSAGES ARE RECEIVED
watch(displayedMessages, (newMessages) => {
  if (newMessages.length > 0 && isLoadingMessages.value) {
    // SMALL DELAY TO PREVENT FLICKERING
    setTimeout(() => {
      isLoadingMessages.value = false
    }, 300)
  }
}, { deep: true })

// HANDLE PINNED MESSAGES UPDATES
watch(pinnedMessages, (newPinnedMessages) => {
  if (newPinnedMessages.length > 0) {
    currentPinnedMessage.value = newPinnedMessages[newPinnedMessages.length - 1]
  } else {
    currentPinnedMessage.value = null
  }
}, { deep: true, immediate: true })

// AUTO SCROLL ON CHAT SELECTION
watch(selectedChat, () => {
  scrollToBottom()
})

// AUTO SCROLL ON NEW MESSAGES
watch(displayedMessages, () => {
  scrollToBottom()
}, { deep: true })

// =================================
// UTILITY METHODS
// =================================

// USER AVATAR AND STATUS UTILITIES
const getUserPhoto = (userId: string): string => {
  if (!userId || userId.trim() === '') {
    return '../../assets/images/Onuman-logo.svg'
  }

  if (userId === currentUserId.value) {
    const photo = currentUser.value?.photo
    return photo || '../../assets/images/Onuman-logo.svg'
  }

  const user = otherUsers.value.find(u => u.id === userId)
  return user?.photo || '../../assets/images/Onuman-logo.svg'
}

const getCurrentChatAvatar = (): string => {
  if (selectedChat.value === 'group') {
    return '../../assets/images/Onuman-logo.svg'
  }
  const user = otherUsers.value.find(u => u.id === selectedChat.value)
  return user?.photo || '../../assets/images/Onuman-logo.svg'
}

const getChatOnlineStatus = (): string => {
  if (selectedChat.value === 'group') return 'Group Chat'

  const user = otherUsers.value.find(u => u.id === selectedChat.value)
  if (!user) return 'Unknown'

  if (user.isOnline) {
    return 'Online'
  } else {
    if (user.lastSeen) {
      const lastSeenTime = formatLastSeen(user.lastSeen)
      return `Last seen ${lastSeenTime}`
    }
    return 'Offline'
  }
}

// TIME FORMATTING UTILITIES
const formatLastSeen = (timestamp: number): string => {
  const now = new Date()
  const lastSeen = new Date(timestamp)
  const diffMs = now.getTime() - lastSeen.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) {
    return 'just now'
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else {
    return lastSeen.toLocaleDateString()
  }
}

const formatTimestamp = (timestamp: number): string => {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (messageDate.getTime() === today.getTime()) {
    return timeStr
  } else if (messageDate.getTime() === today.getTime() - 86400000) {
    return `Yesterday ${timeStr}`
  } else {
    return `${date.toLocaleDateString()} ${timeStr}`
  }
}

const formatChatTime = (timestamp: number | undefined): string => {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffHours / 24

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60))
    return diffMins < 1 ? 'now' : `${diffMins}m`
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)}h`
  } else if (diffDays < 7) {
    return `${Math.floor(diffDays)}d`
  } else {
    return date.toLocaleDateString()
  }
}

// =================================
// CHAT MESSAGE HELPER METHODS
// =================================

const getLastMessage = (chatId: string): string => {
  if (!firebaseChatComposable.value) return 'No messages yet'

  let firebaseChatId = chatId
  if (chatId !== 'group') {
    const sortedIds = [chatId, currentUserId.value].sort()
    firebaseChatId = `${sortedIds[0]}_${sortedIds[1]}`
  }

  const chatMessages = firebaseChatComposable.value.currentMessages(firebaseChatId) || []
  if (chatMessages.length === 0) return 'No messages yet'

  const lastMessage = chatMessages[chatMessages.length - 1]
  if (lastMessage.imageURL && !lastMessage.text) return '📷 Image'
  return lastMessage.text || '📷 Image'
}

const getLastMessageTime = (chatId: string): string => {
  if (!firebaseChatComposable.value) return ''

  let firebaseChatId = chatId
  if (chatId !== 'group') {
    const sortedIds = [chatId, currentUserId.value].sort()
    firebaseChatId = `${sortedIds[0]}_${sortedIds[1]}`
  }

  const chatMessages = firebaseChatComposable.value.currentMessages(firebaseChatId) || []
  if (chatMessages.length === 0) return ''

  const lastMessage = chatMessages[chatMessages.length - 1]
  return formatChatTime(lastMessage.timestamp)
}

const getUnreadCount = (chatId: string): number => {
  if (!firebaseChatComposable.value) return 0

  let firebaseChatId = chatId
  if (chatId !== 'group') {
    const sortedIds = [chatId, currentUserId.value].sort()
    firebaseChatId = `${sortedIds[0]}_${sortedIds[1]}`
  }

  const messages = firebaseChatComposable.value.currentMessages(firebaseChatId) || []
  return messages.filter((msg: Message) =>
    msg.senderId !== currentUserId.value && msg.status !== 'read'
  ).length
}

const getOriginalMessageSender = (messageId: string): string => {
  const originalMsg = displayedMessages.value.find((msg: Message) => msg.id === messageId)
  return originalMsg?.senderName || 'Unknown'
}

const getLastMessageForUser = (userId: string): string => {
  return getLastMessage(userId)
}

const getLastMessageTimeForUser = (userId: string): string => {
  return getLastMessageTime(userId)
}

// =================================
// UI INTERACTION METHODS
// =================================

const scrollToBottom = (force = false) => {
  nextTick(() => {
    if (chatContainer.value) {
      // Check if user is near bottom before auto-scrolling
      const container = chatContainer.value
      const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100

      // Only auto-scroll if user is near bottom or forced
      if (force || isNearBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        })
      }
    }
  })
}

// Watch selected chat and force scroll to bottom
watch(selectedChat, (newChat, oldChat) => {
  if (newChat && newChat !== oldChat) {
    setTimeout(() => {
      scrollToBottom(true)
    }, 1000)
  }
})


const handleScroll = async () => {
  if (!chatContainer.value || isLoadingPrevious.value || !hasMoreMessages.value) return

  const { scrollTop } = chatContainer.value

  if (scrollTop <= 10) {
    await loadPreviousMessages()
  }
}


// INPUT HANDLING METHODS
const handleTextInput = (e: Event) => {
  autoResize(e)
  handleTyping()
}

const autoResize = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  target.style.height = 'auto'
  const maxHeight = 120
  target.style.height = Math.min(target.scrollHeight, maxHeight) + 'px'
}

const addNewLine = () => {
  textResponse.value += '\n'
  nextTick(() => {
    const textarea = document.getElementById('text-edit') as HTMLTextAreaElement
    if (textarea) {
      autoResize({ target: textarea } as any)
    }
  })
}

// =================================
// MODAL MANAGEMENT METHODS
// =================================

const toggleModal = (modalId: string) => {
  if (activeModals.value.has(modalId)) {
    activeModals.value.delete(modalId)
  } else {
    activeModals.value.clear()
    activeModals.value.add(modalId)
  }
}

const isModalVisible = (modalId: string): boolean => {
  return activeModals.value.has(modalId)
}

const closeAllModals = () => {
  activeModals.value.clear()
}

const handleOutsideClick = (event: Event) => {
  const target = event.target as HTMLElement

  if (target.closest('.modalBox-Action') || target.closest('.modalBox') ||
    target.closest('.modal-content') || target.closest('.header-action-btn')) {
    return
  }

  if (activeModals.value.size > 0) {
    closeAllModals()
  }
}


// =================================
// TYPING INDICATOR METHODS
// =================================

const handleTyping = () => {
  if (!selectedChat.value || !firebaseChatComposable.value) return

  firebaseChatComposable.value.setTypingIndicator(selectedChat.value, currentUserId.value, true)

  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }

  typingTimeout.value = setTimeout(() => {
    clearTypingIndicator()
  }, 1000)
}

const clearTypingIndicator = () => {
  if (!selectedChat.value || !firebaseChatComposable.value) return
  firebaseChatComposable.value.setTypingIndicator(selectedChat.value, currentUserId.value, false)
}

// =================================
// DATA INITIALIZATION METHODS
// =================================

const initializeUserData = async () => {
  try {
    console.log('Initializing user data...')
    const response = await get('/api/get_all_employees')
    userList.value = response[1].users
    org.value = response[0] // ORGANIZATION DATA

    // FIND CURRENT USER (ACTIVE: TRUE)
    currentUser.value = userList.value.find(user => user.active === true) || null

    if (currentUser.value) {
      currentUserId.value = currentUser.value.serialId
      currentUserName.value = currentUser.value.name

      console.log('Initializing Firebase chat with user ID:', currentUser.value.serialId)
      console.log('Organization ID:', org.value?.id)

      // INITIALIZE FIREBASE CHAT WITH ORGANIZATION ID
      firebaseChatComposable.value = useFirebaseChat(currentUser.value.serialId, org.value?.id)

      // SET UP REAL-TIME USER STATUS UPDATES
      interface FirebaseUser {
        id: string
        isOnline: boolean
        lastSeen: number
        name?: string
        photo?: string | null
      }

      if (firebaseChatComposable.value.users) {
        watch(firebaseChatComposable.value.users, (firebaseUsers: FirebaseUser[]) => {
          console.log('Firebase users updated:', firebaseUsers.length)
          // UPDATE OTHER USERS WITH REAL-TIME DATA FROM FIREBASE
          otherUsers.value = userList.value
            .filter(user => !user.active)
            .map(user => {
              // FIND CORRESPONDING FIREBASE USER DATA
              const firebaseUser = firebaseUsers.find((fu: FirebaseUser) => fu.id === user.serialId)
              return {
                id: user.serialId,
                name: user.name,
                photo: user.photo,
                isOnline: firebaseUser?.isOnline || false,
                lastSeen: firebaseUser?.lastSeen || (Date.now() - Math.random() * 86400000)
              }
            })

          console.log('Updated users with Firebase status:', otherUsers.value.map(u => ({ id: u.id, name: u.name, isOnline: u.isOnline })))
        }, { deep: true, immediate: true })
      }
    }

    // SET OTHER USERS (ACTIVE: FALSE) - INITIAL SETUP
    otherUsers.value = userList.value
      .filter(user => !user.active)
      .map(user => ({
        id: user.serialId,
        name: user.name,
        photo: user.photo,
        isOnline: false,
        lastSeen: Date.now() - Math.random() * 86400000
      }))

    console.log('Current User:', currentUser.value)
    console.log('Other Users:', otherUsers.value.length)
    console.log('Organization:', org.value)
  } catch (error) {
    console.error('Error fetching employees:', error)
    showToast('error', 'Failed to load users')
  }
}

// =================================
// CHAT MANAGEMENT METHODS
// =================================

const selectChat = async (chatId: string) => {
  if (!firebaseChatComposable.value) {
    console.error('Firebase chat not initialized')
    return
  }

  if (selectedChat.value !== chatId) {
    // CLEAR PREVIOUS CHAT STATE WHEN SWITCHING
    clearChatState()
    selectedChat.value = chatId

    // START LOADING MESSAGES
    isLoadingMessages.value = true

    try {
      let firebaseChatId = chatId
      if (chatId !== 'group') {
        // CREATE THE PROPER FIREBASE CHAT ID FOR PRIVATE CHATS
        const otherUserId = chatId
        const sortedIds = [otherUserId, currentUserId.value].sort()
        firebaseChatId = `${sortedIds[0]}_${sortedIds[1]}`
      }

      console.log('Firebase chat ID:', firebaseChatId)
      console.log('Organization-scoped path: organizations/' + org.value?.id + '/chats/' + firebaseChatId)

      // INITIALIZE CHAT FOR THE SELECTED USER/GROUP (NOW ORGANIZATION-SCOPED)
      await firebaseChatComposable.value.initializeChat(firebaseChatId)
      console.log('Chat initialized successfully for:', firebaseChatId)

      // WAIT A BIT FOR MESSAGES TO LOAD, THEN STOP LOADING
      setTimeout(() => {
        isLoadingMessages.value = false
      }, 300)

      // MARK MESSAGES AS READ AFTER A SHORT DELAY
      nextTick(() => {
        setTimeout(() => {
          const messages = displayedMessages.value
          console.log('Messages for read marking:', messages.length)

          messages
            .filter((msg: Message) => msg.senderId !== currentUserId.value && msg.status !== 'read')
            .forEach((msg: Message) => {
              firebaseChatComposable.value.markMessageAsRead(firebaseChatId, msg.id)
            })
        }, 1000)
      })

    } catch (error) {
      console.error('Error initializing chat:', error)
      showToast('error', 'Failed to load chat')
      isLoadingMessages.value = false
    }
  }
}

const loadPreviousMessages = async () => {
  if (!selectedChat.value || isLoadingPrevious.value || !hasMoreMessages.value || !firebaseChatComposable.value) return

  try {
    isLoadingPrevious.value = true
    const currentMessagesList = displayedMessages.value

    if (currentMessagesList.length === 0) return

    const oldestMessage = currentMessagesList[0]
    const olderMessages = await firebaseChatComposable.value.loadMoreMessages(selectedChat.value, oldestMessage.id)

    if (olderMessages.length === 0) {
      hasMoreMessages.value = false
    }
  } catch (error) {
    console.error('Error loading previous messages:', error)
  } finally {
    isLoadingPrevious.value = false
  }
}

// =================================
// MESSAGE OPERATIONS
// =================================

const sendMessage = async () => {
  if (!canSendMessage.value || !firebaseChatComposable.value) return

  const messageText = textResponse.value.trim()
  const messageImage = imageURL.value
  const messageFile = gofileData.value
  let chatId = selectedChat.value

  // CONVERT TO FIREBASE CHAT ID FORMAT FOR PRIVATE CHATS
  if (selectedChat.value !== 'group') {
    const sortedIds = [selectedChat.value, currentUserId.value].sort()
    chatId = `${sortedIds[0]}_${sortedIds[1]}`
  }

  if (!messageText && !messageImage && !messageFile) return

  try {
    isSending.value = true
    console.log(`Attempting to send message to: ${chatId} (Organization: ${org.value?.id})`)

    const messageData: Partial<Message> = {
      text: messageText,
      senderName: currentUserName.value
    }

    if (messageImage && messageImage.trim()) {
      messageData.imageURL = messageImage
    }
    console.log(messageFile);

    // ADD FILE DATA IF PRESENT (USING CORRECT PROPERTIES)
    if (messageFile) {
      messageData.fileURL = messageFile.downloadPage
      messageData.fileName = messageFile.fileName
      messageData.fileSize = messageFile.fileSize
      messageData.fileId = messageFile.fileId
      messageData.mimeType = messageFile.mimeType
      messageData.directLink = messageFile.directLink // FOR DIRECT ACCESS IF NEEDED
    }

    if (replyingTo.value?.id) {
      messageData.replyTo = replyingTo.value.id
      messageData.originalMessage = replyingTo.value.text ||
        (replyingTo.value.imageURL ? 'Image' :
          (replyingTo.value.fileName ? replyingTo.value.fileName : 'File'))
    }

    // CLEAR INPUT AND RESET TEXTAREA HEIGHT
    textResponse.value = ''
    imageURL.value = ''
    resetGofile() // USE THE RESET FUNCTION
    replyingTo.value = null

    const textarea = document.getElementById('text-edit') as HTMLTextAreaElement
    if (textarea) {
      textarea.style.height = 'auto'
    }

    clearTypingIndicator()

    const result = await firebaseChatComposable.value.sendMessage(chatId, messageData)

    if (result) {
      console.log('Message sent successfully:', result)
      scrollToBottom()
    } else {
      throw new Error('Failed to send message - no result returned')
    }

  } catch (error) {
    console.error('Error sending message:', error)
    showToast('error', 'Failed to send message')
  } finally {
    isSending.value = false
  }
}

// MESSAGE ACTION METHODS
const replyToMessage = (message: Message) => {
  replyingTo.value = message
  closeAllModals()

  // FOCUS ON INPUT
  nextTick(() => {
    const textarea = document.getElementById('text-edit')
    if (textarea) textarea.focus()
  })
}

const cancelReply = () => {
  replyingTo.value = null
}

const deleteMessage = async (messageId: string) => {
  if (!selectedChat.value || !firebaseChatComposable.value) return

  try {
    await firebaseChatComposable.value.deleteMessage(selectedChat.value, messageId)
    closeAllModals()
    showToast('success', 'Message deleted')
  } catch (error) {
    showToast('error', 'Failed to delete message')
  }
}

// =================================
// PIN MESSAGE OPERATIONS
// =================================

const pinToMessage = async (message: Message) => {
  if (!selectedChat.value || !firebaseChatComposable.value) return

  try {
    let chatId = selectedChat.value
    if (selectedChat.value !== 'group') {
      const sortedIds = [selectedChat.value, currentUserId.value].sort()
      chatId = `${sortedIds[0]}_${sortedIds[1]}`
    }

    const isPinning = !message.isPinned
    await firebaseChatComposable.value.pinMessage(chatId, message.id, isPinning)
    closeAllModals()
    showToast('success', isPinning ? 'Message pinned' : 'Message unpinned')
  } catch (error) {
    showToast('error', 'Failed to pin message')
  }
}

const unpinMessage = async () => {
  if (!currentPinnedMessage.value || !selectedChat.value || !firebaseChatComposable.value) return

  try {
    let chatId = selectedChat.value
    if (selectedChat.value !== 'group') {
      const sortedIds = [selectedChat.value, currentUserId.value].sort()
      chatId = `${sortedIds[0]}_${sortedIds[1]}`
    }

    await firebaseChatComposable.value.pinMessage(chatId, currentPinnedMessage.value.id, false)
    showToast('success', 'Message unpinned')
  } catch (error) {
    showToast('error', 'Failed to unpin message')
  }
}

// =================================
// HEADER ACTION METHODS
// =================================

const viewChatMedia = () => {
  closeAllModals()
  showToast('info', 'Media viewer coming soon')
}

const clearChat = async () => {
  const confirmed = await window.electronAPI.showConfirmDialog('Are you sure you want to clear this chat??', 'Delete Chats')
  if (confirmed) {
    showToast('critical', 'Contact Onuman Support Team')
  }
}





// =================================
// LIFECYCLE HOOKS
// =================================

onMounted(async () => {
  console.log('Chat component mounted')
  document.addEventListener('click', handleOutsideClick)

  // INITIALIZE USER DATA FIRST (INCLUDING ORGANIZATION DATA)
  await initializeUserData()

  if (firebaseChatComposable.value && currentUserId.value && org.value?.id) {
    console.log('Setting up Firebase with organization:', org.value.id)

    // SET USER ONLINE STATUS (NOW ORGANIZATION-SCOPED)
    firebaseChatComposable.value.setUserOnlineStatus(currentUserId.value, true)

    // ADD SCROLL LISTENER FOR PAGINATION
    if (chatContainer.value) {
      chatContainer.value.addEventListener('scroll', handleScroll)
    }

    // LOAD USER CHATS (NOW ORGANIZATION-SCOPED)
    try {
      await firebaseChatComposable.value.getUserChats(currentUserId.value)
      console.log('User chats loaded for organization:', org.value.id)

      // SELECT GROUP CHAT BY DEFAULT
      selectChat('group')
    } catch (error) {
      console.error('Error loading chats:', error)
      selectChat('group')
    }
  }

  // SIMULATE LOADING COMPLETION
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})

onUnmounted(() => {
  console.log('Chat component unmounted')
  document.removeEventListener('click', handleOutsideClick)

  if (firebaseChatComposable.value && currentUserId.value) {
    // SET USER OFFLINE
    firebaseChatComposable.value.setUserOnlineStatus(currentUserId.value, false)
  }

  // CLEAR TYPING INDICATOR
  clearTypingIndicator()

  if (chatContainer.value) {
    chatContainer.value.removeEventListener('scroll', handleScroll)
  }

  // CLEAR TIMEOUT
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
})
</script>