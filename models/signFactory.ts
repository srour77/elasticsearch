import ISignable from './ISignable'
import OutLookSign from './outlookSign';

const SignFactory = function(platform: string): ISignable {
    let strategy: ISignable
    switch(platform) {
        case 'outlook':
            strategy = new OutLookSign();
            break;
            
        default: null
    }

    return strategy
}

export default SignFactory