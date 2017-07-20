import { NotificationManager } from 'react-notifications';

export default function notify(type, message, ...args) {
  NotificationManager[type] && NotificationManager[type](message, ...args);
}
