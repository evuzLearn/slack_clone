import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import cors from 'cors';

import { refreshTokens } from './auth';
import models from './models';

const SECRET = 'p8923k82mmguuiyq';
const SECRET2 = '93u4h131vccasde';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, './resolvers')),
);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const app = express();
app.use(cors('*'));

app.use(async (req, res, next) => {
  const token = req.headers['x-token'];
  if (token) {
    try {
      const { user } = jwt.verify(token, SECRET);
      req.user = user;
    } catch (err) {
      const refreshToken = req.headers['x-refresh-token'];
      const [newToken, newRefreshToken] = await refreshTokens(
        token,
        refreshToken,
        models,
        SECRET,
        SECRET2,
      );
      if (newToken && newRefreshToken) {
        res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
        res.set('x-token', newToken);
        res.set('x-refresh-token', newRefreshToken);
      }
      req.user = newToken;
    }
  }
  console.log('10');
  next();
});

const graphqlEndpoint = 'graphql';

app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(req => ({
    schema,
    context: {
      models,
      user: req.user,
      SECRET,
      SECRET2,
    },
  })),
);

app.use('/graphiql', graphiqlExpress({ endpointURL: graphqlEndpoint }));

models.sequelize.sync({ force: true }).then(() => {
  app.listen(8080);
});
