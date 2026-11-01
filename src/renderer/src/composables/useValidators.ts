import { ref, watch, Ref } from 'vue'

export function useValidators() {
  // Phone Number Validator
  const phoneRegex = /^\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/
  function usePhoneValidator(phoneNumber: Ref<string>) {
    const isValidPhone = ref<boolean>(true)

    const formatPhoneNumber = (value: string) => {
      let cleaned = value.replace(/[^\d+]/g, '')
      if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned.replace(/^\+/, '')
      }
      const match = cleaned.match(/^(\+\d{1,3})(\d{0,3})(\d{0,3})(\d{0,4})$/)
      if (match) {
        const formatted = [
          match[1],
          match[2] ? '-' + match[2] : '',
          match[3] ? '-' + match[3] : '',
          match[4] ? '-' + match[4] : ''
        ].join('')
        phoneNumber.value = formatted
      }
    }

    watch(phoneNumber, (newValue) => {
      isValidPhone.value = phoneRegex.test(newValue)
    })

    return { isValidPhone, formatPhoneNumber }
  }

  // Email Validator
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/
  function useEmailValidator(email: Ref<string>) {
    const isValidEmail = ref<boolean>(true)

    watch(email, (newValue) => {
      isValidEmail.value = newValue ? emailRegex.test(newValue) : true
    })

    return { isValidEmail }
  }

  // Trade License Validator
  const tradeLicenseRegex = /^[A-Z0-9]{1,18}$/
  function useTradeLicenseValidator(tradeLicense: Ref<string>) {
    const errorMessage = ref<string>('')

    const validateTradeLicense = (license: string) => {
      if (license.length > 18) {
        errorMessage.value = 'Trade License Number cannot exceed 18 characters.'
      } else if (!tradeLicenseRegex.test(license)) {
        errorMessage.value =
          'Invalid Trade License Number. Please use only alphanumeric characters. Max: 18 digits'
      } else {
        errorMessage.value = ''
      }
    }

    watch(tradeLicense, (newValue) => {
      validateTradeLicense(newValue)
    })

    return { errorMessage, validateTradeLicense }
  }

  return {
    usePhoneValidator,
    useEmailValidator,
    useTradeLicenseValidator
  }
}
