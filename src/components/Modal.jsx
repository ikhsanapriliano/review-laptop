import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { GlobalContext } from "../context/Context"

const Modal = ({ action, status, redirect, isLoggin }) => {
    const { history, setHistory } = useContext(GlobalContext)
    const navigate = useNavigate()

    return (
        <div className="fixed bg-black bg-opacity-60 inset-0 z-[60] flex justify-center items-center">
            <div className="bg-white flex flex-col justify-between items-center px-[100px] py-[50px] h-[250px] gap-3 rounded-md">
                <div className="flex flex-col justify-center items-center gap-3">
                    <i className="fa-solid fa-circle-check text-[70px]"></i>
                    <p className="text-xl font-semibold">{action} {status}!</p>
                </div>
                <button onClick={() => {
                    if (history !== "") { setHistory("") }
                    if (isLoggin) {
                        window.location.href = redirect
                    } else {
                        navigate(redirect)
                    }
                }} className="bg-gray-700 hover:bg-gray-800 duration-150 rounded-md text-white w-full py-1">Ok</button>
            </div>
        </div>
    )
}

export default Modal