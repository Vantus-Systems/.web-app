<template>
  <AdminShell
    title="Shift Management"
    subtitle="Record & Submit Shift Data"
    :user-role="session?.role"
    :user-name="session?.username"
    @logout="logout"
  >
    <div class="max-w-4xl mx-auto">
      <!-- Header Controls -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <!-- Progress Stepper (Only visible in Step Mode) -->
        <div v-if="viewMode === 'step'" class="flex-1">
          <div class="flex items-center justify-between relative max-w-lg">
            <div
              class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10"
            ></div>
            <div
              v-for="step in steps"
              :key="step.number"
              class="flex flex-col items-center gap-2 bg-white px-2"
            >
              <div
                class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm border-2 transition-colors"
                :class="
                  currentStep >= step.number
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white border-slate-300 text-slate-400'
                "
              >
                {{ step.number }}
              </div>
              <span
                class="text-[10px] font-bold uppercase tracking-wider hidden md:block"
                :class="
                  currentStep >= step.number
                    ? 'text-primary-700'
                    : 'text-slate-400'
                "
              >
                {{ step.label }}
              </span>
            </div>
          </div>
        </div>

        <!-- View Mode Toggle -->
        <div class="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-end md:self-auto">
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2"
            :class="
              viewMode === 'form'
                ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5'
                : 'text-slate-500 hover:text-slate-700'
            "
            @click="viewMode = 'form'"
          >
            ⚡ Quick Form
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2"
            :class="
              viewMode === 'step'
                ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5'
                : 'text-slate-500 hover:text-slate-700'
            "
            @click="viewMode = 'step'"
          >
            ➡️ Step-by-Step
          </button>
        </div>
      </div>

      <!-- Main Form Container -->
      <div
        class="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8"
        :class="{ 'space-y-12 divide-y divide-slate-100': viewMode === 'form' }"
      >
        <form @submit.prevent="handleSubmit">

          <!-- SECTION 1: SHIFT SETUP -->
          <div v-show="viewMode === 'form' || currentStep === 1" class="pt-6 first:pt-0">
            <h3 class="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <span v-if="viewMode === 'form'" class="text-slate-300 text-sm font-bold uppercase tracking-wider">01</span>
              Shift Details
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Date
                </label>
                <input
                  v-model="form.date"
                  type="date"
                  required
                  class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Shift
                </label>
                <div class="flex gap-2">
                  <label class="flex-1 flex items-center justify-center gap-2 cursor-pointer border rounded-lg p-2 transition-colors"
                    :class="form.shift === 'AM' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'border-slate-200 hover:bg-slate-50'"
                  >
                    <input v-model="form.shift" type="radio" value="AM" class="sr-only" />
                    <span class="text-sm font-bold">Day (AM)</span>
                  </label>
                  <label class="flex-1 flex items-center justify-center gap-2 cursor-pointer border rounded-lg p-2 transition-colors"
                    :class="form.shift === 'PM' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'border-slate-200 hover:bg-slate-50'"
                  >
                    <input v-model="form.shift" type="radio" value="PM" class="sr-only" />
                    <span class="text-sm font-bold">Night (PM)</span>
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Headcount
                </label>
                <input
                  v-model.number="form.headcount"
                  type="number"
                  min="0"
                  required
                  class="w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Starting Bank
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                  <input
                    v-model.number="form.beginning_box"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="w-full pl-8 pr-4 py-2 rounded-lg border-slate-200 bg-slate-50 text-sm font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 2: SALES -->
          <div v-show="viewMode === 'form' || currentStep === 2" class="pt-6">
            <h3 class="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <span v-if="viewMode === 'form'" class="text-slate-300 text-sm font-bold uppercase tracking-wider">02</span>
              Sales Entry
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-4">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Bingo Sales
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                  <input
                    v-model.number="form.sales_bingo"
                    type="number"
                    step="0.01"
                    required
                    class="w-full pl-8 pr-4 py-3 rounded-lg border-slate-200 bg-slate-50 text-lg font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                    :class="form.sales_bingo < 0 ? 'text-red-600' : 'text-slate-900'"
                  />
                </div>
                <div v-if="form.sales_bingo < 0" class="bg-red-50 border border-red-100 rounded-lg p-4 animate-fade-in">
                  <label class="block text-xs font-bold text-red-700 uppercase tracking-wider mb-2">
                    Reason for Negative Sales
                  </label>
                  <select
                    v-model="form.negative_bingo_reason_code"
                    required
                    class="w-full rounded-lg border-red-200 bg-white px-3 py-2 text-sm text-red-900 focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="" disabled>Select Reason...</option>
                    <option value="HighPayouts">High Payouts</option>
                    <option value="JackpotHit">Jackpot Hit</option>
                    <option value="PromoNight">Promo Night</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div class="space-y-4">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Pulltab Sales
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                  <input
                    v-model.number="form.sales_pulltabs"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    class="w-full pl-8 pr-4 py-3 rounded-lg border-slate-200 bg-slate-50 text-lg font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 3: RECONCILIATION (Ending Bank) -->
          <!-- In Wizard Mode, this is part of Step 3 (Cash) or inserted before?
               User requested: "Place this in Step 3: Cash, right before Total Cash Deposit".
               So in Wizard, it's inside Step 3. In Form view, it's its own section 3. -->
          <div v-show="viewMode === 'form'" class="pt-6">
             <h3 class="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <span class="text-slate-300 text-sm font-bold uppercase tracking-wider">03</span>
              Reconciliation
            </h3>
             <div class="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Ending Bank (Left in Drawer)
                </label>
                <div class="relative max-w-sm">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                  <input
                    v-model.number="form.ending_box"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full pl-8 pr-4 py-3 rounded-lg border-slate-200 bg-white text-lg font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <p class="text-xs text-slate-400 mt-2">Enter the amount of cash left in the drawer (not deposited).</p>
             </div>
          </div>


          <!-- SECTION 4: DEPOSIT (Cash + Checks) -->
          <!-- In Wizard Mode, this is split into Step 3 (Cash) and Step 4 (Checks). -->

          <!-- Wizard Step 3 Content (Cash) -->
          <div v-show="viewMode === 'form' || currentStep === 3" class="pt-6">
            <h3 class="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <span v-if="viewMode === 'form'" class="text-slate-300 text-sm font-bold uppercase tracking-wider">04</span>
              Deposit
            </h3>

            <!-- In Wizard, we show Ending Bank here too -->
            <div v-if="viewMode === 'step'" class="mb-8">
               <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Ending Bank (Left in Drawer)
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                  <input
                    v-model.number="form.ending_box"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full pl-8 pr-4 py-3 rounded-lg border-slate-200 bg-slate-50 text-lg font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
            </div>

            <!-- Cash Section -->
            <div class="space-y-4 mb-8">
              <div class="flex items-center justify-between">
                <label class="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Cash Drop
                </label>
                <button
                  type="button"
                  class="text-xs font-bold text-primary-600 uppercase tracking-wider hover:text-primary-800 flex items-center gap-1"
                  @click="toggleBillCounter"
                >
                  <span v-if="showBillCounter">➖ Hide Bill Counter</span>
                  <span v-else>🧮 Open Bill Counter</span>
                </button>
              </div>

              <!-- Manual Cash Input -->
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                <input
                  v-model.number="form.cash_total_manual"
                  type="number"
                  min="0"
                  step="0.01"
                  :readonly="showBillCounter"
                  class="w-full pl-8 pr-4 py-3 rounded-lg border-slate-200 bg-slate-50 text-lg font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                  :class="{ 'bg-slate-100 text-slate-500 cursor-not-allowed': showBillCounter }"
                />
              </div>

              <!-- Bill Counter Grid -->
              <div v-if="showBillCounter" class="bg-slate-50 rounded-xl p-4 border border-slate-200 animate-fade-in">
                 <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div
                    v-for="(label, key) in denominationsMap"
                    :key="key"
                    class="bg-white p-2 rounded-lg border border-slate-100 shadow-sm"
                  >
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-center">
                      {{ label }}
                    </label>
                    <input
                      v-model.number="form.denominations[key]"
                      type="number"
                      min="0"
                      class="w-full text-center bg-slate-50 border-none rounded py-1 font-mono font-bold text-slate-900 focus:ring-0 text-sm"
                      @focus="$event.target.select()"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Check Section (Visible in Form View or Step 4) -->
            <div v-if="viewMode === 'form'" class="space-y-4 pt-4 border-t border-slate-100">
               <div class="flex items-center justify-between">
                <label class="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Check Drop
                </label>
                <button
                  type="button"
                  class="text-xs font-bold text-primary-600 uppercase tracking-wider hover:text-primary-800 flex items-center gap-1"
                  @click="toggleCheckList"
                >
                  <span v-if="showCheckList">➖ Hide List</span>
                  <span v-else>📝 Itemize Checks</span>
                </button>
              </div>

               <!-- Manual Check Input -->
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                <input
                  v-model.number="form.checks_total_manual"
                  type="number"
                  min="0"
                  step="0.01"
                  :readonly="showCheckList"
                  class="w-full pl-8 pr-4 py-3 rounded-lg border-slate-200 bg-slate-50 text-lg font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-colors"
                   :class="{ 'bg-slate-100 text-slate-500 cursor-not-allowed': showCheckList }"
                />
              </div>

              <!-- Check List -->
              <div v-if="showCheckList" class="space-y-3 animate-fade-in">
                  <div
                    v-for="(check, index) in form.check_logs"
                    :key="index"
                    class="bg-slate-50 rounded-xl p-4 border border-slate-200 relative group"
                  >
                     <button
                        type="button"
                        class="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"
                        @click="removeCheck(index)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                      </button>
                       <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        <input v-model="check.player_name" type="text" placeholder="Name" class="rounded border-slate-200 text-xs px-2 py-1" />
                        <input v-model="check.check_number" type="text" placeholder="Check #" class="rounded border-slate-200 text-xs px-2 py-1 font-mono" />
                        <input v-model.number="check.amount" type="number" placeholder="0.00" class="rounded border-slate-200 text-xs px-2 py-1 font-mono font-bold" />
                      </div>
                      <div class="flex gap-4">
                        <label class="flex items-center gap-1"><input type="checkbox" v-model="check.stamped_on_back" class="rounded text-green-600 scale-75" /> <span class="text-[10px] uppercase font-bold text-slate-500">Stamped</span></label>
                        <label class="flex items-center gap-1"><input type="checkbox" v-model="check.phone_dl_written" class="rounded text-green-600 scale-75" /> <span class="text-[10px] uppercase font-bold text-slate-500">Phone/DL</span></label>
                      </div>
                  </div>
                  <button type="button" @click="addCheck" class="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-xs uppercase hover:border-primary-300 hover:text-primary-600 transition-colors">
                    + Add Check
                  </button>
              </div>
            </div>
          </div>

          <!-- Wizard Step 4 (Checks) - Only visible in Step Mode -->
           <div v-if="viewMode === 'step' && currentStep === 4" class="space-y-6">
              <div class="flex justify-between items-center">
                <h3 class="text-xl font-black text-slate-900">Checks</h3>
                 <button
                  type="button"
                  class="text-xs font-bold text-primary-600 uppercase tracking-wider hover:text-primary-800 flex items-center gap-1"
                  @click="toggleCheckList"
                >
                  <span v-if="showCheckList">➖ Switch to Simple Input</span>
                  <span v-else>📝 Itemize Checks</span>
                </button>
              </div>

               <!-- Manual Check Input -->
              <div v-if="!showCheckList" class="space-y-4">
                 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Check Amount
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                  <input
                    v-model.number="form.checks_total_manual"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full pl-8 pr-4 py-3 rounded-lg border-slate-200 bg-slate-50 text-lg font-mono font-bold focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <!-- Itemized View -->
              <div v-else class="space-y-4">
                <div
                v-for="(check, index) in form.check_logs"
                :key="index"
                class="bg-slate-50 rounded-xl p-4 border border-slate-200 relative group"
              >
                <button
                  type="button"
                  class="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  @click="removeCheck(index)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label
                      class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                      >Player Name</label
                    >
                    <input
                      v-model="check.player_name"
                      type="text"
                      required
                      placeholder="Full Name"
                      class="w-full rounded-lg border-slate-200 text-sm px-3 py-2"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                      >Check #</label
                    >
                    <input
                      v-model="check.check_number"
                      type="text"
                      required
                      placeholder="1234"
                      class="w-full rounded-lg border-slate-200 text-sm px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                      >Amount</label
                    >
                    <div class="relative">
                      <span
                        class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                        >$</span
                      >
                      <input
                        v-model.number="check.amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        class="w-full rounded-lg border-slate-200 text-sm pl-6 pr-3 py-2 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div class="flex gap-6 border-t border-slate-200 pt-3">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="check.stamped_on_back"
                      type="checkbox"
                      class="rounded text-green-600 focus:ring-green-500"
                    />
                    <span
                      class="text-xs font-bold text-slate-600 uppercase tracking-wider"
                      >Stamped on Back</span
                    >
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="check.phone_dl_written"
                      type="checkbox"
                      class="rounded text-green-600 focus:ring-green-500"
                    />
                    <span
                      class="text-xs font-bold text-slate-600 uppercase tracking-wider"
                      >Phone/DL Written</span
                    >
                  </label>
                </div>
              </div>
               <button
                  type="button"
                  class="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-xs uppercase hover:border-primary-300 hover:text-primary-600 transition-colors"
                  @click="addCheck"
                >
                  + Add Another Check
                </button>
              </div>

               <div
                  class="bg-slate-50 rounded-xl p-6 flex justify-between items-center border border-slate-200"
                >
                  <span
                    class="text-sm font-bold text-slate-500 uppercase tracking-wider"
                    >Total Checks</span
                  >
                  <span class="text-2xl font-black text-slate-900 font-mono">{{
                    formatCurrency(totalChecks)
                  }}</span>
                </div>
           </div>


          <!-- SECTION 5: REVIEW -->
          <div v-show="viewMode === 'form' || currentStep === 5" class="pt-6">
            <h3 class="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <span v-if="viewMode === 'form'" class="text-slate-300 text-sm font-bold uppercase tracking-wider">05</span>
              Review & Submit
            </h3>

             <!-- Summary Card -->
            <div class="bg-slate-900 text-white rounded-xl p-6 shadow-xl mb-6">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                   <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Starting Bank</p>
                   <p class="text-lg font-mono font-bold">{{ formatCurrency(form.beginning_box || 0) }}</p>
                </div>
                 <div>
                   <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Sales</p>
                   <p class="text-lg font-mono font-bold">{{ formatCurrency(totalSales) }}</p>
                </div>
                <div>
                   <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ending Bank</p>
                   <p class="text-lg font-mono font-bold">{{ formatCurrency(form.ending_box || 0) }}</p>
                </div>
                <div>
                   <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Deposit</p>
                   <p class="text-lg font-mono font-bold text-green-400">{{ formatCurrency(totalDeposit) }}</p>
                </div>
              </div>

              <div class="mt-6 pt-6 border-t border-slate-700">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div>
                    <p
                      class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
                    >
                      Variance
                    </p>
                    <p class="text-[10px] text-slate-500 font-mono">
                      (Start + Sales) - (End + Deposit)
                    </p>
                  </div>
                  <p
                    class="text-4xl font-mono font-black"
                    :class="
                      variance === 0
                        ? 'text-white'
                        : variance > 0
                          ? 'text-red-400'
                          : 'text-green-400'
                    "
                  >
                    {{ formatCurrency(variance) }}
                    <span v-if="variance > 0" class="text-xs font-bold uppercase tracking-wide text-red-500 ml-2">Shortage</span>
                    <span v-if="variance < 0" class="text-xs font-bold uppercase tracking-wide text-green-500 ml-2">Overage</span>
                  </p>
                </div>
              </div>
            </div>

             <!-- Validation Errors -->
            <div
              v-if="validationErrors.length > 0"
              class="bg-red-50 border border-red-100 rounded-xl p-4 mb-6"
            >
              <h4
                class="text-sm font-bold text-red-800 uppercase tracking-wider mb-2"
              >
                Please fix the following:
              </h4>
              <ul class="list-disc list-inside text-sm text-red-700 space-y-1">
                <li v-for="error in validationErrors" :key="error">
                  {{ error }}
                </li>
              </ul>
            </div>

            <!-- Notes -->
            <div>
              <label
                class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >
                Shift Notes
                <span v-if="variance !== 0" class="text-red-500"
                  >* (Required for variance)</span
                >
              </label>
              <textarea
                v-model="form.notes"
                rows="3"
                class="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Any issues, incidents, or explanations for variance..."
                :required="variance !== 0"
              ></textarea>
            </div>
          </div>


           <!-- Footer Actions -->
          <div class="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center bg-white sticky bottom-0 z-10">
            <!-- Wizard Nav -->
            <button
              v-if="viewMode === 'step'"
              type="button"
              class="px-6 py-2 text-slate-600 font-bold uppercase tracking-wider text-sm hover:text-slate-900 transition-colors"
              :class="{ invisible: currentStep === 1 }"
              @click="prevStep"
            >
              Back
            </button>

             <!-- Submit / Next -->
             <div class="flex gap-4 ml-auto">
                 <button
                  v-if="viewMode === 'step' && currentStep < 5"
                  type="button"
                  class="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider text-sm shadow-lg hover:shadow-xl transition-all"
                  @click="nextStep"
                >
                  Next
                </button>

                <button
                  v-if="viewMode === 'form' || currentStep === 5"
                  type="submit"
                  :disabled="isSubmitting || validationErrors.length > 0"
                  class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isSubmitting ? "Submitting..." : "Submit Shift" }}
                </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import AdminShell from "~/components/admin/AdminShell.vue";
import { useCsrf } from "~/composables/useCsrf";
import { formatCurrency } from "~/utils/format";

definePageMeta({
  middleware: ["auth", "role"],
  roles: ["MIC", "OWNER"],
});

const router = useRouter();
const { getHeaders, refreshCsrfToken } = useCsrf();
const session = ref<{ username?: string; role?: any } | null>(null);

// --- Constants ---
const steps = [
  { number: 1, label: "Setup" },
  { number: 2, label: "Sales" },
  { number: 3, label: "Cash" },
  { number: 4, label: "Checks" },
  { number: 5, label: "Review" },
];

const denominationsMap: Record<string, string> = {
  denom_100_count: "$100",
  denom_50_count: "$50",
  denom_20_count: "$20",
  denom_10_count: "$10",
  denom_5_count: "$5",
  denom_1_count: "$1",
  denom_quarters: "Quarters",
  denom_dimes: "Dimes",
  denom_nickels: "Nickels",
  denom_pennies: "Pennies",
};

const denomValues: Record<string, number> = {
  denom_100_count: 100,
  denom_50_count: 50,
  denom_20_count: 20,
  denom_10_count: 10,
  denom_5_count: 5,
  denom_1_count: 1,
  denom_quarters: 0.25,
  denom_dimes: 0.1,
  denom_nickels: 0.05,
  denom_pennies: 0.01,
};

// --- State ---
const viewMode = ref<'step' | 'form'>('step');
const currentStep = ref(1);
const isSubmitting = ref(false);

// Smart Input Toggles
const showBillCounter = ref(false);
const showCheckList = ref(false);

const form = ref({
  date: new Date().toISOString().slice(0, 10),
  shift: "AM" as "AM" | "PM",
  headcount: 0,
  beginning_box: 0, // Starting Bank
  ending_box: 0,    // Ending Bank
  sales_bingo: 0,
  sales_pulltabs: 0,
  negative_bingo_reason_code: "",
  cash_total_manual: 0,
  checks_total_manual: 0,
  denominations: {
    denom_100_count: 0,
    denom_50_count: 0,
    denom_20_count: 0,
    denom_10_count: 0,
    denom_5_count: 0,
    denom_1_count: 0,
    denom_quarters: 0,
    denom_dimes: 0,
    denom_nickels: 0,
    denom_pennies: 0,
  } as Record<string, number>,
  check_logs: [] as any[],
  notes: "",
});

// --- Computed ---
const totalSales = computed(
  () => (form.value.sales_bingo || 0) + (form.value.sales_pulltabs || 0),
);

// Calculated from Bill Counter Grid
const calculatedCashTotal = computed(() => {
  let sum = 0;
  for (const [key, count] of Object.entries(form.value.denominations)) {
    sum += count * (denomValues[key] || 0);
  }
  return Number(sum.toFixed(2));
});

// Calculated from Check List
const calculatedChecksTotal = computed(() => {
  const sum = form.value.check_logs.reduce(
    (s, check) => s + (Number(check.amount) || 0),
    0,
  );
  return Number(sum.toFixed(2));
});

// The final totals we use (logic: if expanded, use calculated. Else use manual)
// BUT we sync them. If showBillCounter is true, we update manual.
// If showBillCounter is false, user edits manual.
const totalCash = computed(() => form.value.cash_total_manual);
const totalChecks = computed(() => form.value.checks_total_manual);

const totalDeposit = computed(() => (totalCash.value || 0) + (totalChecks.value || 0));

// Variance: (Starting + Sales) - (Ending + Deposit)
// Positive = Shortage (Expected > Actual)
// Negative = Overage (Actual > Expected)
const variance = computed(() => {
  const starting = form.value.beginning_box || 0;
  const ending = form.value.ending_box || 0;

  const expected = starting + totalSales.value;
  const actual = ending + totalDeposit.value;

  // Note: Standard variance is usually Actual - Expected.
  // But user formula is Expected - Actual (Start+Sales) - (End+Deposit).
  // If Result > 0, we have LESS than expected (Shortage).
  return Number((expected - actual).toFixed(2));
});

const validationErrors = computed(() => {
  const errors = [];
  if (variance.value !== 0 && !form.value.notes) {
    errors.push(
      "Variance detected. You must provide a note explaining the difference.",
    );
  }

  // Only validate checks if we are using the check list
  if (showCheckList.value && form.value.check_logs.length > 0) {
      const invalidChecks = form.value.check_logs.some(
        (c) => !c.stamped_on_back || !c.phone_dl_written,
      );
      if (invalidChecks) {
        errors.push("All itemized checks must be stamped and have contact info written.");
      }
  }

  return errors;
});

// --- Watchers ---

// If Bill Counter is visible, sync grid sum to manual total
watch(calculatedCashTotal, (newVal) => {
    if (showBillCounter.value) {
        form.value.cash_total_manual = newVal;
    }
});

// If Check List is visible, sync list sum to manual total
watch(calculatedChecksTotal, (newVal) => {
    if (showCheckList.value) {
        form.value.checks_total_manual = newVal;
    }
});

// --- Methods ---

const toggleBillCounter = () => {
    showBillCounter.value = !showBillCounter.value;
    // If opening, force sync
    if (showBillCounter.value) {
        form.value.cash_total_manual = calculatedCashTotal.value;
    }
};

const toggleCheckList = () => {
    showCheckList.value = !showCheckList.value;
    if (showCheckList.value) {
        form.value.checks_total_manual = calculatedChecksTotal.value;
    }
};

const getDenomValue = (key: string) => denomValues[key] || 0;

const addCheck = () => {
  form.value.check_logs.push({
    player_name: "",
    check_number: "",
    amount: 0,
    stamped_on_back: false,
    phone_dl_written: false,
  });
  // If we add a check, ensure list is visible
  showCheckList.value = true;
};

const removeCheck = (index: number) => {
  form.value.check_logs.splice(index, 1);
};

const nextStep = () => {
  if (currentStep.value < 5) currentStep.value++;
};

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

const handleSubmit = async () => {
  if (validationErrors.value.length > 0) return;

  isSubmitting.value = true;
  try {
    const payload = {
      ...form.value,
      // If manual mode was used (hidden details), we should probably clear the details
      // or at least ensure the manual total is sent.
      // The backend prioritizes `cash_total_manual` if present.
      // We send everything.
      variance_note: variance.value !== 0 ? form.value.notes : undefined,
    };

    // Note: If using manual input, we might want to clear denominations/checks to avoid confusion in DB?
    // But keeping them is fine if they were partially filled.
    // However, if I manually override $500 but grid sums to $400, backend takes $500.

    await $fetch("/api/admin/mic/shifts", {
      method: "POST",
      body: payload,
      headers: getHeaders(),
      credentials: "include",
    });

    alert("Shift submitted successfully!");
    router.push("/admin/mic");
  } catch (e: any) {
    alert(e?.message || "Failed to submit shift.");
  } finally {
    isSubmitting.value = false;
  }
};

const logout = async () => {
  await refreshCsrfToken();
  await $fetch("/api/auth/logout", {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
  });
  router.push("/admin/login");
};

onMounted(async () => {
  const sessionData = await $fetch("/api/auth/user", {
    credentials: "include",
  });
  session.value = sessionData.user;
});
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>
