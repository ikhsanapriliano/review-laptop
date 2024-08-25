import { useContext, useState } from "react"
import axios from "axios"
import { GlobalContext } from "../context/Context"
import Modal from "../components/Modal"
import SubLoading from "../components/SubLoading"

const ChangePassword = () => {
    const { baseUrl } = useContext(GlobalContext)
    const [input, setInput] = useState({
        password: "",
        confirmPassword: ""
    })
    const [error, setError] = useState({
        isError: false,
        message: ""
    })
    const [isSuccess, setIsSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const accessToken = localStorage.getItem("accessToken")

    const handleLogin = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError({
            isError: false,
            message: ""
        })
        axios.patch(`${baseUrl}/api/users/change-password`, {
            password: input.password,
            confirmPassword: input.confirmPassword
        }, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
            .then(() => {
                setIsLoading(false)
                setIsSuccess(true)
            })
            .catch(res => {
                if (res.response.status === 401 || res.response.status === 403) {
                    localStorage.clear()
                    window.location.href = "/login"
                }

                setIsLoading(false)
                let message = res.response.data.meta.message
                setError({
                    isError: true,
                    message
                })
            })
    }

    return (
        <>
            {/* popup */}
            {isSuccess && <Modal action={"Change Password"} status={"Success"} redirect={"/"} />}

            {/* main */}
            <section className="w-full flex flex-col justify-center items-center p-10">
                {
                    isLoading ?
                        <SubLoading />
                        :
                        <form onSubmit={(e) => { handleLogin(e) }} className="p-5 bg-white rounded-md shadow-sm border flex flex-col gap-5 w-[300px]">
                            <h1 className="text-center text-xl font-bold">Change Password</h1>
                            <div className="flex flex-col">
                                <label htmlFor="password">New Password</label>
                                <input autoComplete="off" onChange={(e) => {
                                    setInput(prev => ({ ...prev, password: e.target.value }))
                                }} value={input.password} className="border px-1" id="password" type="password" required />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="newPassword">Confirm New Password</label>
                                <input autoComplete="off" onChange={(e) => {
                                    setInput(prev => ({ ...prev, confirmPassword: e.target.value }))
                                }} value={input.confirmPassword} className="border px-1" id="newPassword" type="password" required />
                            </div>
                            {error.isError && <p className="text-red-600 text-sm">*{error.message}</p>}
                            <div>
                                <button className="bg-gray-300 py-1 w-full" type="submit">Submit</button>
                            </div>
                        </form>
                }
            </section>
        </>
    )
}

export default ChangePassword