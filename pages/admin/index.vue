<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900">
    <!-- Premium Background Elements -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div
        class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[120px]"
      ></div>
      <div
        class="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-gold/5 rounded-full blur-[100px]"
      ></div>
    </div>

    <nav
      class="bg-primary-950 shadow-2xl border-b border-primary-800 sticky top-0 z-50"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <span
                class="text-gold font-black text-2xl tracking-tighter uppercase italic"
                >Mary Esther</span
              >
              <span
                class="ml-2 text-white font-light text-2xl tracking-widest uppercase"
                >Bingo</span
              >
              <div
                class="ml-4 px-2 py-0.5 bg-gold/10 border border-gold/20 rounded text-[10px] text-gold font-bold tracking-widest uppercase"
              >
                Admin
              </div>
            </div>
            <div class="hidden lg:ml-10 lg:flex lg:space-x-4">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                :class="[
                  currentTab === tab.id
                    ? 'bg-primary-900 text-gold shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-primary-900/50',
                  'px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center space-x-2',
                ]"
                @click="currentTab = tab.id"
              >
                <span>{{ tab.name }}</span>
              </button>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="hidden md:flex flex-col items-end mr-4">
              <span class="text-white text-xs font-bold"
                >System Administrator</span
              >
            </div>
            <button
              class="bg-primary-800 hover:bg-red-900/40 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-xs font-bold border border-primary-700 transition-colors"
              @click="logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="py-12 relative z-10">
      <header class="mb-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-end justify-between">
            <div>
              <p
                class="text-gold font-bold text-xs uppercase tracking-[0.2em] mb-1"
              >
                Management Console
              </p>
              <h1 class="text-4xl font-black text-primary-950 tracking-tight">
                {{ currentTabName }}
              </h1>
            </div>
            <div class="hidden sm:block text-right">
              <p class="text-slate-400 text-xs font-medium">Last System Sync</p>
              <p class="text-slate-900 font-bold text-sm">
                {{ new Date().toLocaleTimeString() }}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <!-- Loading State -->
          <div
            v-if="pending"
            class="flex flex-col items-center justify-center py-32"
          >
            <div class="relative">
              <div
                class="h-16 w-16 border-4 border-primary-100 rounded-full"
              ></div>
              <div
                class="absolute top-0 left-0 h-16 w-16 border-4 border-gold border-t-transparent rounded-full animate-spin"
              ></div>
            </div>
            <p class="mt-6 text-primary-900 font-bold animate-pulse">
              Synchronizing Data...
            </p>
          </div>

          <!-- Tab Content -->
          <div v-else>
            <!-- Business Info Tab -->
            <div v-if="currentTab === 'business'">
              <BaseCard>
                <template #header>
                  <h3 class="text-lg font-bold text-primary-900">
                    Corporate Identity & Contact
                  </h3>
                </template>
                <form class="space-y-8" @submit.prevent="saveBusinessInfo">
                  <div class="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6">
                    <div class="sm:col-span-3">
                      <label
                        class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                        >Primary Phone</label
                      >
                      <input
                        v-if="businessData.contact"
                        v-model="businessData.contact.phone"
                        type="text"
                        class="block w-full bg-slate-50 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-gold focus:border-transparent p-4 transition-all"
                      />
                    </div>
                    <div class="sm:col-span-3">
                      <label
                        class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                        >Public Email</label
                      >
                      <input
                        v-if="businessData.contact"
                        v-model="businessData.contact.email"
                        type="email"
                        class="block w-full bg-slate-50 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-gold focus:border-transparent p-4 transition-all"
                      />
                    </div>
                    <div class="sm:col-span-6">
                      <label
                        class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                        >Physical Address</label
                      >
                      <input
                        v-if="businessData.address"
                        v-model="businessData.address.full"
                        type="text"
                        class="block w-full bg-slate-50 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-gold focus:border-transparent p-4 transition-all"
                      />
                    </div>
                    <div class="sm:col-span-6">
                      <label
                        class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
                        >Google Maps Integration URL</label
                      >
                      <input
                        v-if="businessData.address"
                        v-model="businessData.address.mapLink"
                        type="text"
                        class="block w-full bg-slate-50 border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-gold focus:border-transparent p-4 transition-all"
                      />
                    </div>
                  </div>
                  <div class="flex justify-end pt-4">
                    <BaseButton
                      variant="gold"
                      type="submit"
                      class-name="px-10 py-4 shadow-xl shadow-gold/20"
                    >
                      Commit Changes
                    </BaseButton>
                  </div>
                </form>
              </BaseCard>
            </div>

            <!-- Jackpot Tab -->
            <div v-if="currentTab === 'jackpot'">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BaseCard
                  class-name="bg-primary-950 text-white border-none relative overflow-hidden"
                >
                  <div
                    class="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -mr-32 -mt-32"
                  ></div>
                  <template #header>
                    <h3 class="text-lg font-bold text-gold">
                      Live Jackpot Configuration
                    </h3>
                  </template>
                  <form
                    class="space-y-8 relative z-10"
                    @submit.prevent="saveJackpot"
                  >
                    <div>
                      <label
                        class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                        >Current Prize Pool</label
                      >
                      <div class="relative">
                        <div
                          class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                        >
                          <span class="text-gold font-bold text-2xl">$</span>
                        </div>
                        <input
                          v-model="jackpotData.value"
                          type="number"
                          step="0.01"
                          class="block w-full bg-primary-900 border-primary-800 rounded-2xl text-white text-4xl font-black pl-12 pr-4 py-6 focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                        >Display Timestamp</label
                      >
                      <input
                        v-model="jackpotData.lastUpdated"
                        type="text"
                        class="block w-full bg-primary-900 border-primary-800 rounded-xl text-slate-300 p-4 focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                        placeholder="e.g. Today at 5PM"
                      />
                    </div>
                    <div class="flex justify-end">
                      <BaseButton
                        variant="gold"
                        type="submit"
                        class-name="w-full py-5 text-lg shadow-2xl shadow-gold/10"
                      >
                        Broadcast Update
                      </BaseButton>
                    </div>
                  </form>
                </BaseCard>

                <div class="space-y-6">
                  <div
                    class="bg-white p-8 rounded-2xl shadow-lg border border-slate-100"
                  >
                    <h4
                      class="text-sm font-black text-primary-900 uppercase tracking-widest mb-4"
                    >
                      Jackpot Strategy
                    </h4>
                    <p class="text-slate-600 text-sm leading-relaxed">
                      The jackpot amount is the primary driver for player
                      attendance. High-visibility updates during peak hours (4PM
                      - 6PM) correlate with a 15% increase in session revenue.
                    </p>
                  </div>
                  <div class="bg-gold/5 p-8 rounded-2xl border border-gold/20">
                    <h4
                      class="text-sm font-black text-gold-700 uppercase tracking-widest mb-4"
                    >
                      Public Display
                    </h4>
                    <div
                      class="flex items-center justify-center h-24 bg-primary-950 rounded-xl border-2 border-gold/30"
                    >
                      <span
                        class="text-gold font-black text-3xl tracking-tighter"
                        >${{ jackpotData.value }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pricing Tab -->
          <div v-if="currentTab === 'pricing'" class="space-y-8">
            <BaseCard class-name="space-y-6">
              <template #header>
                <div
                  class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p
                      class="text-gold font-bold text-xs uppercase tracking-[0.4em] mb-1"
                    >
                      Pricing Command Center
                    </p>
                    <h3 class="text-3xl font-black text-primary-950">
                      Fortune 1000 Pricing Matrix
                    </h3>
                    <p class="text-sm text-slate-500">
                      Curate the session tiers, jackpot drops, and premium
                      bundles with surgical precision.
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <BaseButton
                      variant="secondary"
                      class-name="px-4 py-2 text-xs uppercase tracking-[0.3em]"
                      type="button"
                      @click="refreshPricingJson"
                    >
                      Sync JSON Preview
                    </BaseButton>
                    <BaseButton
                      variant="secondary"
                      class-name="px-4 py-2 text-xs uppercase tracking-[0.3em]"
                      type="button"
                      @click="importPricingFromJson"
                    >
                      Load JSON to Visual
                    </BaseButton>
                    <BaseButton
                      variant="gold"
                      class-name="px-4 py-2 text-xs uppercase tracking-[0.3em]"
                      type="button"
                      :disabled="isSavingPricing"
                      @click="savePricing"
                    >
                      <span v-if="isSavingPricing">Deploying...</span>
                      <span v-else>Deploy Pricing Schema</span>
                    </BaseButton>
                  </div>
                </div>
              </template>
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div
                  class="rounded-2xl border border-primary-100 bg-gradient-to-b from-primary-950 to-primary-900 p-4 text-white shadow-xl"
                >
                  <p
                    class="text-[10px] uppercase tracking-[0.4em] text-gold-200"
                  >
                    Daytime Sessions
                  </p>
                  <p class="text-3xl font-black">
                    {{ pricingStats.daytimeSessions }}
                  </p>
                  <p class="text-xs text-slate-300">Pay-as-you-go windows</p>
                </div>
                <div
                  class="rounded-2xl border border-slate-100 bg-white/80 p-4 text-primary-950 shadow-lg"
                >
                  <p
                    class="text-[10px] uppercase tracking-[0.4em] text-slate-400"
                  >
                    Machine Tiers
                  </p>
                  <p class="text-3xl font-black">
                    {{ pricingStats.machineTiers }}
                  </p>
                  <p class="text-xs text-slate-500">Configured bundles</p>
                </div>
                <div
                  class="rounded-2xl border border-slate-100 bg-white/80 p-4 text-primary-950 shadow-lg"
                >
                  <p
                    class="text-[10px] uppercase tracking-[0.4em] text-slate-400"
                  >
                    Evening Bundles
                  </p>
                  <p class="text-3xl font-black">
                    {{ pricingStats.eveningBundles }}
                  </p>
                  <p class="text-xs text-slate-500">Premium nightly promises</p>
                </div>
                <div
                  class="rounded-2xl border border-slate-100 bg-white/80 p-4 text-primary-950 shadow-lg"
                >
                  <p
                    class="text-[10px] uppercase tracking-[0.4em] text-slate-400"
                  >
                    FAQs
                  </p>
                  <p class="text-3xl font-black">{{ pricingStats.faqs }}</p>
                  <p class="text-xs text-slate-500">Concierge messaging</p>
                </div>
              </div>
              <div class="grid gap-4 lg:grid-cols-2">
                <div
                  class="rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm"
                >
                  <p class="text-sm font-bold text-primary-900 mb-3">
                    Jackpots On Deck
                  </p>
                  <ul class="space-y-3 text-sm">
                    <li
                      v-for="jackpot in upcomingJackpots"
                      :key="jackpot.name"
                      class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <p class="font-semibold text-primary-900">
                        {{ jackpot.name }}
                      </p>
                      <p class="text-xs text-slate-500">{{ jackpot.time }}</p>
                      <p class="text-xs font-black text-gold-600">
                        {{ jackpot.prize }}
                      </p>
                    </li>
                    <li
                      v-if="(upcomingJackpots && upcomingJackpots.length) === 0"
                      class="text-xs text-slate-400"
                    >
                      No jackpot items configured.
                    </li>
                  </ul>
                </div>
                <div
                  class="rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm"
                >
                  <p class="text-sm font-bold text-primary-900 mb-3">
                    Evening Overview
                  </p>
                  <p
                    class="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2"
                  >
                    {{ pricingData.evening?.startTime || "7:30 PM Start" }}
                  </p>
                  <p class="text-base font-semibold text-primary-950">
                    {{
                      pricingData.evening?.valueProposition ||
                      "2 Machines for $22 includes all premium packs."
                    }}
                  </p>
                  <p class="text-xs text-slate-500 mt-2">
                    {{ pricingData.evening?.scheduleNote }}
                  </p>
                </div>
              </div>
            </BaseCard>

            <div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div class="space-y-6">
                <BaseCard class-name="space-y-5">
                  <template #header>
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <p
                          class="text-xs uppercase tracking-[0.3em] text-slate-500"
                        >
                          Daytime Sessions
                        </p>
                        <h3 class="text-lg font-black text-primary-950">
                          Session Grid
                        </h3>
                      </div>
                      <BaseButton
                        variant="secondary"
                        class-name="px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
                        type="button"
                        @click="addDaytimeSession"
                      >
                        + Add Session
                      </BaseButton>
                    </div>
                  </template>
                  <div class="space-y-5">
                    <article
                      v-for="(session, index) in pricingData.daytime
                        ?.sessions ?? []"
                      :key="session.id ?? index"
                      class="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm"
                    >
                      <div
                        class="flex flex-wrap items-center justify-between gap-3"
                      >
                        <div>
                          <p class="text-base font-black text-primary-900">
                            {{ session.name || "Untitled Session" }}
                          </p>
                          <p
                            class="text-xs uppercase tracking-[0.3em] text-slate-400"
                          >
                            {{ session.timeRange || "Time TBD" }}
                          </p>
                        </div>
                        <div class="flex items-center gap-2">
                          <span
                            class="inline-flex items-center rounded-full bg-primary-900/10 px-3 py-1 text-xs font-bold text-gold-500"
                          >
                            {{ session.icon || "sun" }}
                          </span>
                          <button
                            type="button"
                            class="text-xs font-semibold text-rose-600 hover:text-rose-500"
                            @click="removeDaytimeSession(Number(index))"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div class="grid gap-4 sm:grid-cols-3 mt-4">
                        <label
                          class="text-xs uppercase tracking-[0.3em] text-slate-500"
                        >
                          Session Name
                          <input
                            v-model="session.name"
                            type="text"
                            class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                          />
                        </label>
                        <label
                          class="text-xs uppercase tracking-[0.3em] text-slate-500"
                        >
                          Time Range
                          <input
                            v-model="session.timeRange"
                            type="text"
                            class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                          />
                        </label>
                        <label
                          class="text-xs uppercase tracking-[0.3em] text-slate-500"
                        >
                          Icon
                          <select
                            v-model="session.icon"
                            class="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            <option
                              v-for="icon in daySessionIcons"
                              :key="icon"
                              :value="icon"
                            >
                              {{ icon }}
                            </option>
                          </select>
                        </label>
                      </div>
                      <div class="grid gap-4 sm:grid-cols-2 mt-4">
                        <label
                          class="text-xs uppercase tracking-[0.3em] text-slate-500"
                        >
                          Jackpot Spot
                          <input
                            v-model="session.jackpot"
                            type="text"
                            class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                            placeholder="$250 Hourly"
                          />
                        </label>
                        <label
                          class="text-xs uppercase tracking-[0.3em] text-slate-500"
                        >
                          Description
                          <textarea
                            v-model="session.description"
                            rows="2"
                            class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                          ></textarea>
                        </label>
                      </div>
                      <div class="mt-4 space-y-3">
                        <p
                          class="text-xs uppercase tracking-[0.4em] text-slate-400"
                        >
                          Vibe Tags
                        </p>
                        <div class="flex flex-wrap gap-2">
                          <span
                            v-for="(vibe, vibeIndex) in session.vibe ?? []"
                            :key="`${session.id}-vibe-${vibeIndex}`"
                            class="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                          >
                            <input
                              v-model="session.vibe[vibeIndex]"
                              type="text"
                              class="w-20 bg-transparent text-xs font-semibold focus:outline-none"
                            />
                            <button
                              type="button"
                              class="text-rose-500 hover:text-rose-400"
                              @click="
                                removeSessionVibe(session, Number(vibeIndex))
                              "
                            >
                              ✕
                            </button>
                          </span>
                          <button
                            type="button"
                            class="text-xs font-bold uppercase tracking-[0.3em] text-primary-600"
                            @click="addSessionVibe(session)"
                          >
                            + Add Vibe
                          </button>
                        </div>
                      </div>
                      <div class="mt-5 border-t border-slate-100 pt-4">
                        <div class="flex items-center justify-between">
                          <p
                            class="text-xs uppercase tracking-[0.3em] text-slate-500"
                          >
                            Machine Packages
                          </p>
                          <BaseButton
                            variant="secondary"
                            class-name="px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
                            type="button"
                            @click="addMachineToSession(session)"
                          >
                            Add Tier
                          </BaseButton>
                        </div>
                        <div class="space-y-3 mt-3">
                          <div
                            v-for="(
                              machine, machineIndex
                            ) in session.machines ?? []"
                            :key="`${session.id}-machine-${machineIndex}`"
                            class="grid gap-2 md:grid-cols-4"
                          >
                            <input
                              v-model="machine.description"
                              type="text"
                              placeholder="Description"
                              class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                            />
                            <input
                              v-model="machine.price"
                              type="text"
                              placeholder="Price"
                              class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                            />
                            <select
                              v-model="machine.type"
                              class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                            >
                              <option
                                v-for="type in machineTypeOptions"
                                :key="type"
                                :value="type"
                              >
                                {{ type }}
                              </option>
                            </select>
                            <div class="flex items-center gap-2">
                              <input
                                v-model="machine.savings"
                                type="text"
                                placeholder="Savings copy"
                                class="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                              />
                              <button
                                type="button"
                                class="text-xs font-semibold text-rose-600"
                                @click="
                                  removeMachineFromSession(
                                    session,
                                    Number(machineIndex),
                                  )
                                "
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="mt-5 grid gap-4 md:grid-cols-3">
                        <label
                          class="text-xs uppercase tracking-[0.3em] text-slate-500"
                        >
                          Paper Rule
                          <input
                            v-model="session.paperRules.minSpend"
                            type="text"
                            class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                            placeholder="$1+ spend"
                          />
                        </label>
                        <label
                          class="text-xs uppercase tracking-[0.3em] text-slate-500"
                        >
                          Paper Cards
                          <input
                            v-model="session.paperRules.minPaperCards"
                            type="number"
                            class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                            min="0"
                          />
                        </label>
                        <label
                          class="text-xs uppercase tracking-[0.3em] text-slate-500"
                        >
                          Rule Label
                          <input
                            v-model="session.paperRules.description"
                            type="text"
                            class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                            placeholder="Spend $1 for one card"
                          />
                        </label>
                      </div>
                      <div class="mt-3 grid gap-4 md:grid-cols-3">
                        <label
                          class="text-xs uppercase tracking-[0.3em] text-slate-500"
                        >
                          Advanced Spend
                          <input
                            v-model="
                              session.paperRulesAdvanced.minSpendAdvanced
                            "
                            type="text"
                            class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                            placeholder="$2+ to unlock"
                          />
                        </label>
                        <label
                          class="text-xs uppercase tracking-[0.3em] text-slate-500"
                        >
                          Max Cards
                          <input
                            v-model="session.paperRulesAdvanced.maxPaperCards"
                            type="text"
                            class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                            placeholder="Unlimited"
                          />
                        </label>
                        <label
                          class="text-xs uppercase tracking-[0.3em] text-slate-500"
                        >
                          Advanced Description
                          <input
                            v-model="session.paperRulesAdvanced.description"
                            type="text"
                            class="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                            placeholder="Spend $2+ to get all cards"
                          />
                        </label>
                      </div>
                    </article>
                  </div>
                </BaseCard>
              </div>
              <div class="space-y-6">
                <BaseCard>
                  <template #header>
                    <h3 class="text-lg font-black text-primary-900">
                      Daytime Jackpots & Paper Play
                    </h3>
                  </template>
                  <div class="space-y-4">
                    <div
                      v-for="(jackpot, index) in pricingData.daytime
                        ?.jackpots ?? []"
                      :key="`jackpot-${index}`"
                      class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div class="space-y-3">
                        <input
                          v-model="jackpot.name"
                          type="text"
                          class="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          placeholder="Jackpot name"
                        />
                        <input
                          v-model="jackpot.time"
                          type="text"
                          class="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          placeholder="Trigger window"
                        />
                        <input
                          v-model="jackpot.prize"
                          type="text"
                          class="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          placeholder="$250"
                        />
                        <textarea
                          v-model="jackpot.description"
                          rows="2"
                          class="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          placeholder="Description"
                        ></textarea>
                        <div class="flex justify-end">
                          <button
                            type="button"
                            class="text-xs font-semibold text-rose-600"
                            @click="removeDaytimeJackpot(Number(index))"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                    <BaseButton
                      variant="secondary"
                      class-name="w-full py-2 text-xs uppercase tracking-[0.3em]"
                      type="button"
                      @click="addDaytimeJackpot"
                    >
                      + Add Jackpot
                    </BaseButton>
                  </div>
                  <div
                    class="mt-6 border-t border-dashed border-slate-200 pt-5"
                  >
                    <p
                      class="text-xs uppercase tracking-[0.4em] text-slate-400 mb-2"
                    >
                      Paper Only Games
                    </p>
                    <div class="space-y-4">
                      <div>
                        <p class="text-sm font-semibold text-primary-900 mb-2">
                          Regular Bingo
                        </p>
                        <div class="space-y-3">
                          <div
                            v-for="(entry, entryIndex) in pricingData.daytime
                              ?.paperOnlyGames?.regular_bingo ?? []"
                            :key="`regular-${entryIndex}`"
                            class="grid gap-2 md:grid-cols-3"
                          >
                            <input
                              v-model="entry.name"
                              type="text"
                              placeholder="Game name"
                              class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                            />
                            <input
                              v-model="entry.cards"
                              type="text"
                              placeholder="Cards"
                              class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                            />
                            <div class="flex items-center gap-2">
                              <input
                                v-model="entry.price"
                                type="text"
                                placeholder="Price"
                                class="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                              />
                              <button
                                type="button"
                                class="text-xs font-semibold text-rose-600"
                                @click="
                                  removePaperOnlyGame(
                                    'regular',
                                    Number(entryIndex),
                                  )
                                "
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                        <BaseButton
                          variant="secondary"
                          class-name="mt-3 w-full py-2 text-xs uppercase tracking-[0.3em]"
                          type="button"
                          @click="addPaperOnlyGame('regular')"
                        >
                          + Add Regular Bingo
                        </BaseButton>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-primary-900 mb-2">
                          Specials
                        </p>
                        <div class="space-y-3">
                          <div
                            v-for="(entry, entryIndex) in pricingData.daytime
                              ?.paperOnlyGames?.specials ?? []"
                            :key="`special-${entryIndex}`"
                            class="grid gap-2 md:grid-cols-3"
                          >
                            <input
                              v-model="entry.name"
                              type="text"
                              placeholder="Special name"
                              class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                            />
                            <input
                              v-model="entry.cards"
                              type="text"
                              placeholder="Cards"
                              class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                            />
                            <div class="flex items-center gap-2">
                              <input
                                v-model="entry.price"
                                type="text"
                                placeholder="Price"
                                class="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                              />
                              <button
                                type="button"
                                class="text-xs font-semibold text-rose-600"
                                @click="
                                  removePaperOnlyGame(
                                    'special',
                                    Number(entryIndex),
                                  )
                                "
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                        <BaseButton
                          variant="secondary"
                          class-name="mt-3 w-full py-2 text-xs uppercase tracking-[0.3em]"
                          type="button"
                          @click="addPaperOnlyGame('special')"
                        >
                          + Add Special
                        </BaseButton>
                      </div>
                    </div>
                  </div>
                </BaseCard>

                <BaseCard>
                  <template #header>
                    <h3 class="text-lg font-black text-primary-900">
                      Evening Pricing
                    </h3>
                  </template>
                  <div class="space-y-4">
                    <input
                      v-model="pricingData.evening.startTime"
                      type="text"
                      placeholder="Start Time"
                      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                    <textarea
                      v-model="pricingData.evening.scheduleNote"
                      rows="2"
                      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                      placeholder="Schedule note"
                    ></textarea>
                    <textarea
                      v-model="pricingData.evening.valueProposition"
                      rows="2"
                      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                      placeholder="Value proposition"
                    ></textarea>
                    <div class="space-y-4">
                      <div class="flex items-center justify-between">
                        <p
                          class="text-xs uppercase tracking-[0.3em] text-slate-400"
                        >
                          Machines
                        </p>
                        <BaseButton
                          variant="secondary"
                          class-name="px-2 py-1 text-[10px] uppercase tracking-[0.3em]"
                          type="button"
                          @click="addEveningMachine"
                        >
                          Add Machine
                        </BaseButton>
                      </div>
                      <div
                        v-for="(machine, index) in pricingData.evening
                          ?.machines ?? []"
                        :key="`evening-machine-${index}`"
                        class="grid gap-2 md:grid-cols-3"
                      >
                        <input
                          v-model="machine.description"
                          type="text"
                          placeholder="Description"
                          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                        <input
                          v-model="machine.price"
                          type="text"
                          placeholder="Price"
                          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                        <div class="flex items-center gap-2">
                          <select
                            v-model="machine.type"
                            class="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            <option value="individual">Individual</option>
                            <option value="bundle">Bundle</option>
                            <option value="premium">Premium</option>
                          </select>
                          <button
                            type="button"
                            class="text-xs font-semibold text-rose-600"
                            @click="removeEveningMachine(Number(index))"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          v-model="machine.savings"
                          type="text"
                          placeholder="Savings copy"
                          class="md:col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div class="space-y-3">
                      <div class="flex items-center justify-between">
                        <p
                          class="text-xs uppercase tracking-[0.3em] text-slate-400"
                        >
                          Special Papers
                        </p>
                        <BaseButton
                          variant="secondary"
                          class-name="px-2 py-1 text-[10px] uppercase tracking-[0.3em]"
                          type="button"
                          @click="addEveningSpecialPaper"
                        >
                          Add Paper
                        </BaseButton>
                      </div>
                      <div
                        v-for="(paper, index) in pricingData.evening
                          ?.specialPapers ?? []"
                        :key="`special-paper-${index}`"
                        class="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <input
                          v-model="paper.name"
                          type="text"
                          placeholder="Paper name"
                          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                        <input
                          v-model="paper.optionOne"
                          type="text"
                          placeholder="Option One"
                          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                        <input
                          v-model="paper.optionTwo"
                          type="text"
                          placeholder="Option Two"
                          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                        <textarea
                          v-model="paper.description"
                          rows="2"
                          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          placeholder="Description"
                        ></textarea>
                        <div class="flex items-center justify-between">
                          <input
                            v-model="paper.note"
                            type="text"
                            placeholder="Badge or note"
                            class="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          />
                          <button
                            type="button"
                            class="text-xs font-semibold text-rose-600"
                            @click="removeEveningSpecialPaper(Number(index))"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </BaseCard>

                <BaseCard>
                  <template #header>
                    <h3 class="text-lg font-black text-primary-900">
                      Sunday Exclusives & FAQs
                    </h3>
                  </template>
                  <div class="space-y-4">
                    <input
                      v-model="pricingData.sunday.title"
                      type="text"
                      placeholder="Title"
                      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                    <textarea
                      v-model="pricingData.sunday.note"
                      rows="2"
                      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                      placeholder="Note"
                    ></textarea>
                    <p
                      class="text-xs uppercase tracking-[0.3em] text-slate-400"
                    >
                      Specials
                    </p>
                    <div class="space-y-3">
                      <div
                        v-for="(special, index) in pricingData.sunday
                          ?.specials ?? []"
                        :key="`sunday-special-${index}`"
                        class="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <input
                          v-model="special.name"
                          type="text"
                          placeholder="Special name"
                          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                        <input
                          v-model="special.optionOne"
                          type="text"
                          placeholder="Option One"
                          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                        <input
                          v-model="special.optionTwo"
                          type="text"
                          placeholder="Option Two"
                          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                        <textarea
                          v-model="special.description"
                          rows="2"
                          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          placeholder="Description"
                        ></textarea>
                        <input
                          v-model="special.upikNote"
                          type="text"
                          placeholder="Bonus note"
                          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                        <div class="flex justify-end">
                          <button
                            type="button"
                            class="text-xs font-semibold text-rose-600"
                            @click="removeSundaySpecial(Number(index))"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                    <BaseButton
                      variant="secondary"
                      class-name="w-full py-2 text-xs uppercase tracking-[0.3em]"
                      type="button"
                      @click="addSundaySpecial"
                    >
                      + Add Sunday Special
                    </BaseButton>
                    <p
                      class="text-xs uppercase tracking-[0.3em] text-slate-400"
                    >
                      FAQs
                    </p>
                    <div class="space-y-3">
                      <div
                        v-for="(faq, index) in pricingData.faqs ?? []"
                        :key="`faq-${index}`"
                        class="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <input
                          v-model="faq.question"
                          type="text"
                          placeholder="Question"
                          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                        <textarea
                          v-model="faq.answer"
                          rows="2"
                          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          placeholder="Answer"
                        ></textarea>
                        <div class="flex justify-end">
                          <button
                            type="button"
                            class="text-xs font-semibold text-rose-600"
                            @click="removeFaq(Number(index))"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                    <BaseButton
                      variant="secondary"
                      class-name="w-full py-2 text-xs uppercase tracking-[0.3em]"
                      type="button"
                      @click="addFaq"
                    >
                      + Add FAQ
                    </BaseButton>
                  </div>
                </BaseCard>

                <BaseCard>
                  <template #header>
                    <h3 class="text-lg font-black text-primary-900">
                      Pricing Schema JSON
                    </h3>
                  </template>
                  <textarea
                    v-model="pricingJsonString"
                    rows="12"
                    class="w-full rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 font-mono text-xs text-gold-100"
                  ></textarea>
                  <div class="flex flex-wrap gap-2">
                    <BaseButton
                      variant="secondary"
                      class-name="px-4 py-2 text-xs uppercase tracking-[0.3em]"
                      type="button"
                      @click="validatePricingJson"
                    >
                      Validate JSON
                    </BaseButton>
                    <BaseButton
                      variant="secondary"
                      class-name="px-4 py-2 text-xs uppercase tracking-[0.3em]"
                      type="button"
                      @click="refreshPricingJson"
                    >
                      Refresh JSON
                    </BaseButton>
                  </div>
                </BaseCard>
              </div>
            </div>
          </div>

          <!-- Schedule Tab -->
          <div v-if="currentTab === 'schedule'" class="space-y-8">
            <BaseCard class-name="space-y-6">
              <template #header>
                <div
                  class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p
                      class="text-gold font-bold text-xs uppercase tracking-[0.4em] mb-1"
                    >
                      Timeline Command Center
                    </p>
                    <h3 class="text-3xl font-black text-primary-950">
                      Schedule Control Room
                    </h3>
                    <p class="text-sm text-slate-500">
                      Orchestrate weekly sessions, statuses, and availability
                      from a single pane.
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <BaseButton
                      variant="secondary"
                      class-name="px-4 py-2 text-xs uppercase tracking-[0.3em]"
                      type="button"
                      @click="refreshScheduleJson"
                    >
                      Sync JSON Preview
                    </BaseButton>
                    <BaseButton
                      variant="secondary"
                      class-name="px-4 py-2 text-xs uppercase tracking-[0.3em]"
                      type="button"
                      @click="importScheduleFromJson"
                    >
                      Load JSON to Editor
                    </BaseButton>
                    <BaseButton
                      variant="gold"
                      class-name="px-4 py-2 text-xs uppercase tracking-[0.3em]"
                      type="button"
                      :disabled="isSavingSchedule"
                      @click="saveSchedule"
                    >
                      <span v-if="isSavingSchedule">Publishing...</span>
                      <span v-else>Publish Schedule</span>
                    </BaseButton>
                  </div>
                </div>
              </template>
              <div class="grid gap-4 sm:grid-cols-3">
                <div
                  class="rounded-2xl border border-slate-100 bg-white/90 p-4 text-primary-900 shadow-lg"
                >
                  <p
                    class="text-[10px] uppercase tracking-[0.4em] text-slate-400"
                  >
                    Total Sessions
                  </p>
                  <p class="text-3xl font-black">{{ scheduleSummary.total }}</p>
                  <p class="text-xs text-slate-500">Live timeline entries</p>
                </div>
                <div
                  class="rounded-2xl border border-slate-100 bg-white/90 p-4 text-primary-900 shadow-lg"
                >
                  <p
                    class="text-[10px] uppercase tracking-[0.4em] text-slate-400"
                  >
                    Categories
                  </p>
                  <p class="text-3xl font-black">
                    {{ scheduleCategoryBreakdown.length }}
                  </p>
                  <p class="text-xs text-slate-500">Unique buckets</p>
                </div>
                <div
                  class="rounded-2xl border border-slate-100 bg-white/90 p-4 text-primary-900 shadow-lg"
                >
                  <p
                    class="text-[10px] uppercase tracking-[0.4em] text-slate-400"
                  >
                    Active Days
                  </p>
                  <p class="text-3xl font-black">
                    {{ scheduleSummary.activeDays }}
                  </p>
                  <p class="text-xs text-slate-500">Days covered weekly</p>
                </div>
              </div>
              <div
                class="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.4em] text-slate-500"
              >
                <span
                  v-for="entry in scheduleCategoryBreakdown"
                  :key="entry.category"
                  class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold"
                >
                  {{ entry.category }} • {{ entry.count }} sessions
                </span>
              </div>
            </BaseCard>

            <div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <BaseCard class-name="space-y-5">
                <template #header>
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p
                        class="text-xs uppercase tracking-[0.3em] text-slate-500"
                      >
                        Session Timeline
                      </p>
                      <h3 class="text-lg font-black text-primary-950">
                        Live Timeline
                      </h3>
                    </div>
                    <BaseButton
                      variant="secondary"
                      class-name="px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
                      type="button"
                      @click="addScheduleSession"
                    >
                      + Add Session
                    </BaseButton>
                  </div>
                </template>
                <div class="space-y-4">
                  <article
                    v-for="session in scheduleData"
                    :key="session.id"
                    class="cursor-pointer rounded-2xl border bg-white px-5 py-4 shadow-sm transition hover:shadow-lg"
                    :class="{
                      'border-yellow-400 bg-gradient-to-r from-yellow-50 to-white shadow-lg':
                        selectedSessionId === session.id,
                      'border-slate-100': selectedSessionId !== session.id,
                    }"
                    @click="selectScheduleSession(session.id)"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="text-sm font-black text-primary-900">
                          {{ session.name || "Untitled session" }}
                        </p>
                        <p
                          class="text-xs uppercase tracking-[0.3em] text-slate-400"
                        >
                          {{ session.startTime }} — {{ session.endTime }}
                        </p>
                      </div>
                      <span :class="statusBadgeClass(session.status)">
                        {{ session.status || "Scheduled" }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-500 mt-2">
                      {{ session.gameType }}
                    </p>
                    <div
                      class="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em]"
                    >
                      <span
                        v-for="day in session.availableDays ?? []"
                        :key="`${session.id}-day-${day}`"
                        class="rounded-full border border-slate-200 px-3 py-1 text-slate-600"
                      >
                        {{ day }}
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-400 mt-3">
                      {{ session.jackpot }}
                    </p>
                  </article>
                </div>
              </BaseCard>

              <BaseCard class-name="space-y-5">
                <template #header>
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p
                        class="text-xs uppercase tracking-[0.3em] text-slate-500"
                      >
                        Session Details
                      </p>
                      <h3 class="text-lg font-black text-primary-950">
                        {{ selectedSession?.name || "Select a session" }}
                      </h3>
                    </div>
                    <div class="flex items-center gap-2">
                      <BaseButton
                        variant="secondary"
                        class-name="px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
                        type="button"
                        :disabled="!selectedSession"
                        @click="duplicateScheduleSession"
                      >
                        Clone
                      </BaseButton>
                      <BaseButton
                        variant="secondary"
                        class-name="px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
                        type="button"
                        :disabled="!selectedSession"
                        @click="removeScheduleSession(selectedSession?.id)"
                      >
                        Delete
                      </BaseButton>
                    </div>
                  </div>
                </template>
                <div v-if="selectedSession" class="space-y-4">
                  <div class="grid gap-4 md:grid-cols-2">
                    <input
                      v-model="selectedSession.name"
                      type="text"
                      placeholder="Session Name"
                      class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                    <input
                      v-model="selectedSession.category"
                      type="text"
                      placeholder="Category"
                      class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                  </div>
                  <div class="grid gap-4 md:grid-cols-2">
                    <input
                      v-model="selectedSession.startTime"
                      type="text"
                      placeholder="Start Time"
                      class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                    <input
                      v-model="selectedSession.endTime"
                      type="text"
                      placeholder="End Time"
                      class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                  </div>
                  <div class="grid gap-4 md:grid-cols-2">
                    <input
                      v-model="selectedSession.gameType"
                      type="text"
                      placeholder="Game Type"
                      class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                    <input
                      v-model="selectedSession.status"
                      type="text"
                      placeholder="Status"
                      class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                  </div>
                  <textarea
                    v-model="selectedSession.description"
                    rows="3"
                    class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    placeholder="Description"
                  ></textarea>
                  <div class="grid gap-4 md:grid-cols-2">
                    <input
                      v-model="selectedSession.jackpot"
                      type="text"
                      placeholder="Jackpot"
                      class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                    <input
                      v-model="selectedSession.eligibility"
                      type="text"
                      placeholder="Eligibility"
                      class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <p
                      class="text-xs uppercase tracking-[0.3em] text-slate-400"
                    >
                      Available Days
                    </p>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <button
                        v-for="day in scheduleDays"
                        :key="day"
                        type="button"
                        class="rounded-full border px-3 py-1 text-[11px] font-semibold transition"
                        :class="
                          selectedSession.availableDays?.includes(day)
                            ? 'border-primary-900 bg-primary-900/10 text-primary-900'
                            : 'border-slate-200 bg-white text-slate-600'
                        "
                        @click="toggleAvailableDay(selectedSession, day)"
                      >
                        {{ day }}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p
                      class="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2"
                    >
                      Vibe
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="(tag, index) in selectedSession.vibe ?? []"
                        :key="`session-vibe-${index}`"
                        class="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold"
                      >
                        <input
                          v-model="selectedSession.vibe[index]"
                          type="text"
                          class="w-20 bg-transparent text-xs font-semibold focus:outline-none"
                        />
                        <button
                          type="button"
                          class="text-rose-500 hover:text-rose-400"
                          @click="
                            removeSessionVibe(selectedSession, Number(index))
                          "
                        >
                          ✕
                        </button>
                      </span>
                      <button
                        type="button"
                        class="text-xs font-bold uppercase tracking-[0.3em] text-primary-600"
                        @click="addSessionVibe(selectedSession)"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                  <div>
                    <p
                      class="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2"
                    >
                      Session Pricing
                    </p>
                    <textarea
                      v-model="sessionPricingJson"
                      rows="6"
                      class="w-full rounded-2xl border border-slate-200 bg-slate-900 px-3 py-2 font-mono text-xs text-gold-100"
                    ></textarea>
                    <div class="flex gap-2 pt-2">
                      <BaseButton
                        variant="secondary"
                        class-name="px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
                        type="button"
                        :disabled="!selectedSession"
                        @click="applySessionPricingJson"
                      >
                        Apply JSON
                      </BaseButton>
                      <BaseButton
                        variant="secondary"
                        class-name="px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
                        type="button"
                        :disabled="!selectedSession"
                        @click="refreshSessionPricingJson"
                      >
                        Reset to Current
                      </BaseButton>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-slate-500">
                  Select a session to edit the detailed fields above.
                </div>
              </BaseCard>
            </div>

            <BaseCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-black text-primary-900">
                    Schedule JSON
                  </h3>
                  <div class="flex gap-2">
                    <BaseButton
                      variant="secondary"
                      class-name="px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
                      type="button"
                      @click="refreshScheduleJson"
                    >
                      Refresh
                    </BaseButton>
                    <BaseButton
                      variant="secondary"
                      class-name="px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
                      type="button"
                      @click="importScheduleFromJson"
                    >
                      Load
                    </BaseButton>
                  </div>
                </div>
              </template>
              <textarea
                v-model="scheduleJsonString"
                rows="10"
                class="w-full rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 font-mono text-xs text-gold-100"
              ></textarea>
            </BaseCard>
          </div>

          <!-- Messages Tab -->
          <div v-if="currentTab === 'messages'">
            <div
              v-if="messagesData.length === 0"
              class="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-12 w-12 text-slate-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p class="text-slate-400 font-medium">Inbox is currently empty</p>
            </div>
            <div v-else class="grid grid-cols-1 gap-6">
              <div
                v-for="msg in messagesData"
                :key="msg.timestamp"
                class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between">
                  <div class="flex items-center">
                    <div
                      class="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-black mr-4"
                    >
                      {{ msg.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <h3 class="font-bold text-primary-950">{{ msg.name }}</h3>
                      <p class="text-xs text-slate-500">{{ msg.email }}</p>
                    </div>
                  </div>
                  <span
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter"
                  >
                    {{ new Date(msg.created_at).toLocaleString() }}
                  </span>
                </div>
                <div class="mt-4 pl-14">
                  <p
                    class="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100"
                  >
                    {{ msg.message }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Tab -->
        <div v-if="currentTab === 'users'" class="space-y-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- User List -->
            <div class="lg:col-span-2">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-primary-900">
                  Active Team Members
                </h2>
                <span
                  class="bg-primary-100 text-primary-700 text-xs font-bold px-2.5 py-0.5 rounded-full"
                >
                  {{ usersData.length }} Total
                </span>
              </div>

              <div
                class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
              >
                <table class="min-w-full divide-y divide-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Username
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Last Login
                      </th>
                      <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span class="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="user in usersData" :key="user.id">
                      <td
                        class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                      >
                        <div class="flex items-center">
                          <div
                            class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mr-3"
                          >
                            {{ user.username.charAt(0).toUpperCase() }}
                          </div>
                          {{ user.username }}
                        </div>
                      </td>
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        <span
                          :class="[
                            user.role === 'admin'
                              ? 'bg-gold-100 text-gold-800'
                              : 'bg-blue-100 text-blue-800',
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                          ]"
                        >
                          {{ user.role }}
                        </span>
                      </td>
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {{
                          user.last_login_at
                            ? new Date(user.last_login_at).toLocaleDateString()
                            : "Never"
                        }}
                      </td>
                      <td
                        class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                      >
                        <button
                          class="text-red-600 hover:text-red-900 font-bold"
                          @click="deleteUser(user.id)"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Add User Form -->
            <div>
              <div
                class="bg-primary-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden"
              >
                <!-- Decorative background element -->
                <div
                  class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-gold opacity-10 rounded-full blur-2xl"
                ></div>

                <h2 class="text-xl font-bold mb-6 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 mr-2 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Add New Member
                </h2>

                <form class="space-y-4" @submit.prevent="addUser">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1"
                      >Username</label
                    >
                    <input
                      v-model="newUser.username"
                      type="text"
                      required
                      class="block w-full bg-primary-800 border-primary-700 rounded-lg text-white placeholder-primary-400 focus:ring-gold focus:border-gold p-2.5"
                      placeholder="jdoe"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1"
                      >Password</label
                    >
                    <input
                      v-model="newUser.password"
                      type="password"
                      required
                      class="block w-full bg-primary-800 border-primary-700 rounded-lg text-white placeholder-primary-400 focus:ring-gold focus:border-gold p-2.5"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1"
                      >Role</label
                    >
                    <select
                      v-model="newUser.role"
                      class="block w-full bg-primary-800 border-primary-700 rounded-lg text-white focus:ring-gold focus:border-gold p-2.5"
                    >
                      <option value="mic">MIC (Caller)</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    class="w-full bg-gold hover:bg-gold-600 text-primary-900 font-black py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  >
                    Create Account
                  </button>
                </form>
              </div>

              <!-- Fortune-1000 Trust Signal -->
              <div
                class="mt-6 p-4 bg-gold-50 border border-gold-100 rounded-lg flex items-start"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gold-600 mr-3 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p class="text-xs text-gold-800 leading-relaxed">
                  <strong>Security Note:</strong> New accounts are active
                  immediately. Ensure passwords meet complexity requirements for
                  multi-million dollar operation security standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});

const router = useRouter();
const tabs = [
  { id: "business", name: "Business Info" },
  { id: "jackpot", name: "Jackpot" },
  { id: "pricing", name: "Pricing" },
  { id: "schedule", name: "Schedule" },
  { id: "messages", name: "Messages" },
  { id: "users", name: "Users" },
];
const currentTab = ref("business");
const currentTabName = computed(
  () => tabs.find((t) => t.id === currentTab.value)?.name,
);

// Data refs
const businessData = ref<any>({});
const jackpotData = ref<any>({});
const pricingData = ref<any>({});
const pricingJsonString = ref("");
const scheduleData = ref<any>([]);
const scheduleJsonString = ref("");
const messagesData = ref<any[]>([]);
const usersData = ref<any[]>([]);
const newUser = ref({
  username: "",
  password: "",
  role: "mic",
});

const pending = ref(true);
const isSavingPricing = ref(false);
const isSavingSchedule = ref(false);
const daySessionIcons = ["sun", "sparkles", "clock", "moon", "star"];
const machineTypeOptions = ["individual", "bundle", "premium"];
const scheduleDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const selectedSessionId = ref("");
const sessionPricingJson = ref("");

const deepCloneValue = <T,>(value: T): T =>
  JSON.parse(JSON.stringify(value ?? {}));

const ensureArray = <T,>(value: any): T[] =>
  Array.isArray(value) ? value : [];

const ensureObject = (value: any) =>
  typeof value === "object" && value !== null ? value : {};

const createSessionId = () =>
  `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const createDaytimeSessionSkeleton = () => ({
  id: createSessionId(),
  name: "New Daytime Session",
  timeRange: "10:00 AM – 12:00 PM",
  icon: "sun",
  jackpot: "",
  description: "",
  vibe: ["Community"],
  machines: [
    {
      description: "1 Machine",
      price: "$1",
      type: "individual",
      savings: "",
    },
  ],
  paperRules: {
    minSpend: "$1",
    minPaperCards: 1,
    description: "Spend $1+ for a paper card",
  },
  paperRulesAdvanced: {
    minSpendAdvanced: "$2+",
    maxPaperCards: "Unlimited",
    description: "Spend $2+ to unlock unlimited cards",
  },
});

const normalizePricing = (raw: any) => {
  const clone = deepCloneValue(raw);
  const normalized = {
    ...clone,
    daytime: {
      sessions: ensureArray(clone?.daytime?.sessions).map((session: any) => ({
        ...session,
        id: session.id ?? createSessionId(),
        name: session.name ?? "Untitled Session",
        timeRange: session.timeRange ?? "",
        icon: session.icon ?? "sun",
        jackpot: session.jackpot ?? "",
        description: session.description ?? "",
        vibe: ensureArray(session.vibe),
        machines: ensureArray(session.machines).map((machine: any) => ({
          description: machine.description ?? "",
          price: machine.price ?? "",
          type: machine.type ?? "individual",
          savings: machine.savings ?? "",
        })),
        paperRules: {
          minSpend: session.paperRules?.minSpend ?? "",
          minPaperCards: session.paperRules?.minPaperCards ?? 0,
          description: session.paperRules?.description ?? "",
        },
        paperRulesAdvanced: {
          minSpendAdvanced: session.paperRulesAdvanced?.minSpendAdvanced ?? "",
          maxPaperCards: session.paperRulesAdvanced?.maxPaperCards ?? "",
          description: session.paperRulesAdvanced?.description ?? "",
        },
      })),
      jackpots: ensureArray(clone?.daytime?.jackpots).map((jackpot: any) => ({
        name: jackpot.name ?? "",
        time: jackpot.time ?? "",
        prize: jackpot.prize ?? "",
        description: jackpot.description ?? "",
      })),
      paperOnlyGames: {
        regular_bingo: ensureArray(
          clone?.daytime?.paperOnlyGames?.regular_bingo,
        ).map((entry: any) => ({
          name: entry.name ?? "",
          cards: entry.cards ?? "",
          price: entry.price ?? "",
        })),
        specials: ensureArray(clone?.daytime?.paperOnlyGames?.specials).map(
          (entry: any) => ({
            name: entry.name ?? "",
            cards: entry.cards ?? "",
            price: entry.price ?? "",
          }),
        ),
      },
    },
    evening: {
      ...ensureObject(clone?.evening),
      machines: ensureArray(clone?.evening?.machines).map((machine: any) => ({
        description: machine.description ?? "",
        price: machine.price ?? "",
        type: machine.type ?? "bundle",
        savings: machine.savings ?? "",
      })),
      specialPapers: ensureArray(clone?.evening?.specialPapers).map(
        (paper: any) => ({
          name: paper.name ?? "",
          optionOne: paper.optionOne ?? "",
          optionTwo: paper.optionTwo ?? "",
          description: paper.description ?? "",
          note: paper.note ?? "",
        }),
      ),
      startTime: clone?.evening?.startTime ?? "",
      scheduleNote: clone?.evening?.scheduleNote ?? "",
      valueProposition: clone?.evening?.valueProposition ?? "",
    },
    sunday: {
      ...ensureObject(clone?.sunday),
      title: clone?.sunday?.title ?? "",
      note: clone?.sunday?.note ?? "",
      specials: ensureArray(clone?.sunday?.specials).map((special: any) => ({
        name: special.name ?? "",
        optionOne: special.optionOne ?? "",
        optionTwo: special.optionTwo ?? "",
        description: special.description ?? "",
        upikNote: special.upikNote ?? "",
      })),
    },
    faqs: ensureArray(clone?.faqs).map((faq: any) => ({
      question: faq.question ?? "",
      answer: faq.answer ?? "",
    })),
  };
  return normalized;
};

const normalizeSchedule = (raw: any) => {
  const normalizedArray = ensureArray(raw).map((session: any) => ({
    ...session,
    id: session.id ?? createSessionId(),
    name: session.name ?? "Untitled Session",
    category: session.category ?? "General",
    startTime: session.startTime ?? "",
    endTime: session.endTime ?? "",
    gameType: session.gameType ?? "",
    description: session.description ?? "",
    status: session.status ?? "Upcoming",
    jackpot: session.jackpot ?? "",
    eligibility: session.eligibility ?? "",
    availableDays: ensureArray(session.availableDays),
    vibe: ensureArray(session.vibe),
    pricing: ensureObject(session.pricing),
  }));
  return normalizedArray;
};

const ensureDaytimeStructure = () => {
  if (!pricingData.value.daytime) {
    pricingData.value.daytime = {
      sessions: [],
      jackpots: [],
      paperOnlyGames: { regular_bingo: [], specials: [] },
    };
  }
  if (!Array.isArray(pricingData.value.daytime.sessions)) {
    pricingData.value.daytime.sessions = [];
  }
  if (!Array.isArray(pricingData.value.daytime.jackpots)) {
    pricingData.value.daytime.jackpots = [];
  }
  if (
    !pricingData.value.daytime.paperOnlyGames ||
    typeof pricingData.value.daytime.paperOnlyGames !== "object"
  ) {
    pricingData.value.daytime.paperOnlyGames = {
      regular_bingo: [],
      specials: [],
    };
  }
  if (!Array.isArray(pricingData.value.daytime.paperOnlyGames.regular_bingo)) {
    pricingData.value.daytime.paperOnlyGames.regular_bingo = [];
  }
  if (!Array.isArray(pricingData.value.daytime.paperOnlyGames.specials)) {
    pricingData.value.daytime.paperOnlyGames.specials = [];
  }
};

const ensureEveningStructure = () => {
  if (!pricingData.value.evening) {
    pricingData.value.evening = {
      machines: [],
      specialPapers: [],
      startTime: "",
      scheduleNote: "",
      valueProposition: "",
    };
  }
  if (!Array.isArray(pricingData.value.evening.machines)) {
    pricingData.value.evening.machines = [];
  }
  if (!Array.isArray(pricingData.value.evening.specialPapers)) {
    pricingData.value.evening.specialPapers = [];
  }
};

const ensureSundayStructure = () => {
  if (!pricingData.value.sunday) {
    pricingData.value.sunday = { specials: [], title: "", note: "" };
  }
  if (!Array.isArray(pricingData.value.sunday.specials)) {
    pricingData.value.sunday.specials = [];
  }
  if (!Array.isArray(pricingData.value.faqs)) {
    pricingData.value.faqs = [];
  }
};

const pricingStats = computed(() => {
  const daytimeSessions = pricingData.value?.daytime?.sessions?.length ?? 0;
  const machineTiers = pricingData.value?.daytime?.sessions?.reduce(
    (sum: number, session: any) => sum + (session.machines?.length ?? 0),
    0,
  );
  const eveningBundles = pricingData.value?.evening?.machines?.length ?? 0;
  const faqs = pricingData.value?.faqs?.length ?? 0;
  return {
    daytimeSessions,
    machineTiers,
    eveningBundles,
    faqs,
  };
});

const upcomingJackpots = computed<any[]>(() => {
  return ensureArray(pricingData.value?.daytime?.jackpots).slice(0, 3);
});

const scheduleSummary = computed(() => {
  const total = scheduleData.value.length;
  const uniqueDays = new Set<string>();
  const categories = new Set<string>();
  scheduleData.value.forEach((session: any) => {
    (session.availableDays ?? []).forEach((day: string) => uniqueDays.add(day));
    if (session.category) {
      categories.add(session.category);
    }
  });
  return {
    total,
    activeDays: uniqueDays.size,
    categories: categories.size,
  };
});

const scheduleCategoryBreakdown = computed(() => {
  const counts: Record<string, number> = {};
  scheduleData.value.forEach((session: any) => {
    const bucket = session.category || "General";
    counts[bucket] = (counts[bucket] ?? 0) + 1;
  });
  return Object.entries(counts).map(([category, count]) => ({
    category,
    count,
  }));
});

const selectedSession = computed(() =>
  scheduleData.value.find(
    (session: any) => session.id === selectedSessionId.value,
  ),
);

const statusBadgeClass = (status: string | undefined) => {
  const map: Record<string, string> = {
    Upcoming: "border-yellow-300 bg-yellow-50 text-yellow-800",
    Live: "border-emerald-300 bg-emerald-50 text-emerald-800",
    Closing: "border-rose-300 bg-rose-50 text-rose-800",
    "Sold Out": "border-slate-300 bg-slate-100 text-slate-600",
  };
  return (
    "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] " +
    (map[status ?? ""] ?? "border-slate-200 bg-slate-50 text-slate-500")
  );
};

const refreshPricingJson = () => {
  pricingJsonString.value = JSON.stringify(pricingData.value, null, 2);
};

const refreshScheduleJson = () => {
  scheduleJsonString.value = JSON.stringify(scheduleData.value, null, 2);
};

const refreshSessionPricingJson = () => {
  if (!selectedSession.value) {
    sessionPricingJson.value = "";
    return;
  }
  sessionPricingJson.value = JSON.stringify(
    selectedSession.value.pricing ?? {},
    null,
    2,
  );
};

const importPricingFromJson = () => {
  try {
    const parsed = JSON.parse(pricingJsonString.value);
    pricingData.value = normalizePricing(parsed);
    refreshPricingJson();
    alert("Pricing schema synced to the structured editor.");
  } catch {
    alert("Invalid pricing JSON");
  }
};

const validatePricingJson = () => {
  try {
    JSON.parse(pricingJsonString.value);
    alert("Pricing JSON is valid!");
  } catch {
    alert("Pricing JSON has errors.");
  }
};

const importScheduleFromJson = () => {
  try {
    const parsed = JSON.parse(scheduleJsonString.value);
    const normalized = normalizeSchedule(parsed);
    scheduleData.value = normalized;
    selectedSessionId.value = normalized[0]?.id ?? "";
    refreshScheduleJson();
    refreshSessionPricingJson();
    alert("Schedule data synced.");
  } catch {
    alert("Invalid schedule JSON");
  }
};

const addDaytimeSession = () => {
  ensureDaytimeStructure();
  pricingData.value.daytime.sessions.push(createDaytimeSessionSkeleton());
  refreshPricingJson();
};

const removeDaytimeSession = (index: number) => {
  pricingData.value.daytime.sessions.splice(index, 1);
  refreshPricingJson();
};

const addMachineToSession = (session: any) => {
  session.machines = ensureArray(session.machines);
  session.machines.push({
    description: "New machine tier",
    price: "",
    type: "individual",
    savings: "",
  });
  refreshPricingJson();
};

const removeMachineFromSession = (session: any, index: number) => {
  session.machines?.splice(index, 1);
  refreshPricingJson();
};

const addDaytimeJackpot = () => {
  ensureDaytimeStructure();
  pricingData.value.daytime.jackpots.push({
    name: "New Jackpot",
    time: "",
    prize: "",
    description: "",
  });
  refreshPricingJson();
};

const removeDaytimeJackpot = (index: number) => {
  pricingData.value.daytime.jackpots.splice(index, 1);
  refreshPricingJson();
};

const addPaperOnlyGame = (type: "regular" | "special") => {
  ensureDaytimeStructure();
  const target =
    type === "regular"
      ? pricingData.value.daytime.paperOnlyGames.regular_bingo
      : pricingData.value.daytime.paperOnlyGames.specials;
  target.push({ name: "", cards: "", price: "" });
  refreshPricingJson();
};

const removePaperOnlyGame = (type: "regular" | "special", index: number) => {
  const target =
    type === "regular"
      ? pricingData.value.daytime.paperOnlyGames.regular_bingo
      : pricingData.value.daytime.paperOnlyGames.specials;
  target.splice(index, 1);
  refreshPricingJson();
};

const addEveningMachine = () => {
  ensureEveningStructure();
  pricingData.value.evening.machines.push({
    description: "",
    price: "",
    type: "bundle",
    savings: "",
  });
  refreshPricingJson();
};

const removeEveningMachine = (index: number) => {
  pricingData.value.evening.machines.splice(index, 1);
  refreshPricingJson();
};

const addEveningSpecialPaper = () => {
  ensureEveningStructure();
  pricingData.value.evening.specialPapers.push({
    name: "",
    optionOne: "",
    optionTwo: "",
    description: "",
    note: "",
  });
  refreshPricingJson();
};

const removeEveningSpecialPaper = (index: number) => {
  pricingData.value.evening.specialPapers.splice(index, 1);
  refreshPricingJson();
};

const addSundaySpecial = () => {
  ensureSundayStructure();
  pricingData.value.sunday.specials.push({
    name: "",
    optionOne: "",
    optionTwo: "",
    description: "",
    upikNote: "",
  });
  refreshPricingJson();
};

const removeSundaySpecial = (index: number) => {
  pricingData.value.sunday.specials.splice(index, 1);
  refreshPricingJson();
};

const addFaq = () => {
  ensureSundayStructure();
  pricingData.value.faqs.push({ question: "", answer: "" });
  refreshPricingJson();
};

const removeFaq = (index: number) => {
  pricingData.value.faqs.splice(index, 1);
  refreshPricingJson();
};

const addSessionVibe = (session: any) => {
  session.vibe = ensureArray(session.vibe);
  session.vibe.push("");
  refreshPricingJson();
};

const removeSessionVibe = (session: any, index: number) => {
  session.vibe?.splice(index, 1);
  refreshPricingJson();
};

const toggleAvailableDay = (session: any, day: string) => {
  session.availableDays = ensureArray(session.availableDays);
  if (session.availableDays.includes(day)) {
    session.availableDays = session.availableDays.filter(
      (value: string) => value !== day,
    );
  } else {
    session.availableDays.push(day);
  }
  refreshScheduleJson();
};

const addScheduleSession = () => {
  const skeleton = {
    id: createSessionId(),
    name: "New Session",
    category: "General",
    startTime: "",
    endTime: "",
    gameType: "",
    description: "",
    status: "Upcoming",
    jackpot: "",
    eligibility: "",
    availableDays: [],
    vibe: [],
    pricing: {},
  };
  scheduleData.value.push(skeleton);
  selectedSessionId.value = skeleton.id;
  refreshScheduleJson();
};

const selectScheduleSession = (id: string) => {
  selectedSessionId.value = id;
};

const duplicateScheduleSession = () => {
  if (!selectedSession.value) return;
  const clone = deepCloneValue(selectedSession.value);
  clone.id = createSessionId();
  clone.name = `${selectedSession.value.name || "Session"} Copy`;
  scheduleData.value.push(clone);
  selectedSessionId.value = clone.id;
  refreshScheduleJson();
};

const removeScheduleSession = (id?: string) => {
  if (!id) return;
  if (!confirm("Delete this session from the timeline?")) return;
  const index = scheduleData.value.findIndex(
    (session: any) => session.id === id,
  );
  if (index === -1) return;
  scheduleData.value.splice(index, 1);
  if (selectedSessionId.value === id) {
    selectedSessionId.value = scheduleData.value[0]?.id ?? "";
  }
  refreshScheduleJson();
};

const applySessionPricingJson = () => {
  if (!selectedSession.value) return;
  try {
    const parsed = JSON.parse(sessionPricingJson.value);
    selectedSession.value.pricing = parsed;
    refreshSessionPricingJson();
    refreshScheduleJson();
    alert("Session pricing updated.");
  } catch {
    alert("Invalid session pricing JSON.");
  }
};

// Fetch all data
const loadData = async () => {
  pending.value = true;
  try {
    const [biz, jack, price, sched, msgs, users] = await Promise.all([
      $fetch("/api/business"),
      $fetch("/api/jackpot"),
      $fetch("/api/pricing"),
      $fetch("/api/schedule"),
      $fetch("/api/admin/messages").catch(() => []), // Handle error if auth fails or empty
      $fetch("/api/admin/users").catch(() => []),
    ]);

    businessData.value = biz;
    jackpotData.value = jack;
    pricingData.value = normalizePricing(price);
    scheduleData.value = normalizeSchedule(sched);
    selectedSessionId.value = scheduleData.value[0]?.id ?? "";
    refreshPricingJson();
    refreshScheduleJson();
    refreshSessionPricingJson();
    messagesData.value = msgs;
    usersData.value = users;
  } catch (e) {
    console.error("Failed to load data", e);
  } finally {
    pending.value = false;
  }
};

onMounted(loadData);

watch(
  scheduleData,
  (value) => {
    if (!value.length) {
      selectedSessionId.value = "";
      return;
    }
    if (!value.some((session: any) => session.id === selectedSessionId.value)) {
      selectedSessionId.value = value[0].id;
    }
  },
  { deep: true },
);

watch(
  () => selectedSession.value,
  () => {
    refreshSessionPricingJson();
  },
  { immediate: true },
);

// Save Handlers
const saveBusinessInfo = async () => {
  await $fetch("/api/admin/business", {
    method: "POST",
    body: businessData.value,
  });
  alert("Business Info Saved!");
};

const saveJackpot = async () => {
  await $fetch("/api/admin/jackpot", {
    method: "POST",
    body: jackpotData.value,
  });
  alert("Jackpot Updated!");
};

const savePricing = async () => {
  isSavingPricing.value = true;
  try {
    const payload = deepCloneValue(pricingData.value);
    await $fetch("/api/admin/pricing", { method: "POST", body: payload });
    pricingData.value = normalizePricing(payload);
    refreshPricingJson();
    alert("Pricing Updated!");
  } catch (e) {
    console.error(e);
    alert("Failed to update pricing.");
  } finally {
    isSavingPricing.value = false;
  }
};

const saveSchedule = async () => {
  isSavingSchedule.value = true;
  try {
    const payload = deepCloneValue(scheduleData.value);
    await $fetch("/api/admin/schedule", { method: "POST", body: payload });
    scheduleData.value = normalizeSchedule(payload);
    selectedSessionId.value = scheduleData.value[0]?.id ?? "";
    refreshScheduleJson();
    refreshSessionPricingJson();
    alert("Schedule Updated!");
  } catch (e) {
    console.error(e);
    alert("Failed to update schedule.");
  } finally {
    isSavingSchedule.value = false;
  }
};

const addUser = async () => {
  try {
    const user = await $fetch("/api/admin/users", {
      method: "POST",
      body: newUser.value,
    });
    usersData.value.push(user);
    newUser.value = { username: "", password: "", role: "mic" };
    alert("User added successfully!");
  } catch (e: any) {
    alert(e.data?.message || "Failed to add user");
  }
};

const deleteUser = async (id: string) => {
  if (!confirm("Are you sure you want to delete this user?")) return;
  try {
    await $fetch("/api/admin/users", {
      method: "DELETE",
      body: { id },
    });
    usersData.value = usersData.value.filter((u) => u.id !== id);
  } catch (e: any) {
    alert(e.data?.message || "Failed to delete user");
  }
};

const logout = async () => {
  await $fetch("/api/auth/logout", { method: "POST" });
  const authCookie = useCookie("admin_auth");
  authCookie.value = null;
  router.push("/admin/login");
};
</script>
