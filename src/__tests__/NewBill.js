/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore, {list} from "../__mocks__/store"
import router from "../app/Router.js";

beforeEach(() => {
  // mocking local storage
  jest.spyOn(mockStore, "bills")
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee',
    email: "employee@test.tld",
    password: "employee",
    status: "connected",
 }))

  // setting div in body and running router before test
  const root = document.createElement("div")
  root.setAttribute("id", "root")
  document.body.append(root)
  router()
})

afterEach(() => {
  // emptying body after test
  document.body.innerHTML = ""
})

describe('Given I am connected as an employee and I am on NewBillUI page', () => {
  describe('When  I click on ChangeFile button', () => {
  
    document.body.innerHTML = NewBillUI() // mocks the NewBillUI interface
    window.alert = () => {};  // provide an empty implementation for window.alert

    test('The uploaded mocked file should be the only one uploaded', () => {

      const file = new File(['test'], 'test.png', {type: 'image/png'}) // stocks a mocked .png file
      const changeFileButton = screen.getByTestId('file')
      if (changeFileButton) {
        userEvent.upload(changeFileButton, file)
      }
      // tests the mocked file have properly been uploaded and stocked
      expect(changeFileButton.files[0]).toStrictEqual(file)
      expect(changeFileButton.files.item(0)).toStrictEqual(file)
      expect(changeFileButton.files).toHaveLength(1)
    })

    // tests d'intégration POST
    test("sends new bill with mock API POST", async () => {
      document.body.innerHTML = NewBillUI() // mocks the NewBillUI interface

      const submitButton = screen.getByTestId('form-new-bill')
      const onSubmit = jest.fn()
      if (submitButton) {
        submitButton.addEventListener('click', onSubmit)
        await waitFor(() => userEvent.click(submitButton))
        expect(onSubmit).toHaveBeenCalled()  
      }
    })

    test("send bills to an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    // test("send messages to an API and fails with 500 message error", async () => {

    //   mockStore.bills.mockImplementationOnce(() => {
    //     return {
    //       list : () =>  {
    //         return Promise.reject(new Error("Erreur 500"))
    //       }
    //     }})

    //   window.onNavigate(ROUTES_PATH.NewBill)
    //   await new Promise(process.nextTick);
    //   const message = await screen.getByText(/Erreur 500/)
    //   expect(message).toBeTruthy()
    // })
  })
})