import { Connection } from "typeorm";
import { testConnection } from "../utils/testConnection";
import faker from "faker";
import { graphqlCall } from "../utils/graphqlCall";
import { User } from "../../entity/User";

let connection: Connection;

beforeAll(async () => {
  connection = await testConnection();
});

afterAll(async () => {
  await connection.close();
});

const registerMutation = `
mutation Register($input: RegisterInput!) {
    register(
      input: $input
    ) {
      id
      email
    }
  }
`;

describe("Register test", () => {
  const user = {
    email: faker.internet.email(),
    password: faker.internet.password()
  };
  it("Registeration with new credentials", async () => {
    const response = await graphqlCall({
      source: registerMutation,
      variableValues: { input: user }
    });
    expect(response).toMatchObject({
      data: {
        register: {
          email: user.email
        }
      }
    });

    const dbUser = await User.findOne({ where: { email: user.email } });

    expect(dbUser).toBeDefined();
    expect(dbUser!.confirmed).toBeFalsy();
  });

  it("Register with duplicate email", async () => {
    const response = await graphqlCall({
      source: registerMutation,
      variableValues: { input: user }
    });

    expect(response.data!.register).toBeNull();
  });

  it("Register with invalid email", async () => {
    const invalidUser = {
      email: "invalidEmail",
      password: faker.internet.password()
    };
    const response = await graphqlCall({
      source: registerMutation,
      variableValues: { input: invalidUser }
    });

    expect(response.errors![0].message).toMatch("Argument Validation Error");
  });

  it("Register with invalid password", async () => {
    const invalidUser = {
      email: faker.internet.email(),
      password: "pass"
    };
    const response = await graphqlCall({
      source: registerMutation,
      variableValues: { input: invalidUser }
    });
    expect(response.errors![0].message).toMatch("Argument Validation Error");
  });
});
