import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { GlobalContext } from "../context/Context"
import { useContext, useEffect, useState } from "react"
import Modal from "../components/Modal"
import SubLoading from "../components/SubLoading"

const Register = () => {
    const { baseUrl, user } = useContext(GlobalContext)
    const navigate = useNavigate()
    const [input, setInput] = useState({
        username: "",
        password: "",
        confirmPassword: ""
    })
    const [error, setError] = useState({
        isError: false,
        message: ""
    })
    const [isSuccess, setIsSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (user.isLoggedIn) {
            navigate("/")
        }
    }, [])

    const handleRegister = (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError({
            isError: false,
            message: ""
        })

        axios.post(`${baseUrl}/api/auth/register`, {
            username: input.username,
            password: input.password,
            confirmPassword: input.confirmPassword
        })
            .then(() => {
                setIsLoading(false)
                setIsSuccess(true)
            })
            .catch(res => {
                setIsLoading(false)
                let message = res.response.data.meta.message
                if (res.response.data.meta.error.includes("duplicate")) {
                    message = "username already taken"
                }

                setError({
                    isError: true,
                    message
                })
            })
    }

    return (
        <>
            {/* popup */}
            {isSuccess && <Modal action={"Register"} status={"Success"} redirect={"/login"} />}

            {/* main */}
            <section className="w-full flex flex-col justify-center items-center p-10">
                {
                    isLoading ?
                        <SubLoading />
                        :
                        <form onSubmit={(e) => { handleRegister(e) }} className="p-5 bg-white rounded-md shadow-sm border flex flex-col gap-5 w-[300px]">
                            <h1 className="text-center text-xl font-bold">Register</h1>
                            <div className="flex flex-col">
                                <label htmlFor="username">Username</label>
                                <input autoComplete="username" onChange={(e) => {
                                    setInput(prev => ({ ...prev, username: e.target.value }))
                                }} value={input.username} className="border px-1" id="username" type="text" required />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="password">Password</label>
                                <input autoComplete="off" onChange={(e) => {
                                    setInput(prev => ({ ...prev, password: e.target.value }))
                                }} value={input.password} className="border px-1" id="password" type="password" required />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input autoComplete="off" onChange={(e) => {
                                    setInput(prev => ({ ...prev, confirmPassword: e.target.value }))
                                }} value={input.confirmPassword} className="border px-1" id="confirmPassword" type="password" required />
                            </div>
                            {error.isError && <p className="text-red-600 text-sm">*{error.message}</p>}
                            <div>
                                <button className="bg-gray-300 py-1 w-full" type="submit">Register</button>
                                <p className="text-sm text-center mt-1">already have account ?<Link to={"/login"} className="font-semibold underline">Login</Link></p>
                            </div>
                        </form>
                }
            </section>
        </>
    )
}

export default Register