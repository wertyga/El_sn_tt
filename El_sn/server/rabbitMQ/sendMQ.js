import amqp from 'amqplib/callback_api';

import { sendMailEE } from '../common/functions/commonFunctions';

amqp.connect('amqp://localhost', function(err, conn) {
    if(!err) {
        console.log('-- RabbitMQ connected --');

        conn.createChannel((err, ch) => {
            const ex = 'mail';
            ch.assertExchange(ex, 'fanout', { durable: false });

            sendMailEE.on('send_mail', options => {
                console.log('published')
                ch.publish(ex, '', new Buffer(JSON.stringify(options)));
            });
        });
    } else {
        console.error(err);
        return;
    };
});
