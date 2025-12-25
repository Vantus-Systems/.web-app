<script setup lang="ts">
import { Clock, Calendar, Info, TrendingUp } from 'lucide-vue-next'

interface Session {
  name: string
  time: string
  pricing: string
  details: string
  vibe?: string[]
  jackpot?: string
  category?: string
  status?: string
}

const props = defineProps<{
  session: Session
  index: number
}>()

const categoryColors = {
  Morning: 'from-orange-500 to-amber-500',
  Afternoon: 'from-blue-500 to-indigo-500',
  Evening: 'from-purple-600 to-fuchsia-600',
  'Late Night': 'from-slate-800 to-slate-900'
}

const categoryBg = {
  Morning: 'bg-orange-50',
  Afternoon: 'bg-blue-50',
  Evening: 'bg-purple-50',
  'Late Night': 'bg-slate-50'
}

const colorClass = computed(() => categoryColors[props.session.category as keyof typeof categoryColors] || 'from-gold-500 to-gold-600')
const bgClass = computed(() => categoryBg[props.session.category as keyof typeof categoryBg] || 'bg-white')

const addToCalendar = () => {
  // Mock functionality for "Add to Calendar"
  const text = encodeURIComponent(`Bingo: ${props.session.name}`)
  const details = encodeURIComponent(props.session.details)
  const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}`
  window.open(url, '_blank')
}
</script>

<template>
  <div
    class="group relative bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
  >
    <!-- Status Badge -->
    <div v-if="session.status" class="absolute top-4 right-4 z-20">
      <div class="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-100 shadow-sm">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span class="text-[10px] font-black uppercase tracking-wider text-slate-600">{{ session.status }}</span>
      </div>
    </div>

    <div class="flex flex-col md:flex-row">
      <!-- Time Section -->
      <div 
        :class="[colorClass, 'md:w-48 flex flex-col items-center justify-center p-8 text-white bg-gradient-to-br relative overflow-hidden']"
      >
        <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <Clock class="w-6 h-6 mb-2 opacity-80" />
        <div class="text-3xl font-black tracking-tighter">{{ session.time.split(' ')[0] }}</div>
        <div class="text-sm font-bold opacity-90 uppercase">{{ session.time.split(' ')[1] }}</div>
      </div>

      <!-- Content Section -->
      <div class="flex-1 p-6 md:p-8 flex flex-col justify-between relative">
        <div>
          <div class="flex flex-wrap gap-2 mb-4">
            <span 
              v-for="tag in session.vibe" 
              :key="tag"
              class="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200"
            >
              {{ tag }}
            </span>
          </div>

          <h3 class="text-2xl md:text-3xl font-black text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">
            {{ session.name }}
          </h3>
          
          <p class="text-slate-500 leading-relaxed mb-6 font-medium line-clamp-2">
            {{ session.details }}
          </p>

          <div class="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400">
            <div class="flex items-center gap-2">
              <TrendingUp class="w-4 h-4 text-gold-500" />
              <span>Est. Jackpot: <span class="text-slate-900">{{ session.jackpot }}</span></span>
            </div>
            <div class="flex items-center gap-2">
              <Info class="w-4 h-4 text-primary-500" />
              <span>{{ session.pricing }}</span>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <button 
              @click="addToCalendar"
              class="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary-600 transition-all"
              title="Add to Calendar"
            >
              <Calendar class="w-5 h-5" />
            </button>
          </div>
          
          <div class="flex items-center gap-3">
            <NuxtLink 
              to="/contact"
              class="px-6 py-3 rounded-xl bg-primary-900 text-white font-black text-sm hover:bg-primary-800 transition-all shadow-lg shadow-primary-900/20 flex items-center gap-2 group/btn"
            >
              Reserve Seat
              <svg class="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
