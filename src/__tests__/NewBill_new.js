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
  
 describe("Given I am connected as an employee", () => {
   const onNavigate = (pathname) => {
     document.body.innerHTML = ROUTES({ pathname })
   }
   describe("When I am on Bill page", () => {
     test("Then I click on openNewBill and I go to NewBill page", () => {
       const BILLS = new Bills({document: document, onNavigate : onNavigate, store: store, localStorage: window.localStorage});
       document.body.innerHTML = BillsUI({data: bills});
       const handleNewBill = jest.fn(BILLS.handleClickNewBill);
       const NewBillBtn = screen.getByTestId('btn-new-bill');
       NewBillBtn.addEventListener('click', handleNewBill);
       userEvent.click(NewBillBtn);
       expect(handleNewBill).toHaveBeenCalled();
       expect(screen.queryByText('Envoyer une note de frais')).toBeTruthy();
     })
   });
   describe("When I am on NewBill Page", () => {
     const html = NewBillUI()
     document.body.innerHTML = html
     const newBill = new NewBill({document : document, onNavigate: onNavigate, store: mockStore, localStorage: window.localStorage});
     window.localStorage.setItem("user",
     JSON.stringify({
       type: "Employee",
       email: "johndoe@email.com",
       password: "azerty",
       status: "connected",
     }));
     test("Then I shouldn't be able to set file other than images", () => {
       const handleChangeFile = jest.fn((e)=> newBill.handleChangeFile(e));
       const changeFile = screen.getByTestId('file');
       changeFile.addEventListener('change', handleChangeFile);
       const file = new File(['test'], './NewBill.js', {type: 'text/javascript'})
       userEvent.upload(changeFile, file);
       expect(handleChangeFile).toHaveBeenCalled();
       expect(changeFile.files[0].name).not.toBe('./NewBill.js');
     })
     test("Then I should be able to change file", () => {
       const handleChangeFile = jest.fn((e)=> newBill.handleChangeFile(e));
       const changeFile = screen.getByTestId('file');
       changeFile.addEventListener('change', handleChangeFile);
       const file = new File(['test'], 'https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg', {type: 'image/jpg'})
       userEvent.upload(changeFile, file);
       expect(handleChangeFile).toHaveBeenCalled();
       expect(changeFile.files[0].name).toBe('https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg');
     })
     test("Then I should be able to submit", async () => {
       let updateMock = jest.spyOn(mockStore.bills(), 'update');
       const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
       const submit = screen.getByTestId('form-new-bill');
       submit.addEventListener('submit', handleSubmit);
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
       expect(datePicker.value).toBe(dateValue);
       userEvent.click(screen.getByText('Envoyer'));
       expect(handleSubmit).toHaveBeenCalled();
       expect(screen.getByText('Mes notes de frais')).toBeTruthy();
       expect(updateMock).toHaveBeenCalled();
       let receveidUpdate = await updateMock.mock.results[0].value;
       const excpectedUpdateValue = await mockStore.bills().update();
       expect(receveidUpdate).toStrictEqual(excpectedUpdateValue);
     })
   })
 })