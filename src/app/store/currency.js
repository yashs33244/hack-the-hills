import { atom } from 'recoil';

export const currency = atom({
  key: 'currency', 
  default: {
    name: '',    
    create: true, 
    phrase: '',
  },
});