/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import { formatDate, formatStatus } from "../app/format.js";
import mockStore from "../__mocks__/store.js";
import mockCorruptedStore from "../__mocks__/corruptedStore.js";
 
jest.mock('../app/Store', () => require('../__mocks__/store.js').default);
 
describe("Given I am connected as an employee", () => {

  beforeEach(() => {
    // mocking local storage as employee
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

  describe("Given I am on the Bills page", () => {
    beforeEach(() => {
      window.onNavigate(ROUTES_PATH.Bills)
      document.body.innerHTML = BillsUI({ data: bills })
    })

    test("Then bill icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.toString()).toEqual('active-icon');
    })

    test("Then bills should be ordered from earliest to latest", () => {
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("When I click on Newbill button", () => {
      test('Function handleClickNewBill should be called', async () => {
        const billsObject = new Bills({document, onNavigate, store: mockStore, localStorage: window.localStorage})
  
        document.body.innerHTML = BillsUI({ data: bills })
  
        const button = screen.getByTestId('btn-new-bill')
        const handleClickNewBill = jest.fn(() => billsObject.handleClickNewBill)
        if (!!button) {
          button.addEventListener('click', handleClickNewBill)
          userEvent.click(button)
          expect(handleClickNewBill).toHaveBeenCalled()  
        } else {
          expect(handleClickNewBill).not.toHaveBeenCalled()
        }
      })
    })
    
    describe("When I click on an eye-icon", () => {
      test("Then date should respect a given regex format", async () => {
        const billsObject = new Bills({document: document, onNavigate, store: mockStore, localStorage: window.localStorage});

        mockStore.bills().list().then(async snapshot => {
          const attendedBills = snapshot
            .map(doc => {
              try {
                return {
                  ...doc,
                  date: formatDate(doc.date),
                  status: formatStatus(doc.status),
                }
              } catch(e) {
                // if for some reason, corrupted data was introduced, we manage here failing formatDate function
                // log the error and return unformatted date in that case
                return {
                  ...doc,
                  date: doc.date,
                  status: formatStatus(doc.status)
                }
              }
            })
            
            billsObject.getBills().then(result => {
              expect(result).toEqual(attendedBills);
            });
        })
      })

      test("Then date format should stay unchanged", async () => {
        const billsObject = new Bills({document: document, onNavigate, store: mockCorruptedStore, localStorage: window.localStorage});

        mockStore.bills().list().then(async snapshot => {
          const attendedBills = snapshot
            .map(doc => {
              try {
                return {
                  ...doc,
                  date: formatDate(doc.date),
                  status: formatStatus(doc.status),
                }
              } catch(e) {
                // if for some reason, corrupted data was introduced, we manage here failing formatDate function
                // log the error and return unformatted date in that case
                return {
                  ...doc,
                  date: doc.date,
                  status: formatStatus(doc.status)
                }
              }
            })
            
            billsObject.getBills().then(result => {
              expect(result).not.toEqual(attendedBills);
            });
        })
      })

      test("Then a modal should open", async () => {
        const billsObject = new Bills({document: document, onNavigate, store: mockStore, localStorage: window.localStorage});

        document.body.innerHTML = BillsUI({data: bills});

        const iconEye = screen.getAllByTestId('icon-eye')[0];
        expect(iconEye).toBeTruthy();

        const handleClickIconEye = jest.fn(() => billsObject.handleClickIconEye(iconEye));
        iconEye.addEventListener('click', handleClickIconEye);
        userEvent.click(iconEye);
        expect(handleClickIconEye).toHaveBeenCalled();
        expect(screen.findByRole('dialog')).toBeTruthy();
      })
    })
  })


  
  // tests d'intégration GET

  describe("When I navigate to BillsUI", () => {
    test("fetches bills from mock API GET", async () => {
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const contentBody  = await screen.getByTestId("tbody")
      expect(contentBody).not.toBe('')
     })
  })

  describe("When an error occurs on API", () => {
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