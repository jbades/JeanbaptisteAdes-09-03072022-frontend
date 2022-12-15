/**
 * @jest-environment jsdom
 */

import userEvent from '@testing-library/user-event'
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import NewBillUI from "../views/NewBillUI.js";
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import { formatDate } from "../app/format.js"
import router from "../app/Router.js";
import Bills from "../containers/Bills";
import storeMock, {list} from "../__mocks__/store"

describe("Given I'm connected as an employee", () => {

  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
  }))

  const store = storeMock
  
  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname })
  }

  const bills = new Bills({
    document, onNavigate, store, localStorage: window.localStorage
  })

  const billsList = bills.getBills()

  describe("When correctly-formated data feeds the system", () => {

    test("Then bills date-format should be string", () => {
      billsList.then((snapshot) =>
      {
        // console.log(snapshot)
        const count = 0
        snapshot.map(bill => {
          if (typeof bill.date === 'string') {
            new Date(bill.date)
            count++
          }
        })
        expect(snapshot.length === count).toBe(true)
      })
    })
  })

  describe('Given I am on Bills page', () => {

    describe('When  I click on Newbill button', () => {
    
      test('Function handleClickNewBill should be called', () => {
  
        billsList.then((snapshot) => {
          document.body.innerHTML = BillsUI({ data: snapshot })
          // console.log(BillsUI({ data: snapshot }))
          const handleClickNewBill = jest.fn(bills.handleClickNewBill)
          const button = screen.getByTestId('btn-new-bill')
          if (button) {
            button.addEventListener('click', handleClickNewBill)
            userEvent.click(button)
            expect(handleClickNewBill).toHaveBeenCalled()  
          }
        })
      })
  
      test('Function handleClickIconEye should be called', () => {
  
        billsList.then((snapshot) => {
          document.body.innerHTML = BillsUI({ data: snapshot })
          // console.log(BillsUI({ data: snapshot }))
          const handleClickIconEye = jest.fn(bills.handleClickIconEye)
          const iconEye = screen.getAllByTestId(`icon-eye`)
          if (iconEye) {
            iconEye.addEventListener('click', handleClickIconEye)
            userEvent.click(iconEye)
            expect(handleClickIconEye).toHaveBeenCalled()  
          }       
        })
      })
    })
  })
  
})