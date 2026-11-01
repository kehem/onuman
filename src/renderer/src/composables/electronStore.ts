// src/composables/electronStore.ts

export const useElectronStore = () => {
  // Type the key and value parameters for clarity
  const set = (key: string, value: any): void => {
    // Directly call the 'set' function on the electronAPI store from the main process
    window.electronAPI.store.set(key, value)
  }

  // Use async/await for getting values from the store
  const get = async (key: string): Promise<any> => {
    try {
      // Await the result of the store get call (as it's a promise)
      const result = await window.electronAPI.store.get(key)
      return result
    } catch (error) {
      console.error('Error fetching value from store:', error)
      return null // or some default value in case of error
    }
  }

  return { set, get }
}
