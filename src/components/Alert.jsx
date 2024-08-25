import { useContext } from "react"
import { GlobalContext } from "../context/Context"

const Alert = ({ action, status }) => {
    const { setIsAlert } = useContext(GlobalContext)

    return (
        <div className={`flex text-white items-center justify-between fixed top-[20px] rounded-md shadow-md right-0 left-0 z-[60] w-[300px] mx-auto ${status === "Success" ? "bg-green-500" : "bg-red-500"} px-3 py-2`}>
            <div className="flex gap-3 items-center">
                <i className={`fa-solid ${status === "Success" ? "fa-circle-check" : "fa-circle-xmark"} text-xl`}></i>
                <p>{action} {status}!</p>
            </div>
            <button onClick={() => { setIsAlert(false) }} className="border-l pl-3"><i className="fa-solid fa-xmark"></i></button>
        </div>
    )
}

export default Alert