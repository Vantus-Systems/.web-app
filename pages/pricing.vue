<template>
  <div class="bg-white min-h-screen">
    <!-- Hero Section -->
    <section
      class="relative bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white overflow-hidden py-24 md:py-36"
    >
      <div class="absolute inset-0 opacity-5">
        <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div
        class="absolute inset-0 bg-gradient-to-t from-primary-950/90 to-transparent"
      ></div>

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
          Whether you're here for daytime casual play or our premium evening
          session, we offer unbeatable value with clear, honest pricing. No
          gimmicks, just great gaming.
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
            <span>7-Days-A-Week Sessions</span>
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
      <!-- Loading State -->
      <div v-if="pending" class="flex justify-center py-20">
        <div
          class="animate-spin h-12 w-12 border-4 border-gold-500 border-t-transparent rounded-full"
        ></div>
      </div>

      <div v-else class="space-y-32">
        <!-- ===== DAYTIME PLAY SECTION ===== -->
        <section id="daytime" class="scroll-mt-20">
          <div class="text-center mb-16">
            <span
              class="text-gold-600 font-bold uppercase tracking-widest text-sm"
              >☀️ 10:30 AM – 7:30 PM</span
            >
            <h2
              class="text-4xl md:text-5xl font-black text-primary-900 mt-4 mb-6"
            >
              Daytime Play-As-You-Go
            </h2>
            <p class="text-xl text-slate-600 max-w-2xl mx-auto">
              Enjoy flexible, affordable gaming with our machine and paper-card
              options. Perfect for a quick afternoon or extended play session.
            </p>
          </div>

          <!-- Time Windows -->
          <div class="grid md:grid-cols-2 gap-8 mb-16">
            <!-- Morning 10:30 - 12:30 -->
            <div
              class="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-8 md:p-12"
            >
              <div class="flex items-center gap-3 mb-6">
                <div class="text-3xl">☀️</div>
                <h3 class="text-2xl font-bold text-primary-900">
                  Morning Window
                </h3>
              </div>
              <p class="text-amber-700 font-semibold text-lg mb-2">
                10:30 AM – 12:30 PM
              </p>
              <div class="space-y-4 mt-8 border-t-2 border-amber-200 pt-8">
                <h4 class="font-bold text-primary-900 text-lg">Machine Play</h4>
                <div class="space-y-3">
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
                      <span class="text-xs text-slate-500"
                        >(save $1)</span
                      ></span
                    >
                  </div>
                  <div
                    class="flex justify-between items-center p-3 bg-white rounded-lg border border-amber-100"
                  >
                    <span class="font-medium text-slate-700">5 Machines</span>
                    <span class="text-xl font-bold text-gold-600"
                      >$3
                      <span class="text-xs text-slate-500"
                        >(save $2)</span
                      ></span
                    >
                  </div>
                </div>

                <div
                  class="bg-amber-100 border-l-4 border-amber-500 rounded p-4 mt-6"
                >
                  <p class="text-sm text-amber-900 font-semibold mb-2">
                    💡 Free Paper Bonus
                  </p>
                  <p class="text-sm text-amber-800">
                    Spend <strong>$1+</strong> on machines → Get
                    <strong>1 free paper card</strong>
                  </p>
                  <p class="text-sm text-amber-800 mt-2">
                    Spend <strong>$2+</strong> on machines → Get
                    <strong>unlimited paper cards</strong>
                  </p>
                </div>
              </div>
            </div>

            <!-- Afternoon 12:30 - 7:30 -->
            <div
              class="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200 rounded-3xl p-8 md:p-12"
            >
              <div class="flex items-center gap-3 mb-6">
                <div class="text-3xl">🕐</div>
                <h3 class="text-2xl font-bold text-primary-900">
                  Afternoon Window
                </h3>
              </div>
              <p class="text-slate-700 font-semibold text-lg mb-2">
                12:30 PM – 7:30 PM
              </p>
              <div class="space-y-4 mt-8 border-t-2 border-slate-200 pt-8">
                <h4 class="font-bold text-primary-900 text-lg">Machine Play</h4>
                <div class="space-y-3">
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
                      <span class="text-xs text-slate-500"
                        >(save $1)</span
                      ></span
                    >
                  </div>
                </div>

                <div
                  class="bg-blue-100 border-l-4 border-blue-500 rounded p-4 mt-6"
                >
                  <p class="text-sm text-blue-900 font-semibold mb-2">
                    💡 Free Paper Bonus
                  </p>
                  <p class="text-sm text-blue-800">
                    Spend <strong>$1+</strong> on machines → Get
                    <strong>1 free paper card</strong>
                  </p>
                  <p class="text-sm text-blue-800 mt-2">
                    Spend <strong>$2+</strong> on machines → Get
                    <strong>unlimited paper cards</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Paper Only Option -->
          <div
            class="bg-gradient-to-r from-primary-50 to-slate-50 border-2 border-primary-200 rounded-3xl overflow-hidden"
          >
            <div class="p-8 md:p-12">
              <h3 class="text-2xl font-bold text-primary-900 mb-2">
                🎫 Paper Cards Only (No Machines)
              </h3>
              <p class="text-slate-600 mb-8">
                Prefer paper play? We've got affordable options for every game.
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
                    <div>
                      <p class="text-sm font-semibold text-slate-600 mb-1">
                        Double Actions & Speedy Coveralls
                      </p>
                      <div
                        class="flex justify-between p-3 bg-white rounded-lg text-sm"
                      >
                        <span>1 Card</span>
                        <span class="font-bold">$1</span>
                      </div>
                      <div
                        class="flex justify-between p-3 bg-white rounded-lg text-sm mt-1"
                      >
                        <span>3 Cards</span>
                        <span class="font-bold">$2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== EVENING SESSION SECTION ===== -->
        <section id="evening" class="scroll-mt-20">
          <div class="text-center mb-16">
            <span
              class="text-gold-600 font-bold uppercase tracking-widest text-sm"
              >🌙 Starts at 7:30 PM</span
            >
            <h2
              class="text-4xl md:text-5xl font-black text-primary-900 mt-4 mb-6"
            >
              Premium Evening Session
            </h2>
            <p class="text-xl text-slate-600 max-w-2xl mx-auto">
              Our flagship gaming experience with all-inclusive machine bundles
              and exciting nightly games.
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
              <h3 class="text-3xl md:text-4xl font-black mb-4">
                Best Value: 2 Machines for $22
              </h3>
              <p class="text-gold-200 text-lg mb-8">
                Includes six-packs, double actions & letter X papers
              </p>
              <div
                class="inline-block bg-gold-500 text-primary-900 px-6 py-3 rounded-full font-bold text-lg"
              >
                Premium Inclusions
              </div>
            </div>
          </div>

          <!-- Machine Options -->
          <div class="grid md:grid-cols-2 gap-8 mb-16">
            <div class="bg-slate-50 border-2 border-slate-200 rounded-2xl p-8">
              <h4 class="text-2xl font-bold text-primary-900 mb-6">
                1 Machine Play
              </h4>
              <div class="text-5xl font-black text-gold-600 mb-4">$11</div>
              <p class="text-slate-600 mb-6">
                Single machine entry for one evening session
              </p>
              <button
                class="w-full bg-primary-900 hover:bg-primary-800 text-white font-bold py-3 rounded-lg transition"
              >
                Select
              </button>
            </div>

            <div
              class="relative bg-gradient-to-br from-gold-100 to-gold-50 border-3 border-gold-500 rounded-2xl p-8 shadow-xl transform md:scale-105"
            >
              <div
                class="absolute top-0 right-0 bg-gold-500 text-white font-bold px-4 py-2 rounded-bl-2xl rounded-tr-2xl text-sm uppercase"
              >
                Best Value
              </div>
              <h4 class="text-2xl font-bold text-primary-900 mb-6">
                2 Machines Play
              </h4>
              <div class="text-5xl font-black text-gold-600 mb-4">$22</div>
              <div class="bg-white rounded-lg p-4 mb-6 space-y-2">
                <p class="text-sm font-bold text-gold-600">
                  ✓ Six-packs included
                </p>
                <p class="text-sm font-bold text-gold-600">
                  ✓ Double actions included
                </p>
                <p class="text-sm font-bold text-gold-600">
                  ✓ Letter X papers included
                </p>
              </div>
              <button
                class="w-full bg-gold-500 hover:bg-gold-600 text-primary-900 font-bold py-3 rounded-lg transition"
              >
                Select
              </button>
            </div>
          </div>

          <!-- Special Papers & Games -->
          <div
            class="bg-white border-2 border-primary-200 rounded-3xl overflow-hidden"
          >
            <div class="bg-primary-900 text-white p-8">
              <h3 class="text-2xl font-bold">
                ✏️ Additional Paper Games & Specials
              </h3>
            </div>
            <div class="p-8 md:p-12 space-y-8">
              <!-- Special Paper Games -->
              <div>
                <h4
                  class="text-xl font-bold text-primary-900 mb-6 pb-3 border-b-2 border-primary-300"
                >
                  Odd/Even • Cover All • Lucky Seven • Treasure Hunt
                </h4>
                <div class="grid md:grid-cols-2 gap-6">
                  <div
                    class="bg-gold-50 border-2 border-gold-200 rounded-lg p-6"
                  >
                    <p class="text-sm text-gold-700 font-semibold mb-2">
                      Single Card
                    </p>
                    <p class="text-3xl font-bold text-gold-600">$1</p>
                  </div>
                  <div
                    class="bg-gold-50 border-2 border-gold-200 rounded-lg p-6"
                  >
                    <p class="text-sm text-gold-700 font-semibold mb-2">
                      6-Card Set (Per Game Type)
                    </p>
                    <p class="text-3xl font-bold text-gold-600">$5</p>
                    <p class="text-xs text-gold-700 mt-2">
                      ⚠️ No mixing/matching across game types
                    </p>
                  </div>
                </div>
              </div>

              <!-- Progressive Daub -->
              <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
                <h4 class="text-lg font-bold text-blue-900 mb-2">
                  🎲 Progressive Daub Ticket
                </h4>
                <p class="text-blue-800 mb-2">
                  <strong>Played during second half of session</strong>
                </p>
                <p class="text-blue-800 text-sm">
                  Included with machine play • Must purchase session entry to
                  participate
                </p>
              </div>

              <!-- Pull Tabs -->
              <div
                class="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6"
              >
                <h4 class="text-lg font-bold text-purple-900 mb-2">
                  🐴 Pull Tabs (Horse Races)
                </h4>
                <p class="text-purple-800 text-sm">
                  Available throughout most operating hours • Exciting
                  scratch-to-win games
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== SUNDAY SPECIALS ===== -->
        <section id="sunday" class="scroll-mt-20">
          <div class="text-center mb-16">
            <span
              class="text-gold-600 font-bold uppercase tracking-widest text-sm"
              >🌟 SUNDAY EXCLUSIVE</span
            >
            <h2
              class="text-4xl md:text-5xl font-black text-primary-900 mt-4 mb-6"
            >
              Sunday Night Specials
            </h2>
            <p class="text-xl text-slate-600 max-w-2xl mx-auto">
              In addition to all standard evening session pricing, enjoy these
              Sunday-only games.
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <!-- Speedy -->
            <div
              class="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-8"
            >
              <h3 class="text-2xl font-bold text-primary-900 mb-6">Speedy</h3>
              <p class="text-slate-600 mb-8">Fast-paced favorite</p>
              <div class="space-y-3 mb-8">
                <div class="flex justify-between p-3 bg-white rounded-lg">
                  <span class="font-medium text-slate-700">1 Card</span>
                  <span class="font-bold text-red-600">$1</span>
                </div>
                <div class="flex justify-between p-3 bg-white rounded-lg">
                  <span class="font-medium text-slate-700">3 Cards</span>
                  <span class="font-bold text-red-600">$2</span>
                </div>
              </div>
            </div>

            <!-- Super 3 & U-PIK -->
            <div
              class="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-8"
            >
              <h3 class="text-2xl font-bold text-primary-900 mb-6">
                Super 3 & U-PIK
              </h3>
              <p class="text-slate-600 mb-8">Premium Sunday games</p>
              <div class="space-y-3 mb-8">
                <div class="flex justify-between p-3 bg-white rounded-lg">
                  <span class="font-medium text-slate-700">1 Card</span>
                  <span class="font-bold text-emerald-600">$1</span>
                </div>
                <div class="flex justify-between p-3 bg-white rounded-lg">
                  <span class="font-medium text-slate-700">6 Cards</span>
                  <span class="font-bold text-emerald-600">$5</span>
                </div>
              </div>
              <div class="bg-emerald-100 border border-emerald-400 rounded p-3">
                <p class="text-xs text-emerald-900 font-semibold">
                  🎁 FREE U-PIK CARD every night you play!
                </p>
              </div>
            </div>

            <!-- Free U-PIK Highlight -->
            <div
              class="bg-gradient-to-br from-gold-50 to-amber-50 border-3 border-gold-400 rounded-2xl p-8 flex flex-col justify-center"
            >
              <div class="text-5xl text-center mb-4">🎉</div>
              <h3 class="text-2xl font-bold text-primary-900 mb-4 text-center">
                Free U-PIK Reward
              </h3>
              <p class="text-center text-slate-700 font-semibold mb-2">
                Every night you play session
              </p>
              <p class="text-center text-sm text-slate-600">
                Receive 1 complimentary U-PIK card as our thank you for joining
                us
              </p>
            </div>
          </div>
        </section>

        <!-- ===== TESTIMONIALS SECTION ===== -->
        <section class="scroll-mt-20">
          <div class="text-center mb-16">
            <span
              class="inline-block bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4"
            >
              Community Voices
            </span>
            <h2 class="text-4xl md:text-5xl font-black text-primary-900 mb-6">
              What Our Players Say
            </h2>
            <p class="text-xl text-slate-600 max-w-2xl mx-auto">
              Real feedback from real players who choose Mary Esther Bingo every
              week
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div
              v-motion-fade-visible
              class="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div class="flex items-center gap-2 mb-4">
                <svg
                  v-for="i in 5"
                  :key="i"
                  class="w-5 h-5 text-gold-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </div>
              <p class="text-slate-700 leading-relaxed mb-6 italic">
                "Saved $15 on the Friday night bundle! The $22 for 2 machines
                deal includes everything you need. Best value in Northwest
                Florida."
              </p>
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-white font-bold text-lg"
                >
                  M
                </div>
                <div>
                  <p class="font-bold text-primary-900">Maria S.</p>
                  <p class="text-sm text-slate-500">Friday Regular</p>
                </div>
              </div>
            </div>

            <div
              v-motion-fade-visible
              class="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div class="flex items-center gap-2 mb-4">
                <svg
                  v-for="i in 5"
                  :key="i"
                  class="w-5 h-5 text-gold-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </div>
              <p class="text-slate-700 leading-relaxed mb-6 italic">
                "Love the daytime play-as-you-go option. I can drop in for an
                hour or stay all afternoon — my budget, my choice. Way better
                than driving to Pensacola!"
              </p>
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-white font-bold text-lg"
                >
                  J
                </div>
                <div>
                  <p class="font-bold text-primary-900">James T.</p>
                  <p class="text-sm text-slate-500">Afternoon Player</p>
                </div>
              </div>
            </div>

            <div
              v-motion-fade-visible
              class="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div class="flex items-center gap-2 mb-4">
                <svg
                  v-for="i in 5"
                  :key="i"
                  class="w-5 h-5 text-gold-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </div>
              <p class="text-slate-700 leading-relaxed mb-6 italic">
                "Only hall in Fort Walton with sessions every single day! The
                staff is professional, the facility is clean, and I've made
                friends I see every week. Five stars!"
              </p>
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-white font-bold text-lg"
                >
                  L
                </div>
                <div>
                  <p class="font-bold text-primary-900">Linda R.</p>
                  <p class="text-sm text-slate-500">Sunday Night Fan</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ===== FAQ SECTION ===== -->
        <section id="faq" class="scroll-mt-20">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-black text-primary-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p class="text-xl text-slate-600">
              Quick answers to help you understand our pricing
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div
              v-for="(faq, idx) in pricing?.faqs"
              :key="idx"
              class="bg-slate-50 border-l-4 border-gold-500 rounded-lg p-6"
            >
              <h3 class="font-bold text-primary-900 text-lg mb-3">
                {{ faq.question }}
              </h3>
              <p class="text-slate-600 leading-relaxed">{{ faq.answer }}</p>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section
          class="text-center py-16 bg-gradient-to-r from-primary-900 to-primary-800 text-white rounded-3xl"
        >
          <h2 class="text-3xl md:text-4xl font-black mb-6">Ready to Play?</h2>
          <p class="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join us today and experience premier bingo gaming with unbeatable
            value and community spirit.
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
    "View our session prices, machine bundles, and special game rates. Affordable entertainment daily!",
});

interface Pricing {
  faqs: {
    question: string;
    answer: string;
  }[];
}

const { data: pricing, pending } = await useFetch<Pricing>("/api/pricing");
</script>

<style scoped>
.pattern-grid-lg {
  background-image: radial-gradient(
    rgba(234, 179, 8, 0.2) 1px,
    transparent 1px
  );
  background-size: 32px 32px;
}
html {
  scroll-behavior: smooth;
}
</style>
