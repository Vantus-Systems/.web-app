import { useState, useFetch } from '#imports'

export const useBusiness = () => {
  const business = useState('business', () => ({}))
  const pricing = useState('pricing', () => ({}))
  const schedule = useState('schedule', () => ({}))
  const jackpot = useState('jackpot', () => ({}))
  const specials = useState('specials', () => ({}))

  const fetchBusiness = async () => {
    const { data } = await useFetch('/api/business')
    if (data.value) business.value = data.value
  }

  const fetchPricing = async () => {
    const { data } = await useFetch('/api/pricing')
    if (data.value) pricing.value = data.value
  }

  const fetchSchedule = async () => {
     const { data } = await useFetch('/api/schedule')
     if (data.value) schedule.value = data.value
  }

  const fetchJackpot = async () => {
      const { data } = await useFetch('/api/jackpot')
      if (data.value) jackpot.value = data.value
  }

  const fetchSpecials = async () => {
      const { data } = await useFetch('/api/specials')
      if (data.value) specials.value = data.value
  }

  return {
    business,
    pricing,
    schedule,
    jackpot,
    specials,
    fetchBusiness,
    fetchPricing,
    fetchSchedule,
    fetchJackpot,
    fetchSpecials,
  }
}
