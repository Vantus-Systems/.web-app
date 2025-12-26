<template>
  <div class="bg-white min-h-screen">
    <!-- Hero Section with Bingo Background -->
    <section
      class="relative bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white overflow-hidden py-24 md:py-36"
    >
      <div class="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=2000"
          class="w-full h-full object-cover opacity-30"
          alt="Bingo hall"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-primary-900/60 to-primary-800/40"
        ></div>
      </div>

      <div class="relative z-10 container mx-auto px-4 text-center">
        <div
          v-motion-fade-visible
          class="inline-flex items-center gap-2 bg-gold-500/20 backdrop-blur-sm border border-gold-400/50 text-gold-300 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-[0.3em] mb-8 shadow-lg shadow-gold/20"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          Transparent Pricing • No Hidden Fees • Best Value Guarantee
        </div>
        <h1
          v-motion-fade-visible
          class="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gold-100 to-gold-300 drop-shadow-2xl"
        >
          Play More, Save More
        </h1>
        <p
          v-motion-fade-visible
          class="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto mb-10 leading-relaxed font-light"
        >
          One main session at 7:30 PM every night. Daytime pay-as-you-go games
          from 10:30 AM. Clear, honest pricing with zero surprises.
        </p>

        <!-- Trust Badges -->
        <div
          v-motion-fade-visible
          class="flex flex-wrap items-center justify-center gap-6 mb-10"
        >
          <div class="flex items-center gap-2 text-primary-200 text-sm">
            <svg
              class="w-5 h-5 text-gold-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            <span>200+ Daily Players</span>
          </div>
          <div class="flex items-center gap-2 text-primary-200 text-sm">
            <svg
              class="w-5 h-5 text-gold-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                clip-rule="evenodd"
              />
            </svg>
            <span>7 Days A Week</span>
          </div>
          <div class="flex items-center gap-2 text-primary-200 text-sm">
            <svg
              class="w-5 h-5 text-gold-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
              />
              <path
                d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"
              />
            </svg>
            <span>Free Secure Parking</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#daytime"
            class="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-primary-900 font-black px-10 py-5 rounded-2xl transition-all transform hover:-translate-y-2 shadow-2xl shadow-gold/30 text-lg"
          >
            Daytime Play →
          </a>
          <a
            href="#evening"
            class="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/70 text-white font-bold px-10 py-5 rounded-2xl transition-all hover:-translate-y-1 text-lg"
          >
            Evening Session
          </a>
        </div>
      </div>
    </section>

    <div class="container mx-auto px-4 py-20">
      <div class="space-y-32">
        <!-- ===== PAY-AS-YOU-GO (DAYTIME) ===== -->
        <section id="daytime" class="scroll-mt-20">
          <div class="text-center mb-16">
            <span
              class="text-gold-600 font-bold uppercase tracking-widest text-sm"
              >☀️ 10:30 AM – 7:30 PM</span
            >
            <h2
              class="text-4xl md:text-5xl font-black text-primary-900 mt-4 mb-6"
            >
              Daytime Pay-As-You-Go
            </h2>
            <p class="text-xl text-slate-600 max-w-3xl mx-auto">
              Flexible, affordable gaming windows. Pay only for the machines you
              want to play. Super 6 Jackpots ($250) start at 12 PM!
            </p>
          </div>

          <!-- Morning Window -->
          <div class="grid md:grid-cols-2 gap-8 mb-16">
            <div
              class="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-8 md:p-12"
            >
              <div class="flex items-center gap-3 mb-6">
                <div class="text-4xl">☀️</div>
                <div>
                  <h3 class="text-2xl font-bold text-primary-900">
                    Morning Play
                  </h3>
                  <p class="text-amber-700 font-semibold">
                    10:30 AM – 12:30 PM
                  </p>
                </div>
              </div>
              <p class="text-amber-700 mb-8">
                Doors open at 10 AM. Bingo starts at 10:30 AM.
              </p>

              <h4 class="font-bold text-primary-900 text-lg mb-4">
                Machine Pricing
              </h4>
              <div class="space-y-3 mb-8">
                <div
                  class="flex justify-between items-center p-3 bg-white rounded-lg border border-amber-100"
                >
                  <span class="font-medium text-slate-700">1 Machine</span>
                  <span class="text-xl font-bold text-primary-900">$1</span>
                </div>
                <div
                  class="flex justify-between items-center p-3 bg-white rounded-lg border border-amber-100"
                >
                  <span class="font-medium text-slate-700">3 Machines</span>
                  <span class="text-xl font-bold text-gold-600"
                    >$2
                    <span class="text-xs text-slate-500">(save $1)</span></span
                  >
                </div>
                <div
                  class="flex justify-between items-center p-3 bg-white rounded-lg border border-amber-100"
                >
                  <span class="font-medium text-slate-700">5 Machines</span>
                  <span class="text-xl font-bold text-gold-600"
                    >$3
                    <span class="text-xs text-slate-500">(save $2)</span></span
                  >
                </div>
              </div>

              <div class="bg-amber-100 border-l-4 border-amber-500 rounded p-4">
                <p class="text-sm text-amber-900 font-semibold mb-2">
                  💡 Free Paper Bonus
                </p>
                <p class="text-sm text-amber-800">
                  <strong>Spend $1+ →</strong> Get 1 free paper card
                </p>
                <p class="text-sm text-amber-800 mt-1">
                  <strong>Spend $2+ →</strong> Unlimited paper cards
                </p>
              </div>
            </div>

            <!-- Afternoon Window -->
            <div
              class="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200 rounded-3xl p-8 md:p-12"
            >
              <div class="flex items-center gap-3 mb-6">
                <div class="text-4xl">🕐</div>
                <div>
                  <h3 class="text-2xl font-bold text-primary-900">
                    Afternoon Play
                  </h3>
                  <p class="text-slate-700 font-semibold">12:30 PM – 7:30 PM</p>
                </div>
              </div>
              <p class="text-slate-700 mb-8">
                Pay-as-you-go games continue until the main session.
              </p>

              <h4 class="font-bold text-primary-900 text-lg mb-4">
                Machine Pricing
              </h4>
              <div class="space-y-3 mb-8">
                <div
                  class="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100"
                >
                  <span class="font-medium text-slate-700">1 Machine</span>
                  <span class="text-xl font-bold text-primary-900">$1</span>
                </div>
                <div
                  class="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-100"
                >
                  <span class="font-medium text-slate-700">4 Machines</span>
                  <span class="text-xl font-bold text-gold-600"
                    >$3
                    <span class="text-xs text-slate-500">(save $1)</span></span
                  >
                </div>
              </div>

              <div class="bg-blue-100 border-l-4 border-blue-500 rounded p-4">
                <p class="text-sm text-blue-900 font-semibold mb-2">
                  💡 Free Paper Bonus
                </p>
                <p class="text-sm text-blue-800">
                  <strong>Spend $1+ →</strong> Get 1 free paper card
                </p>
                <p class="text-sm text-blue-800 mt-1">
                  <strong>Spend $2+ →</strong> Unlimited paper cards
                </p>
              </div>
            </div>
          </div>

          <!-- Daytime Jackpots -->
          <div
            class="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-3xl p-8 md:p-12 mb-16"
          >
            <div class="flex items-center gap-3 mb-6">
              <div class="text-4xl">💰</div>
              <div>
                <h3 class="text-2xl font-bold text-primary-900">
                  Daytime Jackpots & Progressives
                </h3>
                <p class="text-purple-700 font-semibold">
                  Big wins all day long!
                </p>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
              <div class="bg-white rounded-2xl p-6 border border-purple-100">
                <h4 class="font-bold text-primary-900 text-lg mb-2">
                  Super 6 Jackpots
                </h4>
                <p class="text-slate-600 text-sm mb-4">
                  Played at the top of each hour starting at 12 PM.
                </p>
                <div class="text-3xl font-black text-purple-600">$250</div>
              </div>

              <div class="bg-white rounded-2xl p-6 border border-purple-100">
                <h4 class="font-bold text-primary-900 text-lg mb-2">
                  Bingo Babes Progressive
                </h4>
                <p class="text-slate-600 text-sm mb-4">
                  Played after the 4 PM Super 6 Jackpot game.
                </p>
                <div class="text-3xl font-black text-purple-600">
                  $200 Guaranteed
                </div>
                <p class="text-xs text-purple-500 mt-1">
                  + Chance at the Progressive Jackpot
                </p>
              </div>
            </div>
          </div>

          <!-- Paper Only Option -->
          <div
            class="bg-gradient-to-r from-primary-50 to-slate-50 border-2 border-primary-200 rounded-3xl overflow-hidden"
          >
            <div class="p-8 md:p-12">
              <h3 class="text-2xl font-bold text-primary-900 mb-2">
                🎫 Paper Cards Only
              </h3>
              <p class="text-slate-600 mb-8">
                Prefer paper-only play? Low-cost entry to bingo.
              </p>

              <div class="grid md:grid-cols-2 gap-8">
                <div>
                  <h4
                    class="font-bold text-primary-900 text-lg mb-4 pb-3 border-b-2 border-primary-300"
                  >
                    Regular Bingo
                  </h4>
                  <div class="space-y-3">
                    <div class="flex justify-between p-3 bg-white rounded-lg">
                      <span class="text-slate-700">3 Cards</span>
                      <span class="font-bold text-primary-900">$0.25</span>
                    </div>
                    <div class="flex justify-between p-3 bg-white rounded-lg">
                      <span class="text-slate-700">6 Cards</span>
                      <span class="font-bold text-primary-900">$0.50</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4
                    class="font-bold text-primary-900 text-lg mb-4 pb-3 border-b-2 border-primary-300"
                  >
                    Special Games
                  </h4>
                  <div class="space-y-3">
                    <div class="flex justify-between p-3 bg-white rounded-lg">
                      <span class="text-slate-700">1 Card</span>
                      <span class="font-bold text-primary-900">$1</span>
                    </div>
                    <div class="flex justify-between p-3 bg-white rounded-lg">
                      <span class="text-slate-700">3 Cards</span>
                      <span class="font-bold text-primary-900">$2</span>
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
              class="text-gold-600 font-bold uppercase tracking-widest text-sm"
              >🌙 7:30 PM Main Session</span
            >
            <h2
              class="text-4xl md:text-5xl font-black text-primary-900 mt-4 mb-6"
            >
              Nightly Bingo Session
            </h2>
            <p class="text-xl text-slate-600 max-w-3xl mx-auto">
              Our flagship nightly session with all-inclusive machine bundles,
              specialty games, and the Hornet Progressive.
            </p>
          </div>

          <!-- Session Sales Window -->
          <div
            class="mb-16 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-8"
          >
            <h3 class="text-2xl font-bold text-primary-900 mb-2">
              📌 Session Sales Window: 5:15 PM – 7:30 PM
            </h3>
            <p class="text-emerald-700 font-medium">
              Buy your session cards early for best card selection.
            </p>
          </div>

          <!-- Best Value Highlight -->
          <div class="mb-16 relative">
            <div
              class="absolute -inset-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400 rounded-3xl blur opacity-25"
            ></div>
            <div
              class="relative bg-gradient-to-br from-primary-900 to-primary-800 text-white rounded-3xl p-8 md:p-16 text-center"
            >
              <div class="text-5xl mb-4">⭐</div>
              <h3 class="text-3xl md:text-4xl font-black mb-6">
                BEST VALUE: 2 Machines for $22
              </h3>
              <div class="grid md:grid-cols-3 gap-4 mb-8">
                <div
                  class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                >
                  <p class="text-gold-300 font-bold text-sm mb-1">
                    ✓ Six-Packs
                  </p>
                </div>
                <div
                  class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                >
                  <p class="text-gold-300 font-bold text-sm mb-1">
                    ✓ Double Actions
                  </p>
                </div>
                <div
                  class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                >
                  <p class="text-gold-300 font-bold text-sm mb-1">
                    ✓ Letter X Papers
                  </p>
                </div>
              </div>
              <p class="text-primary-200">
                Everything you need for a complete evening of premium bingo
              </p>
            </div>
          </div>

          <!-- Machine Packages -->
          <div class="grid md:grid-cols-2 gap-8 mb-16">
            <div
              class="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-all"
            >
              <h4 class="text-2xl font-bold text-primary-900 mb-6">
                Single Machine
              </h4>
              <p class="text-slate-600 mb-8">
                One machine entry for the 7:30 PM session
              </p>
              <div class="text-5xl font-black text-gold-600 mb-4">$11</div>
              <button
                class="w-full bg-primary-900 hover:bg-primary-800 text-white font-bold py-3 rounded-lg transition"
              >
                Select
              </button>
            </div>

            <div
              class="relative bg-gradient-to-br from-gold-100 to-gold-50 border-3 border-gold-500 rounded-2xl p-8 shadow-2xl transform md:scale-105 hover:shadow-2xl transition-all"
            >
              <div
                class="absolute top-0 right-0 bg-gold-500 text-white font-bold px-4 py-2 rounded-bl-2xl rounded-tr-2xl text-sm uppercase"
              >
                ★ Best Value
              </div>
              <h4 class="text-2xl font-bold text-primary-900 mb-6 mt-4">
                Two Machines (Recommended)
              </h4>
              <p class="text-slate-700 mb-8 font-medium">
                Includes: 6-packs • Double Actions • Letter X Papers
              </p>
              <div class="text-5xl font-black text-gold-600 mb-6">$22</div>
              <button
                class="w-full bg-gold-500 hover:bg-gold-600 text-primary-900 font-bold py-3 rounded-lg transition transform hover:-translate-y-1"
              >
                Select
              </button>
            </div>
          </div>

          <!-- Specialty Games & Add-Ons -->
          <div
            class="bg-white border-2 border-primary-200 rounded-3xl overflow-hidden"
          >
            <div class="bg-primary-900 text-white p-8">
              <h3 class="text-2xl font-bold">
                ✏️ Session-Only Specialty Games
              </h3>
            </div>
            <div class="p-8 md:p-12 space-y-8">
              <div>
                <h4
                  class="text-xl font-bold text-primary-900 mb-6 pb-3 border-b-2 border-primary-300"
                >
                  Odd/Even • Lucky Seven • Treasure Hunt • Cover All • Letter X
                </h4>
                <div class="grid md:grid-cols-2 gap-6">
                  <div
                    class="bg-gold-50 border-2 border-gold-200 rounded-lg p-6"
                  >
                    <p class="text-sm text-gold-700 font-semibold mb-2">
                      Single Card
                    </p>
                    <p class="text-4xl font-bold text-gold-600">$1</p>
                  </div>
                  <div
                    class="bg-gold-50 border-2 border-gold-200 rounded-lg p-6"
                  >
                    <p class="text-sm text-gold-700 font-semibold mb-2">
                      6-Card Set
                    </p>
                    <p class="text-4xl font-bold text-gold-600">$5</p>
                    <p class="text-xs text-gold-700 mt-2">
                      Per game type (no mixing)
                    </p>
                  </div>
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-6">
                <div
                  class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6"
                >
                  <h4 class="text-lg font-bold text-blue-900 mb-2">
                    🐝 Hornet Progressive Daub Ticket
                  </h4>
                  <p class="text-blue-800 text-sm">
                    Played after the Letter X game. $250 Guaranteed prize with a
                    chance at the progressive jackpot.
                  </p>
                </div>
                <div
                  class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6"
                >
                  <h4 class="text-lg font-bold text-purple-900 mb-2">
                    🐴 Pull Tabs (Horse Races)
                  </h4>
                  <p class="text-purple-800 text-sm">
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
              class="text-gold-600 font-bold uppercase tracking-widest text-sm"
              >🎉 Weekly Promotions</span
            >
            <h2
              class="text-4xl md:text-5xl font-black text-primary-900 mt-4 mb-6"
            >
              Weekly Specials & Bonuses
            </h2>
            <p class="text-xl text-slate-600 max-w-3xl mx-auto">
              Extra value every day of the week. Plan your visit and maximize
              your winnings.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Monday -->
            <div
              class="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-8"
            >
              <h3 class="text-2xl font-bold text-primary-900 mb-4">Monday</h3>
              <div class="space-y-3">
                <div class="bg-white rounded p-3 border-l-4 border-red-500">
                  <p class="font-bold text-primary-900">
                    Good Neighbor Session
                  </p>
                  <p class="text-sm text-slate-600">5× Pull Tabs Consolation</p>
                </div>
                <div class="bg-white rounded p-3 border-l-4 border-red-500">
                  <p class="font-bold text-primary-900">Neighbor Send-Out</p>
                  <p class="text-sm text-slate-600">$250 Jackpot Winners</p>
                </div>
              </div>
            </div>

            <!-- Tuesday -->
            <div
              class="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-8"
            >
              <h3 class="text-2xl font-bold text-primary-900 mb-4">Tuesday</h3>
              <div class="space-y-3">
                <div class="bg-white rounded p-3 border-l-4 border-blue-500">
                  <p class="font-bold text-primary-900">Free 9-On Games</p>
                  <p class="text-sm text-slate-600">3 PM, 6 PM, Post-Session</p>
                </div>
                <div class="bg-white rounded p-3 border-l-4 border-blue-500">
                  <p class="font-bold text-primary-900">Bonus Machine</p>
                  <p class="text-sm text-slate-600">
                    1 free machine with session buy-in
                  </p>
                </div>
              </div>
            </div>

            <!-- Wednesday -->
            <div
              class="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-8"
            >
              <h3 class="text-2xl font-bold text-primary-900 mb-4">
                Wednesday
              </h3>
              <div class="space-y-3">
                <div class="bg-white rounded p-3 border-l-4 border-emerald-500">
                  <p class="font-bold text-primary-900">Free Machine</p>
                  <p class="text-sm text-slate-600">With session buy-in</p>
                </div>
                <div class="bg-white rounded p-3 border-l-4 border-emerald-500">
                  <p class="font-bold text-primary-900">
                    Weekly Free Bingo Promo
                  </p>
                  <p class="text-sm text-slate-600">$100 single-winner prize</p>
                  <p class="text-xs text-emerald-700 mt-1">
                    + 7 days free session play
                  </p>
                </div>
              </div>
            </div>

            <!-- Thursday -->
            <div
              class="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-300 rounded-2xl p-8"
            >
              <h3 class="text-2xl font-bold text-primary-900 mb-4">Thursday</h3>
              <div class="space-y-3">
                <div class="bg-white rounded p-3 border-l-4 border-violet-500">
                  <p class="font-bold text-primary-900">
                    Good Neighbor Session
                  </p>
                  <p class="text-sm text-slate-600">5× Pull Tabs Consolation</p>
                </div>
                <div class="bg-white rounded p-3 border-l-4 border-violet-500">
                  <p class="font-bold text-primary-900">Neighbor Send-Out</p>
                  <p class="text-sm text-slate-600">$250 Jackpot Winners</p>
                </div>
              </div>
            </div>

            <!-- Friday -->
            <div
              class="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-8"
            >
              <h3 class="text-2xl font-bold text-primary-900 mb-4">Friday</h3>
              <div class="space-y-3">
                <div class="bg-white rounded p-3 border-l-4 border-amber-500">
                  <p class="font-bold text-primary-900">
                    Free Treasure Hunt Cards
                  </p>
                  <p class="text-sm text-slate-600">6-for-$5 value FREE</p>
                </div>
                <div class="bg-white rounded p-3 border-l-4 border-amber-500">
                  <p class="font-bold text-primary-900">
                    Treasure Hunt Jackpot
                  </p>
                  <p class="text-sm text-slate-600">
                    $250 single winner (both halves)
                  </p>
                </div>
              </div>
            </div>

            <!-- Saturday -->
            <div
              class="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-300 rounded-2xl p-8"
            >
              <h3 class="text-2xl font-bold text-primary-900 mb-4">Saturday</h3>
              <div class="space-y-3">
                <div class="bg-white rounded p-3 border-l-4 border-pink-500">
                  <p class="font-bold text-primary-900">Alternating Specials</p>
                  <p class="text-sm text-slate-600">
                    AYCP Paper or Premium Bundles
                  </p>
                </div>
                <div class="bg-white rounded p-3 border-l-4 border-pink-500">
                  <p class="text-xs text-pink-700 italic">
                    Check with hall for current promotion
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== SUNDAY SPECIAL ===== -->
        <section
          id="sunday"
          class="scroll-mt-20 -mx-4 px-4 py-16 bg-gradient-to-br from-gold-50 via-amber-50 to-orange-50"
        >
          <div class="max-w-5xl mx-auto">
            <div class="text-center mb-16">
              <span
                class="text-gold-700 font-bold uppercase tracking-widest text-sm"
                >🌟 SUNDAY SPECIAL</span
              >
              <h2
                class="text-4xl md:text-5xl font-black text-primary-900 mt-4 mb-6"
              >
                Premier Sunday Night
              </h2>
              <p class="text-xl text-slate-700 max-w-3xl mx-auto font-medium">
                Special games, free dinner, and 15× $250 jackpots make Sundays
                our most exciting night.
              </p>
            </div>

            <div class="grid md:grid-cols-3 gap-6 mb-12">
              <div
                class="bg-white rounded-2xl p-8 border-2 border-gold-300 shadow-lg"
              >
                <div class="text-4xl mb-4">🎉</div>
                <h3 class="text-2xl font-bold text-primary-900 mb-4">
                  Speedy Coverall
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between p-3 bg-gold-50 rounded">
                    <span class="font-medium text-slate-700">1 Card</span>
                    <span class="font-bold text-primary-900">$1</span>
                  </div>
                  <div class="flex justify-between p-3 bg-gold-50 rounded">
                    <span class="font-medium text-slate-700">3 Cards</span>
                    <span class="font-bold text-gold-600">$2</span>
                  </div>
                </div>
              </div>

              <div
                class="bg-white rounded-2xl p-8 border-2 border-gold-300 shadow-lg"
              >
                <div class="text-4xl mb-4">⭐</div>
                <h3 class="text-2xl font-bold text-primary-900 mb-4">
                  Super 3 & U-PIK
                </h3>
                <div class="space-y-3">
                  <div class="flex justify-between p-3 bg-gold-50 rounded">
                    <span class="font-medium text-slate-700">1 Card</span>
                    <span class="font-bold text-primary-900">$1</span>
                  </div>
                  <div class="flex justify-between p-3 bg-gold-50 rounded">
                    <span class="font-medium text-slate-700">6 Cards</span>
                    <span class="font-bold text-gold-600">$5</span>
                  </div>
                </div>
              </div>

              <div
                class="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-8 border-3 border-emerald-400 shadow-lg flex flex-col justify-center text-center"
              >
                <div class="text-5xl mb-4">🎁</div>
                <h3 class="text-2xl font-bold text-primary-900 mb-2">
                  FREE U-PIK Card
                </h3>
                <p class="text-emerald-800 font-semibold">
                  Every session entry includes
                </p>
                <p class="text-sm text-emerald-700 mt-2">
                  Plus $500 weekly jackpot
                </p>
              </div>
            </div>

            <div
              class="bg-white rounded-3xl p-8 border-2 border-gold-300 text-center"
            >
              <h3 class="text-2xl font-bold text-primary-900 mb-4">
                15× $250 UPIK Jackpots
              </h3>
              <p class="text-slate-700 mb-6 font-medium">
                Plus Free Dinner & Special Games
              </p>
              <div class="grid md:grid-cols-3 gap-4">
                <div class="bg-gold-100 rounded-lg p-4">
                  <p class="text-sm font-bold text-gold-900">
                    15 Separate Chances
                  </p>
                  <p class="text-2xl font-black text-gold-700">$250</p>
                </div>
                <div class="bg-emerald-100 rounded-lg p-4">
                  <p class="text-sm font-bold text-emerald-900">Free Dinner</p>
                  <p class="text-2xl font-black text-emerald-700">Included</p>
                </div>
                <div class="bg-blue-100 rounded-lg p-4">
                  <p class="text-sm font-bold text-blue-900">
                    Best Session Value
                  </p>
                  <p class="text-2xl font-black text-blue-700">$22</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section
          class="text-center py-16 bg-gradient-to-r from-primary-900 to-primary-800 text-white rounded-3xl"
        >
          <h2 class="text-3xl md:text-4xl font-black mb-6">Ready to Play?</h2>
          <p class="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Choose your favorite day and session, then visit us. Clear pricing,
            transparent rules, and premium bingo awaits.
          </p>
          <NuxtLink
            to="/schedule"
            class="inline-block bg-gold-500 hover:bg-gold-600 text-primary-900 font-bold px-8 py-4 rounded-lg transition transform hover:-translate-y-1"
          >
            View Our Schedule
          </NuxtLink>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "Pricing & Sessions | Mary Esther Bingo",
  description:
    "Clear, transparent pricing for all bingo sessions. From $1 pay-as-you-go to premium evening sessions with jackpots.",
});
</script>

<style scoped>
html {
  scroll-behavior: smooth;
}
</style>
