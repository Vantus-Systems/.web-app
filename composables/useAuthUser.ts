import { useState, useFetch } from '#imports'

export const useAuthUser = () => {
  const user = useState('user', () => null)

  const fetchUser = async () => {
    try {
      const { data, error } = await useFetch('/api/auth/user')
      if (error.value) {
        user.value = null
      } else {
        user.value = data.value?.user || null
      }
    } catch (e) {
      user.value = null
    }
  }

  const logout = async () => {
    await useFetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return {
    user,
    fetchUser,
    logout,
  }
}
