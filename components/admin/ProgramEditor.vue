<template>
  <div
    class="grid gap-0 h-full select-none"
    :style="{
      gridTemplateColumns: `${leftPanelWidth}px 4px minmax(0,1fr) 4px ${rightPanelWidth}px`,
    }"
  >
    <!-- Library Sidebar -->
    <div
      class="h-full flex flex-col bg-surface border border-divider rounded-xl overflow-hidden shadow-sm"
    >
      <div class="p-4 space-y-3 border-b border-divider bg-base/30">
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-[10px] uppercase tracking-widest text-slate-500 font-bold"
            >
              Library
            </p>
            <h3 class="text-lg font-bold text-slate-900">Programs</h3>
          </div>
          <button
            class="text-xs font-bold text-accent-primary border border-divider bg-surface hover:bg-base rounded-lg px-3 py-1.5 transition-colors"
            :disabled="!patternsReady"
            @click="confirmAction(startEdit)"
          >
            + New
          </button>
        </div>
        <div class="relative">
          <input
            v-model="programSearch"
            type="text"
            placeholder="Search programs..."
            class="w-full rounded-lg border-divider bg-base px-3 py-2 text-xs focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
          />
        </div>
        <div
          v-if="!patternsReady"
          class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-bold text-amber-700 flex items-center gap-2"
        >
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Add patterns before creating programs.
        </div>
      </div>
      <div class="flex-1 p-2 space-y-1 overflow-y-auto">
        <button
          v-for="p in filteredPrograms"
          :key="p.slug"
          class="w-full text-left rounded-lg border px-3 py-2.5 transition-all duration-200 group"
          :class="
            editingProgram?.slug === p.slug
              ? 'border-accent-primary bg-accent-primary/5 shadow-sm'
              : 'border-transparent hover:bg-base hover:border-divider'
          "
          @click="confirmAction(() => startEdit(p))"
        >
          <div class="flex justify-between items-start">
            <div
              class="text-sm font-bold text-slate-900 group-hover:text-accent-primary transition-colors"
            >
              {{ p.name }}
            </div>
            <button
              class="text-[10px] font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-700"
              @click.stop="deleteProgram(p.slug)"
            >
              Delete
            </button>
          </div>
          <div
            class="text-[10px] uppercase tracking-widest text-slate-500 mt-1"
          >
            {{ p.games.length }} games
          </div>
        </button>
      </div>
    </div>

    <!-- Resizer Left -->
    <div
      class="w-1 h-full cursor-col-resize hover:bg-accent-primary/50 transition-colors active:bg-accent-primary z-10"
      @mousedown="startResizeLeft"
    ></div>

    <!-- Orchestrator Area -->
    <div class="flex flex-col gap-4 h-full overflow-y-auto px-2">
      <div class="flex items-center justify-between shrink-0">
        <div>
          <p
            class="text-[10px] uppercase tracking-widest text-slate-500 font-bold"
          >
            Program Orchestrator
          </p>
          <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            {{ form.name || "Select a Program" }}
            <span
              v-if="isDirty"
              class="text-amber-500 text-sm"
              title="Unsaved changes"
              >*</span
            >
          </h3>
        </div>
        <div class="flex gap-2">
          <div
            class="text-xs text-slate-500 font-bold bg-surface px-3 py-1.5 rounded-lg border border-divider"
          >
            Total Payout: ${{ totalPayout }}
          </div>
          <div
            class="text-xs text-slate-500 font-bold bg-surface px-3 py-1.5 rounded-lg border border-divider"
          >
            Duration: {{ totalDuration }}m
          </div>
        </div>
      </div>

      <div
        class="bg-surface border border-divider rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm"
      >
        <label class="block">
          <span
            class="text-xs font-bold text-slate-500 uppercase tracking-wider"
            >Name</span
          >
          <input
            v-model="form.name"
            class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
            :class="{
              'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500':
                validationErrors.name,
            }"
          />
          <p
            v-if="validationErrors.name"
            class="text-xs text-rose-500 mt-1 font-medium"
          >
            {{ validationErrors.name }}
          </p>
        </label>
        <label class="block">
          <span
            class="text-xs font-bold text-slate-500 uppercase tracking-wider"
            >Slug</span
          >
          <input
            v-model="form.slug"
            class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all disabled:opacity-50"
            :class="{
              'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500':
                validationErrors.slug,
            }"
            :disabled="!editingProgram?.isNew"
          />
          <p
            v-if="validationErrors.slug"
            class="text-xs text-rose-500 mt-1 font-medium"
          >
            {{ validationErrors.slug }}
          </p>
        </label>
        <label class="block">
          <span
            class="text-xs font-bold text-slate-500 uppercase tracking-wider"
            >Description</span
          >
          <input
            v-model="form.description"
            class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
            :class="{
              'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500':
                validationErrors.description,
            }"
          />
          <p
            v-if="validationErrors.description"
            class="text-xs text-rose-500 mt-1 font-medium"
          >
            {{ validationErrors.description }}
          </p>
        </label>
      </div>

      <!-- Games Validation Error -->
      <div
        v-if="validationErrors.games"
        class="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3"
      >
        <AlertCircle class="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        <p class="text-sm text-rose-600 font-medium">
          {{ validationErrors.games }}
        </p>
      </div>

      <div
        class="bg-surface border border-divider rounded-xl flex flex-col shadow-sm flex-1 min-h-[400px]"
      >
        <div
          class="p-4 border-b border-divider flex items-center justify-between bg-base/30"
        >
          <div
            class="text-xs font-bold uppercase tracking-widest text-slate-500"
          >
            Setlist
          </div>
          <div class="flex gap-2">
            <button
              class="text-xs font-bold border border-divider bg-surface hover:bg-base text-slate-900 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1"
              @click="addGame"
            >
              <span>+ Game</span>
            </button>
            <button
              class="text-xs font-bold border border-dashed border-divider hover:border-slate-500 text-slate-500 hover:text-slate-900 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1"
              @click="addBreak"
            >
              <span>+ Break</span>
            </button>
          </div>
        </div>

        <div class="flex-1 p-4 space-y-2 overflow-y-auto">
          <div
            v-for="(game, idx) in form.games"
            :key="`${game.title}-${idx}`"
            class="flex items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-200 cursor-move group"
            :class="[
              isBreak(game)
                ? 'border-dashed border-divider bg-base/50'
                : 'border-divider bg-surface hover:border-accent-primary/50',
              selectedGameIndex === idx
                ? 'ring-2 ring-accent-primary border-transparent'
                : '',
            ]"
            draggable="true"
            @dragstart="dragIndex = idx"
            @dragover.prevent
            @drop="reorder(idx)"
            @click="selectGame(idx)"
            @contextmenu.prevent="showContextMenu($event, idx)"
          >
            <div
              class="text-xs font-bold text-slate-500 w-6 text-center select-none cursor-grab active:cursor-grabbing"
            >
              {{ idx + 1 }}
            </div>
            <div class="flex-1">
              <div class="text-sm font-bold text-slate-900">
                {{ game.title }}
              </div>
              <div
                class="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5"
              >
                {{ game.patternSlug || "No Pattern" }}
              </div>
            </div>
            <button
              class="text-xs font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50"
              @click.stop="removeGame(idx)"
            >
              Remove
            </button>
          </div>

          <div
            v-if="form.games.length === 0"
            class="flex flex-col items-center justify-center h-40 text-slate-500 border-2 border-dashed border-divider rounded-xl bg-base/30"
          >
            <p class="text-sm font-medium">No games yet</p>
            <p class="text-xs mt-1">
              Add a game or break to start building the program.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Resizer Right -->
    <div
      class="w-1 h-full cursor-col-resize hover:bg-accent-primary/50 transition-colors active:bg-accent-primary z-10"
      @mousedown="startResizeRight"
    ></div>

    <!-- Inspector Panel -->
    <div
      class="h-full bg-surface border border-divider rounded-xl overflow-hidden shadow-sm flex flex-col"
    >
      <div
        class="p-4 border-b border-divider bg-base/30 flex justify-between items-center"
      >
        <div>
          <p
            class="text-[10px] uppercase tracking-widest text-slate-500 font-bold"
          >
            Inspector
          </p>
          <h3 class="text-lg font-bold text-slate-900 truncate max-w-[200px]">
            {{ selectedGame ? selectedGame.title : "No Selection" }}
          </h3>
        </div>
        <div class="flex gap-1">
          <button
            v-if="selectedGame"
            class="p-1 hover:bg-base rounded text-slate-500 hover:text-slate-900 transition-colors"
            title="Toggle JSON Inspector"
            @click="showInspector = !showInspector"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="selectedGame" class="flex-1 flex flex-col overflow-hidden">
        <!-- Inspector Tabs -->
        <div class="flex border-b border-divider bg-base/30">
          <button
            v-for="tab in [
              'General',
              'Payout',
              'Pricing',
              'Timeline',
              'Preview',
            ]"
            :key="tab"
            class="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border-b-2"
            :class="
              activeTab === tab
                ? 'border-accent-primary text-slate-900 bg-surface'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-surface/50'
            "
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <div class="p-4 space-y-6 overflow-y-auto flex-1">
          <!-- General Tab -->
          <div
            v-if="activeTab === 'General'"
            class="space-y-4 animate-in fade-in duration-300"
          >
            <label class="block">
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Title</span
              >
              <input
                v-model="selectedGame.title"
                class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
              />
            </label>
            <label class="block">
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Paper Color</span
              >
              <div class="flex items-center gap-2 mt-1.5">
                <input
                  :value="selectedGame.paperColor || '#ffffff'"
                  type="color"
                  class="w-10 h-10 rounded cursor-pointer border border-divider p-1 bg-white"
                  @input="
                    selectedGame.paperColor = (
                      $event.target as HTMLInputElement
                    ).value
                  "
                />
                <span class="text-xs font-mono text-slate-500">{{
                  selectedGame.paperColor || "#ffffff"
                }}</span>
              </div>
            </label>
            <label class="block">
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Notes</span
              >
              <textarea
                v-model="selectedGame.notes"
                rows="3"
                class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all resize-none"
              ></textarea>
            </label>

            <div class="border-t border-divider pt-6 space-y-4">
              <div
                class="text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Pattern Picker
              </div>
              <div class="space-y-2">
                <input
                  v-model="patternSearch"
                  type="text"
                  placeholder="Search patterns..."
                  class="w-full rounded-lg border-divider bg-base px-3 py-2 text-xs focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
                />
                <select
                  v-model="patternCategory"
                  class="w-full rounded-lg border-divider bg-base px-3 py-2 text-xs focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
                >
                  <option
                    v-for="category in patternCategories"
                    :key="category"
                    :value="category"
                  >
                    {{ category }}
                  </option>
                </select>
              </div>

              <div
                class="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1"
              >
                <button
                  v-for="pattern in filteredPatterns"
                  :key="pattern.slug"
                  class="border rounded-lg p-2 text-left transition-all duration-200 hover:shadow-sm"
                  :class="
                    pattern.slug === selectedGame.patternSlug
                      ? 'border-accent-primary bg-accent-primary/5 ring-1 ring-accent-primary'
                      : 'border-divider bg-surface hover:border-slate-500/50'
                  "
                  @click="selectedGame.patternSlug = pattern.slug"
                >
                  <div class="text-xs font-bold text-slate-900 mb-2 truncate">
                    {{ pattern.name }}
                  </div>
                  <div
                    class="aspect-square bg-white rounded border border-divider/50 overflow-hidden"
                  >
                    <BingoPatternGrid
                      :name="pattern.name"
                      :definition="pattern.definition"
                      :fill-color="selectedGame.paperColor"
                      size="xs"
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Payout Tab -->
          <div
            v-if="activeTab === 'Payout'"
            class="space-y-4 animate-in fade-in duration-300"
          >
            <label class="block">
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Payout Type</span
              >
              <select
                v-model="selectedGame.payout.type"
                class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
              >
                <option value="fixed">Fixed Amount</option>
                <option value="percentage">Percentage of Sales</option>
                <option value="progressive">Progressive Jackpot</option>
                <option value="merchandise">Merchandise / Other</option>
              </select>
            </label>

            <div
              v-if="
                selectedGame.payout.type === 'fixed' ||
                selectedGame.payout.type === 'progressive'
              "
              class="block"
            >
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Amount ($)</span
              >
              <input
                v-model.number="selectedGame.payout.amount"
                type="number"
                min="0"
                step="0.01"
                class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
              />
            </div>

            <div v-if="selectedGame.payout.type === 'percentage'" class="block">
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Percentage (%)</span
              >
              <input
                v-model.number="selectedGame.payout.percentage"
                type="number"
                min="0"
                max="100"
                class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
              />
            </div>

            <label class="block">
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Description / Notes</span
              >
              <textarea
                v-model="selectedGame.payout.description"
                rows="3"
                class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all resize-none"
                placeholder="Details about the prize..."
              ></textarea>
            </label>
          </div>

          <!-- Pricing Tab -->
          <div
            v-if="activeTab === 'Pricing'"
            class="space-y-4 animate-in fade-in duration-300"
          >
            <label class="block">
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Pricing Model</span
              >
              <select
                v-model="selectedGame.pricing.model"
                class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
              >
                <option value="included">Included in Session</option>
                <option value="standard">Standard Cost</option>
                <option value="premium">Premium / Upcharge</option>
              </select>
            </label>

            <div v-if="selectedGame.pricing.model !== 'included'" class="block">
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Price ($)</span
              >
              <input
                v-model.number="selectedGame.pricing.price"
                type="number"
                min="0"
                step="0.01"
                class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
              />
            </div>
            <div
              class="p-4 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 text-xs"
            >
              <p class="font-bold mb-1">Pricing Note</p>
              <p>
                "Included" games are covered by the base session fee. "Standard"
                and "Premium" allow defining specific costs for extra cards or
                special games.
              </p>
            </div>
          </div>

          <!-- Timeline Tab -->
          <div
            v-if="activeTab === 'Timeline'"
            class="space-y-4 animate-in fade-in duration-300"
          >
            <label class="block">
              <span
                class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >Estimated Duration (Minutes)</span
              >
              <input
                v-model.number="selectedGame.timeline.estimatedDuration"
                type="number"
                min="1"
                class="mt-1.5 w-full rounded-lg border-divider bg-base px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all"
              />
            </label>

            <label
              class="flex items-center gap-3 p-3 rounded-lg border border-divider bg-base"
            >
              <input
                v-model="selectedGame.timeline.isBreak"
                type="checkbox"
                class="w-5 h-5 rounded border-gray-300 text-accent-primary focus:ring-accent-primary"
              />
              <span class="text-sm font-bold text-slate-900"
                >Is this a Break / Intermission?</span
              >
            </label>
          </div>

          <!-- Preview Tab -->
          <div
            v-if="activeTab === 'Preview'"
            class="space-y-4 animate-in fade-in duration-300 h-full flex flex-col"
          >
            <div
              class="flex-1 flex items-center justify-center bg-base/50 rounded-lg border border-divider p-4 relative min-h-[200px]"
            >
              <div
                v-if="selectedPattern"
                class="flex flex-col items-center gap-4"
              >
                <div class="text-sm font-bold text-slate-900">
                  {{ selectedPattern.name }}
                </div>
                <BingoPatternGrid
                  :name="selectedPattern.name"
                  :definition="{
                    frames: [
                      selectedPattern.definition.frames?.[currentFrame] || [],
                    ],
                  }"
                  :fill-color="selectedGame.paperColor"
                  size="md"
                />
                <div class="text-xs text-slate-500 font-mono">
                  Frame {{ currentFrame + 1 }} / {{ maxFrames }}
                </div>
              </div>
              <div v-else class="text-slate-500 text-sm">
                No Pattern Selected
              </div>
            </div>

            <!-- Playback Controls -->
            <div
              class="bg-surface border border-divider rounded-lg p-3 space-y-3"
            >
              <div class="flex items-center justify-center gap-4">
                <button
                  class="p-2 hover:bg-base rounded-full transition-colors disabled:opacity-50"
                  :disabled="maxFrames <= 1"
                  title="Previous Frame"
                  @click="prevFrame"
                >
                  <SkipBack class="w-4 h-4" />
                </button>
                <button
                  class="p-3 bg-accent-primary text-white rounded-full hover:bg-accent-primary/90 transition-all shadow-sm disabled:opacity-50"
                  :disabled="maxFrames <= 1"
                  :title="isPlaying ? 'Pause' : 'Play'"
                  @click="togglePlayback"
                >
                  <component
                    :is="isPlaying ? Pause : Play"
                    class="w-5 h-5 fill-current"
                  />
                </button>
                <button
                  class="p-2 hover:bg-base rounded-full transition-colors disabled:opacity-50"
                  :disabled="maxFrames <= 1"
                  title="Next Frame"
                  @click="nextFrame"
                >
                  <SkipForward class="w-4 h-4" />
                </button>
              </div>

              <div class="space-y-1">
                <div
                  class="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 font-bold"
                >
                  <span>Speed</span>
                  <span>{{ playbackSpeed }}ms</span>
                </div>
                <input
                  v-model.number="playbackSpeed"
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  class="w-full accent-accent-primary"
                />
              </div>
            </div>

            <!-- Metrics & Inspection -->
            <div class="space-y-2">
              <div
                class="text-[10px] uppercase tracking-widest text-slate-500 font-bold"
              >
                Performance Metrics
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div class="bg-base/50 p-2 rounded border border-divider">
                  <div class="text-[10px] text-slate-500 uppercase">
                    Est. Duration
                  </div>
                  <div class="text-sm font-mono font-bold text-slate-900">
                    {{ selectedGame.timeline?.estimatedDuration || 0 }} min
                  </div>
                </div>
                <div class="bg-base/50 p-2 rounded border border-divider">
                  <div class="text-[10px] text-slate-500 uppercase">
                    Payout Density
                  </div>
                  <div class="text-sm font-mono font-bold text-slate-900">
                    ${{ payoutDensity }}/min
                  </div>
                </div>
                <div class="bg-base/50 p-2 rounded border border-divider">
                  <div class="text-[10px] text-slate-500 uppercase">
                    Active Cells
                  </div>
                  <div class="text-sm font-mono font-bold text-slate-900">
                    {{ currentActiveCells }} / 25
                  </div>
                </div>
                <div class="bg-base/50 p-2 rounded border border-divider">
                  <div class="text-[10px] text-slate-500 uppercase">
                    Saturation
                  </div>
                  <div class="text-sm font-mono font-bold text-slate-900">
                    {{ saturationPercentage }}%
                  </div>
                </div>
              </div>
            </div>

            <!-- Variable Inspector -->
            <div class="space-y-2">
              <button
                class="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold hover:text-slate-900 transition-colors w-full text-left"
                @click="showInspector = !showInspector"
              >
                <span
                  class="transform transition-transform"
                  :class="showInspector ? 'rotate-90' : ''"
                  >▶</span
                >
                Debug & State Inspector
              </button>

              <div
                v-if="showInspector"
                class="bg-gray-900 rounded-lg p-3 space-y-3 overflow-hidden animate-in slide-in-from-top-2 duration-200"
              >
                <!-- Live State -->
                <div
                  class="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono text-gray-300 border-b border-gray-700 pb-2"
                >
                  <div class="text-gray-500">State</div>
                  <div>{{ isPlaying ? "Playing" : "Paused" }}</div>
                  <div class="text-gray-500">Frame</div>
                  <div>{{ currentFrame }} / {{ maxFrames }}</div>
                  <div class="text-gray-500">Speed</div>
                  <div>{{ playbackSpeed }}ms</div>
                  <div class="text-gray-500">Pattern</div>
                  <div class="truncate">{{ selectedGame.patternSlug }}</div>
                </div>

                <!-- Raw Data -->
                <div class="space-y-1">
                  <div class="text-[10px] text-gray-500 font-bold uppercase">
                    Game Data Model
                  </div>
                  <pre
                    class="text-[9px] text-green-400 overflow-auto max-h-[150px] scrollbar-thin scrollbar-thumb-gray-700"
                    >{{ JSON.stringify(selectedGame, null, 2) }}</pre
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex-1 flex items-center justify-center text-slate-500 p-8 text-center"
      >
        <div>
          <p class="text-sm font-medium">No Game Selected</p>
          <p class="text-xs mt-1">
            Select a game from the setlist to edit its details.
          </p>
        </div>
      </div>

      <div class="p-4 border-t border-divider bg-base/30">
        <button
          class="w-full flex items-center justify-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg shadow-sm transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          :disabled="isSaving"
          @click="saveProgram"
        >
          <SaveIcon v-if="!isSaving" class="w-4 h-4" />
          <div
            v-else
            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
          ></div>
          {{ isSaving ? "Saving..." : "Save Program" }}
        </button>
      </div>
    </div>
    <div
      v-if="confirmationModal.visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div
        class="bg-surface border border-divider rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200"
      >
        <div class="flex items-center gap-3 text-amber-500 mb-4">
          <AlertCircle class="w-6 h-6" />
          <h3 class="text-lg font-bold text-slate-900">Unsaved Changes</h3>
        </div>
        <p class="text-sm text-slate-500 mb-6">
          You have unsaved changes. Are you sure you want to discard them?
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-base rounded-lg transition-colors"
            @click="cancelAction"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors shadow-sm"
            @click="proceedWithAction"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="contextMenu.visible"
      ref="contextMenuRef"
      class="fixed z-50 bg-surface border border-divider rounded-lg shadow-lg py-1 min-w-[160px]"
      :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
    >
      <button
        class="w-full text-left px-4 py-2 text-sm text-slate-900 hover:bg-base flex items-center gap-2"
        @click="duplicateGame"
      >
        <Copy class="w-4 h-4" />
        Duplicate
      </button>
      <button
        class="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 flex items-center gap-2"
        @click="deleteGameFromMenu"
      >
        <Trash2 class="w-4 h-4" />
        Delete
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useMagicKeys, whenever } from "@vueuse/core";
import BingoPatternGrid from "~/components/bingo/BingoPatternGrid.vue";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Trash2,
  Copy,
  Save as SaveIcon,
  AlertCircle,
} from "lucide-vue-next";

const props = defineProps<{
  programs: any[];
  patterns: any[];
  isSaving?: boolean;
}>();

const emit = defineEmits<{
  (e: "save", program: any): void;
  (e: "delete", slug: string): void;
  (e: "navigate", step: string): void;
  (e: "dirty-change", isDirty: boolean): void;
}>();

const activeTab = ref("General");
const editingProgram = ref<any>(null);
const programSearch = ref("");
const patternSearch = ref("");
const patternCategory = ref("All");
const dragIndex = ref<number | null>(null);
const selectedGameIndex = ref<number | null>(null);

const patternsReady = computed(() => props.patterns.length > 0);

const form = ref({
  slug: "",
  name: "",
  description: "",
  games: [] as any[],
});

const filteredPrograms = computed(() => {
  const term = programSearch.value.trim().toLowerCase();
  return props.programs.filter((program) => {
    if (!term) return true;
    return (
      program.name?.toLowerCase().includes(term) ||
      program.slug?.toLowerCase().includes(term)
    );
  });
});

const patternCategories = computed(() => {
  const categories = props.patterns
    .map((pattern) => pattern.category)
    .filter((c) => c && typeof c === "string") as string[];
  return Array.from(new Set(["All", ...categories]));
});

const filteredPatterns = computed(() => {
  const term = patternSearch.value.trim().toLowerCase();
  const allowed = patternCategories.value.includes(patternCategory.value)
    ? patternCategory.value
    : "All";
  return props.patterns.filter((pattern) => {
    const matchesCategory =
      allowed === "All" || (pattern.category && pattern.category === allowed);
    if (!term) return true;
    return (
      matchesCategory &&
      (pattern.name?.toLowerCase().includes(term) ||
        pattern.slug?.toLowerCase().includes(term))
    );
  });
});

const showInspector = ref(false);
const validationErrors = ref<Record<string, string>>({});

const confirmationModal = ref({
  visible: false,
  pendingAction: null as (() => void) | null,
});

const originalForm = ref("");

// Deep equality check for dirty detection to prevent false positives
const isDirty = computed(() => {
  if (!originalForm.value) return false;
  const current = JSON.stringify(form.value);
  return current !== originalForm.value;
});

watch(isDirty, (newVal) => {
  emit("dirty-change", newVal);
});

const startEdit = (program?: any) => {
  if (program) {
    form.value = JSON.parse(
      JSON.stringify({
        slug: program.slug,
        name: program.name,
        description: program.description,
        games: program.games.map((game: any) => ({
          sortOrder: game.sortOrder,
          title: game.title,
          paperColor: game.paperColor,
          notes: game.notes,
          patternSlug: game.patternSlug,
          pricing: game.pricing,
          payout: game.payout,
          timeline: game.timeline,
        })),
      }),
    );
  } else {
    form.value = {
      slug: "",
      name: "",
      description: "",
      games: [],
    };
  }
  originalForm.value = JSON.stringify(form.value);
  editingProgram.value = program || { isNew: true };
  selectedGameIndex.value = form.value.games.length ? 0 : null;
};

const confirmAction = (action: () => void) => {
  if (isDirty.value) {
    confirmationModal.value = {
      visible: true,
      pendingAction: action,
    };
  } else {
    action();
  }
};

const proceedWithAction = () => {
  if (confirmationModal.value.pendingAction) {
    confirmationModal.value.pendingAction();
  }
  confirmationModal.value = { visible: false, pendingAction: null };
};

const cancelAction = () => {
  confirmationModal.value = { visible: false, pendingAction: null };
};

const addGame = () => {
  if (!patternsReady.value) return;
  form.value.games.push({
    sortOrder: form.value.games.length + 1,
    title: "New Game",
    paperColor: "#ffffff",
    notes: "",
    patternSlug: props.patterns[0]?.slug || "",
    pricing: { model: "included" },
    payout: { type: "fixed", amount: 0 },
    timeline: { estimatedDuration: 10, isBreak: false },
  });
  selectedGameIndex.value = form.value.games.length - 1;
};

const addBreak = () => {
  form.value.games.push({
    sortOrder: form.value.games.length + 1,
    title: "Break",
    paperColor: "#f8fafc",
    notes: "Break",
    patternSlug: props.patterns[0]?.slug || "",
    pricing: { model: "included" },
    payout: { type: "fixed", amount: 0 },
    timeline: { estimatedDuration: 15, isBreak: true },
  });
  selectedGameIndex.value = form.value.games.length - 1;
};

const removeGame = (idx: number) => {
  form.value.games.splice(idx, 1);
  if (selectedGameIndex.value === idx) {
    selectedGameIndex.value = null;
  }
};

const totalDuration = computed(() => {
  return form.value.games.reduce((sum, game) => {
    return sum + (Number(game.timeline?.estimatedDuration) || 0);
  }, 0);
});

const reorder = (targetIndex: number) => {
  if (dragIndex.value === null) return;
  const [moved] = form.value.games.splice(dragIndex.value, 1);
  form.value.games.splice(targetIndex, 0, moved);
  form.value.games.forEach((game, i) => (game.sortOrder = i + 1));
  dragIndex.value = null;
};

const selectGame = (idx: number) => {
  selectedGameIndex.value = idx;
};

const selectedGame = computed(() =>
  selectedGameIndex.value !== null
    ? form.value.games[selectedGameIndex.value]
    : null,
);

const saveProgram = () => {
  // Clear previous validation errors
  validationErrors.value = {};

  // Basic client-side validation
  if (!form.value.slug || !form.value.slug.trim()) {
    validationErrors.value["slug"] = "Program slug is required";
    return;
  }
  if (!form.value.name || !form.value.name.trim()) {
    validationErrors.value["name"] = "Program name is required";
    return;
  }
  if (form.value.games.length === 0) {
    validationErrors.value["games"] = "At least one game is required";
    return;
  }

  // Validate games
  for (let i = 0; i < form.value.games.length; i++) {
    const game = form.value.games[i];
    if (!game.title || !game.title.trim()) {
      validationErrors.value[`games[${i}].title`] = "Game title is required";
      return;
    }
    if (!game.patternSlug) {
      validationErrors.value[`games[${i}].patternSlug`] =
        "Game pattern is required";
      return;
    }
  }

  form.value.games.forEach((game, i) => (game.sortOrder = i + 1));
  emit("save", form.value);
};

defineExpose({
  triggerSave: () => {
    saveProgram();
  },
});

const deleteProgram = (slug: string) => {
  emit("delete", slug);
};

const isBreak = (game: any) => game.title.toLowerCase().includes("break");

const totalPayout = computed(() => {
  return form.value.games.reduce((sum, game) => {
    if (game.payout?.type === "fixed" || game.payout?.type === "progressive") {
      return sum + (Number(game.payout.amount) || 0);
    }
    return sum;
  }, 0);
});

// Shortcuts
const keys = useMagicKeys();
whenever(keys.ctrl_s, (e) => {
  e.preventDefault();
  saveProgram();
});
whenever(keys.ctrl_n, (e) => {
  e.preventDefault();
  addGame();
});

// Simulation State
const isPlaying = ref(false);
const currentFrame = ref(0);
const playbackInterval = ref<any>(null);
const playbackSpeed = ref(1000);

const selectedPattern = computed(() => {
  if (!selectedGame.value?.patternSlug) return null;
  return props.patterns.find((p) => p.slug === selectedGame.value.patternSlug);
});

const maxFrames = computed(() => {
  if (!selectedPattern.value?.definition?.frames) return 1;
  return selectedPattern.value.definition.frames.length;
});

const currentActiveCells = computed(() => {
  if (!selectedPattern.value?.definition?.frames) return 0;
  const frame = selectedPattern.value.definition.frames[currentFrame.value];
  if (!frame) return 0;
  return frame.reduce((sum: number, cell: number) => sum + (cell ? 1 : 0), 0);
});

const payoutDensity = computed(() => {
  const amount = Number(selectedGame.value?.payout?.amount) || 0;
  const duration = Number(selectedGame.value?.timeline?.estimatedDuration) || 1;
  return (amount / duration).toFixed(2);
});

const saturationPercentage = computed(() => {
  return Math.round((currentActiveCells.value / 25) * 100);
});

const togglePlayback = () => {
  if (isPlaying.value) {
    pausePlayback();
  } else {
    startPlayback();
  }
};

const startPlayback = () => {
  if (maxFrames.value <= 1) return;
  isPlaying.value = true;
  playbackInterval.value = setInterval(() => {
    currentFrame.value = (currentFrame.value + 1) % maxFrames.value;
  }, playbackSpeed.value);
};

const pausePlayback = () => {
  isPlaying.value = false;
  if (playbackInterval.value) {
    clearInterval(playbackInterval.value);
    playbackInterval.value = null;
  }
};

const nextFrame = () => {
  if (maxFrames.value <= 1) return;
  currentFrame.value = (currentFrame.value + 1) % maxFrames.value;
};

const prevFrame = () => {
  if (maxFrames.value <= 1) return;
  currentFrame.value =
    (currentFrame.value - 1 + maxFrames.value) % maxFrames.value;
};

// Reset frame when selection changes
watch(selectedGameIndex, () => {
  pausePlayback();
  currentFrame.value = 0;
});

watch(playbackSpeed, () => {
  if (isPlaying.value) {
    pausePlayback();
    startPlayback();
  }
});

// Context Menu
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  index: -1,
});

const showContextMenu = (e: MouseEvent, idx: number) => {
  e.preventDefault();
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    index: idx,
  };
};

const closeContextMenu = () => {
  contextMenu.value.visible = false;
};

const duplicateGame = () => {
  if (contextMenu.value.index === -1) return;
  const game = form.value.games[contextMenu.value.index];
  const newGame = JSON.parse(JSON.stringify(game));
  newGame.title = `${newGame.title} (Copy)`;
  form.value.games.splice(contextMenu.value.index + 1, 0, newGame);
  form.value.games.forEach((g, i) => (g.sortOrder = i + 1));
  closeContextMenu();
};

const deleteGameFromMenu = () => {
  if (contextMenu.value.index === -1) return;
  removeGame(contextMenu.value.index);
  closeContextMenu();
};

// Resizable Panels
const leftPanelWidth = ref(280);
const rightPanelWidth = ref(320);
const isResizingLeft = ref(false);
const isResizingRight = ref(false);

const startResizeLeft = () => {
  isResizingLeft.value = true;
  document.addEventListener("mousemove", resizeLeft);
  document.addEventListener("mouseup", stopResize);
};

const startResizeRight = () => {
  isResizingRight.value = true;
  document.addEventListener("mousemove", resizeRight);
  document.addEventListener("mouseup", stopResize);
};

const resizeLeft = (e: MouseEvent) => {
  if (!isResizingLeft.value) return;
  leftPanelWidth.value = Math.max(200, Math.min(500, e.clientX - 24)); // 24px padding/gap adjustment
};

const resizeRight = (e: MouseEvent) => {
  if (!isResizingRight.value) return;
  const containerWidth = document.body.clientWidth;
  rightPanelWidth.value = Math.max(
    250,
    Math.min(600, containerWidth - e.clientX - 24),
  );
};

const stopResize = () => {
  isResizingLeft.value = false;
  isResizingRight.value = false;
  document.removeEventListener("mousemove", resizeLeft);
  document.removeEventListener("mousemove", resizeRight);
  document.removeEventListener("mouseup", stopResize);
};

// Close context menu on click outside
whenever(keys.escape, closeContextMenu);
import { onClickOutside } from "@vueuse/core";
const contextMenuRef = ref(null);
onClickOutside(contextMenuRef, closeContextMenu);
</script>
