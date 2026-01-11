import { mount } from "@vue/test-utils";
import ProgramCard from "~/components/bingo/ProgramCard.vue";

const sampleProgram = {
  slug: "evening-session",
  name: "Evening Session",
  description: "Full session breakdown and prize structure.",
  gameCount: 12,
};

describe("ProgramCard", () => {
  it("renders program details and CTA", () => {
    const wrapper = mount(ProgramCard, {
      props: { program: sampleProgram },
      global: {
        stubs: {
          // Stub NuxtLink custom mode to render slot content
          NuxtLink: {
            template:
              '<div><slot :navigate="() => {}" /></div>',
          },
        },
      },
    });

    expect(wrapper.text()).toContain(sampleProgram.name);
    expect(wrapper.text()).toContain("View Program");
    // Tag with game count badge
    expect(wrapper.text()).toContain("Patterns");

    // Button exists and is accessible
    const btn = wrapper.find("button");
    expect(btn.exists()).toBe(true);
    expect(btn.attributes("aria-label")).toBe("View program details");
  });
});
