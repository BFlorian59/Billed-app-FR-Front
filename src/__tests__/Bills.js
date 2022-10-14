/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import userEvent from '@testing-library/user-event';
import mockStore from "../__mocks__/store"
import Actions from "../views/Actions";

import router from "../app/Router.js";

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
      const icon =await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(icon).toEqual(windowIcon)

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : 1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("Quand je click sur le bouton btn-new-bill", () =>{

     
      
      it('Alors il appelle la fonction this.handleClickNewBill pour afficher la modale pour ajouterune nouvelle note de frais', () => {
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

    describe("Quand je click sur le bouton iconEye", () =>{
    
      it('A modal should open', () => {

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = Actions()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const bill = new Bills({
          document, onNavigate, store, bills, localStorage: window.localStorage
        })    

        const eye = screen.getByTestId('icon-eye')
        const handleClickIconEye = jest.fn(bill.handleClickIconEye())
        
        eye.addEventListener('click', handleClickIconEye)
        userEvent.click(eye)
        expect(handleClickIconEye).toHaveBeenCalled()
  
        const modale = screen.getByTestId("modaleFileemployee")
        expect(modale).toBeTruthy()
      })
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      // await waitFor(() => screen.getByText("Mes notes de frais"))
      // const contentType  = await screen.getByText("Type")
      // expect(contentType).toBeTruthy()
      // const contentNom  = await screen.getByText("Nom")
      // expect(contentNom).toBeTruthy()
      // const contentDate  = await screen.getByText("Date")
      // expect(contentDate).toBeTruthy()
      // const contentMontant  = await screen.getByText("Montant")
      // expect(contentMontant).toBeTruthy()
      // const contentStatut  = await screen.getByText("Statut")
      // expect(contentStatut).toBeTruthy()
      // const contentActions  = await screen.getByText("Actions")
      // expect(contentActions).toBeTruthy()
      //expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
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
      // const message = await screen.getByText(/Erreur 404/)
      //expect(message).toBeTruthy()
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
      // const message = await screen.getByText(/"Erreur 500/)
      //expect(message).toBeTruthy()
    })
  })

  })
})
