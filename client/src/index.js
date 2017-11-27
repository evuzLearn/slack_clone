import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import 'semantic-ui-css/semantic.min.css';

import registerServiceWorker from './registerServiceWorker';
import Routes from './routes';

const httpLink = createHttpLink({
  uri: 'http://localhost:8080/graphql',
});

const authLink = setContext(() => {
  const headers = {};
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  if (token) headers['x-token'] = token;
  if (refreshToken) headers['x-refresh-token'] = refreshToken;
  return {
    headers,
  };
});

const afterwareLink = new ApolloLink((operation, forward) => {
  const { headers } = operation.getContext();

  if (headers) {
    const token = headers.get('x-token');
    const refreshToken = headers.get('x-refresh-token');

    if (token) {
      localStorage.setItem('token', token);
    }

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  return forward(operation);
});

const client = new ApolloClient({
  link: afterwareLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
});

const App = (
  <ApolloProvider client={client}>
    <Routes />
  </ApolloProvider>
);

ReactDOM.render(App, document.getElementById('root'));
registerServiceWorker();
