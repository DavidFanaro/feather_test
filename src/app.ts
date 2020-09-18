import feathers from "@feathersjs/feathers";
import express from "@feathersjs/express"
import socketio from "@feathersjs/socketio"
import '@feathersjs/transport-commons';


interface Message {
  id?: number;
  text: string;
}

class MessageSevice {
  messages: Message[] = [];

  async find() {
    return this.messages;
  }

  async create(data: Pick<Message, "text">) {
    const message: Message = {
      id: this.messages.length,
      text: data.text,
    };
    this.messages.push(message);

    return message;
  }
}



//create express

const app = express(feathers())

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(express.static(__dirname))

app.configure(express.rest())

app.configure(socketio())

app.use(express.errorHandler())

app.use('messages', new MessageSevice())

app.service('messages').on('created', (message:Message) => {
    console.log('A new message has been created', message)
})

app.on('connection', connection =>
  app.channel('everybody').join(connection)
)

app.publish(data => app.channel('everybody'))

app.listen(3030).on('listening', () => {
    console.log(`Feathers server listening on localhost:${3030}`)
})

app.service('messages').create({
    text: 'Hello from the server'
})