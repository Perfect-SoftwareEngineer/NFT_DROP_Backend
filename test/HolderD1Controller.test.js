const app = require("../app");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const supertest = require("supertest");
require("dotenv").config();



describe("HolderD1", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe("get product route", () => {
    describe("given the product does not exist", () => {
      it("should return a 404", async () => {
        const productId = "product-123";

        await supertest(app).get(`/api/products/${productId}`).expect(404);
      });
    });

  //   describe("given the product does exist", () => {
  //     it("should return a 200 status and the product", async () => {
  //       // @ts-ignore
  //       const product = await createProduct(productPayload);

  //       const { body, statusCode } = await supertest(app).get(
  //         `/api/products/${product.productId}`
  //       );

  //       expect(statusCode).toBe(200);

  //       expect(body.productId).toBe(product.productId);
  //     });
  //   });
  // });

  // describe("create product route", () => {
  //   describe("given the user is not logged in", () => {
  //     it("should return a 403", async () => {
  //       const { statusCode } = await supertest(app).post("/api/products");

  //       expect(statusCode).toBe(403);
  //     });
  //   });

  //   describe("given the user is logged in", () => {
  //     it("should return a 200 and create the product", async () => {
  //       const jwt = signJwt(userPayload);

  //       const { statusCode, body } = await supertest(app)
  //         .post("/api/products")
  //         .set("Authorization", `Bearer ${jwt}`)
  //         .send(productPayload);

  //       expect(statusCode).toBe(200);

  //       expect(body).toEqual({
  //         __v: 0,
  //         _id: expect.any(String),
  //         createdAt: expect.any(String),
  //         description:
  //           "Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 MP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go.",
  //         image: "https://i.imgur.com/QlRphfQ.jpg",
  //         price: 879.99,
  //         productId: expect.any(String),
  //         title: "Canon EOS 1500D DSLR Camera with 18-55mm Lens",
  //         updatedAt: expect.any(String),
  //         user: expect.any(String),
  //       });
  //     });
  //   });
  });
});
