
import Vue from "vue";
import GithubStream from "src/github-stream.vue";

// Component test
describe("github-stream.vue", () => {
  // Asserting that the component has been created
  it("should have a created hook", () => {
    expect(typeof GithubStream.created).toBe("function");
  });

  // Asserting that the component has the correct default data
  it("should set correct default api URLs", () => {
    expect(typeof GithubStream.data).toBe("function");
    var defaultData = GithubStream.data();
    expect(defaultData.api.base).toBe("https://api.github.com/users/");
    expect(defaultData.api.activities).toBe("/events/public");
  });
});
