import { connect } from "amqplib";

const start = async () => {
  try {
    const connection = await connect("amqp://root:123q123q@localhost"); //your connection to rmq i used docker
    const chanel = await connection.createChannel(); // create a channel for listing
    await chanel.assertExchange("test", "topic", {
      //create exchange for manage message
      durable: true,
    });
    const replyQueue = await chanel.assertQueue("", { exclusive: true }); // create reply chanel for undersdent message is read
    chanel.consume(
      // consume all messages from the service
      replyQueue.queue,
      (message) => {
        console.log(message?.content.toString());
        console.log(message?.properties.correlationId);
      },
      {
        noAck: true, // automaticly acknowledge
      }
    );
    chanel.publish("test", "test.command", Buffer.from("Hello, world!"), {
      //send message
      replyTo: replyQueue.queue, // replay to queue
      correlationId: "1", // required generation uniq
    });
  } catch (error) {
    console.error(error);
  }
};

start();
