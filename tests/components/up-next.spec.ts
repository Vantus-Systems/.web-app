import { mount } from "@vue/test-utils";
import UpNext from "~/components/public/UpNext.vue";

// Simple mock for $fetch in component scope
vi.stubGlobal("$fetch", async (url: string) => {
  if (url === "/api/next-session") {
    // Return a session starting 1 hour from now
    const startAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    return {
      type: "schedule",
      programName: "Evening Session",
      programSlug: "evening-session",
      startTime: "19:30",
      startAt,
    };
  }
  return null;
});

describe("UpNext", () => {
  it("renders program title and CTA", async () => {
    const wrapper = mount(UpNext, {
      global: {
        stubs: {
          NuxtLink: {
            template:
              '<a :href="to"><slot /></a>',
            props: ["to"],
          },
        },
      },
    });

    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.text()).toContain("Evening Session");
    const link = wrapper.find("a");
    expect(link.attributes("href")).toBe("/programs/evening-session");
  });
});
