<template>
  <div class="space-y-4 font-sans text-slate-900">
    <!-- Header / Control Bar -->
    <BaseCard class-name="space-y-4 border-l-4 border-l-gold">
      <div
        class="flex flex-col xl:flex-row xl:items-center justify-between gap-6"
      >
        <div>
          <div class="flex items-center gap-3 mb-1">
            <p class="text-gold font-bold text-xs uppercase tracking-[0.3em]">
              Enterprise Command Center
            </p>
            <span
              v-if="unsavedChanges"
              class="animate-pulse px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide"
            >
              Unsaved Changes
            </span>
            <span
              :class="[
                'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide',
                pricingReady
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700',
              ]"
            >
              Pricing {{ pricingReady ? "Ready" : "Pending" }}
            </span>
            <span
              :class="[
                'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide',
                programsReady
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700',
              ]"
            >
              Programs {{ programsReady ? "Ready" : "Pending" }}
            </span>
          </div>
          <h3 class="text-3xl font-black text-primary-950 tracking-tight">
            Schedule Control Room
          </h3>
          <p class="text-sm text-slate-500 font-medium">
            Manage operations, monitor occupancy, and optimize revenue.
          </p>
        </div>

        <!-- Month Navigation & Actions -->
        <div class="flex flex-wrap items-center gap-3">
          <div
            class="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm"
          >
            <button
              class="p-2 hover:bg-slate-50 rounded-md text-slate-500 hover:text-primary-600 transition-colors"
              @click="changeMonth(-1)"
            >
              <ChevronLeft class="w-5 h-5" />
            </button>
            <div class="px-4 text-center min-w-[140px]">
              <span
                class="block text-sm font-black text-primary-900 uppercase tracking-widest"
                >{{ currentMonthName }}</span
              >
              <span class="block text-[10px] text-slate-400 font-bold">{{
                currentYear
              }}</span>
            </div>
            <button
              class="p-2 hover:bg-slate-50 rounded-md text-slate-500 hover:text-primary-600 transition-colors"
              @click="changeMonth(1)"
            >
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>

          <div class="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

          <!-- View Switcher -->
          <div class="flex items-center gap-2">
            <button
              :class="[
                'px-3 py-2 rounded-lg text-xs font-bold transition-all border',
                viewMode === 'month'
                  ? 'bg-primary-900 text-white border-primary-900'
                  : 'bg-white text-slate-500 border-slate-200',
              ]"
              @click="viewMode = 'month'"
            >
              Month
            </button>
            <button
              :class="[
                'px-3 py-2 rounded-lg text-xs font-bold transition-all border',
                viewMode === 'week'
                  ? 'bg-primary-900 text-white border-primary-900'
                  : 'bg-white text-slate-500 border-slate-200',
              ]"
              @click="viewMode = 'week'"
            >
              Week
            </button>
            <button
              :class="[
                'px-3 py-2 rounded-lg text-xs font-bold transition-all border',
                viewMode === 'agenda'
                  ? 'bg-primary-900 text-white border-primary-900'
                  : 'bg-white text-slate-500 border-slate-200',
              ]"
              @click="viewMode = 'agenda'"
            >
              Agenda
            </button>
          </div>

          <div class="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

          <!-- Filter Toggles -->
          <div class="flex items-center gap-2">
            <button
              :class="[
                'px-3 py-2 rounded-lg text-xs font-bold transition-all border',
                filters.showDrafts
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-200',
              ]"
              @click="toggleFilter('drafts')"
            >
              Drafts
            </button>
            <button
              :class="[
                'px-3 py-2 rounded-lg text-xs font-bold transition-all border',
                filters.highlightConflicts
                  ? 'bg-rose-100 text-rose-700 border-rose-200'
                  : 'bg-white text-slate-500 border-slate-200',
              ]"
              @click="toggleFilter('conflicts')"
            >
              Conflicts
            </button>
            <button
              :class="[
                'px-3 py-2 rounded-lg text-xs font-bold transition-all border',
                filters.showMetrics
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-500 border-slate-200',
              ]"
              @click="toggleFilter('metrics')"
            >
              Projected Metrics
            </button>
          </div>

          <div class="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

          <BaseButton
            variant="outline"
            class-name="px-4 py-3 text-xs uppercase tracking-[0.2em]"
            type="button"
            @click="openBulkModal"
          >
            Bulk Tools
          </BaseButton>

          <BaseButton
            variant="gold"
            class-name="px-6 py-3 text-xs uppercase tracking-[0.2em] shadow-xl shadow-gold/20"
            type="button"
            :disabled="isSaving"
            @click="saveAll"
          >
            <span v-if="isSaving">Syncing...</span>
            <span v-else>Publish Changes</span>
          </BaseButton>
        </div>
      </div>

      <div class="grid gap-3 md:grid-cols-4">
        <div class="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            Sessions
          </p>
          <p class="text-2xl font-black text-primary-900">
            {{ scheduleSummary.totalSessions }}
          </p>
          <p class="text-xs text-slate-500">
            {{ currentMonthName }} coverage
          </p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            Projected Revenue
          </p>
          <p class="text-2xl font-black text-primary-900">
            ${{ formatMoney(scheduleSummary.projectedRevenue) }}
          </p>
          <p class="text-xs text-slate-500">
            Based on assigned sessions
          </p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            Avg. Occupancy
          </p>
          <p class="text-2xl font-black text-primary-900">
            {{ scheduleSummary.occupancyAvg }}%
          </p>
          <p class="text-xs text-slate-500">
            Auto-calculated
          </p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            Conflict Days
          </p>
          <p class="text-2xl font-black text-primary-900">
            {{ scheduleSummary.conflictDays }}
          </p>
          <p class="text-xs text-slate-500">
            {{ filters.highlightConflicts ? "Visible" : "Hidden" }}
          </p>
        </div>
      </div>
    </BaseCard>

    <!-- Monthly Calendar Grid -->
    <div
      v-if="viewMode === 'month'"
      class="bg-slate-100 rounded-xl p-1 overflow-x-auto shadow-inner"
    >
      <div
        class="min-w-[1000px] grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden"
      >
        <!-- Weekday Headers -->
        <div
          v-for="day in weekDays"
          :key="day"
          class="bg-white p-3 text-center"
        >
          <span
            class="text-xs font-black text-slate-400 uppercase tracking-widest"
            >{{ day }}</span
          >
        </div>

        <!-- Calendar Days -->
        <div
          v-for="cell in calendarCells"
          :key="cell.dateStr"
          :class="[
            'bg-white min-h-[180px] p-2 transition-colors relative group',
            !cell.isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : '',
            cell.isToday ? 'bg-primary-50/30' : '',
          ]"
          @dragover.prevent
          @drop="onDrop($event, cell.dateStr)"
        >
          <!-- Date Header -->
          <div class="flex justify-between items-start mb-2">
            <span
              :class="[
                'text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full',
                cell.isToday
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-slate-700',
              ]"
            >
              {{ cell.dayNum }}
            </span>
            <button
              class="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-gold transition-opacity"
              @click="addNewSession(cell.dateStr)"
            >
              <Plus class="w-4 h-4" />
            </button>
          </div>

          <!-- Conflict Indicator -->
          <div
            v-if="cell.hasConflict && filters.highlightConflicts"
            class="mb-2 px-2 py-1 bg-rose-50 border border-rose-100 rounded text-[10px] font-bold text-rose-600 flex items-center gap-1 animate-pulse"
          >
            <AlertTriangle class="w-3 h-3" /> Scheduling Conflict
          </div>

          <!-- Day Profile Summary -->
          <div class="space-y-2">
            <div
              class="rounded-lg border px-2 py-2 text-xs font-bold"
              :class="profileClass(profileForDate(cell.dateStr)?.category)"
            >
              <div class="flex items-center justify-between gap-2">
                <span>
                  {{
                    profileForDate(cell.dateStr)?.name || "Unassigned Profile"
                  }}
                </span>
                <select
                  class="bg-white/70 border border-slate-200 rounded text-[10px] px-1 py-0.5"
                  :value="profileForDate(cell.dateStr)?.id || ''"
                  @change="
                    setDayProfileAssignment(
                      cell.dateStr,
                      ($event.target as HTMLSelectElement).value,
                    )
                  "
                >
                  <option value="">--</option>
                  <option
                    v-for="profile in dayProfilesData.profiles"
                    :key="profile.id"
                    :value="profile.id"
                  >
                    {{ profile.name }}
                  </option>
                </select>
              </div>
              <p class="mt-1 text-[10px] font-semibold text-slate-500">
                {{ cell.sessions.length }} session{{
                  cell.sessions.length === 1 ? "" : "s"
                }}
              </p>
              <button
                class="mt-2 text-[10px] font-bold uppercase tracking-wider text-primary-700"
                @click="openProfileDrawer(cell.dateStr)"
              >
                View Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Week View -->
    <div
      v-if="viewMode === 'week'"
      class="bg-white rounded-xl border border-slate-200 p-4"
    >
      <div class="grid grid-cols-7 gap-4">
        <div
          v-for="date in weekDates"
          :key="date.toISOString()"
          class="space-y-3"
        >
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {{ date.toLocaleDateString("en-US", { weekday: "short" }) }}
            {{ date.getDate() }}
          </div>
          <div
            v-for="session in getSessionsForDate(
              date.toISOString().slice(0, 10),
              date.toLocaleDateString('en-US', { weekday: 'short' }),
            )"
            :key="session.uniqueKey"
            class="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs"
          >
            <div class="font-bold text-primary-900">{{ session.name }}</div>
            <div class="text-slate-500">{{ session.startTime }} - {{ session.endTime }}</div>
            <div
              v-if="filters.showMetrics"
              class="mt-2 rounded border border-slate-100 bg-white px-2 py-1 text-[10px] text-slate-500"
            >
              Proj. Rev: ${{ formatMoney(session.projectedRevenue) }} • Occ.
              {{ session.occupancy }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Agenda View -->
    <div
      v-if="viewMode === 'agenda'"
      class="bg-white rounded-xl border border-slate-200 p-4 space-y-3"
    >
      <div
        v-for="session in agendaSessions"
        :key="session.uniqueKey"
        class="flex items-center justify-between rounded-lg border border-slate-200 p-3"
      >
        <div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {{ session.dateStr }}
          </p>
          <p class="text-sm font-bold text-primary-900">{{ session.name }}</p>
          <p class="text-xs text-slate-500">
            {{ session.startTime }} - {{ session.endTime }}
          </p>
          <p v-if="filters.showMetrics" class="text-[10px] text-slate-400">
            Proj. Rev: ${{ formatMoney(session.projectedRevenue) }} • Occ.
            {{ session.occupancy }}%
          </p>
        </div>
        <div class="text-xs text-slate-500">
          {{ session.status }}
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <div
      v-if="contextMenu.visible"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      class="fixed z-50 bg-white rounded-lg shadow-2xl border border-slate-100 w-48 py-1 transform transition-all duration-200 origin-top-left"
      @mouseleave="closeContextMenu"
    >
      <div class="px-3 py-2 border-b border-slate-100 bg-slate-50">
        <p class="text-xs font-bold text-primary-900 truncate">
          {{ contextMenu.session?.name }}
        </p>
      </div>
      <button
        class="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-gold/10 hover:text-primary-900 flex items-center gap-2"
        @click="handleContextAction('edit')"
      >
        <Edit class="w-3 h-3" /> Edit Details
      </button>
      <button
        class="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-gold/10 hover:text-primary-900 flex items-center gap-2"
        @click="handleContextAction('duplicate')"
      >
        <Copy class="w-3 h-3" /> Duplicate
      </button>
      <button
        class="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-gold/10 hover:text-primary-900 flex items-center gap-2"
        @click="handleContextAction('toggleDraft')"
      >
        <EyeOff class="w-3 h-3" /> Toggle Draft
      </button>
      <div class="h-px bg-slate-100 my-1"></div>
      <button
        class="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
        @click="handleContextAction('delete')"
      >
        <Trash2 class="w-3 h-3" /> Delete
      </button>
    </div>

    <!-- Bulk Generator Modal -->
    <div
      v-if="showBulkModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        class="absolute inset-0 bg-primary-950/60 backdrop-blur-sm"
        @click="showBulkModal = false"
      ></div>
      <div
        class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div
          class="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center"
        >
          <h3 class="text-xl font-black text-primary-900">
            Bulk Schedule Generator
          </h3>
          <button
            class="text-slate-400 hover:text-slate-600"
            @click="showBulkModal = false"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-6">
          <div>
            <label
              class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >Select Template</label
            >
            <select
              v-model="bulkForm.template"
              class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"
            >
              <option :value="null">-- Select a Template --</option>
              <optgroup
                v-if="pricingData?.daytime?.sessions"
                label="Daytime Sessions"
              >
                <option
                  v-for="(s, idx) in pricingData.daytime.sessions"
                  :key="idx"
                  :value="{ type: 'daytime', data: s }"
                >
                  {{ s.name }} ({{ s.timeRange }})
                </option>
              </optgroup>
              <optgroup v-if="pricingData?.evening" label="Evening">
                <option :value="{ type: 'evening', data: pricingData.evening }">
                  Nightly Session ({{ pricingData.evening.startTime }})
                </option>
              </optgroup>
            </select>
          </div>
          <!-- Bulk dates and days input (same as before) -->
           <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                >Start Date</label
              >
              <input
                v-model="bulkForm.startDate"
                type="date"
                class="w-full rounded-xl border-slate-200 bg-slate-50"
              />
            </div>
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                >End Date</label
              >
              <input
                v-model="bulkForm.endDate"
                type="date"
                class="w-full rounded-xl border-slate-200 bg-slate-50"
              />
            </div>
          </div>
          <div>
            <label
              class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >Days of Week</label
            >
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(day, idx) in weekDays"
                :key="day"
                type="button"
                :class="[
                  'px-3 py-1 rounded text-xs font-bold border transition-colors',
                  bulkForm.days.includes(idx)
                    ? 'bg-primary-900 text-white border-primary-900'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300',
                ]"
                @click="toggleBulkDay(idx)"
              >
                {{ day }}
              </button>
            </div>
          </div>
          <!-- ... -->
        </div>
        <div
          class="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200"
        >
          <BaseButton variant="outline" @click="showBulkModal = false"
            >Cancel</BaseButton
          >
          <BaseButton variant="gold" @click="runBulkGenerate"
            >Generate Sessions</BaseButton
          >
        </div>
      </div>
    </div>

    <!-- Session Editor Modal -->
    <div
      v-if="editingSession"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        class="absolute inset-0 bg-primary-950/60 backdrop-blur-sm"
        @click="closeEditor"
      ></div>
      <div
        class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
      >
        <!-- Modal Header -->
        <div
          class="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10"
        >
          <div>
            <h3 class="text-xl font-black text-primary-900">
              {{
                editingSession.id.startsWith("new")
                  ? "New Session"
                  : "Edit Session"
              }}
            </h3>
            <p class="text-xs text-slate-500 uppercase tracking-widest">
              {{ editingSession.name || "Untitled" }}
            </p>
          </div>
          <button
            type="button"
            class="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition"
            @click="closeEditor"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6">

          <!-- NEW: Linked Configuration -->
          <div class="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 grid sm:grid-cols-2 gap-4">
               <div>
                    <label class="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Pricing Template</label>
                    <div class="flex gap-2">
                        <select
                            v-model="editingSession.pricingSessionId"
                            class="w-full rounded-lg border-indigo-200 text-sm focus:border-indigo-400 focus:ring-indigo-400"
                            @change="handlePricingTemplateChange"
                        >
                            <option value="">-- None --</option>
                            <optgroup label="Daytime">
                                <option
                                    v-for="(s, idx) in pricingData?.daytime?.sessions || []"
                                    :key="s.id || idx"
                                    :value="s.id"
                                >
                                    {{ s.name }}
                                </option>
                            </optgroup>
                            <optgroup label="Evening">
                                <option value="evening-main">Evening Main</option>
                            </optgroup>
                        </select>
                    </div>
               </div>
               <div>
                   <label class="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Linked Program</label>
                   <select v-model="editingSession.programSlug" class="w-full rounded-lg border-indigo-200 text-sm focus:border-indigo-400 focus:ring-indigo-400">
                       <option value="">-- None --</option>
                       <option v-for="p in programs" :key="p.slug" :value="p.slug">{{ p.name }}</option>
                   </select>
               </div>
          </div>

          <!-- Metrics Inputs (Enterprise) -->
          <div
            class="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-3 gap-4"
          >
            <div>
              <label
                class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                >Proj. Revenue</label
              >
              <div class="relative">
                <span class="absolute left-3 top-2 text-slate-400 text-xs"
                  >$</span
                >
                <input
                  v-model.number="editingSession.projectedRevenue"
                  type="number"
                  class="w-full pl-6 rounded-lg border-slate-200 text-xs font-bold text-emerald-600 focus:border-gold focus:ring-gold"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label
                class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                >Tickets Sold</label
              >
              <input
                v-model.number="editingSession.ticketsSold"
                type="number"
                class="w-full rounded-lg border-slate-200 text-xs font-bold text-slate-700 focus:border-gold focus:ring-gold"
                placeholder="0"
              />
            </div>
            <div>
              <label
                class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                >Total Seats</label
              >
              <input
                v-model.number="editingSession.totalSeats"
                type="number"
                class="w-full rounded-lg border-slate-200 text-xs font-bold text-slate-700 focus:border-gold focus:ring-gold"
                placeholder="100"
              />
            </div>
          </div>

          <!-- Basic Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <label class="block">
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block"
                >Session Name</span
              >
              <input
                v-model="editingSession.name"
                type="text"
                class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"
              />
            </label>
            <label class="block">
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block"
                >Category</span
              >
              <input
                v-model="editingSession.category"
                type="text"
                class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"
                list="categories"
              />
              <datalist id="categories">
                <option value="General"></option>
                <option value="Special"></option>
                <option value="Holiday"></option>
              </datalist>
            </label>
          </div>

          <!-- Timing -->
          <div class="grid grid-cols-2 gap-6">
            <label class="block">
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block"
                >Start Time</span
              >
              <input
                v-model="editingSession.startTime"
                type="time"
                placeholder="18:30"
                class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"
              />
            </label>
            <label class="block">
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block"
                >End Time</span
              >
              <input
                v-model="editingSession.endTime"
                type="time"
                placeholder="21:00"
                class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"
              />
            </label>
          </div>

          <!-- Recurring / Override Logic Display -->
          <div
            v-if="editingSession.overrideDate"
            class="bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-start gap-2"
          >
            <AlertTriangle class="w-4 h-4 text-amber-600 mt-0.5" />
            <div>
              <p class="text-xs font-bold text-amber-800">One-Off Override</p>
              <p class="text-[10px] text-amber-700">
                This session is scheduled specifically for
                {{ editingSession.overrideDate }}.
              </p>
            </div>
          </div>
          <div
            v-else-if="
              editingSession.availableDays &&
              editingSession.availableDays.length > 0
            "
            class="bg-primary-50 border border-primary-100 p-3 rounded-lg"
          >
            <p class="text-xs font-bold text-primary-800 mb-2">
              Recurring Schedule
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="day in weekDays"
                :key="day"
                type="button"
                :class="[
                  'px-3 py-1 rounded text-[10px] font-bold transition-all border',
                  editingSession.availableDays?.includes(day)
                    ? 'bg-primary-900 text-white border-primary-900'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300',
                ]"
                @click="toggleDay(day)"
              >
                {{ day }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <label class="block">
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block"
                >Status</span
              >
              <select
                v-model="editingSession.status"
                class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-gold focus:ring-gold"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Live">Live</option>
                <option value="Closing">Closing</option>
                <option value="Sold Out">Sold Out</option>
              </select>
            </label>
            <div class="flex items-center pt-6">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="editingSession.isDraft"
                  type="checkbox"
                  class="rounded border-slate-300 text-gold focus:ring-gold"
                />
                <span class="text-sm font-bold text-slate-700"
                  >Save as Draft</span
                >
              </label>
            </div>
          </div>
        </div>

        <div
          class="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3 z-10 rounded-b-2xl"
        >
          <BaseButton variant="outline" type="button" @click="closeEditor"
            >Cancel</BaseButton
          >
          <BaseButton variant="gold" type="button" @click="saveSession"
            >Done</BaseButton
          >
        </div>
      </div>
    </div>

    <!-- Day Profile Sessions Drawer -->
    <div
      v-if="profileDrawerDate"
      class="fixed inset-0 z-50 flex items-center justify-end"
    >
      <div
        class="absolute inset-0 bg-primary-950/40"
        @click="closeProfileDrawer"
      ></div>
      <div
        class="relative bg-white h-full w-full max-w-md shadow-2xl border-l border-slate-200 flex flex-col"
      >
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Day Profile Sessions
            </p>
            <h3 class="text-lg font-black text-primary-900">
              {{ profileDrawerDate }}
            </h3>
          </div>
          <button
            class="text-slate-400 hover:text-slate-600"
            @click="closeProfileDrawer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-3 overflow-y-auto">
          <div
            v-for="session in getSessionsForDate(
              profileDrawerDate,
              new Date(profileDrawerDate).toLocaleDateString('en-US', { weekday: 'short' }),
            )"
            :key="session.uniqueKey"
            class="rounded-lg border border-slate-200 p-3"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-primary-900">{{ session.name }}</p>
                <p class="text-xs text-slate-500">
                  {{ session.startTime }} - {{ session.endTime }}
                </p>
              </div>
              <button
                class="text-xs font-bold text-primary-600"
                @click="editSession(session)"
              >
                Edit
              </button>
            </div>
          </div>
          <div v-if="getSessionsForDate(
              profileDrawerDate,
              new Date(profileDrawerDate).toLocaleDateString('en-US', { weekday: 'short' }),
            ).length === 0" class="text-sm text-slate-400">
            No sessions assigned.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Edit,
  Copy,
  EyeOff,
  AlertTriangle,
} from "lucide-vue-next";
import BaseCard from "~/components/ui/BaseCard.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import { parseTime } from "~/utils/time.utils";

const props = defineProps<{
  modelValue: any[];
  isSaving: boolean;
  pricingData?: any;
  programs?: any[];
  dayProfiles?: {
    profiles: any[];
    assignments: Record<string, string>;
    overrides: Record<string, any[]>;
  };
}>();

const emit = defineEmits(["update:modelValue", "save", "update:dayProfiles"]);

// --- State ---
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const currentDate = ref(new Date());
const unsavedChanges = ref(false);
const editingSession = ref<any>(null);
const contextMenu = ref({ visible: false, x: 0, y: 0, session: null as any });
const profileDrawerDate = ref<string | null>(null);
const viewMode = ref<"month" | "week" | "agenda">("month");
const filters = ref({
  showDrafts: true,
  highlightConflicts: true,
  showMetrics: true,
});

const pricingReady = computed(() => {
  const pricing = props.pricingData ?? {};
  const daytimeSessions = pricing?.daytime?.sessions?.length ?? 0;
  const eveningDefined =
    Boolean(pricing?.evening?.startTime) ||
    (pricing?.evening?.machines?.length ?? 0) > 0 ||
    (pricing?.evening?.specialtyGames?.length ?? 0) > 0;
  return daytimeSessions > 0 || eveningDefined;
});

const programsReady = computed(() => (props.programs?.length ?? 0) > 0);

// Bulk Ops State
const showBulkModal = ref(false);
const bulkForm = ref({
  template: null as any,
  startDate: "",
  endDate: "",
  days: [] as number[],
});

// --- Computed Calendar Logic ---
const currentMonthName = computed(() =>
  currentDate.value.toLocaleString("default", { month: "long" }),
);
const currentYear = computed(() => currentDate.value.getFullYear());

const calendarCells = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  let startDay = firstDayOfMonth.getDay() - 1;
  if (startDay === -1) startDay = 6;

  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  const cells = [];

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    cells.push(createCell(d, false));
  }

  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(year, month, i);
    cells.push(createCell(d, true));
  }

  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    cells.push(createCell(d, false));
  }

  return cells;
});

const scheduleSummary = computed(() => {
  const monthCells = calendarCells.value.filter((cell) => cell.isCurrentMonth);
  const sessions = monthCells.flatMap((cell) => cell.sessions);
  const totalSessions = sessions.length;
  const projectedRevenue = sessions.reduce(
    (sum, session) => sum + (Number(session.projectedRevenue) || 0),
    0,
  );
  const occupancySum = sessions.reduce(
    (sum, session) => sum + (Number(session.occupancy) || 0),
    0,
  );
  const occupancyAvg = totalSessions
    ? Math.round(occupancySum / totalSessions)
    : 0;
  const conflictDays = monthCells.filter((cell) => cell.hasConflict).length;
  return {
    totalSessions,
    projectedRevenue,
    occupancyAvg,
    conflictDays,
  };
});

const dayProfilesData = computed(() => ({
  profiles: props.dayProfiles?.profiles ?? [],
  assignments: props.dayProfiles?.assignments ?? {},
  overrides: props.dayProfiles?.overrides ?? {},
}));

const weekDates = computed(() => {
  const base = new Date(currentDate.value);
  const day = base.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
});

const agendaSessions = computed(() => {
  const sessions = calendarCells.value.flatMap((cell) =>
    cell.sessions.map((session: any) => ({
      ...session,
      dateStr: cell.dateStr,
    })),
  );
  return sessions.sort((a, b) => {
    if (a.dateStr === b.dateStr) {
      return parseTime(a.startTime) - parseTime(b.startTime);
    }
    return a.dateStr.localeCompare(b.dateStr);
  });
});

const createCell = (date: Date, isCurrentMonth: boolean) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dateStr = `${y}-${m}-${d}`;
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

  const sessions = getSessionsForDate(dateStr, dayName);

  let hasConflict = false;
  if (sessions.length > 1) {
    for (let i = 0; i < sessions.length - 1; i++) {
      const s1 = sessions[i];
      const s2 = sessions[i + 1];
      const start1 = parseTime(s1.startTime || "");
      const end1 = parseTime(s1.endTime || "");
      const start2 = parseTime(s2.startTime || "");

      if (start2 < end1) {
        hasConflict = true;
        if (s1) s1.hasConflict = true;
        if (s2) s2.hasConflict = true;
      }
    }
  }

  return {
    date,
    dateStr,
    dayNum: date.getDate(),
    isCurrentMonth,
    isToday: new Date().toDateString() === date.toDateString(),
    sessions,
    hasConflict,
  };
};

const profileForDate = (dateStr: string) => {
  const profileId = dayProfilesData.value.assignments[dateStr];
  return dayProfilesData.value.profiles.find((p: any) => p.id === profileId);
};

const profileClass = (category?: string) => {
  switch (category) {
    case "weekend":
      return "bg-purple-50 border-purple-200 text-purple-800";
    case "special":
      return "bg-gold/10 border-gold/30 text-gold-800";
    case "closed":
      return "bg-slate-100 border-slate-200 text-slate-500";
    case "weekday":
    default:
      return "bg-sky-50 border-sky-200 text-sky-800";
  }
};

const setDayProfileAssignment = (dateStr: string, profileId: string) => {
  const next = {
    profiles: dayProfilesData.value.profiles,
    assignments: { ...dayProfilesData.value.assignments, [dateStr]: profileId },
    overrides: dayProfilesData.value.overrides,
  };
  emit("update:dayProfiles", next);
  unsavedChanges.value = true;
};

const openProfileDrawer = (dateStr: string) => {
  profileDrawerDate.value = dateStr;
};

const closeProfileDrawer = () => {
  profileDrawerDate.value = null;
};

const getSessionsForDate = (dateStr: string, dayName: string) => {
  const overrides = props.modelValue.filter((s) => s.overrideDate === dateStr);
  const recurring = props.modelValue.filter((s) => {
    if (s.overrideDate) return false;
    if (!s.availableDays?.includes(dayName)) return false;
    if (s.excludedDates?.includes(dateStr)) return false;
    return true;
  });

  let combined = [...overrides, ...recurring];

  if (!filters.value.showDrafts) {
    combined = combined.filter((s) => !s.isDraft);
  }

  return combined
    .map((s) => ({
      ...s,
      uniqueKey: s.id + "-" + dateStr,
      occupancy:
        Math.round(((s.ticketsSold || 0) / (s.totalSeats || 100)) * 100) || 0,
      hasConflict: false,
    }))
    .sort((a, b) => {
      const ta = parseTime(a.startTime);
      const tb = parseTime(b.startTime);
      return ta - tb;
    });
};

const changeMonth = (delta: number) => {
  const d = new Date(currentDate.value);
  d.setMonth(d.getMonth() + delta);
  currentDate.value = d;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Live": return "bg-emerald-500";
    case "Upcoming": return "bg-sky-500";
    case "Closing": return "bg-amber-500";
    case "Sold Out": return "bg-rose-500";
    default: return "bg-slate-300";
  }
};

const formatMoney = (val?: number) => (val ? val.toLocaleString() : "0");

const getProgramName = (slug: string) => {
    return props.programs?.find(p => p.slug === slug)?.name || slug;
};
const getPricingName = (id: string) => {
    if (id === 'evening-main') return 'Evening Main';
    return props.pricingData?.daytime?.sessions?.find((s:any) => s.id === id)?.name || id;
};

// --- Drag and Drop ---
const onDragStart = (e: DragEvent, session: any) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData("application/json", JSON.stringify(session));
    e.dataTransfer.effectAllowed = "move";
  }
};

const onDrop = (e: DragEvent, targetDateStr: string) => {
  const data = e.dataTransfer?.getData("application/json");
  if (!data) return;
  const session = JSON.parse(data);

  const parts = (session.uniqueKey || "").split("-");
  const sourceDateStr = parts.slice(-3).join("-");

  if (sourceDateStr === targetDateStr) return;

  const updatedList = [...props.modelValue];

  if (session.overrideDate) {
    const idx = updatedList.findIndex((s) => s.id === session.id);
    if (idx !== -1) {
      updatedList[idx] = { ...updatedList[idx], overrideDate: targetDateStr };
    }
  } else {
    const recurringIdx = updatedList.findIndex((s) => s.id === session.id);
    if (recurringIdx !== -1) {
      const recurring = { ...updatedList[recurringIdx] };
      recurring.excludedDates = [
        ...(recurring.excludedDates || []),
        sourceDateStr,
      ];
      updatedList[recurringIdx] = recurring;
    }

    const newOverride = {
      ...session,
      id: `override-${Date.now()}`,
      overrideDate: targetDateStr,
      availableDays: [],
      excludedDates: [],
      uniqueKey: undefined,
      hasConflict: false,
    };
    updatedList.push(newOverride);
  }

  emit("update:modelValue", updatedList);
  unsavedChanges.value = true;
};

const toggleFilter = (key: "drafts" | "conflicts" | "metrics") => {
  if (key === "drafts") filters.value.showDrafts = !filters.value.showDrafts;
  if (key === "conflicts")
    filters.value.highlightConflicts = !filters.value.highlightConflicts;
  if (key === "metrics") filters.value.showMetrics = !filters.value.showMetrics;
};

// --- Context Menu ---
const openContextMenu = (e: MouseEvent, session: any) => {
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    session,
  };
};

const closeContextMenu = () => {
  contextMenu.value.visible = false;
};

const handleContextAction = (action: string) => {
  if (!contextMenu.value.session) return;
  const s = contextMenu.value.session;

  if (action === "edit") editSession(s);
  if (action === "delete") deleteSession(s);
  if (action === "duplicate") duplicateSession(s);
  if (action === "toggleDraft") toggleDraft(s);

  closeContextMenu();
};

const toggleDraft = (session: any) => {
  const updatedList = [...props.modelValue];
  const idx = updatedList.findIndex((x) => x.id === session.id);
  if (idx !== -1) {
    updatedList[idx] = {
      ...updatedList[idx],
      isDraft: !updatedList[idx].isDraft,
    };
    emit("update:modelValue", updatedList);
    unsavedChanges.value = true;
  }
};

const duplicateSession = (session: any) => {
  const clone = JSON.parse(JSON.stringify(session));
  clone.id = `copy-${Date.now()}`;
  clone.name += " (Copy)";
  delete clone.uniqueKey;
  delete clone.hasConflict;

  const updatedList = [...props.modelValue, clone];
  emit("update:modelValue", updatedList);
  unsavedChanges.value = true;
};

// --- Editor Logic ---
const createSessionId = () =>
  `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const addNewSession = (dateStr: string) => {
  editingSession.value = {
    id: createSessionId(),
    name: "New Session",
    category: "General",
    startTime: "18:00",
    endTime: "21:00",
    gameType: "Regular",
    status: "Upcoming",
    overrideDate: dateStr,
    availableDays: [],
    pricing: {},
    specials: {},
    isDraft: true,
    projectedRevenue: 0,
    ticketsSold: 0,
    totalSeats: 100,
    programSlug: "",
    pricingSessionId: ""
  };
};

const editSession = (session: any) => {
  const realSession = props.modelValue.find((s) => s.id === session.id);
  if (realSession) {
    editingSession.value = JSON.parse(JSON.stringify(realSession));
  }
};

const handlePricingTemplateChange = () => {
    if (!editingSession.value.pricingSessionId) return;
    const pid = editingSession.value.pricingSessionId;
    let data = null;
    let type = 'daytime';

    if (pid === 'evening-main') {
        data = props.pricingData?.evening;
        type = 'evening';
    } else {
        data = props.pricingData?.daytime?.sessions?.find((s:any) => s.id === pid);
    }

    if (data) {
        if (confirm("Apply template settings (Name, Times, etc.) to this session?")) {
            applyTemplateData(type, data);
        }
    }
};

const applyTemplateData = (type: string, data: any) => {
  if (type === "daytime") {
    editingSession.value.name = data.name;
    if (data.timeRange) {
      const parts = data.timeRange.split("–").map((s: string) => s.trim());
      if (parts.length >= 1) editingSession.value.startTime = parts[0];
      if (parts.length >= 2) editingSession.value.endTime = parts[1];
    }
    editingSession.value.description = data.description;
    editingSession.value.jackpot = data.jackpot;
  } else if (type === "evening") {
    editingSession.value.name = "Evening Session";
    editingSession.value.startTime = data.startTime;
    editingSession.value.description = data.scheduleNote;
    editingSession.value.endTime = "22:00";
  }
};

const saveSession = () => {
  if (!editingSession.value) return;

  const index = props.modelValue.findIndex(
    (s) => s.id === editingSession.value.id,
  );
  const updatedList = [...props.modelValue];

  if (index >= 0) {
    updatedList[index] = editingSession.value;
  } else {
    updatedList.push(editingSession.value);
  }

  emit("update:modelValue", updatedList);
  unsavedChanges.value = true;
  closeEditor();
};

const deleteSession = (session?: any) => {
  const target = session || editingSession.value;
  if (!target) return;

  if (
    !confirm(
      "Are you sure? If this is a recurring session, it will delete ALL instances.",
    )
  )
    return;

  const updatedList = props.modelValue.filter((s) => s.id !== target.id);
  emit("update:modelValue", updatedList);
  unsavedChanges.value = true;
  closeEditor();
};

const closeEditor = () => {
  editingSession.value = null;
};

const toggleDay = (day: string) => {
  if (!editingSession.value) return;
  if (!editingSession.value.availableDays)
    editingSession.value.availableDays = [];

  if (editingSession.value.overrideDate) {
    if (
      !confirm(
        "Converting this one-off session to a recurring schedule will clear the specific date. Continue?",
      )
    )
      return;
    editingSession.value.overrideDate = undefined;
  }

  const days = editingSession.value.availableDays;
  if (days.includes(day)) {
    editingSession.value.availableDays = days.filter((d: string) => d !== day);
  } else {
    days.push(day);
  }
};

// --- Bulk Operations ---
const openBulkModal = () => {
  bulkForm.value = {
    template: null,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
      .toISOString()
      .slice(0, 10),
    days: [4],
  };
  showBulkModal.value = true;
};

const toggleBulkDay = (idx: number) => {
  const i = bulkForm.value.days.indexOf(idx);
  if (i === -1) bulkForm.value.days.push(idx);
  else bulkForm.value.days.splice(i, 1);
};

const runBulkGenerate = () => {
  if (!bulkForm.value.template) return alert("Please select a template.");
  if (!bulkForm.value.startDate || !bulkForm.value.endDate)
    return alert("Please select a date range.");
  if (bulkForm.value.days.length === 0)
    return alert("Please select at least one day of the week.");

  const start = new Date(bulkForm.value.startDate);
  const end = new Date(bulkForm.value.endDate);

  if (start > end) return alert("Start date must be before end date.");
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 365)
    return alert("Please generate less than a year at a time.");

  const { type, data } = bulkForm.value.template;
  const newSessions = [];
  const loopDate = new Date(start);

  while (loopDate <= end) {
    let dayIndex = loopDate.getDay() - 1;
    if (dayIndex === -1) dayIndex = 6;

    if (bulkForm.value.days.includes(dayIndex)) {
      const dateStr = loopDate.toISOString().slice(0, 10);

      const newSession = {
        id: createSessionId(),
        name: type === "daytime" ? data.name : "Evening Session",
        category: type === "daytime" ? data.name.split(" ")[0] : "Evening",
        startTime: "",
        endTime: type === "evening" ? "22:00" : "",
        gameType: "Regular",
        status: "Upcoming",
        overrideDate: dateStr,
        availableDays: [],
        pricing: {},
        specials: {},
        isDraft: false,
        projectedRevenue: 0,
        ticketsSold: 0,
        totalSeats: 100,
        programSlug: "",
        pricingSessionId: type === "evening" ? "evening-main" : data.id
      };

      if (type === "daytime") {
        if (data.timeRange) {
          const parts = data.timeRange.split("–").map((s: string) => s.trim());
          if (parts.length >= 1) newSession.startTime = parts[0];
          if (parts.length >= 2) newSession.endTime = parts[1];
        }
        newSession.description = data.description;
        newSession.jackpot = data.jackpot;
      } else {
        newSession.startTime = data.startTime;
        newSession.description = data.scheduleNote;
      }

      newSessions.push(newSession);
    }

    loopDate.setDate(loopDate.getDate() + 1);
  }

  if (newSessions.length > 0) {
    const updatedList = [...props.modelValue, ...newSessions];
    emit("update:modelValue", updatedList);
    unsavedChanges.value = true;
    showBulkModal.value = false;
    alert(`Generated ${newSessions.length} sessions.`);
  } else {
    alert("No dates matched your selection criteria.");
  }
};

// --- Conflict Validation ---
const validateConflicts = () => {
  const errors = [];
  const list = props.modelValue;
  const recurring = list.filter(
    (s) => !s.overrideDate && s.availableDays && s.availableDays.length > 0,
  );
  for (let i = 0; i < recurring.length; i++) {
    for (let j = i + 1; j < recurring.length; j++) {
      const s1 = recurring[i];
      const s2 = recurring[j];
      const commonDays = s1.availableDays.filter((d: string) =>
        s2.availableDays.includes(d),
      );
      if (commonDays.length > 0) {
        if (checkTimeOverlap(s1, s2)) {
          errors.push(
            `Recurring conflict: "${s1.name}" vs "${s2.name}" on ${commonDays.join(", ")}`,
          );
        }
      }
    }
  }

  const overrides = list.filter((s) => s.overrideDate);
  const byDate: Record<string, any[]> = {};
  overrides.forEach((s) => {
    if (!byDate[s.overrideDate]) byDate[s.overrideDate] = [];
    byDate[s.overrideDate].push(s);
  });

  for (const date in byDate) {
    const sessionsOnDate = byDate[date];
    if (sessionsOnDate.length < 2) continue;
    for (let i = 0; i < sessionsOnDate.length; i++) {
      for (let j = i + 1; j < sessionsOnDate.length; j++) {
        if (checkTimeOverlap(sessionsOnDate[i], sessionsOnDate[j])) {
          errors.push(
            `Date conflict (${date}): "${sessionsOnDate[i].name}" vs "${sessionsOnDate[j].name}"`,
          );
        }
      }
    }
  }

  overrides.forEach((ov) => {
    const dateObj = new Date(ov.overrideDate);
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dow = dayMap[dateObj.getDay()];

    const activeRecurring = recurring.filter(
      (r) =>
        r.availableDays.includes(dow) &&
        (!r.excludedDates || !r.excludedDates.includes(ov.overrideDate)),
    );

    activeRecurring.forEach((rec) => {
      if (checkTimeOverlap(ov, rec)) {
        errors.push(
          `Conflict (${ov.overrideDate}): Override "${ov.name}" overlaps with recurring "${rec.name}"`,
        );
      }
    });
  });

  return errors;
};

const checkTimeOverlap = (s1: any, s2: any) => {
  const start1 = parseTime(s1.startTime || "");
  const end1 = parseTime(s1.endTime || "");
  const start2 = parseTime(s2.startTime || "");
  const end2 = parseTime(s2.endTime || "");
  return start1 < end2 && start2 < end1;
};

const saveAll = () => {
  const conflicts = validateConflicts();
  if (conflicts.length > 0) {
    alert(
      "Cannot save due to schedule conflicts:\n\n" +
        conflicts.slice(0, 3).join("\n") +
        (conflicts.length > 3 ? "\n...and more" : ""),
    );
    return;
  }

  emit("save");
  unsavedChanges.value = false;
};
</script>
