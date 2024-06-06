import ICallBack from './ICallBack';
import ISignable from './ISignable'
import OutLookCallback from './outlookCallback';

const callbackFactory = function(platform: string): ICallBack {
    let strategy: ICallBack
    switch(platform) {
        case 'outlook':
            strategy = new OutLookCallback();
            break;
            
        default: null
    }

    return strategy
}

export default callbackFactory