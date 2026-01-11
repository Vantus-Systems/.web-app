import { mount } from "@vue/test-utils";
import ProgramViewer from "~/components/bingo/ProgramViewer.vue";

const sampleProgram = {
  games: [
    { sortOrder: 1, title: "Game 1", paperColor: "Blue", pattern: { name: "X", definition: [[0]] } },
  ],
};

describe("ProgramViewer", () => {
  it("renders mobile and desktop views and forwards select-game", async () => {
    const wrapper = mount(ProgramViewer, {
      props: { program: sampleProgram },
      global: {
        stubs: {
          ProgramGamesTable: {
            template:
              '<div class="table-stub" @click="$emit(\'select-game\', $props.games?.[0])"></div>',
            props: ["games"],
          },
          ProgramGamesCards: {
            template:
              '<div class="cards-stub" @click="$emit(\'select-game\', $props.games?.[0])"></div>',
            props: ["games"],
          },
        },
      },
    });

    // Both stubs should exist in DOM (one hidden via CSS in real app)
    expect(wrapper.find(".table-stub").exists()).toBe(true);
    expect(wrapper.find(".cards-stub").exists()).toBe(true);

    // Emitting from child should bubble via ProgramViewer
    await wrapper.find(".cards-stub").trigger("click");
    const emitted = wrapper.emitted("select-game");
    expect(emitted).toBeTruthy();
    expect(emitted?.[0]?.[0]).toEqual(sampleProgram.games[0]);
  });
});
