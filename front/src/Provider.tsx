import { Provider } from 'react-redux'
import { store } from './store/reducer'

function ProviderHOC(props:{children:JSX.Element}) {
    //@ts-ignore
    return (
        <Provider store={store}>
            {props.children}
        </Provider>)

}

export default ProviderHOC;
