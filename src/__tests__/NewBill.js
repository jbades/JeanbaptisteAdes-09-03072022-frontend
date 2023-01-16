/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import {screen} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import mockCorruptedStore from "../__mocks__/corruptedStore"
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {

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
    
  describe("Given and I am on NewBillUI page", () => {

    beforeEach(() => {
      document.body.innerHTML = NewBillUI() // mocks the NewBillUI interface
      window.alert = () => {};  // provide an empty implementation for window.alert
    })

    describe ("When  I click on ChangeFile button", () => {
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
    })
  
    // tests d'intégration POST
    test("mocking API POST to send a new bill", async () => {

      const newBill = new NewBill({document : document, onNavigate: onNavigate, store: mockStore, localStorage: window.localStorage});
      document.body.innerHTML = NewBillUI() // mocks the NewBillUI interface

      // mocking the form-filling-in
      const name = screen.getByTestId('expense-name');
      const amount = screen.getByTestId('amount');
      const datePicker = screen.getByTestId('datepicker');
      const pct = screen.getByTestId('pct');
      const nameValue = 'new bill test';
      const amountValue = '256';
      const dateValue = '2020-05-12';
      const pctValue = '20';
      userEvent.type(name, nameValue);
      userEvent.type(amount, amountValue);
      userEvent.type(datePicker, dateValue);
      userEvent.type(pct, pctValue);
      datePicker.value = dateValue;

      // mocking submission
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      let updateMock = jest.spyOn(mockStore.bills(), 'update');

      const submit = screen.getByTestId('form-new-bill');
      submit.addEventListener('submit', handleSubmit);
      userEvent.click(screen.getByText('Envoyer'));

      // mocking update method and comparing submitted result with sent data

      expect(handleSubmit).toHaveBeenCalled();
      expect(updateMock).toHaveBeenCalled();
      let receveidUpdate = await updateMock.mock.results[0].value;
      const expectedUpdateValue = await mockStore.bills().update();
      expect(receveidUpdate).toStrictEqual(expectedUpdateValue);
    })

    test("mocking a POST error triggering 404 and 500 errors", async () => {

      const newBill = new NewBill({document : document, onNavigate: onNavigate, store: mockStore, localStorage: window.localStorage});
      document.body.innerHTML = NewBillUI() // mocks the NewBillUI interface

      // mocking the form-filling-in
      const name = screen.getByTestId('expense-name');
      const amount = screen.getByTestId('amount');
      const datePicker = screen.getByTestId('datepicker');
      const pct = screen.getByTestId('pct');
      const nameValue = 'new bill test';
      const amountValue = '256';
      const dateValue = '2020-05-12';
      const pctValue = '20';
      userEvent.type(name, nameValue);
      userEvent.type(amount, amountValue);
      userEvent.type(datePicker, dateValue);
      userEvent.type(pct, pctValue);
      datePicker.value = dateValue;

      // mocking submission
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      let updateMock = jest.spyOn(mockStore.bills(), 'update');

      const submit = screen.getByTestId('form-new-bill');
      submit.addEventListener('submit', handleSubmit);
      userEvent.click(screen.getByText('Envoyer'));

      // mocking update method and comparing submitted result with sent data

      expect(handleSubmit).toHaveBeenCalled();
      expect(updateMock).toHaveBeenCalled();
      let receveidUpdate = await updateMock.mock.results[0].value;
      const expectedUpdateValue = await mockCorruptedStore.bills().update();
      expect(receveidUpdate).not.toStrictEqual(expectedUpdateValue);
    })

  })
})