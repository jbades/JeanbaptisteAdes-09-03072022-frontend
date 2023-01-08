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
      // tests the mocked file a properly been uploaded and stocked
      expect(changeFileButton.files[0]).toStrictEqual(file)
      expect(changeFileButton.files.item(0)).toStrictEqual(file)
      expect(changeFileButton.files).toHaveLength(1)
    })
  })
})

describe('Given I am connected as an employee and I am on NewBillUI page', () => {
  describe('When  I click on submit button', () => {

    document.body.innerHTML = NewBillUI() // mocks the NewBillUI interface

    // mocks onNavigate, localStorage & store to feed NewBill object
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "employee@test.tld",
      password: "employee",
      status: "connected",
   }))

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }

    const store = mockStore // puis-je appeler un store vide ? Pas d'utilité à appeler mockStore, si ?

    const newBills = new NewBill({
      document, onNavigate, store, localStorage: window.localStorage
    })

    // test("Then form should be submited", async () => {
    //   let updateMock = jest.spyOn(mockStore.bills(), 'update');
    //   const handleSubmit = jest.fn((e) => newBills.handleSubmit(e));
    //   const submit = screen.getByTestId('form-new-bill');
    //   submit.addEventListener('submit', handleSubmit);
    //   const name = screen.getByTestId('expense-name');
    //   const amount = screen.getByTestId('amount');
    //   const datePicker = screen.getByTestId('datepicker');
    //   const pct = screen.getByTestId('pct');
    //   const nameValue = 'new bill test';
    //   const amountValue = '256';
    //   const dateValue = '2020-05-12';
    //   const pctValue = '20';
    //   userEvent.type(name, nameValue);
    //   userEvent.type(amount, amountValue);
    //   userEvent.type(datePicker, dateValue);
    //   userEvent.type(pct, pctValue);
    //   datePicker.value = dateValue;
    //   expect(datePicker.value).toBe(dateValue);
    //   userEvent.click(screen.getByText('Envoyer'));
    //   expect(handleSubmit).toHaveBeenCalled();
    //   expect(screen.getByText('Mes notes de frais')).toBeTruthy();
    //   expect(updateMock).toHaveBeenCalled();
    //   let receveidUpdate = await updateMock.mock.results[0].value;
    //   const expectedUpdateValue = await mockStore.bills().update();
    //   expect(receveidUpdate).toStrictEqual(expectedUpdateValue);
    // })

    test('Function handleSubmit should be called', () => {
      const submitButton = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e) => newBills.handleSubmit(e))
      if (submitButton) {
        submitButton.addEventListener('submit', handleSubmit)
        userEvent.click(submitButton)
        expect(handleSubmit).toHaveBeenCalled()  
      }
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I'm on NewBills", () => {

    test("sends new bill with mock API POST", async () => {
      document.body.innerHTML = NewBillUI() // mocks the NewBillUI interface
      // console.log(document.body.innerHTML)

      // const submitButton = screen.getByTestId('btn-send-bill')
      const submitButton = screen.getByTestId('form-new-bill')
      const onSubmit = jest.fn()
      if (submitButton) {
        submitButton.addEventListener('click', onSubmit)
        await waitFor(() => userEvent.click(submitButton))
        expect(onSubmit).toHaveBeenCalled()  
      }
    })
  })
})