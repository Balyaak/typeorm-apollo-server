import { GraphQLSchema, graphql } from "graphql";
import { createSchema } from "../../utils/createSchema";
import Maybe from "graphql/tsutils/Maybe";

let schema: GraphQLSchema;

interface Options {
  source: string;
  variableValues?: Maybe<{
    [key: string]: any;
  }>;
  userId?: string;
}
export const graphqlCall = async ({ source, variableValues }: Options) => {
  if (!schema) {
    schema = await createSchema();
  }

  return graphql({
    schema,
    source,
    variableValues
  });
};
