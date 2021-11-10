
const request = require("request");
// we also need our app for the correct routes!
const app = require("./app");

describe("GET / ", () => {
  test("It should respond with an array of students", async () => {
    const response = await request(app).get("/");
    expect(response.body).toBee("Hello World");
    expect(response.statusCode).toBe(200);
  });
});