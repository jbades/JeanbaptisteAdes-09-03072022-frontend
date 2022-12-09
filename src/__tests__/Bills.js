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

describe("Given getBills function runs", () => {
  describe("When correctly formated data feeds the system", () => {
    test("Then bills date format should be string", () => {
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const store = storeMock

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const bills = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

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
})

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.className).toBe("active-icon");
    })
    // test("Then bills should be ordered from earliest to latest", () => {
    //   document.body.innerHTML = BillsUI({ data: bills })
    //   const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
    //   const antiChrono = (a, b) => ((a < b) ? 1 : -1)
    //   const datesSorted = [...dates].sort(antiChrono)
    //   expect(dates).toEqual(datesSorted)
    // })
  })

  describe("When I am on Bills Page but it is loading", () => {
    test('Then, Loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe("When I am on Bills Page but back-end send an error message", () => {
    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  // describe("When I am on Bills Page and there are no bills", () => {
  //   test('Then, no list should be shown', () => {
  //     test('Then, no cards should be shown', () => {
  //       document.body.innerHTML = rows()
  //       expect(screen)
  //     })
  //   })
  // })
})

describe("Given I am connected as an employee and I am on Bills Page", () => {
  describe("When I click on NewBill button", () => {
    test("Then, it should renders Bills page", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      fireEvent.click(screen.getByTestId("btn-new-bill"))
      document.body.innerHTML = NewBillUI({ data: bills })
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    })
  })
})

describe('Given I am connected as an employee and I am on Bills page', () => {
  describe('When  I click on Newbill button', () => {
  
    test('Function handleClickNewBill should be called', () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
  
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
  
      const store = storeMock
  
      const bills = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

      document.body.innerHTML = BillsUI({ data: bills })
      //Y'a un problème avec data: bills. Poser question.

      const handleClickNewBill = jest.fn(bills.handleClickNewBill)
      const button = screen.getByTestId('btn-new-bill')
      if (button) {
        button.addEventListener('click', handleClickNewBill)
        userEvent.click(button)
        expect(handleClickNewBill).toHaveBeenCalled()  
      }
    })

    test('Function handleClickIconEye should be called', () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
  
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
  
      const store = storeMock
  
      const bills = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

      document.body.innerHTML = BillsUI({ data: bills })

      const handleClickIconEye = jest.fn(bills.handleClickIconEye)
      const iconEye = screen.getAllByTestId(`icon-eye`)
      // NodeList {} vide. Pas de données chargées. Pb avec data: bill ?
      if (iconEye) {
        iconEye.addEventListener('click', handleClickIconEye)
        userEvent.click(iconEye)
        expect(handleClickIconEye).toHaveBeenCalled()  
      }       
    })
  })
})

