// Please do not be fooled into thinking this component is an example of good
//   React.  The one who follow this component as a good idea is a scoundrel!

import { v4 as uuid } from 'node-uuid'
import React, { Component } from 'react'
import {
  Button,
  Card,
  Container,
  Form,
  Image as Img,
  Menu,
  Progress,
  Table,
} from 'semantic-ui-react'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      amount: '',
      description: '',
      fileFieldKey: Math.random().toString(36),
      items: [],
      submitting: false,
      uploadStep: 0,
    }
  }

  componentDidMount() {
    fetch('/items')
      .then(response => response.json())
      .then(json => json.items)
      .then(items => this.setState(() => ({ items })))
  }

  handleChange = change => {
    const update = { [change.target.name]: change.target.value }

    this.setState(() => update)
  }

  handleFileSelected = change => {
    const reader = new FileReader()
    const file = change.target.files[0]

    reader.onloadend = () => {
      const i = new Image()
      i.src = reader.result
      i.onload = () => {
        this.setState(() => ({
          file,
          filePreviewUrl: reader.result,
        }))
      }
    }

    reader.readAsDataURL(file)
  }

  handleSubmit = e => {
    e.preventDefault()

    this.setState(() => ({ submitting: true }))

    // Go to the server to upload the image
    const id = uuid()
    const item = {
      id,
      description: this.state.description,
      amount: this.state.amount,
    }

    const name = `${id}.${this.state.file.type.split('/')[1]}`
    const signingUrl = `/get-upload-url?name=${name}&type=${this.state.file
      .type}`

    fetch(signingUrl)
      .then(response => response.json())
      .then(json => json.data)
      .then(({ signedRequest, url }) =>
        fetch(signedRequest, {
          body: this.state.file,
          method: 'PUT',
          mode: 'cors',
        }).then(() => url),
      )
      .then(url => {
        this.setState(() => ({ uploadStep: 1 }))

        const options = {
          body: JSON.stringify({ id, url }),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        }

        return fetch('/images', options).then(() => url)
      })
      .then(url => {
        this.setState(() => ({ uploadStep: 2 }))

        const options = {
          body: JSON.stringify(item),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        }

        return fetch('/items', options).then(() => url)
      })
      .then(url => {
        const newItems = [...this.state.items, { ...item, imageUrl: url }]
        this.setState(() => ({ items: newItems, uploadStep: 3 }))

        this.resetFormState()
      })
      // eslint-disable-next-line no-console
      .catch(console.err)
  }

  resetFormState = () => {
    this.setState({
      description: '',
      amount: '',
      file: null,
      fileFieldKey: Math.random().toString(36),
      filePreviewUrl: null,
      submitting: false,
      uploadStep: 0,
    })
  }

  render() {
    // Magic numbers ftw!
    const uploadFraction = this.state.uploadStep / 3
    const uploadPercentage = Math.ceil(uploadFraction * 100)

    return (
      <div className="App">
        <Menu fixed="top" inverted>
          <Container>
            <Menu.Item header>Reimbursements</Menu.Item>
          </Container>
        </Menu>
        <Container text style={{ marginTop: '7em' }}>
          <Card color="blue" fluid>
            <Card.Content>
              <Card.Header>Upload a new item</Card.Header>
              <Form onSubmit={this.handleSubmit}>
                <Form.Field key={this.state.fileFieldKey}>
                  <label htmlFor="file">Select file</label>
                  <input
                    name="file"
                    onChange={this.handleFileSelected}
                    placeholder="Select file"
                    type="file"
                  />
                  {this.state.filePreviewUrl && (
                    <Img
                      src={this.state.filePreviewUrl}
                      style={{ maxHeight: '100px' }}
                    />
                  )}
                </Form.Field>
                <Form.Input
                  label="Description"
                  name="description"
                  onChange={this.handleChange}
                  placeholder="Description"
                  type="text"
                  value={this.state.description}
                />
                <Form.Input
                  label="Amount"
                  name="amount"
                  onChange={this.handleChange}
                  placeholder="Amount"
                  type="number"
                  value={this.state.amount}
                />
                <Button type="submit">Submit</Button>
              </Form>
            </Card.Content>
            {this.state.submitting && (
              <Card.Content extra>
                <Progress percent={uploadPercentage} indicating />
              </Card.Content>
            )}
          </Card>

          <Card fluid color="green">
            <Card.Content>
              <Card.Header>Your data</Card.Header>
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Description</Table.HeaderCell>
                    <Table.HeaderCell>Amount</Table.HeaderCell>
                    <Table.HeaderCell>Receipt</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {this.state.items.map(item => (
                    <Table.Row key={item.id}>
                      <Table.Cell>{item.description}</Table.Cell>
                      <Table.Cell>${item.amount}</Table.Cell>
                      <Table.Cell>
                        <Img src={item.imageUrl} style={{ maxWidth: '50px' }} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Card.Content>
          </Card>
        </Container>
      </div>
    )
  }
}

export default App
