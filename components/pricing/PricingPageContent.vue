<template>
  <div class="bg-richBlack text-white min-h-screen">
    <!-- Hero Section -->
    <section
      class="relative bg-black text-white py-32 overflow-hidden border-b border-zinc-900"
    >
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-richBlack to-richBlack z-10"></div>
        <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>
      <div
        class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(78,221,97,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(78,221,97,0.08),transparent_30%)]"
      ></div>

      <div class="container mx-auto px-4 relative z-10 text-center">
        <div 
          class="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full mb-8"
        >
          <div class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
          <span class="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Session Intel</span>
        </div>
        
        <h1 class="text-6xl md:text-8xl font-black mb-8 tracking-tighter uppercase leading-none">
          <span class="text-white">Pricing &</span>
          <span class="block text-primary drop-shadow-[0_0_30px_rgba(78,221,97,0.6)]">Sessions</span>
        </h1>
        <p
          class="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto font-bold mb-10 uppercase tracking-widest leading-relaxed"
        >
          Transparent pricing. Big jackpots. No hidden fees.
          <span class="block mt-4 font-black text-white tracking-wider">
            Walk in. Buy cards. Win big.
          </span>
        </p>

        <div class="flex flex-wrap justify-center gap-6">
          <a
            href="#daytime"
            class="bg-primary hover:bg-white text-black font-black px-10 py-5 rounded-2xl transition-all hover:-translate-y-1 shadow-[0_20px_60px_rgba(78,221,97,0.5)] text-lg uppercase tracking-[0.2em]"
          >
            Daytime Session
          </a>
          <a
            href="#evening"
            class="bg-transparent border-4 border-primary hover:bg-primary/20 text-primary font-black px-10 py-5 rounded-2xl transition-all text-lg uppercase tracking-[0.2em] backdrop-blur-md"
          >
            Evening Session
          </a>
        </div>
      </div>
    </section>

    <div class="container mx-auto px-4 py-20">
      <div class="space-y-32">
        <!-- ===== TODAY'S PROMOTIONS (V2) ===== -->
        <section
          v-if="pricing.promotions && pricing.promotions.length > 0"
          id="promotions"
          class="scroll-mt-20"
        >
          <div class="text-center mb-16">
            <span
              class="text-primary font-black uppercase tracking-[0.4em] text-xs"
              >🔥 Limited Time</span
            >
            <h2
              class="text-5xl md:text-7xl font-black text-white mt-4 mb-6 uppercase tracking-tighter"
            >
              Active <span class="text-primary">Promotions</span>
            </h2>
          </div>
          <div class="grid md:grid-cols-2 gap-6">
            <div
              v-for="(promo, idx) in pricing.promotions"
              :key="idx"
              class="bg-charcoal border-l-4 border-primary p-8 rounded-[2rem] shadow-2xl"
            >
              <h3 class="text-2xl font-bold text-primary mb-2 uppercase tracking-wider">
                {{ promo.title }}
              </h3>
              <p class="text-zinc-400 font-bold uppercase tracking-wider text-sm">{{ promo.description }}</p>
            </div>
          </div>
        </section>

        <!-- ===== PAY-AS-YOU-GO (DAYTIME) ===== -->
        <section id="daytime" class="scroll-mt-20">
          <div class="text-center mb-16">
            <span
              class="text-primary font-black uppercase tracking-[0.4em] text-xs"
              >☀️ 10:30 AM – 7:30 PM</span
            >
            <h2
              class="text-5xl md:text-7xl font-black text-white mt-4 mb-6 uppercase tracking-tighter"
            >
              Daytime <span class="text-primary">Pay-As-You-Go</span>
            </h2>
            <p class="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto font-bold uppercase tracking-wider leading-relaxed">
              Flexible gaming windows. Pay only for the machines you
              play. Super 6 Jackpots ($250) start at 12 PM!
            </p>
          </div>

          <!-- Dynamic Daytime Sessions -->
          <div class="grid md:grid-cols-2 gap-8 mb-16">
            <div
              v-for="(session, idx) in pricing.daytime?.sessions || []"
              :key="idx"
              class="border-2 border-zinc-800 rounded-[2.5rem] p-10 bg-charcoal hover:border-primary/50 transition-all duration-500 shadow-2xl"
            >
              <div class="flex items-center gap-4 mb-6">
                <div class="text-5xl">
                  {{
                    session.icon === "sun"
                      ? "☀️"
                      : session.icon === "moon"
                        ? "🌙"
                        : "🕐"
                  }}
                </div>
                <div>
                  <h3 class="text-3xl font-bold text-white uppercase tracking-tighter">
                    {{ session.name }}
                  </h3>
                  <p class="font-bold text-primary tracking-wider">
                    {{ session.timeRange }}
                  </p>
                </div>
              </div>
              <p class="text-zinc-400 font-bold uppercase tracking-wider text-sm mb-8">
                {{ session.description }}
              </p>

              <h4 class="font-bold text-white text-lg mb-4 uppercase tracking-wider">
                Machine Pricing
              </h4>
              <div class="space-y-3 mb-8">
                <div
                  v-for="(machine, mIdx) in session.machines || []"
                  :key="mIdx"
                  class="flex justify-between items-center p-4 bg-black rounded-xl border border-zinc-800"
                >
                  <span class="font-medium text-zinc-300 uppercase tracking-wider text-sm">{{
                    machine.description
                  }}</span>
                  <span class="text-2xl font-black text-primary">
                    {{ machine.price }}
                    <span
                      v-if="machine.savings"
                      class="text-xs text-zinc-500 font-normal ml-1"
                      >({{ machine.savings }})</span
                    >
                  </span>
                </div>
              </div>

              <!-- Paper Rules / Bonus (Static or Dynamic if added later) -->
              <div
                v-if="session.paperRules"
                class="border-l-4 border-primary rounded-xl p-5 bg-black/50"
              >
                <p class="text-sm font-bold mb-2 text-primary uppercase tracking-wider">
                  💡 Free Paper Bonus
                </p>
                <p class="text-sm text-zinc-400 font-bold uppercase tracking-wider">
                  <strong class="text-white">{{ session.paperRules.minSpend }} →</strong>
                  Get {{ session.paperRules.minPaperCards }} free paper card
                </p>
                <p
                  v-if="session.paperRulesAdvanced"
                  class="text-sm mt-1 text-zinc-400 font-bold uppercase tracking-wider"
                >
                  <strong class="text-white">{{ session.paperRulesAdvanced.minSpendAdvanced }} →</strong>
                  {{ session.paperRulesAdvanced.maxPaperCards }} paper cards
                </p>
                <!-- Fallback if fields are missing in data but exist in UI expectation -->
                <p
                  v-else
                  class="text-sm mt-1 text-zinc-400 font-bold uppercase tracking-wider"
                >
                  <strong class="text-white">Spend $2+ →</strong> Unlimited paper cards
                </p>
              </div>
            </div>
          </div>

          <!-- Daytime Jackpots -->
          <div
            class="bg-charcoal border-2 border-zinc-800 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-2xl hover:border-primary/50 transition-all duration-500"
          >
            <div class="flex items-center gap-4 mb-10">
              <div class="text-5xl">💰</div>
              <div>
                <h3 class="text-3xl font-bold text-white uppercase tracking-tighter">
                  Daytime Jackpots & Progressives
                </h3>
                <p class="text-primary font-bold uppercase tracking-wider">
                  Big wins all day long!
                </p>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
              <!-- Dynamic Jackpots -->
              <div
                v-for="(jackpot, idx) in pricing.daytime?.jackpots || []"
                :key="idx"
                class="bg-black rounded-2xl p-8 border border-zinc-800"
              >
                <h4 class="font-bold text-white text-xl mb-2 uppercase tracking-wider">
                  {{ jackpot.name }}
                </h4>
                <p class="text-zinc-400 text-sm mb-4 font-bold uppercase tracking-wider">
                  {{ jackpot.time }}
                </p>
                <div class="text-4xl font-black text-primary">
                  {{ jackpot.prize }}
                </div>
              </div>

              <!-- Hardcoded Bingo Babes (Connected to Store) -->
              <div class="bg-black rounded-2xl p-8 border border-zinc-800">
                <h4 class="font-bold text-white text-xl mb-2 uppercase tracking-wider">
                  Bingo Babes Progressive
                </h4>
                <p class="text-zinc-400 text-sm mb-4 font-bold uppercase tracking-wider">
                  Played after the 4 PM Super 6 Jackpot game.
                </p>
                <div class="text-4xl font-black text-primary">
                  {{ formatCurrency(jackpotStore.babesValue) }}
                </div>
                <p class="text-xs text-primary mt-2 uppercase tracking-widest">
                  Current Progressive Amount
                </p>
              </div>
            </div>
          </div>

          <!-- Paper Only Option (Hardcoded / Static for now as it's not in editor) -->
          <div
            class="bg-charcoal border-2 border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div class="p-10 md:p-14">
              <h3 class="text-3xl font-bold text-white mb-3 uppercase tracking-tighter">
                🎫 Paper Cards Only
              </h3>
              <p class="text-zinc-400 mb-10 font-bold uppercase tracking-wider text-sm">
                Prefer paper-only play? Low-cost entry to bingo.
              </p>

              <div class="grid md:grid-cols-2 gap-8">
                <div>
                  <h4
                    class="font-bold text-white text-xl mb-4 pb-3 border-b-2 border-primary uppercase tracking-wider"
                  >
                    Regular Bingo
                  </h4>
                  <div class="space-y-3">
                    <div class="flex justify-between p-4 bg-black rounded-xl border border-zinc-800">
                      <span class="text-zinc-300 uppercase tracking-wider text-sm font-bold">3 Cards</span>
                      <span class="font-black text-primary text-xl">$0.25</span>
                    </div>
                    <div class="flex justify-between p-4 bg-black rounded-xl border border-zinc-800">
                      <span class="text-zinc-300 uppercase tracking-wider text-sm font-bold">6 Cards</span>
                      <span class="font-black text-primary text-xl">$0.50</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4
                    class="font-bold text-white text-xl mb-4 pb-3 border-b-2 border-primary uppercase tracking-wider"
                  >
                    Special Games
                  </h4>
                  <div class="space-y-3">
                    <div class="flex justify-between p-4 bg-black rounded-xl border border-zinc-800">
                      <span class="text-zinc-300 uppercase tracking-wider text-sm font-bold">1 Card</span>
                      <span class="font-black text-primary text-xl">$1</span>
                    </div>
                    <div class="flex justify-between p-4 bg-black rounded-xl border border-zinc-800">
                      <span class="text-zinc-300 uppercase tracking-wider text-sm font-bold">3 Cards</span>
                      <span class="font-black text-primary text-xl">$2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== EVENING SESSION ===== -->
        <section id="evening" class="scroll-mt-20">
          <div class="text-center mb-16">
            <span
              class="text-primary font-black uppercase tracking-[0.4em] text-xs"
              >🌙 {{ pricing.evening?.startTime || "7:30 PM" }} Main
              Session</span
            >
            <h2
              class="text-5xl md:text-7xl font-black text-white mt-4 mb-6 uppercase tracking-tighter"
            >
              Nightly Bingo <span class="text-primary">Session</span>
            </h2>
            <p class="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto font-bold uppercase tracking-wider leading-relaxed">
              {{
                pricing.evening?.valueProposition ||
                "Our flagship nightly session with all-inclusive machine bundles, specialty games, and the Hornet Progressive."
              }}
            </p>
          </div>

          <!-- Session Sales Window -->
          <div
            v-if="pricing.evening?.scheduleNote"
            class="mb-16 bg-charcoal border-2 border-primary/50 rounded-[2.5rem] p-8 shadow-[0_0_40px_rgba(78,221,97,0.2)]"
          >
            <h3 class="text-2xl font-bold text-white mb-2 uppercase tracking-wider">
              📌 {{ pricing.evening.scheduleNote }}
            </h3>
            <p class="text-primary font-bold uppercase tracking-wider text-sm">
              Walk in early for best card selection.
            </p>
          </div>

          <!-- Best Value Highlight (Dynamic from Premium Bundles) -->
          <!-- Use the first "premium" type bundle found or default to hardcoded -->
          <div class="mb-16 relative">
            <div
              class="absolute -inset-1 bg-gradient-to-r from-primary via-primary to-primary rounded-[2.5rem] blur opacity-40"
            ></div>
            <div
              class="relative bg-gradient-to-br from-black to-charcoal text-white rounded-[2.5rem] p-12 md:p-20 text-center border border-primary/50 shadow-[0_0_60px_rgba(78,221,97,0.4)]"
            >
              <div class="text-6xl mb-6">⭐</div>
              <!-- Logic to find "Premium" bundle -->
              <div
                v-if="
                  pricing.evening?.machines?.find(
                    (m: any) => m.type === 'premium',
                  )
                "
              >
                <h3 class="text-4xl md:text-5xl font-black mb-8 uppercase tracking-tighter">
                  {{
                    pricing.evening.machines.find(
                      (m: any) => m.type === "premium",
                    ).description
                  }}
                  for
                  {{
                    pricing.evening.machines.find(
                      (m: any) => m.type === "premium",
                    ).price
                  }}
                </h3>
                <div class="grid md:grid-cols-3 gap-4 mb-8">
                  <!-- Assuming description implies contents, or hardcoded 'features' if structure doesn't support list. -->
                  <!-- For now, we keep the badges generic or based on description parsing if needed. Let's keep generic 'Best Value' badges. -->
                  <div
                    class="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-primary/30"
                  >
                    <p class="text-primary font-bold text-sm mb-1 uppercase tracking-wider">
                      ✓ Six-Packs
                    </p>
                  </div>
                  <div
                    class="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-primary/30"
                  >
                    <p class="text-primary font-bold text-sm mb-1 uppercase tracking-wider">
                      ✓ Double Actions
                    </p>
                  </div>
                  <div
                    class="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-primary/30"
                  >
                    <p class="text-primary font-bold text-sm mb-1 uppercase tracking-wider">
                      ✓ Letter X Papers
                    </p>
                  </div>
                </div>
              </div>
              <div v-else>
                <h3 class="text-4xl md:text-5xl font-black mb-8 uppercase tracking-tighter">
                  BEST VALUE: 2 Machines for $22
                </h3>
                <div class="grid md:grid-cols-3 gap-4 mb-8">
                  <div
                    class="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-primary/30"
                  >
                    <p class="text-primary font-bold text-sm mb-1 uppercase tracking-wider">
                      ✓ Six-Packs
                    </p>
                  </div>
                  <div
                    class="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-primary/30"
                  >
                    <p class="text-primary font-bold text-sm mb-1 uppercase tracking-wider">
                      ✓ Double Actions
                    </p>
                  </div>
                  <div
                    class="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-primary/30"
                  >
                    <p class="text-primary font-bold text-sm mb-1 uppercase tracking-wider">
                      ✓ Letter X Papers
                    </p>
                  </div>
                </div>
              </div>
              <p class="text-zinc-300 font-bold uppercase tracking-wider">
                Everything you need for a complete evening of premium bingo
              </p>
            </div>
          </div>

          <!-- Machine Packages (Dynamic) -->
          <div class="grid md:grid-cols-2 gap-8 mb-16">
            <div
              v-for="(machine, idx) in pricing.evening?.machines?.filter(
                (m: any) => m.type !== 'premium',
              ) || []"
              :key="idx"
              :class="[
                machine.type === 'bundle'
                  ? 'relative bg-charcoal border-3 border-primary shadow-[0_0_40px_rgba(78,221,97,0.3)] transform md:scale-105 hover:shadow-[0_0_60px_rgba(78,221,97,0.4)]'
                  : 'bg-charcoal border-2 border-zinc-800 hover:border-primary/50',
                'rounded-[2.5rem] p-10 transition-all duration-500',
              ]"
            >
              <div
                v-if="machine.type === 'bundle'"
                class="absolute top-0 right-0 bg-primary text-black font-black px-6 py-3 rounded-bl-2xl rounded-tr-2xl text-sm uppercase tracking-widest"
              >
                ★ Recommended
              </div>
              <h4
                class="text-3xl font-bold text-white mb-6 uppercase tracking-tighter"
                :class="{ 'mt-4': machine.type === 'bundle' }"
              >
                {{ machine.description }}
              </h4>
              <p class="text-zinc-400 mb-8 font-bold uppercase tracking-wider text-sm">
                {{ machine.savings || "Standard Entry" }}
              </p>
              <div class="text-5xl font-black text-primary mb-6">
                {{ machine.price }}
              </div>
              <button
                class="w-full font-black py-4 rounded-xl transition-all uppercase tracking-wider"
                :class="
                  machine.type === 'bundle'
                    ? 'bg-primary hover:bg-white text-black'
                    : 'bg-black hover:bg-primary hover:text-black text-white border border-zinc-800'
                "
              >
                Select
              </button>
            </div>
          </div>

          <!-- Specialty Games & Add-Ons (Dynamic) -->
          <div
            class="bg-charcoal border-2 border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div class="bg-black text-white p-10 border-b border-zinc-800">
              <h3 class="text-3xl font-bold uppercase tracking-tighter">
                ✏️ Session-Only Specialty Games
              </h3>
            </div>
            <div class="p-10 md:p-14 space-y-8">
              <!-- Dynamic List -->
              <div
                v-if="
                  pricing.evening?.specialtyGames &&
                  pricing.evening.specialtyGames.length > 0
                "
              >
                <div
                  v-for="(game, idx) in pricing.evening.specialtyGames"
                  :key="idx"
                  class="mb-8 border-b border-zinc-800 last:border-0 pb-6 last:pb-0"
                >
                  <h4 class="text-2xl font-bold text-white mb-2 uppercase tracking-wider">
                    {{ game.name }}
                  </h4>
                  <p class="text-zinc-400 text-sm mb-4 font-bold uppercase tracking-wider">
                    {{ game.description }}
                  </p>
                  <p class="text-3xl font-bold text-primary">
                    {{ game.price }}
                  </p>
                </div>
              </div>

              <!-- Fallback Hardcoded if no dynamic data (Legacy Support) -->
              <div v-else>
                <div>
                  <h4
                    class="text-xl font-bold text-white mb-6 pb-3 border-b-2 border-primary uppercase tracking-wider"
                  >
                    Odd/Even • Lucky Seven • Treasure Hunt • Cover All • Letter
                    X
                  </h4>
                  <div class="grid md:grid-cols-2 gap-6">
                    <div
                      class="bg-black border-2 border-primary/50 rounded-xl p-8"
                    >
                      <p class="text-sm text-primary font-bold mb-2 uppercase tracking-wider">
                        Single Card
                      </p>
                      <p class="text-5xl font-bold text-primary">$1</p>
                    </div>
                    <div
                      class="bg-black border-2 border-primary/50 rounded-xl p-8"
                    >
                      <p class="text-sm text-primary font-bold mb-2 uppercase tracking-wider">
                        6-Card Set
                      </p>
                      <p class="text-5xl font-bold text-primary">$5</p>
                      <p class="text-xs text-zinc-500 mt-2 uppercase tracking-wider font-bold">
                        Per game type (no mixing)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-6">
                <div
                  class="bg-black border-l-4 border-primary rounded-xl p-8"
                >
                  <h4 class="text-lg font-bold text-white mb-2 uppercase tracking-wider">
                    🐝 Hornet Progressive Daub Ticket
                  </h4>
                  <p class="text-zinc-400 text-sm font-bold uppercase tracking-wider">
                    Played after the Letter X game.
                    <span class="font-black text-primary block mt-1 text-xl">
                      {{ formatCurrency(jackpotStore.hornetValue) }}
                    </span>
                    with a chance at the progressive jackpot.
                  </p>
                </div>
                <div
                  class="bg-black border-l-4 border-primary rounded-xl p-8"
                >
                  <h4 class="text-lg font-bold text-white mb-2 uppercase tracking-wider">
                    🐴 Pull Tabs (Horse Races)
                  </h4>
                  <p class="text-zinc-400 text-sm font-bold uppercase tracking-wider">
                    Sold the majority of the time we are open. Also known as row
                    games.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== WEEKLY SPECIALS ===== -->
        <section id="specials" class="scroll-mt-20">
          <div class="text-center mb-16">
            <span
              class="text-primary font-black uppercase tracking-[0.4em] text-xs"
              >🎉 Weekly Promotions</span
            >
            <h2
              class="text-5xl md:text-7xl font-black text-white mt-4 mb-6 uppercase tracking-tighter"
            >
              Weekly Specials & <span class="text-primary">Bonuses</span>
            </h2>
            <p class="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto font-bold uppercase tracking-wider leading-relaxed">
              Extra value every day of the week. Plan your visit and maximize
              your winnings.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="day in daysOrder"
              :key="day"
              class="border-2 border-zinc-800 rounded-[2rem] p-8 bg-charcoal hover:border-primary/50 transition-all duration-500"
            >
              <h3 class="text-3xl font-bold text-white mb-6 uppercase tracking-tighter">
                {{ day }}
              </h3>

              <div class="space-y-3">
                <template v-if="getSpecialsForDay(day).length > 0">
                  <div
                    v-for="(special, idx) in getSpecialsForDay(day)"
                    :key="idx"
                    class="bg-black rounded-xl p-4 border-l-4 border-primary"
                  >
                    <p class="font-bold text-white uppercase tracking-wider text-sm">
                      {{ special.title }}
                    </p>
                    <p class="text-sm text-zinc-400 font-bold uppercase tracking-wider mt-1">{{ special.detail }}</p>
                  </div>
                </template>
                <template v-else>
                  <div
                    class="bg-black/50 rounded-xl p-4 text-center border border-dashed border-zinc-800"
                  >
                    <p class="text-sm text-zinc-600 italic uppercase tracking-wider font-bold">
                      No specials listed
                    </p>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== SUNDAY SPECIAL ===== -->
        <section
          id="sunday"
          class="scroll-mt-20 -mx-4 px-4 py-20 bg-black border-y border-zinc-900"
        >
          <div class="max-w-5xl mx-auto">
            <div class="text-center mb-16">
              <span
                class="text-primary font-black uppercase tracking-[0.4em] text-xs"
                >🌟 SUNDAY SPECIAL</span
              >
              <h2
                class="text-5xl md:text-7xl font-black text-white mt-4 mb-6 uppercase tracking-tighter"
              >
                {{ pricing.sunday?.title || "Premier Sunday Night" }}
              </h2>
              <p class="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto font-bold uppercase tracking-wider leading-relaxed">
                {{
                  pricing.sunday?.note ||
                  "Special games, free dinner, and 15× $250 jackpots make Sundays our most exciting night."
                }}
              </p>
            </div>

            <!-- Dynamic Sunday Specials -->
            <div class="grid md:grid-cols-3 gap-6 mb-12">
              <div
                v-for="(special, idx) in pricing.sunday?.specials || []"
                :key="idx"
                class="bg-charcoal rounded-[2rem] p-10 border-2 border-primary/50 shadow-[0_0_30px_rgba(78,221,97,0.2)]"
              >
                <div class="text-5xl mb-4">🎉</div>
                <h3 class="text-3xl font-bold text-white mb-6 uppercase tracking-tighter">
                  {{ special.name }}
                </h3>
                <div class="space-y-3">
                  <div
                    v-if="special.optionOne"
                    class="flex justify-between p-4 bg-black rounded-xl border border-zinc-800"
                  >
                    <span class="font-medium text-zinc-300 uppercase tracking-wider text-sm">{{
                      special.optionOne
                    }}</span>
                  </div>
                  <div
                    v-if="special.optionTwo"
                    class="flex justify-between p-4 bg-black rounded-xl border border-zinc-800"
                  >
                    <span class="font-medium text-zinc-300 uppercase tracking-wider text-sm">{{
                      special.optionTwo
                    }}</span>
                  </div>
                  <p
                    v-if="special.description"
                    class="text-xs text-zinc-500 mt-2 uppercase tracking-wider font-bold"
                  >
                    {{ special.description }}
                  </p>
                </div>
              </div>

              <!-- Hardcoded Fallback if empty -->
              <div
                v-if="
                  !pricing.sunday?.specials ||
                  pricing.sunday.specials.length === 0
                "
                class="col-span-3 text-center text-zinc-500 italic"
              >
                No Sunday specials configured.
              </div>
            </div>

            <div
              class="bg-charcoal rounded-[2.5rem] p-10 border-2 border-primary text-center shadow-[0_0_50px_rgba(78,221,97,0.3)]"
            >
              <h3 class="text-3xl font-bold text-white mb-4 uppercase tracking-tighter">
                15× $250 UPIK Jackpots
              </h3>
              <p class="text-zinc-400 mb-8 font-bold uppercase tracking-wider">
                Plus Free Dinner & Special Games
              </p>
              <div class="grid md:grid-cols-3 gap-4">
                <div class="bg-black rounded-xl p-6 border border-primary/50">
                  <p class="text-sm font-bold text-primary uppercase tracking-wider">
                    15 Separate Chances
                  </p>
                  <p class="text-3xl font-black text-primary">$250</p>
                </div>
                <div class="bg-black rounded-xl p-6 border border-primary/50">
                  <p class="text-sm font-bold text-primary uppercase tracking-wider">Free Dinner</p>
                  <p class="text-3xl font-black text-primary">Included</p>
                </div>
                <div class="bg-black rounded-xl p-6 border border-primary/50">
                  <p class="text-sm font-bold text-primary uppercase tracking-wider">
                    Best Session Value
                  </p>
                  <p class="text-3xl font-black text-primary">$22</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- FAQs Section (Dynamic) -->
        <section
          v-if="pricing.faqs && pricing.faqs.length > 0"
          class="max-w-4xl mx-auto"
        >
          <h2 class="text-5xl md:text-7xl font-black text-white mb-12 text-center uppercase tracking-tighter">
            <span class="text-primary">Frequently Asked</span> Questions
          </h2>
          <div class="space-y-4">
            <div
              v-for="(faq, idx) in pricing.faqs"
              :key="idx"
              class="bg-charcoal rounded-[2rem] p-8 border border-zinc-800"
            >
              <h3 class="font-bold text-xl text-white mb-3 uppercase tracking-wider">
                {{ faq.question }}
              </h3>
              <p class="text-zinc-400 font-bold uppercase tracking-wider text-sm">{{ faq.answer }}</p>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section
          class="text-center py-20 bg-gradient-to-br from-black to-charcoal text-white rounded-[2.5rem] border-2 border-primary shadow-[0_0_60px_rgba(78,221,97,0.4)]"
        >
          <h2 class="text-5xl md:text-6xl font-black mb-8 uppercase tracking-tighter">Ready to <span class="text-primary">Play?</span></h2>
          <p class="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto font-bold uppercase tracking-wider leading-relaxed">
            Walk in. Buy your cards. Win big. Transparent pricing,
            transparent rules, premium bingo awaits.
          </p>
          <NuxtLink
            to="/schedule"
            class="inline-block bg-primary hover:bg-white text-black font-black px-12 py-5 rounded-2xl transition-all transform hover:-translate-y-1 shadow-[0_20px_60px_rgba(78,221,97,0.5)] uppercase tracking-[0.2em]"
          >
            View Our Schedule
          </NuxtLink>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJackpotStore } from "~/stores/jackpot";

const props = defineProps<{
  pricing: any;
  schedule: any[];
}>();

const jackpotStore = useJackpotStore();

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
};

// --- Dynamic Specials Logic ---

const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const dayStyles: Record<string, any> = {
  Mon: {
    bg: "bg-gradient-to-br from-red-50 to-orange-50",
    border: "border-red-300",
    accent: "border-red-500",
  },
  Tue: {
    bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
    border: "border-blue-300",
    accent: "border-blue-500",
  },
  Wed: {
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    border: "border-emerald-300",
    accent: "border-emerald-500",
  },
  Thu: {
    bg: "bg-gradient-to-br from-violet-50 to-purple-50",
    border: "border-violet-300",
    accent: "border-violet-500",
  },
  Fri: {
    bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
    border: "border-amber-300",
    accent: "border-amber-500",
  },
  Sat: {
    bg: "bg-gradient-to-br from-pink-50 to-rose-50",
    border: "border-pink-300",
    accent: "border-pink-500",
  },
  Sun: {
    bg: "bg-gradient-to-br from-gold-50 to-orange-50",
    border: "border-gold-300",
    accent: "border-gold-500",
  },
};

const getSpecialsForDay = (day: string) => {
  if (!props.schedule || !Array.isArray(props.schedule)) return [];

  const specials: { title: string; detail: string }[] = [];

  props.schedule.forEach((session: any) => {
    // Check if session is active on this day
    if (session.availableDays && session.availableDays.includes(day)) {
      // Check if it has a specific special for this day
      if (session.specials && session.specials[day]) {
        specials.push({
          title: session.name, // Use session name as title (e.g. "Good Neighbor Session")
          detail: session.specials[day],
        });
      }
      // Fallback: If it's a "Special" category session but has no specific daily override, use description
      // BUT only if it's not a generic "Daytime" session which clutters the view.
      else if (
        session.category === "Special" ||
        session.category === "Promotion"
      ) {
        specials.push({
          title: session.name,
          detail: session.description,
        });
      }
    }
  });

  // Sort logic could go here if needed, e.g. prioritizing named specials
  return specials;
};
</script>

<style scoped>
html {
  scroll-behavior: smooth;
}
</style>
