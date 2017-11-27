import React, { Component } from 'react';
import { extendObservable } from 'mobx';
import { observer } from 'mobx-react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import {
  Container,
  Header,
  Input,
  Button,
  Message,
  Form,
} from 'semantic-ui-react';

class CreateTeam extends Component {
  constructor(props) {
    super(props);
    extendObservable(this, {
      name: '',
      errors: {},
    });
  }

  onSubmit = async () => {
    const { name } = this;
    const response = await this.props.mutate({
      variables: { name },
    });
    console.log(response);
    const { ok, errors } = response.data.createTeam;

    if (ok) this.props.history.push('/');
    else {
      const err = errors.reduce((acc, { path, message }) => {
        acc[`${path}Error`] = message;
        return acc;
      }, {});
      this.errors = err;
    }
  };

  onChange = e => {
    const { name, value } = e.target;
    this[name] = value;
  };

  render() {
    const { name, errors: { nameError } } = this;
    const errorList = [];

    if (nameError) errorList.push(nameError);

    return (
      <Container text>
        <Header as="h2">Create a Team</Header>
        <Form>
          <Form.Field error={!!nameError}>
            <Input
              name="name"
              onChange={this.onChange}
              value={name}
              placeholder="Name"
              fluid
            />
          </Form.Field>
          <Button onClick={this.onSubmit}>Submit</Button>
        </Form>
        {errorList.length ? (
          <Message
            error
            header="There was some errors with your submission"
            list={errorList}
          />
        ) : null}
      </Container>
    );
  }
}

const createTeamMutation = gql`
  mutation($name: String!) {
    createTeam(name: $name) {
      ok
      errors {
        path
        message
      }
    }
  }
`;

export default graphql(createTeamMutation)(observer(CreateTeam));
