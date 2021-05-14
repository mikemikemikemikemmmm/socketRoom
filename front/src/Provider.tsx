import { Provider } from 'react-redux'
import { createStore } from 'redux'
import App from './App'
import { reducer } from './store/reducer'
import {socket} from './socket'
function ProviderHOC() {
    //@ts-ignore
    const store = createStore(reducer)
    console.log('ProviderHOC render')
    return <>
        <Provider store={store}>
            <App socket={socket} />
        </Provider>
    </>

}

export default ProviderHOC;
