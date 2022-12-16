/**
  * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import Bills from "../containers/Bills";
import BillsUI from "../views/BillsUI.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store" 
import router from "../app/Router.js";

console.log(jest.mock("../app/store", () => mockStore))
jest.mock("../app/store", () => mockStore) // question : pourquoi ça ne marche pas si l'ordre des dépendances change ?

describe("Given I'm connected as an employee", () => {

  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
  }))

  const store = mockStore
  
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

    describe('If it exists, when  I click on Newbill button', () => {
    
      test('Function handleClickNewBill should be called', () => {
  
        billsList.then((snapshot) => {
          document.body.innerHTML = BillsUI({ data: snapshot })
          // console.log(BillsUI({ data: snapshot }))
          const handleClickNewBill = jest.fn(bills.handleClickNewBill)
          const button = screen.getByTestId('btn-new-bill')
          if (!!button) {
            button.addEventListener('click', handleClickNewBill)
            userEvent.click(button)
            expect(handleClickNewBill).toHaveBeenCalled()  
          } else {
            expect(handleClickNewBill).not.toHaveBeenCalled()
          }
        })
      })
    })

    describe('When  I click on iconEye button', () => {
  
      test('Function handleClickIconEye should be called', () => {
  
        billsList.then((snapshot) => {
          // console.log(snapshot[0])
          document.body.innerHTML = BillsUI({ data: snapshot[0] })
          // console.log(BillsUI({ data: snapshot }))
          const handleClickIconEye = jest.fn(bills.handleClickIconEye)
          const iconEye = screen.getByTestId(`icon-eye`)
          if (!!iconEye) {
            iconEye.addEventListener('click', handleClickIconEye)
            userEvent.click(iconEye)
            expect(handleClickIconEye).toHaveBeenCalled()  
          } else {
            expect(handleClickIconEye).not.toHaveBeenCalled()
          }
        })
      })
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to BillsUI", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      // await waitFor(() => screen.getByTestId("tbody"))
      const contentBody  = await screen.getByTestId("tbody")
      expect(contentBody).not.toBe('')
    })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
})