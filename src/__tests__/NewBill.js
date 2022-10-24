/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import userEvent from '@testing-library/user-event'

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I choose a not valid proof file", () => {
    // test de la fonction handleChangeFile 
    it("Then a warning should be display", () => { 
      document.body.innerHTML = NewBillUI()

      // Mocking browser API localStorage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        email: 'a@a.fr'
      }))
  
      new NewBill({document, onNavigate: null, store: mockStore, localStorage: window.localStorage})

      const inputFile = screen.getByTestId('file')
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(['test.txt'], 'test.txt')
          ]
        }
      })
      
      expect(screen.getByText(/Veuillez choisir/)).toBeTruthy()
    })
  })

  describe("When I choose a valid proof file", () => {
    it("Then file data should be sent", async () => {
      document.body.innerHTML = NewBillUI()

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        email: 'a@a.fr'
      }))
      
      const newBill = new NewBill({document, onNavigate: null, store: mockStore, localStorage: window.localStorage})

      const inputFile = screen.getByTestId('file')

      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(['test.jpg'], 'test.jpg')
          ]
        }
      })
      await new Promise(process.nextTick)
      
      expect(newBill.billId).toBe('1234')
    })
    // POST newbills
    describe("When I choose a valid proof file and I click on send button", () => {
      it("Then I should be sent on Bills page", async () => {
        document.body.innerHTML = NewBillUI()

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname, data: bills })
        }
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          email: 'a@a.fr'
        }))
        const newBill = new NewBill({ document, onNavigate: onNavigate, store: null, localStorage: window.localStorage})

        newBill.fileName = "test"

        const submit = screen.getByText('Envoyer')
        userEvent.click(submit)

        const lastBill = await waitFor(() => screen.getByText('test2'))
        expect(lastBill).toBeTruthy()
      })
    })
  })
})
