import amqp from 'amqplib/callback_api';
import '../common/ENVS';

import { emailSending } from "../common/functions/commonFunctions";

const log = require('../common/log')(module);

amqp.connect('amqp://localhost', function(err, conn) {
    if(err) {
        console.log(err);
        return;
    };

    console.log('-- RabbitMQ Receiver Connected --');

    conn.createChannel((err, ch) => {
        const ex = 'mail';

        ch.assertExchange(ex, 'fanout', { durable: false });
        ch.assertQueue('', { exclusive: true }, (err, q) => {
            ch.bindQueue(q.queue, ex, '');

            ch.consume(q.queue, msg => {
                const emailOptions = JSON.parse(msg.content.toString());

                emailSending(emailOptions);
            }, { noAck: true });
        });
    });
});


