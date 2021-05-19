
import { render } from '@testing-library/react'
import { App } from '../App'
import ProviderHOC from '../Provider'
import {socket} from '../socket'
describe('components', () => {
    jest.mock('../socket')
    it('provider should render without crash', () => {
        const { getByTestId } = render(<ProviderHOC><App socket={socket}/> </ProviderHOC>)
        const lobby = getByTestId('Lobby')
        expect(lobby).toBeVisible()
    })
})