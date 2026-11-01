<!-- src/components/FileServer/FileList.vue -->
<template>
  <div class="file-list">
    <h2>📁 Uploaded Files</h2>

    <div v-if="loading" class="loading">Loading files...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <table v-else-if="files.length > 0" class="file-table">
      <thead>
        <tr>
          <th>Preview</th>
          <th>File Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="file in files" :key="file.generated" class="file-row">
          <td class="preview-cell">
            <img
              v-if="isImage(file.original)"
              :src="`http://localhost:3000/files/${file.generated}`"
              alt="Thumbnail"
              class="thumbnail"
              @error="handleImageError"
            />
            <div
              v-else
              class="file-ext"
              :style="{ backgroundColor: getColor(file.original) }"
            >
              {{ getExt(file.original) }}
            </div>
          </td>
          <td>
            <a
              class="file-link"
              :href="`http://localhost:3000/files/original/${encodeURIComponent(file.original)}`"
              target="_blank"
            >
              {{ file.original }}
            </a>
          </td>
          <td>
            <button
              @click="deleteFile(file.generated)"
              class="delete-button"
              :disabled="deleting === file.generated"
            >
              {{ deleting === file.generated ? 'Deleting...' : 'Delete' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="no-files">No files uploaded yet.</div>

    <button v-if="error" @click="() => fetchFiles()" class="retry-button">
      Retry
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface FileEntry {
  generated: string;
  original: string;
}

const files = ref<FileEntry[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const deleting = ref<string | null>(null);
const maxRetries = 5;
const retryDelay = 1000;

const isImage = (filename: string): boolean => {
  const ext = filename.toLowerCase().split(".").pop();
  return ["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(ext || "");
};

const getExt = (filename: string): string => {
  return filename.split(".").pop()?.toUpperCase() || "FILE";
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = "none";
};

const getColor = (filename: string) => {
  const ext = getExt(filename);
  const colors: Record<string, string> = {
    PDF: "#e53935",
    DOC: "#1e88e5",
    DOCX: "#42a5f5",
    XLS: "#43a047",
    XLSX: "#66bb6a",
    TXT: "#ffb300",
    ZIP: "#8e24aa",
    RAR: "#6a1b9a",
    MP4: "#d81b60",
    MP3: "#00acc1",
  };
  return colors[ext] || "#555";
};

const fetchFiles = async (retryCount = 0) => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch("http://localhost:3000/list");
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const result = await response.json();
    files.value = result.files || [];
  } catch (err) {
    if (retryCount < maxRetries) {
      setTimeout(() => fetchFiles(retryCount + 1), retryDelay);
    } else {
      error.value = `Failed to fetch files: ${
        err instanceof Error ? err.message : String(err)
      }`;
    }
  } finally {
    loading.value = false;
  }
};

const deleteFile = async (generated: string) => {
  deleting.value = generated;
  try {
    const response = await fetch(`http://localhost:3000/delete/${generated}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(`Failed to delete file`);
    await fetchFiles();
  } catch (err) {
    error.value = `Error deleting file: ${
      err instanceof Error ? err.message : String(err)
    }`;
  } finally {
    deleting.value = null;
  }
};

onMounted(fetchFiles);
defineExpose({ fetchFiles });
</script>

<style scoped>
.file-list {
  padding: 2rem;
  background-color: #121212;
  border-radius: 10px;
  max-width: 900px;
  margin: 0 auto;
  color: #ddd;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

h2 {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #f1f1f1;
}

.loading,
.no-files {
  color: #aaa;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.error {
  color: #ff4c4c;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.file-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.7);
}

.file-table thead tr {
  background-color: #272727;
  border-bottom: 2px solid #444;
}

.file-table th,
.file-table td {
  padding: 1rem;
  text-align: left;
  color: #ccc;
  vertical-align: middle;
  border-bottom: 1px solid #333;
}

.file-table th {
  font-weight: 600;
  font-size: 0.9rem;
  user-select: none;
}

.file-row:hover {
  background-color: #333;
}

.preview-cell {
  width: 80px;
  text-align: center;
}

.thumbnail {
  max-width: 60px;
  max-height: 60px;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 0 5px #222 inset;
}

.file-ext {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  aspect-ratio: 1;
  font-size: 0.9rem;
  font-weight: 700;
  border-radius: 6px;
  color: #fff;
  text-transform: uppercase;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.7);
  user-select: none;
}

.file-link {
  color: #9fcfff;
  font-weight: 500;
  text-decoration: none;
  word-break: break-word;
}

.file-link:hover {
  text-decoration: underline;
}

.delete-button {
  padding: 0.4rem 1rem;
  border: none;
  background-color: #d32f2f;
  color: white;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-width: 90px;
}

.delete-button:hover:not(:disabled) {
  background-color: #b71c1c;
}

.delete-button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #444;
  color: #eee;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-button:hover {
  background-color: #666;
}
</style>
