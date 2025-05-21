import 'react-native-stream';
import { Buffer } from 'buffer';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

if (typeof global.process === 'undefined') {
  global.process = {
    env: {},
    version: '',
    nextTick: require('next-tick')
  };
} 