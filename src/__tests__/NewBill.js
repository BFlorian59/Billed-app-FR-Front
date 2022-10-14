/**
 * @jest-environment jsdom
 */

 import {fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Alors le formulaire apparait.", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      //to-do write assertion
      const newBill = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      const file = screen.getByTestId("file")
      const handleChangeFile  = jest.fn((e) => newBill.handleChangeFile(e))

      file .addEventListener("click", handleChangeFile )
      fireEvent.click(file)
      expect(handleChangeFile ).toHaveBeenCalled()

    })

    describe('When I click on submit button', () => {
      test('les informations sont rajoutés au tableau', () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = NewBillUI()
        const html = NewBillUI()
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const newBill = new NewBill({
          document, onNavigate, store: null, localStorage: window.localStorage
        })


        const formNewBill  = screen.getByTestId("form-new-bill")
        const handleSubmit  = jest.fn((e) => newBill.handleSubmit(e))

        formNewBill.addEventListener("click", handleSubmit )
        fireEvent.click(formNewBill)
        expect(handleSubmit ).toHaveBeenCalled()
      })
    })
  })
})
