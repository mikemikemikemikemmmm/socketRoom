
import { render } from '@testing-library/react'
import ProviderHOC from '../Provider'
import {App,  IRoomToClient } from '../App'
import * as redux from 'react-redux'
import { fakeData } from './fakeRoom'
import {socket} from '../socket'
describe('components', () => {
    it('Lobby should render without crash', () => {
        const mockUseSelector = jest.spyOn(redux, 'useSelector').mockReturnValue(undefined)
        const { getByTestId, queryByTestId } = render(<ProviderHOC><App socket={socket}/> </ProviderHOC>)
        const room = queryByTestId('Room')
        const lobby = getByTestId('Lobby')
        expect(lobby).toBeVisible()
        expect(room).toBeNull()
    })
    it('Room should render without crash', () => {
        const mockUseSelector = jest.spyOn(redux, 'useSelector').mockReturnValue(fakeData)
        const { getByTestId, queryByTestId } = render(<ProviderHOC><App socket={socket}/> </ProviderHOC>)
        const lobby = queryByTestId('Lobby')
        const room = getByTestId('Room')
        expect(lobby).toBeNull()
        expect(room).toBeVisible()
    })
}) 