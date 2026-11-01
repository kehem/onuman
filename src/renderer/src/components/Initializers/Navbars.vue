<template>
    <section class="navbars" style="-webkit-app-region: no-drag;">
        <div class="text-nowrap text-s f-center gap-05 h-100">
            <div class="onuman-icon">
                <img src="../../assets/images/Onuman-logo.svg" alt="Onuman Logo" />
            </div>
            <div class="vr"></div>
            <!-- NAV LIST -->
            <nav class="nav-list" role="menubar" aria-label="Main navigation">
                <!-- NAV -->
                <div v-for="nav in navItems" :key="nav.name" class="a-nav" role="menuitem"
                    :aria-haspopup="nav.subNavs.length > 0 ? 'true' : 'false'"
                    :aria-expanded="activeNav === nav.name ? 'true' : 'false'" :aria-label="nav.name"
                    :tabindex="isAnyModalOpen ? -1 : 0" @mouseenter="handleMouseEnter(nav.name)"
                    @click="toggleSubNav(nav.name)" @keydown="handleNavKeydown($event, nav.name)">
                    <p class="nav-name" :id="'nav-name-' + nav.name" :class="{ 'underline-first': isAltPressed }"
                        :data-first-letter="nav.name[0].toLowerCase()">
                        {{ nav.name }}
                    </p>
                    <ul class="sub-navs" v-show="activeNav === nav.name" role="menu"
                        :aria-label="`${nav.name} submenu`">
                        <li v-for="subNav in nav.subNavs" :key="subNav.name" class="sub-nav tab-index" role="menuitem"
                            :aria-label="subNav.name" :tabindex="isAnyModalOpen ? -1 : 0"
                            @click="handleSubNavClick(subNav.action)" @keydown.enter="handleSubNavClick(subNav.action)"
                            @keydown.space="handleSubNavClick(subNav.action)">
                            <p>{{ subNav.name }}</p>
                            <p class="shot-cut-nav">{{ subNav.shortcut }}</p>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>

        <ModalBox :is-open="isModalOpen['All Materials']" :show-close-button="true"
            @close="closeModal('All Materials')">
            <h2>All Materials</h2>
            <p>Manage your All Materials settings here.</p>
        </ModalBox>
        <ModalBox :is-open="isModalOpen['New Analyzer']" :show-close-button="true" @close="closeModal('New Analyzer')">
            <h2>New Analyzer</h2>
            <p>Manage your New Analyzer settings here.</p>
        </ModalBox>
        <ModalBox :is-open="isModalOpen['New Reports']" :show-close-button="true" @close="closeModal('New Reports')">
            <h2>New Reports</h2>
            <p>Manage your New Reports settings here.</p>
        </ModalBox>
        <ModalBox :is-open="isModalOpen['New FTP']" :show-close-button="true" @close="closeModal('New FTP')">
            <h2>New FTP</h2>
            <p>Manage your New FTP settings here.</p>
        </ModalBox>
        <ModalBox :is-open="isModalOpen['New Chat']" :show-close-button="true" @close="closeModal('New Chat')">
            <h2>New Chat</h2>
            <p>Manage your New Chat settings here.</p>
        </ModalBox>
        <ModalBox :is-open="isModalOpen['New Help']" :show-close-button="true" @close="closeModal('New Help')">
            <h2>New Help</h2>
            <p>Manage your New Help settings here.</p>
        </ModalBox>
    </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import ModalBox from '../../components/UI/ModalBox.vue';
// import FileUploader from '../FileServer/FileUploader.vue';
// import FileList from '../FileServer/FileList.vue';
import { useRouter } from 'vue-router';
const router = useRouter()
import { useToast } from '../../composables/Toast'
const { showToast } = useToast()


// const fileList = ref<InstanceType<typeof FileList> | null>(null)

// // Refresh file list when a file is uploaded
// const refreshFileList = () => {
//     if (fileList.value) {
//         fileList.value.fetchFiles()
//     }
// }





interface SubNav {
    name: string;
    shortcut: string;
    action: () => void;
}

interface NavItem {
    name: string;
    subNavs: SubNav[];
}
const navItems = ref<NavItem[]>([
    {
        name: 'Project',
        subNavs: [
            { name: 'Dashboard', shortcut: 'Ctrl + D', action: () => router.push('/dashboard') },
            { name: 'New Project', shortcut: 'Ctrl + N', action: () => router.push('/addNewProject') },
        ],
    },
    {
        name: 'Materials',
        subNavs: [
            { name: 'Current Materials', shortcut: 'Ctrl + M', action: () => router.push('/materials') },
            { name: 'All Materials', shortcut: 'Ctrl + Shift + M', action: () => router.push('/materials') },
        ],
    },
    {
        name: 'Analyzer',
        subNavs: [
            { name: 'New Analyzer', shortcut: 'Ctrl + Alt + N', action: () => openModal('New Analyzer') },
        ],
    },
    {
        name: 'Reports',
        subNavs: [
            { name: 'New Reports', shortcut: 'Alt + R', action: () => router.push('/reports') },
        ],
    },
    {
        name: 'FTP',
        subNavs: [
            { name: 'New FTP', shortcut: 'Ctrl + F', action: () => router.push('/file-share') },
        ],
    },
    {
        name: 'Chat',
        subNavs: [
            { name: 'New Chat', shortcut: 'Alt + T', action: () => router.push('/chat') },
        ],
    },
    {
        name: 'Help',
        subNavs: [
            { name: 'New Help', shortcut: 'Ctrl + H', action: () => openModal('New Help') },
        ],
    },
]);

const activeNav = ref<string | null>(null);
const isHoverEnabled = ref(false);
const isAltPressed = ref(false);
const isModalOpen = ref<{ [key: string]: boolean }>({});

// Check if any modal is open
const isAnyModalOpen = computed(() => {
    return Object.values(isModalOpen.value).some((isOpen) => isOpen);
});

const openModal = (subNavName: string) => {
    isModalOpen.value[subNavName] = true;
};

const closeModal = (subNavName: string) => {
    isModalOpen.value[subNavName] = false;
};

const toggleSubNav = (navName: string) => {
    activeNav.value = activeNav.value === navName ? null : navName;
    isHoverEnabled.value = true;
};

const handleMouseEnter = (navName: string) => {
    if (isHoverEnabled.value) {
        activeNav.value = navName;
    }
};

const handleSubNavClick = (action: () => void) => {
    action();
    isHoverEnabled.value = true;
    isAltPressed.value = false;
};

const handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.a-nav') && !target.closest('.modal-box')) {
        activeNav.value = null;
        isHoverEnabled.value = false;
        isAltPressed.value = false;
    }
};

const handleNavKeydown = (event: KeyboardEvent, navName: string) => {
    if (isAnyModalOpen.value) return;

    if (event.key === 'Enter' || event.key === ' ') {
        toggleSubNav(navName);
        if (activeNav.value === navName) {
            setTimeout(() => {
                const submenu = document.querySelector(
                    `.a-nav[aria-expanded="true"] .sub-navs li:first-child`
                ) as HTMLElement;
                submenu?.focus();
            }, 0);
        }
        event.preventDefault();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        if (activeNav.value === navName) {
            const submenuItems = document.querySelectorAll(
                `.a-nav[aria-expanded="true"] .sub-navs li`
            ) as NodeListOf<HTMLElement>;
            const currentFocused = document.activeElement as HTMLElement;
            let currentIndex = -1;

            submenuItems.forEach((item, index) => {
                if (item === currentFocused) {
                    currentIndex = index;
                }
            });

            let nextIndex: number;
            if (event.key === 'ArrowDown') {
                nextIndex = currentIndex + 1 < submenuItems.length ? currentIndex + 1 : 0;
            } else {
                nextIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : submenuItems.length - 1;
            }

            submenuItems[nextIndex]?.focus();
            event.preventDefault();
        }
    }
};

const handleKeydown = (event: KeyboardEvent) => {
    if (isAnyModalOpen.value) return;

    const ctrl = event.ctrlKey;
    const shift = event.shiftKey;
    const alt = event.altKey;
    const key = event.key.toLowerCase();

    if (event.key === 'Alt') {
        isAltPressed.value = !isAltPressed.value;
        if (!isAltPressed.value) {
            activeNav.value = null;
            isHoverEnabled.value = false;
        }
        event.preventDefault();
        return;
    }

    if (isAltPressed.value && !ctrl && !shift && !alt && /^[a-z]$/.test(key)) {
        const matchingNav = navItems.value.find(
            (nav) => nav.name[0].toLowerCase() === key
        );
        if (matchingNav) {
            toggleSubNav(matchingNav.name);
            setTimeout(() => {
                const submenu = document.querySelector(
                    `.a-nav[aria-expanded="true"] .sub-navs li:first-child`
                ) as HTMLElement;
                submenu?.focus();
            }, 0);
            isAltPressed.value = false;
        }
        event.preventDefault();
    }

    // 🔑 Hotkey Logic with Toasts
    if (ctrl && !shift && !alt && key === 'd') {
        navItems.value.find((nav) => nav.name === 'Project')?.subNavs.find(sn => sn.name === 'Dashboard')?.action();
        showToast('info', 'Navigated to Dashboard');
        event.preventDefault();
    }
    else if (ctrl && !shift && !alt && key === 'n') {
        navItems.value.find((nav) => nav.name === 'Project')?.subNavs.find(sn => sn.name === 'New Project')?.action();
        showToast('info', 'Opened New Project');
        event.preventDefault();
    }
    else if (ctrl && !shift && !alt && key === 'm') {
        navItems.value.find((nav) => nav.name === 'Materials')?.subNavs.find(sn => sn.name === 'Current Materials')?.action();
        showToast('info', 'Opened Current Materials');
        event.preventDefault();
    }
    else if (ctrl && shift && !alt && key === 'm') {
        navItems.value.find((nav) => nav.name === 'Materials')?.subNavs.find(sn => sn.name === 'All Materials')?.action();
        showToast('info', 'Opened All Materials');
        event.preventDefault();
    }
    else if (ctrl && !shift && alt && key === 'n') {
        navItems.value.find((nav) => nav.name === 'Analyzer')?.subNavs.find(sn => sn.name === 'New Analyzer')?.action();
        showToast('info', 'Opened New Analyzer');
        event.preventDefault();
    }
    else if (!ctrl && alt && !shift && key === 'r') {
        navItems.value.find((nav) => nav.name === 'Reports')?.subNavs.find(sn => sn.name === 'New Reports')?.action();
        showToast('info', 'Opened Reports');
        event.preventDefault();
    }
    else if (ctrl && !shift && !alt && key === 'f') {
        navItems.value.find((nav) => nav.name === 'FTP')?.subNavs.find(sn => sn.name === 'New FTP')?.action();
        showToast('info', 'Opened FTP');
        event.preventDefault();
    }
    else if (!ctrl && !shift && alt && key === 't') {
        navItems.value.find((nav) => nav.name === 'Chat')?.subNavs.find(sn => sn.name === 'New Chat')?.action();
        showToast('info', 'Opened Chat');
        event.preventDefault();
    }
    else if (ctrl && !shift && !alt && key === 'h') {
        navItems.value.find((nav) => nav.name === 'Help')?.subNavs.find(sn => sn.name === 'New Help')?.action();
        showToast('info', 'Opened Help');
        event.preventDefault();
    }
    else if (ctrl && shift && !alt && key === 'tab') {
        const searchInput = document.getElementById('search') as HTMLInputElement;
        searchInput?.focus();
        showToast('info', 'Focused Search Input');
        event.preventDefault();
    }
};


// const searchQuery = ref('');
// const searchResults = ref<string[]>([]);
// const isSearching = ref(false);
// const showSearchResults = ref(false);

// const handleSearch = async () => {
//     if (searchQuery.value.trim() === '') {
//         showSearchResults.value = false;
//         searchResults.value = [];
//         return;
//     }

//     isSearching.value = true;
//     showSearchResults.value = true;

//     setTimeout(() => {
//         searchResults.value = [`Results for "${searchQuery.value}"`];
//         isSearching.value = false;
//     }, 1000);
// };

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('click', handleOutsideClick);
});
</script>

<style scoped>
.underline-first {
    position: relative;
}

.underline-first::first-letter {
    text-decoration: underline;
}

.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}
</style>