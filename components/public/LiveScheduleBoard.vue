<script setup lang="ts">
import { computed } from "vue";
import { parseTime } from "~/utils/time.utils";

interface Session {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  availableDays: string[];
  // Add other session properties as needed
}

const props = defineProps<{
  sessions: Session[];
  nowMinutes: number;
  mode: "now" | "custom";
  getStatus: (session: Session) => "live" | "upcoming" | "past" | "inactive";
}>();

const emit = defineEmits<{
  (e: "select", sessionId: string): void;
}>();

// Find the current live session
const liveSession = computed(() => {
  return props.sessions.find(session => props.getStatus(session) === "live") || null;
});

// Find the next upcoming session
const nextSession = computed(() => {
  const now = props.nowMinutes;
  const upcoming = props.sessions.filter(session => {
    const status = props.getStatus(session);
    return status === "upcoming";
  });
  
  // Sort by start time
  upcoming.sort((a, b) => {
    const aStart = parseTime(a.startTime);
    const bStart = parseTime(b.startTime);
    return aStart - bStart;
  });

  return upcoming[0] || null;
});

// Calculate time remaining until next session
const timeUntilNext = computed(() => {
  if (!nextSession.value) return null;
  
  const nextStart = parseTime(nextSession.value.startTime);
  const now = props.nowMinutes;
  
  return nextStart >= now ? nextStart - now : 24 * 60 - now;
});

// Format time remaining as human-readable string
const formatTimeRemaining = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};

// Calculate progress percentage for live session
const liveProgress = computed(() => {
  if (!liveSession.value) return 0;
  
  const start = parseTime(liveSession.value.startTime);
  const end = parseTime(liveSession.value.endTime);
  const now = props.nowMinutes;
  
  // Handle midnight wrap-around
  let totalDuration, elapsed;
  if (end <= start) {
    // Spans midnight
    totalDuration = (24 * 60 - start) + end;
    elapsed = now >= start ? now - start : (24 * 60 - start) + now;
  } else {
    // Same day
    totalDuration = end - start;
    elapsed = now - start;
  }
  
  return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
});

// Handle session selection
const handleSelect = (sessionId: string) => {
  emit("select", sessionId);
};
</script>

<template>
  <div v-motion-fade-visible class="bg-surface-dark/80 backdrop-blur-sm border border-gold/20 rounded-lg p-4 relative overflow-hidden">
    <!-- Glass panel with subtle noise texture -->
    <div class="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('/images/dots.png')] bg-[size:15px]"></div>
    
    <div class="relative z-10">
      <!-- Top row: NOW LIVE + UP NEXT -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <!-- NOW LIVE section -->
        <div v-motion-slide-left class="bg-card rounded-lg p-4 border border-white/10">
          <h3 class="text-sm font-bold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span class="w-2 h-2 bg-primary rounded-full motion-safe:animate-pulse"></span>
            NOW LIVE
          </h3>
          
          <div v-if="liveSession" class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="flex-1">
                <h4 class="text-lg font-bold text-white truncate">{{ liveSession.name }}</h4>
                <p class="text-sm text-secondary-dark">{{ liveSession.startTime }} - {{ liveSession.endTime }}</p>
              </div>
              <span v-motion-pop-visible class="bg-primary text-richBlack px-3 py-1 rounded-full text-xs font-bold motion-safe:animate-pulse">
                LIVE
              </span>
            </div>
            
            <!-- Progress bar -->
            <div class="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div 
                v-motion-slide-left 
                class="bg-primary h-full rounded-full transition-all duration-1000 ease-linear" 
                :style="{ width: `${liveProgress}%` }"
              ></div>
            </div>
            
            <div class="text-right">
              <span class="text-xs text-secondary-dark">
                {{ Math.round(liveProgress)}}% complete
              </span>
            </div>
          </div>
          
          <div v-else class="text-center py-6">
            <p class="text-secondary-dark text-sm">No live sessions at the moment</p>
          </div>
        </div>
        
        <!-- UP NEXT section -->
        <div v-motion-slide-right class="bg-card rounded-lg p-4 border border-white/10">
          <h3 class="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">
            UP NEXT
          </h3>
          
          <div v-if="nextSession" class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="flex-1">
                <h4 class="text-lg font-bold text-white truncate">{{ nextSession.name }}</h4>
                <p class="text-sm text-secondary-dark">{{ nextSession.startTime }} - {{ nextSession.endTime }}</p>
              </div>
            </div>
            
            <div class="text-center">
              <span v-if="timeUntilNext !== null" class="text-primary font-bold text-lg">
                Starts in {{ formatTimeRemaining(timeUntilNext) }}
              </span>
              <span v-else class="text-secondary-dark text-sm">
                Starting soon
              </span>
            </div>
          </div>
          
          <div v-else class="text-center py-6">
            <p class="text-secondary-dark text-sm">No upcoming sessions today</p>
          </div>
        </div>
      </div>
      
      <!-- Bottom row: Timeline rail -->
      <div class="relative">
        <h3 v-motion-fade-visible class="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">
          TODAY'S SCHEDULE
        </h3>
        
        <div class="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          <div 
            v-for="session in sessions" 
            :key="session.id" 
            v-motion-fade-visible 
            class="flex-shrink-0 w-44 snap-center motion-safe:transition-all motion-safe:duration-300" 
            :class="{
              'motion-safe:scale-[1.02]': props.getStatus(session) === 'live',
              'opacity-60': props.getStatus(session) === 'past',
              'border border-gold/30': props.getStatus(session) === 'upcoming' && !nextSession || nextSession?.id === session.id,
              'ring-2 ring-primary/50': props.getStatus(session) === 'live'
            }"
            @click="handleSelect(session.id)"
          >
            <div 
              class="bg-card rounded-lg p-3 h-full cursor-pointer hover:bg-white/5 transition-colors" 
              :class="{
                'bg-primary/10': props.getStatus(session) === 'live',
                'border border-transparent': props.getStatus(session) !== 'live'
              }"
            >
              <div class="flex items-center gap-2 mb-2">
                <span 
                  v-if="props.getStatus(session) === 'live'" 
                  class="w-2 h-2 bg-primary rounded-full motion-safe:animate-pulse flex-shrink-0"
                ></span>
                <span 
                  v-else-if="props.getStatus(session) === 'upcoming' && nextSession?.id === session.id" 
                  class="w-2 h-2 bg-gold rounded-full flex-shrink-0"
                ></span>
                <span v-else class="w-2 h-2 bg-white/20 rounded-full flex-shrink-0"></span>
                
                <h4 class="text-sm font-bold text-white truncate flex-1">
                  {{ session.name }}
                </h4>
              </div>
              
              <p class="text-xs text-secondary-dark mb-2">
                {{ session.startTime }} - {{ session.endTime }}
              </p>
              
              <div class="flex gap-1 flex-wrap">
                <span 
                  v-if="props.getStatus(session) === 'live'" 
                  v-motion-pop-visible 
                  class="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold motion-safe:animate-pulse"
                >
                  LIVE
                </span>
                <span 
                  v-else-if="props.getStatus(session) === 'upcoming' && nextSession?.id === session.id" 
                  class="bg-gold/20 text-gold px-2 py-0.5 rounded-full text-xs font-bold"
                >
                  NEXT
                </span>
                <span 
                  v-else-if="props.getStatus(session) === 'past'" 
                  class="bg-white/10 text-secondary-dark px-2 py-0.5 rounded-full text-xs"
                >
                  COMPLETED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Ensure tap targets are at least 44px tall */
:deep(.timeline-item) {
  min-height: 64px;
}

/* Custom motion-safe animations */
@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 8px 0 rgba(78, 221, 97, 0.7);
  }
  50% { 
    box-shadow: 0 0 16px 4px rgba(78, 221, 97, 0.9);
  }
}

.motion-safe .live-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Progress bar smooth transition */
.progress-bar {
  transition: width 1s linear;
}
</style>