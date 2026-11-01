import { ref, computed, reactive } from 'vue'

interface ValidationRule {
  required?: boolean
  maxLength?: number
}

export function useStringValidator() {
  const validationRules = reactive<ValidationRule>({})
  const value = ref<string>('')
  const touched = ref<boolean>(false)

  const error = computed(() => {
    if (!value.value && validationRules.required) {
      return 'Required'
    }
    if (value.value && validationRules.maxLength && value.value.length > validationRules.maxLength) {
      return `Must not exceed ${validationRules.maxLength} characters`
    }
    return ''
  })

  const isValid = computed(() => !error.value)

  const validate = () => {
    touched.value = true
    return { isValid: isValid.value, error: error.value }
  }

  const setRules = (rules: ValidationRule) => {
    Object.assign(validationRules, rules)
  }

  const reset = () => {
    value.value = ''
    touched.value = false
  }

  return {
    value,
    touched,
    isValid,
    error,
    validate,
    setRules,
    reset
  }
}