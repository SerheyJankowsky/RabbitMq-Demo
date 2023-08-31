import { connect } from "amqplib";

const start = async () => {
  try {
    const connection = await connect("amqp://root:123q123q@localhost");
    const chanel = await connection.createChannel();
    await chanel.assertExchange("test", "topic", {
      durable: true,
    });
    const queue = await chanel.assertQueue("test-queue", {
      durable: true,
    });
    chanel.bindQueue(queue.queue, "test", "test.command");
    chanel.consume(
      queue.queue,
      (message) => {
        if (message) {
          console.log(message.content.toString());
          if (message.properties.replyTo) {
            console.log(message.properties.replyTo);
            chanel.sendToQueue(
              // send to queue without exchange
              message.properties.replyTo,
              Buffer.from("Answer"),
              {
                correlationId: message.properties.correlationId,
              }
            );
          }
        }
        return;
      },
      {
        noAck: true,
      }
    );
  } catch (error) {
    console.error(error);
  }
};

start();
