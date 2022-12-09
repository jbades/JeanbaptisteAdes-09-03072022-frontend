/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import userEvent from '@testing-library/user-event'
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import { formatDate } from "../app/format.js"
import router from "../app/Router.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import storeMock, {list} from "../__mocks__/store"
 
// describe("Given I am connected as an employee", () => {
//   describe("When I am on NewBill Page", () => {
//     test("Then ...", () => {
//       const html = NewBillUI()
//       document.body.innerHTML = html
//       //to-do write assertion
//     })
//   })
// })

describe('Given I am connected as an employee and I am on NewBillUI page', () => {
  describe('When  I click on submit button', () => {
  
    document.body.innerHTML = NewBillUI()
    console.log(NewBillUI())

    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }

    const store = storeMock

    const newBills = new NewBill({
      document, onNavigate, store, localStorage: window.localStorage
    })

    test('Function handleSubmit should be called', () => {

      const submitButton = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn(newBills.handleSubmit)
      if (submitButton) {
        submitButton.addEventListener('click', handleSubmit)
        userEvent.click(submitButton)
        expect(handleSubmit).toHaveBeenCalled()  
      }
    })
  })
})

// describe('Given I am connected as an employee and I am on NewBillUI page', () => {
//   describe('When  I click on submit button', () => {
  
//     document.body.innerHTML = NewBillUI()
//     console.log(NewBillUI())

//     Object.defineProperty(window, 'localStorage', { value: localStorageMock })
//     window.localStorage.setItem('user', JSON.stringify({
//       type: 'Employee'
//     }))

//     const onNavigate = (pathname) => {
//       document.body.innerHTML = ROUTES({ pathname })
//     }

//     const store = storeMock

//     const newBills = new NewBill({
//       document, onNavigate, store, localStorage: window.localStorage
//     })

//     describe('When  I click on changeFile button', () => {
//       test('Function handleChangeFile should be called', () => {
//         const changeFileButton = screen.getByTestId('form-new-bill')
//         const handleChangeFile = jest.fn(newBills.handleChangeFile)
//         if (changeFileButton) {
//           submitButton.addEventListener('click', handleChangeFile)
//           userEvent.click(changeFileButton)
//           expect(handleChangeFile).toHaveBeenCalled()  
//         }
//       })
//     })
//   })
// })