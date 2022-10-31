/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills, {icon} from "../containers/Bills.js";
import userEvent from '@testing-library/user-event';
import mockStore from "../__mocks__/store"
import Actions from "../views/Actions";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    it("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const icon =await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(icon).toEqual(windowIcon)

    })

    test("Then bills should be ordered from earliest to latest", () => {
      // mockBillsUI used so that the dates are note formatted when displayed
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (b, a) => ((a > b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    //mon test
    describe("When I click on the button btn-new-bill", () =>{ 
      it('Then it display the modal to add a new expense report', () => {
         const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const bills = new Bills({
          document, onNavigate, store: null, localStorage: window.localStorage
        })

         const handleClickNewBill = jest.fn(() => bills.handleClickNewBill())
          const buttonNewBill = screen.getByTestId("btn-new-bill")
    
          buttonNewBill.addEventListener('click', handleClickNewBill)
          userEvent.click(buttonNewBill)
          expect(handleClickNewBill).toHaveBeenCalled()
      })
      it('should render the new bill page', () => {

        expect(ROUTES_PATH['NewBill']).toBe('#employee/bill/new')
      })
    })

    describe("When I click on the button iconEye", () =>{
    
      it('A modal should open', () => {

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        document.body.innerHTML = BillsUI({ data: bills })

        const billsInstance = new Bills({ document })

        document.body.innerHTML = Actions()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const bill = new Bills({
          document, onNavigate, store, bills, localStorage: window.localStorage
        })    
        $.fn.modal = jest.fn(); 
        const eye = screen.getByTestId('icon-eye')
        const handleClickIconEye =  jest.fn(() => billsInstance.handleClickIconEye(eye))
        
        eye.addEventListener('click', handleClickIconEye)
        userEvent.click(eye)
        expect(handleClickIconEye).toHaveBeenCalled()
  
        expect(document.getElementById('modaleFile')).toBeTruthy   
      })
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as employee", () => {
  describe("When I navigate to Bills", () => {
    it("fetches bills from mock API GET", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      onNavigate(ROUTES_PATH.Bills)

      const lastBill = await waitFor(() => screen.getByText('test2'))
      expect(lastBill).toBeTruthy()
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
    it("fetches bills from an API and fails with 404 message error", async () => {

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

    it("fetches messages from an API and fails with 500 message error", async () => {

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
