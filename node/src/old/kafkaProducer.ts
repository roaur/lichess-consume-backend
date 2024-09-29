// kafkaProducer.ts

import { Kafka, Producer } from 'kafkajs';
import { config } from 'dotenv';

config();

const useKafka = process.env.USE_KAFKA === 'true';

export let connectKafkaProducer: () => Promise<void>;
export let disconnectKafkaProducer: () => Promise<void>;
export let sendMessage: (topic: string, messages: any[]) => Promise<void>;

if (useKafka) {
  const kafka = new Kafka({
    clientId: 'lichess-stream-client',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  });

  const producer: Producer = kafka.producer();

  connectKafkaProducer = async () => {
    try {
      await producer.connect();
      console.log('Connected to Kafka');
    } catch (error) {
      console.error('Error connecting to Kafka:', error);
      process.exit(1); // Exit if Kafka connection fails
    }
  };

  disconnectKafkaProducer = async () => {
    try {
      await producer.disconnect();
      console.log('Disconnected from Kafka');
    } catch (error) {
      console.error('Error disconnecting from Kafka:', error);
    }
  };

  sendMessage = async (topic: string, messages: any[]) => {
    await producer.send({ topic, messages });
  };
} else {
  // Mock implementations that do nothing
  connectKafkaProducer = async () => {
    // Do nothing
  };

  disconnectKafkaProducer = async () => {
    // Do nothing
  };

  sendMessage = async (topic: string, messages: any[]) => {
    // Do nothing
  };
}
