<template>
    <!-- ------------------------- COMMENT CONTAINER ------------------------- -->
    <div class="comment-container" :class="{ 'inline-comment': inline }" ref="commentRef" title="Comment">
        <button v-if="inline" type="button" class="comment-button" @click="showComment"><i class="m-message-square" aria-hidden="true"></i> Comment</button>
        <i v-else class="m-message-square msg-icon" @click="showComment"></i>

        <!-- ------------------------- LOADING SKELETON ------------------------- -->
        <span class="comment-text" v-if="isLoading">
            <div class="action-btns skeleton">
                <p class="last-modified-cmt skeleton-text"></p>
                <span class="iconed">
                    <i class="m-compose skeleton-icon"></i>
                    <i class="m-circle-with-cross skeleton-icon"></i>
                </span>
            </div>
            <div class="comment-textbox">
                <div class="skeleton-textarea"></div>
            </div>
        </span>

        <!-- ------------------------- COMMENT DISPLAY ------------------------- -->
        <span class="comment-text" v-else-if="isClickedComment">
            <div class="action-btns">
                <p class="last-modified-cmt">
                    <i class="m-time"></i> {{ formatUpdateTime(getUpdateTime) }}
                </p>
                <span class="iconed">
                    <i class="m-compose" @click="editComment" title="Edit"></i>
                    <i class="m-circle-with-cross" @click="toggleCommentVisibility" title="Close Window"></i>
                </span>
            </div>
            <div class="comment-textbox">
                <textarea name="comment" :class="{ 'success-border-pulse': isClickedEditComment }"
                    :disabled="!isClickedEditComment" id="comment" maxlength="200" @focusout="sendComment"
                    v-model="typedComment"></textarea>
            </div>
        </span>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

import { useApi } from '../../composables/useApi'
const { get, put } = useApi()

// ------------------------- DEFINE PROPS -------------------------
const props = defineProps<{
    type: string,
    typeid: number,
    inline?: boolean
}>();

// ------------------------- STATE VARIABLES -------------------------
const isClickedEditComment = ref(false);       // CONTROLS IF COMMENT IS IN EDIT MODE
const isClickedComment = ref(false);           // CONTROLS COMMENT POPUP VISIBILITY
const isLoading = ref(false);                  // CONTROLS LOADING STATE
const typedComment = ref('');                  // CURRENTLY TYPED COMMENT
const originalComment = ref('');               // ORIGINAL COMMENT FOR COMPARISON
const getUpdateTime = ref('');                 // LAST UPDATED TIME
const commentId = ref<number | null>(null);    // COMMENT ID FROM BACKEND
const commentRef = ref<HTMLElement | null>(null);


// ------------------------- FORMAT DATE TO STRING -------------------------
const formatUpdateTime = (isoDate: string): string => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// ------------------------- ENABLE EDIT MODE -------------------------
const editComment = () => {
    isClickedEditComment.value = true;
};

// ------------------------- TOGGLE COMMENT POPUP -------------------------
const toggleCommentVisibility = () => {
    isClickedComment.value = !isClickedComment.value;
    isLoading.value = false;
};

// ------------------------- FETCH COMMENT DATA -------------------------
const showComment = async (event: Event) => {
    event.preventDefault();

    isClickedComment.value = true;
    isClickedEditComment.value = false;
    isLoading.value = true;
    try {
        const response = await get('/api/get_comment', {
            params: {
                type: props.type,
                typeid: props.typeid
            }
        });

        const data = response;
        commentId.value = data.id;
        typedComment.value = data.comment;
        originalComment.value = data.comment;
        getUpdateTime.value = data.updated_at;
    } catch (error) {
        // ERROR HANDLING (OPTIONAL)
    } finally {
        isLoading.value = false;
    }
};

// ------------------------- CLICK OUTSIDE TO HIDE -------------------------
const handleClickOutside = (event: MouseEvent) => {
    if (commentRef.value && !commentRef.value.contains(event.target as Node)) {
        isClickedComment.value = false;
        isClickedEditComment.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

// ------------------------- SUBMIT COMMENT IF CHANGED -------------------------
const sendComment = async (event: Event) => {
    event.preventDefault();

    const trimmedComment = typedComment.value.trim();
    if (trimmedComment === originalComment.value.trim()) {
        isClickedEditComment.value = false;
        return;
    }
    try {
        isLoading.value = true;

        await put(`/api/send_comment/${commentId.value}`, {
            comment: trimmedComment
        });

        originalComment.value = trimmedComment;
        isClickedEditComment.value = false;
    } catch (error) {
        // ERROR HANDLING (OPTIONAL)
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.inline-comment { position: relative; z-index: 10; }
.comment-button { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 0.7rem; border: 1px solid #49605a; border-radius: 0.35rem; background: #263b36; color: #dcebe6; font-size: 0.75rem; cursor: pointer; }
.comment-button:hover, .comment-button:focus-visible { background: #36534b; outline: 2px solid #8abeb0; outline-offset: 2px; }
.inline-comment .comment-text { display: block; position: absolute; right: 0; top: calc(100% + 0.4rem); width: min(15rem, 80vw); min-height: 8rem; background: #292f2e; border: 1px solid #52645f; border-radius: 0.35rem; box-shadow: 0 6px 20px #0008; }
.inline-comment .action-btns { display: flex; justify-content: space-between; gap: 0.5rem; padding: 0.5rem; background: #394642; }
.inline-comment .last-modified-cmt { font-size: 0.7rem; }
.inline-comment .iconed { display: flex; gap: 0.5rem; }
.inline-comment .iconed i { cursor: pointer; }
.inline-comment .comment-textbox { padding: 0.5rem; }
.inline-comment textarea { width: 100%; max-height: 15rem; resize: vertical; padding: 0.4rem; background: #222b29; color: #edf3f0; }
/* ------------------------- SKELETON LOADING STYLES ------------------------- */
.skeleton {
    position: relative;
    overflow: hidden;
    background-color: #4d4d4d;
}

.skeleton-text {
    width: 80%;
    height: 16px;
    background-color: #5c5c5c;
    border-radius: 4px;
}

.skeleton-icon {
    width: 10px;
    aspect-ratio: 1;
    background-color: #6e6e6e;
    display: inline-block;
    margin: 0 4px;
}

.skeleton-textarea {
    width: 100%;
    height: 100%;
    background-color: #666666;
    border-radius: 4px;
}

.skeleton::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    0% {
        left: -100%;
    }

    100% {
        left: 100%;
    }
}
</style>
