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

  describe("When getBills function runs & correctly formated data feeds the system", () => {

    test("Then bills date format should be string", () => {
      const billsList = bills.getBills()
      billsList.then((snapshot) =>
      {
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

  // describe("When I am on Bills Page", () => {
  //   test("Then bills should be ordered from earliest to latest", () => {
  //     document.body.innerHTML = BillsUI({ data: bills })
  //     const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
  //     const antiChrono = (a, b) => ((a < b) ? 1 : -1)
  //     const datesSorted = [...dates].sort(antiChrono)
  //     expect(dates).toEqual(datesSorted)
  //   })
  // })
})

// describe('Given I am connected as an employee and I am on Bills page', () => {
//   describe('When  I click on Newbill button', () => {
  
//     Object.defineProperty(window, 'localStorage', { value: localStorageMock })
//     window.localStorage.setItem('user', JSON.stringify({
//       type: 'Employee'
//     }))

//     const onNavigate = (pathname) => {
//       document.body.innerHTML = ROUTES({ pathname })
//     }

//     const store = storeMock

//     const bills = new Bills({
//       document, onNavigate, store, localStorage: window.localStorage
//     })

//     test('Function handleClickNewBill should be called', () => {

//       document.body.innerHTML = BillsUI({ data: bills })
//       //Y'a un problème avec data: bills. Poser question.

//       const handleClickNewBill = jest.fn(bills.handleClickNewBill)
//       const button = screen.getByTestId('btn-new-bill')
//       if (button) {
//         button.addEventListener('click', handleClickNewBill)
//         userEvent.click(button)
//         expect(handleClickNewBill).toHaveBeenCalled()  
//       }
//     })

//     test('Function handleClickIconEye should be called', () => {

//       document.body.innerHTML = BillsUI({ data: bills })

//       const handleClickIconEye = jest.fn(bills.handleClickIconEye)
//       const iconEye = screen.getAllByTestId(`icon-eye`)
//       // NodeList {} vide. Pas de données chargées. Pb avec data: bill ?
//       if (iconEye) {
//         iconEye.addEventListener('click', handleClickIconEye)
//         userEvent.click(iconEye)
//         expect(handleClickIconEye).toHaveBeenCalled()  
//       }       
//     })
//   })
// })